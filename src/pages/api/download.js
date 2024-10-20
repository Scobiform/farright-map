import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function scrapeElectionStatistics(page) {
    try {
        // Wait for the table to appear
        await page.waitForSelector('table.tablesaw', { timeout: 10000 });

        // Scrape the election statistics table data
        const statisticsData = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table.tablesaw tbody tr'));

            return rows.map(row => {
                const labelElement = row.querySelector('td:first-child');
                const valueElement = row.querySelector('td:last-child');

                // Add safety checks to ensure elements exist before accessing them
                const label = labelElement ? labelElement.innerText.trim() : 'N/A';
                const value = valueElement ? valueElement.innerText.trim() : 'N/A';

                return {
                    label,
                    value,
                };
            });
        });

        return statisticsData;
    } catch (error) {
        console.error('Error scraping election statistics:', error);
        return [];
    }
}

async function scrapeAllSVGs(page) {
    try {
        // Wait for a non-loading SVG or relevant chart to load
        await page.waitForSelector('svg:not(.loading)', { timeout: 10000 });

        // Scrape all non-loading SVG elements and return them as separate fields in a JSON array
        const svgData = await page.evaluate(() => {
            const svgElements = Array.from(document.querySelectorAll('svg:not(.loading)'));
            return svgElements.map((svg, index) => {
                return {
                    [`svg_${index + 1}`]: svg.outerHTML.trim() // Save each SVG as a separate field
                };
            });
        });

        return svgData;
    } catch (error) {
        console.error('Error scraping SVGs:', error);
        return [];
    }
}

async function scrapeSVGCharts(page) {
    try {
        // Wait for the container with the SVG to load
        await page.waitForSelector('div.js-d3chart', { timeout: 10000 });

        // Scrape all SVG elements and their surrounding data attributes
        const svgData = await page.evaluate(() => {
            const svgElements = Array.from(document.querySelectorAll('div.js-d3chart'));

            // Return the outer HTML of the SVG and the data attributes
            return svgElements.map(svgElement => {
                const svg = svgElement.querySelector('svg') ? svgElement.querySelector('svg').outerHTML.trim() : null;
                const chartData = svgElement.getAttribute('data-chartdata');
                const chartOptions = svgElement.getAttribute('data-chartoptions');

                return {
                    svg,
                    chartData: chartData ? JSON.parse(chartData) : null,
                    chartOptions: chartOptions ? JSON.parse(chartOptions) : null
                };
            });
        });

        return svgData;
    } catch (error) {
        console.error('Error scraping SVGs and data attributes:', error);
        return [];
    }
}

async function scrapeElectedAndRunnerUp(page) {
    try {
        // Wait for the "Gewählte Person" section to appear
        await page.waitForSelector('div.gewaehlter-direktbewerber', { timeout: 10000 });

        // Scrape the "Gewählte Person" and "Erstunterlegene Person" information
        const electionResult = await page.evaluate(() => {
            const electedPersonElement = document.querySelector('div.gewaehlter-direktbewerber');
            const runnerUpPersonElement = document.querySelector('div.erstunterlegener');

            // Safely extract data from the elements
            const electedPerson = electedPersonElement
                ? {
                    name: electedPersonElement.querySelector('.gewaehlter-direktbewerber__name')?.innerText.trim() || 'N/A',
                    party: electedPersonElement.querySelector('.gewaehlter-direktbewerber__partei abbr')?.getAttribute('title') || 'N/A',
                    percentage: electedPersonElement.querySelector('.gewaehlter-direktbewerber__value')?.innerText.trim() || 'N/A',
                    color: electedPersonElement.querySelector('.partei__farbe')?.getAttribute('style').match(/color:(.*)/)?.[1]?.trim() || 'N/A',
                }
                : null;

            const runnerUpPerson = runnerUpPersonElement
                ? {
                    name: runnerUpPersonElement.querySelector('.erstunterlegener__name')?.innerText.trim() || 'N/A',
                    party: runnerUpPersonElement.querySelector('.erstunterlegener__partei abbr')?.getAttribute('title') || 'N/A',
                    percentage: runnerUpPersonElement.querySelector('.erstunterlegener__value')?.innerText.trim() || 'N/A',
                    color: runnerUpPersonElement.querySelector('.partei__farbe')?.getAttribute('style').match(/color:(.*)/)?.[1]?.trim() || 'N/A',
                }
                : null;

            return {
                electedPerson,
                runnerUpPerson,
            };
        });

        return electionResult;
    } catch (error) {
        console.error('Error scraping elected and runner-up person:', error);
        return null;
    }
}

async function scrapeVoterTurnout(page) {
    try {
        // Wait for the voter turnout element to appear
        await page.waitForSelector('.wahlbeteiligung__wrapper', { timeout: 10000 });

        // Scrape the voter turnout percentage
        const voterTurnout = await page.evaluate(() => {
            const turnoutElement = document.querySelector('.wahlbeteiligung__wrapper .js-wahlbeteiligung__number');
            return turnoutElement ? turnoutElement.innerText.trim() : 'N/A';
        });

        return voterTurnout;
    } catch (error) {
        console.error('Error scraping voter turnout:', error);
        return 'N/A';
    }
}

async function scrapeVoterTurnoutChart(page) {
    try {
        // Wait for the SVG map chart to appear
        await page.waitForSelector('div.js-d3chart', { timeout: 10000 });

        // Scrape the map/chart SVG data
        const chartData = await page.evaluate(() => {
            const chartElement = document.querySelector('div.js-d3chart');
            const svg = chartElement.querySelector('svg') ? chartElement.querySelector('svg').outerHTML.trim() : null;
            const chartData = chartElement.getAttribute('data-chartdata');
            const chartOptions = chartElement.getAttribute('data-chartoptions');

            return {
                svg,
                chartData: chartData ? JSON.parse(chartData) : null,
                chartOptions: chartOptions ? JSON.parse(chartOptions) : null,
            };
        });

        return chartData;
    } catch (error) {
        console.error('Error scraping voter turnout chart:', error);
        return null;
    }
}

export default async function handler(req, res) {
    let browser;
    const { electoralDistrict, state, stateNumber } = req.query;
    const cacheDir = path.join(process.cwd(), 'public', 'cache');
    const cacheFile = path.join(cacheDir, `${electoralDistrict}_${state}.json`);

    // Check if cache file exists
    if (fs.existsSync(cacheFile)) {
        try {
            // Read and return cached data
            const cachedData = fs.readFileSync(cacheFile, 'utf8');
            return res.status(200).json(JSON.parse(cachedData));
        } catch (error) {
            console.error('Error reading cache file:', error);
            return res.status(500).json({ error: 'Failed to read cached data' });
        }
    }
    
    try {
        // Launch Puppeteer
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Navigate to the appropriate URL for the state
        switch (state) {
            case 'sh':
                console.log('Scraping data for Schleswig-Holstein');
                await page.goto(`https://www.wahlen-sh.de/ltw_2022/ergebnispraesentation_wahlkreis_${electoralDistrict}.html`, { waitUntil: 'domcontentloaded' });
                break;
            case 'bremen':
                await page.goto(`https://www.wahlen-bremen.de/Wahlen/2023_05_14/${electoralDistrict}/`, { waitUntil: 'domcontentloaded' });
                break;
            case 'berlin':
                await page.goto(`https://www.wahlen-berlin.de/wahlen/BE2023/AFSPRAES/agh/ergebnisse_bezirk_${electoralDistrict}.html`, { waitUntil: 'domcontentloaded' });
                break;
            case 'brandenburg':
                await page.goto(`https://wahlergebnisse.brandenburg.de/12/500/20240922/landtagswahl_land/ergebnisse_wahlkreis_${electoralDistrict}.html`, { waitUntil: 'domcontentloaded' });
                break;
            case 'bundestag':
                console.log('Scraping data for Bundestag');
                let url = `https://www.bundeswahlleiter.de/bundestagswahlen/2021/ergebnisse/bund-99/land-${stateNumber}/wahlkreis-${electoralDistrict}.html`;
                console.log(url);
                await page.goto(url, { waitUntil: 'domcontentloaded' });
                break;            
        }

        // Wait for the table to appear
        await page.waitForSelector('table.tablesaw.table-stimmen', { timeout: 10000 });

        // Scrape the table data with safety checks
        const tableData = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table.tablesaw.table-stimmen tbody tr'));

            return rows.map(row => {
                const partyElement = row.querySelector('th');
                const cells = row.querySelectorAll('td');
                
                // Add safety checks to ensure that elements exist before accessing them
                const party = partyElement ? partyElement.innerText.trim() : 'N/A';
                const candidate = cells[0] ? cells[0].innerText.trim() : 'N/A';
                const firstVotes = cells[1] ? cells[1].innerText.trim() : 'N/A';
                const firstVotePercentage = cells[2] ? cells[2].innerText.trim() : 'N/A';
                const secondVotes = cells[5] ? cells[5].innerText.trim() : 'N/A';
                const secondVotePercentage = cells[6] ? cells[6].innerText.trim() : 'N/A';

                return {
                    party,
                    candidate,
                    firstVotes,
                    firstVotePercentage,
                    secondVotes,
                    secondVotePercentage,
                };
            });
        });

        // Scrape the election statistics
        const statisticsData = await scrapeElectionStatistics(page);

        // Scrape all SVG elements
        let svgData = null;
        if(state !== 'berlin' || state !== 'bundestag') {
            svgData = await scrapeAllSVGs(page);
        }

        // Scrape SVG charts and their data attributes
        const svgChartsData = await scrapeSVGCharts(page);

        // Additional scraping only for Brandenburg
        let electedData = null;
        let voterTurnout = 'N/A';
        let voterTurnoutChart = null;
        if (state === 'brandenburg') {
            electedData = await scrapeElectedAndRunnerUp(page);
            voterTurnout = await scrapeVoterTurnout(page);
            voterTurnoutChart = await scrapeVoterTurnoutChart(page);
        }

        // Combine the table data and statistics data
        const combinedData = {
            tableData,
            statisticsData,
            svgData,
            svgChartsData,
            electedData,
            voterTurnout,
            voterTurnoutChart,
        };
        
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }

        // Cache the data by writing it to a file
        fs.writeFileSync(cacheFile, JSON.stringify(combinedData, null, 2));

        // Return the scraped data
        res.status(200).json(combinedData);

    } catch (error) {
        console.error('Error scraping table:', error);
        res.status(500).json({ error: 'Failed to scrape the table' });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}



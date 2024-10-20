import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Helper to scrape election statistics
async function scrapeElectionStatistics(page) {
    try {
        await page.waitForSelector('table.tablesaw', { timeout: 10000 });
        return await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table.tablesaw tbody tr'));
            return rows.map(row => ({
                label: row.querySelector('td:first-child')?.innerText.trim() || 'N/A',
                value: row.querySelector('td:last-child')?.innerText.trim() || 'N/A',
            }));
        });
    } catch (error) {
        console.error('Error scraping election statistics:', error);
        return [];
    }
}

// Helper to scrape SVG charts
async function scrapeSVGCharts(page) {
    try {
        await page.waitForSelector('[class*="chart"]', { timeout: 1000 });
        return await page.evaluate(() => {
            const chartElements = Array.from(document.querySelectorAll('[class*="chart"]'));
            return chartElements.map(chartElement => ({
                svg: chartElement.querySelector('svg')?.outerHTML.trim() || null,
                chartData: chartElement.getAttribute('data-chartdata') ? JSON.parse(chartElement.getAttribute('data-chartdata')) : null,
                chartOptions: chartElement.getAttribute('data-chartoptions') ? JSON.parse(chartElement.getAttribute('data-chartoptions')) : null,
                className: chartElement.getAttribute('class') || 'No class name',
            }));
        });
    } catch (error) {
        console.error('Error scraping SVG charts:', error);
        return [];
    }
}

// Helper to scrape elected and runner-up person
async function scrapeElectedAndRunnerUp(page) {
    try {
        await page.waitForSelector('div.gewaehlter-direktbewerber', { timeout: 10000 });
        return await page.evaluate(() => {
            const electedPersonElement = document.querySelector('div.gewaehlter-direktbewerber');
            const runnerUpPersonElement = document.querySelector('div.erstunterlegener');

            const electedPerson = electedPersonElement ? {
                name: electedPersonElement.querySelector('.gewaehlter-direktbewerber__name')?.innerText.trim() || 'N/A',
                party: electedPersonElement.querySelector('.gewaehlter-direktbewerber__partei abbr')?.getAttribute('title') || 'N/A',
                percentage: electedPersonElement.querySelector('.gewaehlter-direktbewerber__value')?.innerText.trim() || 'N/A',
                color: electedPersonElement.querySelector('.partei__farbe')?.getAttribute('style')?.match(/color:(.*)/)?.[1]?.trim() || 'N/A',
            } : null;

            const runnerUpPerson = runnerUpPersonElement ? {
                name: runnerUpPersonElement.querySelector('.erstunterlegener__name')?.innerText.trim() || 'N/A',
                party: runnerUpPersonElement.querySelector('.erstunterlegener__partei abbr')?.getAttribute('title') || 'N/A',
                percentage: runnerUpPersonElement.querySelector('.erstunterlegener__value')?.innerText.trim() || 'N/A',
                color: runnerUpPersonElement.querySelector('.partei__farbe')?.getAttribute('style')?.match(/color:(.*)/)?.[1]?.trim() || 'N/A',
            } : null;

            return { electedPerson, runnerUpPerson };
        });
    } catch (error) {
        console.error('Error scraping elected and runner-up person:', error);
        return null;
    }
}

// Helper to scrape voter turnout chart
async function scrapeVoterTurnoutChart(page) {
    try {
        await page.waitForSelector('div.js-d3chart', { timeout: 1000 });
        return await page.evaluate(() => {
            const chartElement = document.querySelector('div.js-d3chart');
            return {
                svg: chartElement.querySelector('svg')?.outerHTML.trim() || null,
                chartData: chartElement.getAttribute('data-chartdata') ? JSON.parse(chartElement.getAttribute('data-chartdata')) : null,
                chartOptions: chartElement.getAttribute('data-chartoptions') ? JSON.parse(chartElement.getAttribute('data-chartoptions')) : null,
            };
        });
    } catch (error) {
        console.error('Error scraping voter turnout chart:', error);
        return null;
    }
}

// Main handler function
export default async function handler(req, res) {
    let browser;
    const { electoralDistrict, state, stateNumber, name } = req.query;
    const cacheDir = path.join(process.cwd(), 'public', 'cache');
    const cacheFile = path.join(cacheDir, `${electoralDistrict}_${state}.json`);

    // Check for cached data
    if (fs.existsSync(cacheFile)) {
        try {
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

        // Define URLs for different states
        const urlMapping = {
            sh: `https://www.wahlen-sh.de/ltw_2022/ergebnispraesentation_wahlkreis_${electoralDistrict}.html`,
            bremen: `https://www.wahlen-bremen.de/Wahlen/2023_05_14/ergebnisse_stadtbezirk_${electoralDistrict}.html`,
            berlin: `https://www.wahlen-berlin.de/wahlen/BE2023/AFSPRAES/agh/ergebnisse_wahlkreis_${electoralDistrict}.html`,
            brandenburg: `https://wahlergebnisse.brandenburg.de/12/500/20240922/landtagswahl_land/ergebnisse_wahlkreis_${electoralDistrict}.html`,
            bundestag: `https://www.bundeswahlleiter.de/bundestagswahlen/2021/ergebnisse/bund-99/land-${stateNumber}/wahlkreis-${electoralDistrict}.html`
        };

        const url = urlMapping[state];
        if (!url) throw new Error('No URL available for this state');

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Scrape table data
        const tableData = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table.tablesaw.table-stimmen tbody tr'));
            return rows.map(row => {
                const partyElement = row.querySelector('th');
                const cells = row.querySelectorAll('td');
                return {
                    party: partyElement?.innerText.trim() || 'N/A',
                    candidate: cells[0]?.innerText.trim() || 'N/A',
                    firstVotes: cells[1]?.innerText.trim() || 'N/A',
                    firstVotePercentage: cells[2]?.innerText.trim() || 'N/A',
                    secondVotes: cells[5]?.innerText.trim() || 'N/A',
                    secondVotePercentage: cells[6]?.innerText.trim() || 'N/A',
                };
            });
        });

        // Scrape additional data based on state
        const svgChartsData = await scrapeSVGCharts(page);
        let electedData = null;
        let voterTurnoutChart = null;

        if (['brandenburg', 'bremen', 'berlin', 'sh'].includes(state)) {
            if (state !== 'bremen') {
                electedData = await scrapeElectedAndRunnerUp(page);
            }
            voterTurnoutChart = await scrapeVoterTurnoutChart(page);
        }

        // Combine scraped data
        const combinedData = {
            name,
            tableData,
            svgChartsData,
            electedData,
            voterTurnoutChart,
        };

        // Cache the result
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        fs.writeFileSync(cacheFile, JSON.stringify(combinedData, null, 2));

        // Return the response
        res.status(200).json(combinedData);

    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).json({ error: 'Failed to scrape the data' });
    } finally {
        if (browser) await browser.close();
    }
}

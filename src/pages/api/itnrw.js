import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  // Ensure it's a GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let { LWKNR } = req.query;
  LWKNR = LWKNR.padStart(3, '0');

  if (!LWKNR) {
    return res.status(400).json({ message: 'LWKNR is required' });
  }

  try {
    // Launch the Puppeteer browser
    const browser = await puppeteer.launch({ headless: true }); 
    const page = await browser.newPage();

    // Replace with the correct URL for the IT.NRW election results
    const url = `https://www.wahlergebnisse.nrw/landtagswahlen/2022/aktuell/a${LWKNR}lw2200.shtml`;
    console.log('Scraping data from:', url);
    
    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract the relevant data using the correct selectors
    const data = await page.evaluate(() => {
      const result = {};

      // Scrape the district name
      const districtNameElement = document.querySelector('#dieserWahlkreis');
      result.districtName = districtNameElement ? districtNameElement.innerText : 'N/A';

      // Scrape first vote percentages
      const firstVoteRow = document.querySelector('#parteienErststimmeTable2');
      if (firstVoteRow) {
        const firstVotes = Array.from(firstVoteRow.children).map(td => td.innerText);
        result.firstVotes = {
          CDU: firstVotes[0],
          SPD: firstVotes[1],
          FDP: firstVotes[2],
          AfD: firstVotes[3],
          GRUENE: firstVotes[4],
          LINKE: firstVotes[5],
          ANDERE: firstVotes[6]
        };
      }

      // Scrape second vote percentages
      const secondVoteRow = document.querySelector('#prozentWerteZweitstimmeTable');
      if (secondVoteRow) {
        const secondVotes = Array.from(secondVoteRow.children).map(td => td.innerText);
        result.secondVotes = {
          CDU: secondVotes[1],
          SPD: secondVotes[2],
          FDP: secondVotes[3],
          AfD: secondVotes[4],
          GRUENE: secondVotes[5],
          LINKE: secondVotes[6],
          ANDERE: secondVotes[7]
        };
      }

      return result;
    });

    // Close the browser
    await browser.close();

    // Send the scraped data as the response
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching IT.NRW data:', error);
    res.status(500).json({ message: 'Failed to fetch IT.NRW data', error: error.message });
  }
}

// pages/api/district.js

export default async function handler(req, res) {
    const { code } = req.query; // Get the district code from the query string
  
    if (!code) {
      return res.status(400).json({ error: "District code is required" });
    }
  
    try {
      const response = await fetch(`https://wahlen.rlp-ltw-2021.23degrees.eu/assets/json/${code}.json`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
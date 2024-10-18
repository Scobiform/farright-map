const fetchResponse = async (url, res) => {   
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
    
        const data = await response.json();
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}

const fetchData = async (code, state, res) => {
    const stateStruc = {
        'rlp': `https://wahlen.rlp-ltw-2021.23degrees.eu/assets/json/${code}.json`,
        'hessen': `https://wahlen.hessen-ltw23.23degrees.eu/assets/json/${code}.json`
    }

    switch(state) {
        case 'rlp':
            return fetchResponse(stateStruc[state], res);
        case 'hessen':
            return fetchResponse(stateStruc[state], res);
        default:
            return stateStruc['rlp'];
    }
};

export default async function handler(req, res) {
    const { code } = req.query; 
    const { state } = req.query; 
    const data = await fetchData(code, state, res);
}
  
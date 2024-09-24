import db from '../../lib/db';

export default function handler(req, res) {

    if (req.method === 'GET') {
        const location = db.prepare('SELECT * FROM location').all();
        return res.status(200).json(location);
    }
    if (req.method === 'POST') {
        const { name, latitude, longitude, organization_id } = req.body;
        const stmt = db.prepare('INSERT INTO location (name, latitude, longitude, organization_id) VALUES (?, ?, ?, ?)');
        stmt.run(name, latitude, longitude, organization_id);
        return res.status(201).json({ message: 'Location created' });
    }
    return res.status(405).json({ message: 'Method not allowed' });

}

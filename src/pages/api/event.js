import db from '../../lib/db';

export default function handler(req, res) {
    
        if (req.method === 'GET') {
            const event = db.prepare('SELECT * FROM event').all();
            return res.status(200).json(event);
        }
        if (req.method === 'POST') {
            const { name, date, location_id, organization_id } = req.body;
            const stmt = db.prepare('INSERT INTO event (name, date, location_id, organization_id) VALUES (?, ?, ?, ?)');
            stmt.run(name, date, location_id, organization_id);
            return res.status(201).json({ message: 'Event created' });
        }
        return res.status(405).json({ message: 'Method not allowed' });
    
}

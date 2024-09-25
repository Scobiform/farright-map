import db from '../../lib/db';

export default function handler(req, res) {
    const { method, body } = req;

    switch (method) {
        case 'GET': {
            const locations = db.prepare('SELECT * FROM location').all();
            return res.status(200).json(locations);
        }

        case 'POST': {
            const { name, latitude, longitude, organization_id } = body;
            const stmt = db.prepare('INSERT INTO location (name, latitude, longitude, organization_id) VALUES (?, ?, ?, ?)');
            stmt.run(name, latitude, longitude, organization_id);
            return res.status(201).json({ message: 'Location created' });
        }

        case 'PUT': {
            const { id, name, latitude, longitude, organization_id } = body;
            const stmt = db.prepare('UPDATE location SET name = ?, latitude = ?, longitude = ?, organization_id = ? WHERE id = ?');
            stmt.run(name, latitude, longitude, organization_id, id);
            return res.status(200).json({ message: 'Location updated' });
        }

        case 'DELETE': {
            const { id } = body;
            const stmt = db.prepare('DELETE FROM location WHERE id = ?');
            stmt.run(id);
            return res.status(200).json({ message: 'Location deleted' });
        }

        case 'PATCH': {
            const { id, organization_id } = body;
            const stmt = db.prepare('UPDATE location SET organization_id = ? WHERE id = ?');
            stmt.run(organization_id, id);
            return res.status(200).json({ message: 'Location organization updated' });
        }

        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}

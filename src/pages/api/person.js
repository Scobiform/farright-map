import db from '../../lib/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const persons = db.prepare('SELECT * FROM person').all();
    return res.status(200).json(persons);
  }

  if (req.method === 'POST') {
    const { name, organization_id } = req.body;
    const stmt = db.prepare('INSERT INTO person (name, organization_id) VALUES (?, ?)');
    stmt.run(name, organization_id);
    return res.status(201).json({ message: 'Person created' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

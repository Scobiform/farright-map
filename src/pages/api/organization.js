import db from '../../lib/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const organizations = db.prepare('SELECT * FROM organization').all();
    return res.status(200).json(organizations);
  }

  if (req.method === 'POST') {
    const { name } = req.body;
    const stmt = db.prepare('INSERT INTO organization (name) VALUES (?)');
    stmt.run(name);
    return res.status(201).json({ message: 'Organization created' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
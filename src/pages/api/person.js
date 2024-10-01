import db from '../../lib/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const persons = db.prepare('SELECT * FROM person').all();
    return res.status(200).json(persons);
  }

  // Add POST, PUT, DELETE methods
  if (req.method === 'POST') {
    const { name, organization_id, ...attributes } = req.body;
    const attrString = JSON.stringify(attributes);
    const stmt = db.prepare('INSERT INTO person (name, organization_id, attributes) VALUES (?, ?, ?)');
    stmt.run(name, organization_id, attrString);
    return res.status(201).json({ message: 'Person created' });
  }

  if (req.method === 'PUT') {
    const { id, name, organization_id, ...attributes } = req.body;
    // Get person by ID
    const person = getPersonById(id);
    console.log(person);
    const attrString = JSON.stringify(attributes);
    const stmt = db.prepare('UPDATE person SET name = ?, organization_id = ?, attributes = ? WHERE id = ?');
    stmt.run(name, organization_id, attrString, id);
    return res.status(200).json({ message: 'Person updated' });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    const stmt = db.prepare('DELETE FROM person WHERE id = ?');
    stmt.run(id);
    return res.status(200).json({ message: 'Person deleted' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

// Get person by ID
export async function getPersonById(id) {
  const person = db.prepare('SELECT * FROM person WHERE id = ?').get(id);
  return person;
}
import db from '../../lib/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const persons = db.prepare('SELECT * FROM person').all();
      return res.status(200).json(persons);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching persons' });
    }
  }

  if (req.method === 'POST') {
    const { name, organization_id, ...attributes } = req.body;
    const attrString = JSON.stringify(attributes);

    try {
      const stmt = db.prepare('INSERT INTO person (name, organization_id, attributes) VALUES (?, ?, ?)');
      const info = stmt.run(name, organization_id, attrString);
      const person = getPersonById(info.lastInsertRowid);
      return res.status(201).json(person);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating person' });
    }
  }

  if (req.method === 'PUT') {
    const { id, name, organization_id, ...attributes } = req.body;
    
    // Check if attributes are provided, else set an empty object
    const attrString = attributes && Object.keys(attributes).length > 0 ? JSON.stringify(attributes) : '{}';
  
    try {
      const stmt = db.prepare('UPDATE person SET name = ?, organization_id = ?, attributes = ? WHERE id = ?');
      stmt.run(name, organization_id, attrString, id);
      console.log({ name, organization_id, attrString, id });
      // Retrieve the updated person to send back
      const updatedPerson = getPersonById(id);
      return res.status(200).json(updatedPerson);
    } catch (error) {
      console.error(error); // Log the error for debugging
      return res.status(500).json({ message: 'Error updating person' });
    }
  }
  

  if (req.method === 'DELETE') {
    const { id } = req.body;
    
    try {
      const stmt = db.prepare('DELETE FROM person WHERE id = ?');
      stmt.run(id);
      return res.status(200).json({ message: 'Person deleted' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting person' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

// Helper function
export function getPersonById(id) {
  try {
    const person = db.prepare('SELECT * FROM person WHERE id = ?').get(id);
    return person;
  } catch (error) {
    throw new Error('Person not found');
  }
}

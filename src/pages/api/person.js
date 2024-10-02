import db from '../../lib/db';

export default async function handler(req, res) {
  // GET: Fetch all persons
  if (req.method === 'GET') {
    try {
      const persons = db.prepare('SELECT * FROM person').all();
      return res.status(200).json(persons);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching persons' });
    }
  }

  // POST: Create a new person
  if (req.method === 'POST') {
    const { name, organization_id, ...attributes } = req.body;
    const attrString = JSON.stringify(attributes || {});

    try {
      const stmt = db.prepare('INSERT INTO person (name, organization_id, attributes) VALUES (?, ?, ?)');
      const info = stmt.run(name, organization_id, attrString);
      const person = getPersonById(info.lastInsertRowid);
      // Delete old entry and make new based on attributes
      const stmt2 = db.prepare('DELETE FROM person WHERE id = ?');
      stmt2.run(info.lastInsertRowid);
      const stmt3 = db.prepare('INSERT INTO person (name, organization_id, attributes) VALUES (?, ?, ?)');
      stmt3.run(name, organization_id, attrString);
      return res.status(201).json(person);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating person' });
    }
  }

  // PUT: Update an existing person
  if (req.method === 'PUT') {
    const { id, name, organization_id, ...attributes } = req.body;
    
    // Parse incoming attributes to avoid appending nested JSON
    const attrString = JSON.stringify(attributes);

    try {
      const stmt = db.prepare('UPDATE person SET name = ?, organization_id = ?, attributes = ? WHERE id = ?');
      stmt.run(name, organization_id, attrString, id);
      const updatedPerson = getPersonById(id); // Retrieve the updated person
      return res.status(200).json(updatedPerson);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating person' });
    }
  }

  // PATCH: Update attributes of an existing person
  if (req.method === 'PATCH') {
    const { id, ...attributes } = req.body;
    const attrString = JSON.stringify(attributes);

    try {
      // Retrieve the person
      const person = getPersonById(id);
      if (!person) {
        return res.status(404).json({ message: 'Person not found' });
      }

      // Update the person's attributes
      const stmt = db.prepare('UPDATE person SET attributes = ? WHERE id = ?');
      stmt.run(attrString, id);
      const updatedPerson = getPersonById(id); // Retrieve the updated person
      return res.status(200).json(updatedPerson);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating person' });
    }
  }

  // DELETE: Delete a specific attribute from a person
  if (req.method === 'DELETE') {
    const { id, key } = req.body; // Expecting an id and the attribute key to delete

    try {
      const person = getPersonById(id); // Retrieve the person
      if (!person) {
        return res.status(404).json({ message: 'Person not found' });
      }

      // Update the attributes, deleting the specified key
      const updatedAttributes = { ...JSON.parse(person.attributes) }; // Parse existing attributes
      delete updatedAttributes[key]; // Delete the specified attribute

      // Update the person in the database
      const stmt = db.prepare('UPDATE person SET attributes = ? WHERE id = ?');
      stmt.run(JSON.stringify(updatedAttributes), id);

      return res.status(200).json({ message: 'Attribute deleted', attributes: updatedAttributes });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting attribute', error });
    }
  }

  // Method Not Allowed
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
  return res.status(405).json({ message: 'Method not allowed' });
}

// Helper function to get person by ID
export function getPersonById(id) {
  try {
    const person = db.prepare('SELECT * FROM person WHERE id = ?').get(id);
    return person;
  } catch (error) {
    throw new Error('Person not found');
  }
}

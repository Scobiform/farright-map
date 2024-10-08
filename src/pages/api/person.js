import db from '../../lib/db';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'PATCH':
        return handlePatch(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// Helper function to get person by ID
function getPersonById(id) {
  return db.prepare('SELECT * FROM person WHERE id = ?').get(id);
}

// Handle GET request
function handleGet(req, res) {
  const persons = db.prepare('SELECT * FROM person').all();
  return res.status(200).json(persons);
}

// Handle POST request
function handlePost(req, res) {
  const { name, organization_id, ...attributes } = req.body;
  const lastEdited = new Date().toISOString(); // Get the current timestamp
  const attrString = JSON.stringify({ ...attributes, last_edited: lastEdited });

  const stmt = db.prepare('INSERT INTO person (name, organization_id, attributes) VALUES (?, ?, ?)');
  const info = stmt.run(name, organization_id, attrString);
  const person = getPersonById(info.lastInsertRowid);
  return res.status(201).json(person);
}

// Handle PUT request
function handlePut(req, res) {
  const { id, name, organization_id, ...attributes } = req.body;
  const lastEdited = new Date().toISOString(); // Get the current timestamp
  const attrString = JSON.stringify({ ...attributes, last_edited: lastEdited });

  const stmt = db.prepare('UPDATE person SET name = ?, organization_id = ?, attributes = ? WHERE id = ?');
  stmt.run(name, organization_id, attrString, id);
  const updatedPerson = getPersonById(id);
  return res.status(200).json(updatedPerson);
}

// Handle PATCH request
function handlePatch(req, res) {
  const { id, ...attributes } = req.body;
  const person = getPersonById(id);
  if (!person) {
    return res.status(404).json({ message: 'Person not found' });
  }

  const lastEdited = new Date().toISOString(); // Get the current timestamp
  const updatedAttributes = { ...JSON.parse(person.attributes), ...attributes, last_edited: lastEdited };
  const stmt = db.prepare('UPDATE person SET attributes = ? WHERE id = ?');
  stmt.run(JSON.stringify(updatedAttributes), id);
  const updatedPerson = getPersonById(id);
  return res.status(200).json(updatedPerson);
}

// Handle DELETE request
function handleDelete(req, res) {
  const { id, key } = req.body;
  const person = getPersonById(id);
  if (!person) {
    return res.status(404).json({ message: 'Person not found' });
  }

  const updatedAttributes = JSON.parse(person.attributes);
  delete updatedAttributes[key];

  const lastEdited = new Date().toISOString(); 
  updatedAttributes.last_edited = lastEdited; // Update the last_edited attribute

  const stmt = db.prepare('UPDATE person SET attributes = ? WHERE id = ?');
  stmt.run(JSON.stringify(updatedAttributes), id);
  return res.status(200).json({ message: 'Attribute deleted', attributes: updatedAttributes });
}

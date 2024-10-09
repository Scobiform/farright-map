import db from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PATCH':
        return handlePatch(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in personAttributes handler:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// Handle GET request to fetch attributes for a person
function handleGet(req, res) {
  const personId = req.query.personId;
  if (!personId) {
    return res.status(400).json({ message: 'personId is required' });
  }

  try {
    const stmt = db.prepare('SELECT id, key, value FROM person_attributes WHERE person_id = ?');
    const attributes = stmt.all(personId);
    return res.status(200).json(attributes);
  } catch (error) {
    console.error('Error fetching person attributes:', error);
    return res.status(500).json({ message: 'Error fetching person attributes' });
  }
}

// Handle POST request to add a new attribute
function handlePost(req, res) {
  const { personId, key, value } = req.body;
  if (!personId || !key) {
    return res.status(400).json({ message: 'personId and key are required' });
  }

  try {
    const insertStmt = db.prepare(
      'INSERT INTO person_attributes (person_id, key, value) VALUES (?, ?, ?)'
    );
    const result = insertStmt.run(personId, key, value);

    return res.status(201).json({ id: result.lastInsertRowid, personId, key, value });
  } catch (error) {
    console.error('Error adding person attribute:', error);
    return res.status(500).json({ message: 'Error adding person attribute' });
  }
}

// Handle PATCH request to update an attribute
function handlePatch(req, res) {
  const { id, value } = req.body;
  if (!id) {
    return res.status(400).json({ message: 'id is required for PATCH request' });
  }

  try {
    const updateStmt = db.prepare('UPDATE person_attributes SET value = ? WHERE id = ?');
    const changes = updateStmt.run(value, id).changes;

    if (changes === 0) {
      return res.status(404).json({ message: 'Attribute not found' });
    }

    return res.status(200).json({ message: 'Attribute updated successfully' });
  } catch (error) {
    console.error('Error updating person attribute:', error);
    return res.status(500).json({ message: 'Error updating person attribute' });
  }
}

// Handle DELETE request to remove an attribute
function handleDelete(req, res) {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: 'id is required for DELETE request' });
  }

  try {
    const deleteStmt = db.prepare('DELETE FROM person_attributes WHERE id = ?');
    const changes = deleteStmt.run(id).changes;

    if (changes === 0) {
      return res.status(404).json({ message: 'Attribute not found' });
    }

    return res.status(200).json({ message: 'Attribute deleted successfully' });
  } catch (error) {
    console.error('Error deleting person attribute:', error);
    return res.status(500).json({ message: 'Error deleting person attribute' });
  }
}

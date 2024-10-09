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
    console.error('Error in location handler:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// Handle GET request to fetch all locations or a specific one by personId
function handleGet(req, res) {
  const { personId } = req.query;

  try {
    let stmt;
    let locations;

    if (personId) {
      stmt = db.prepare('SELECT * FROM location WHERE person_id = ?');
      locations = stmt.all(personId);
    } else {
      stmt = db.prepare('SELECT * FROM location');
      locations = stmt.all();
    }

    return res.status(200).json(locations);
  } catch (error) {
    console.error('Error fetching location:', error);
    return res.status(500).json({ message: 'Error fetching location' });
  }
}

// Handle POST request to add a new location
function handlePost(req, res) {
  const { name, lat, lon, personId, organizationId } = req.body;
  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  try {
    const insertStmt = db.prepare(
      'INSERT INTO location (name, lat, lon, person_id, organization_id) VALUES (?, ?, ?, ?, ?)'
    );
    const result = insertStmt.run(name, lat, lon, personId, organizationId);

    return res.status(201).json({ id: result.lastInsertRowid, name, lat, lon, personId, organizationId });
  } catch (error) {
    console.error('Error adding location:', error);
    return res.status(500).json({ message: 'Error adding location' });
  }
}

// Handle PATCH request to update a location
function handlePatch(req, res) {
  const { id, name, lat, lon } = req.body;
  if (!id) {
    return res.status(400).json({ message: 'id is required for PATCH request' });
  }

  try {
    const updateStmt = db.prepare('UPDATE location SET name = ?, lat = ?, lon = ? WHERE id = ?');
    const changes = updateStmt.run(name, lat, lon, id).changes;

    if (changes === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    return res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    return res.status(500).json({ message: 'Error updating location' });
  }
}

// Handle DELETE request to remove a location
function handleDelete(req, res) {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: 'id is required for DELETE request' });
  }

  try {
    const deleteStmt = db.prepare('DELETE FROM location WHERE id = ?');
    const changes = deleteStmt.run(id).changes;

    if (changes === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    return res.status(200).json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    return res.status(500).json({ message: 'Error deleting location' });
  }
}
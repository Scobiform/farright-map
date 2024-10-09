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
    console.error('Error in handler:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// Helper function to get person by ID
function getPersonById(id) {
  return db.prepare('SELECT * FROM person WHERE id = ?').get(id);
}

// Handle GET request
function handleGet(req, res) {
  const { id } = req.query;

  if (id) {
    const person = getPersonById(id);
    if (person) {
      return res.status(200).json(person);
    } else {
      return res.status(404).json({ message: 'Person not found' });
    }
  } else {
    const persons = db.prepare('SELECT * FROM person').all();
    return res.status(200).json(persons);
  }
}

// Handle POST request (Create a new person)
function handlePost(req, res) {
  const {
    type,
    name,
    votes,
    profession,
    birth_year,
    birthplace,
    residence,
    electoral_district,
    voting_district,
    lat,
    lon,
    mail,
    mobile,
    website,
    wikipedia,
    organization_id,
  } = req.body;

  try {
    const insertStmt = db.prepare(`
      INSERT INTO person (
        type, name, votes, profession, birth_year, birthplace, residence, electoral_district,
        voting_district, lat, lon, mail, mobile, website, wikipedia, organization_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      type,
      name,
      votes || 0,
      profession,
      birth_year,
      birthplace,
      residence,
      electoral_district,
      voting_district,
      lat,
      lon,
      mail,
      mobile,
      website,
      wikipedia,
      organization_id
    );

    const newPerson = getPersonById(result.lastInsertRowid);
    return res.status(201).json(newPerson);

  } catch (error) {
    console.error('Error in handlePost:', error);
    return res.status(500).json({ message: 'Error creating person', error: error.message });
  }
}

// Handle PUT request (Replace a person)
function handlePut(req, res) {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: 'ID is required for PUT request' });
  }

  const existingPerson = getPersonById(id);
  if (!existingPerson) {
    return res.status(404).json({ message: 'Person not found' });
  }

  const {
    type,
    name,
    votes,
    profession,
    birth_year,
    birthplace,
    residence,
    electoral_district,
    voting_district,
    lat,
    lon,
    mail,
    mobile,
    website,
    wikipedia,
    organization_id,
  } = req.body;

  try {
    const updateStmt = db.prepare(`
      UPDATE person SET
        type = ?, name = ?, votes = ?, profession = ?, birth_year = ?, birthplace = ?, residence = ?,
        electoral_district = ?, voting_district = ?, lat = ?, lon = ?, mail = ?, mobile = ?,
        website = ?, wikipedia = ?, organization_id = ?
      WHERE id = ?
    `);

    updateStmt.run(
      type,
      name,
      votes || 0,
      profession,
      birth_year,
      birthplace,
      residence,
      electoral_district,
      voting_district,
      lat,
      lon,
      mail,
      mobile,
      website,
      wikipedia,
      organization_id,
      id
    );

    const updatedPerson = getPersonById(id);
    return res.status(200).json(updatedPerson);

  } catch (error) {
    console.error('Error in handlePut:', error);
    return res.status(500).json({ message: 'Error updating person', error: error.message });
  }
}

// Handle PATCH request (Partial update of a person)
function handlePatch(req, res) {
  const { id, ...fieldsToUpdate } = req.body;
  if (!id) {
    return res.status(400).json({ message: 'ID is required for PATCH request' });
  }

  const existingPerson = getPersonById(id);
  if (!existingPerson) {
    return res.status(404).json({ message: 'Person not found' });
  }

  const allowedFields = [
    'type',
    'name',
    'votes',
    'profession',
    'birth_year',
    'birthplace',
    'residence',
    'electoral_district',
    'voting_district',
    'lat',
    'lon',
    'mail',
    'mobile',
    'website',
    'wikipedia',
    'organization_id',
  ];

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(fieldsToUpdate)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }

  try {
    const updateStmt = db.prepare(`
      UPDATE person SET
        ${fields.join(', ')}
      WHERE id = ?
    `);

    updateStmt.run(...values, id);

    const updatedPerson = getPersonById(id);
    return res.status(200).json(updatedPerson);

  } catch (error) {
    console.error('Error in handlePatch:', error);
    return res.status(500).json({ message: 'Error updating person', error: error.message });
  }
}

// Handle DELETE request (Delete a person)
function handleDelete(req, res) {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: 'ID is required for DELETE request' });
  }

  const existingPerson = getPersonById(id);
  if (!existingPerson) {
    return res.status(404).json({ message: 'Person not found' });
  }

  try {
    const deleteStmt = db.prepare('DELETE FROM person WHERE id = ?');
    deleteStmt.run(id);

    return res.status(200).json({ message: 'Person deleted successfully' });

  } catch (error) {
    console.error('Error in handleDelete:', error);
    return res.status(500).json({ message: 'Error deleting person', error: error.message });
  }
}

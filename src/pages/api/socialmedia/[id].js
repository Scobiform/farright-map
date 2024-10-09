import db from '../../../lib/db';

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    if (id) {
      // Fetch social media links for a person by person_id
      const socialMedia = db.prepare('SELECT * FROM social_media WHERE person_id = ?').all(id);
      if (!socialMedia || socialMedia.length === 0) {
        return res.status(404).json({ message: 'Social media not found for this person' });
      }
      return res.status(200).json(socialMedia);
    } else {
      return res.status(400).json({ message: 'Person ID is required' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

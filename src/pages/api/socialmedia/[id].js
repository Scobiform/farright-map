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

  if (req.method === 'POST') {
    const { facebook, instagram, tiktok, x_com, telegram, youtube } = req.body;

    // Ensure at least one social media link is provided
    if (!facebook && !instagram && !tiktok && !x_com && !telegram && !youtube) {
      return res.status(400).json({ message: 'At least one social media link is required' });
    }

    try {
      // Insert or update social media links for the given person_id
      const stmt = db.prepare(`
        INSERT INTO social_media (person_id, platform, url)
        VALUES (?, ?, ?)
        ON CONFLICT (person_id, platform) DO UPDATE SET url = excluded.url
      `);

      // Inserting each social media platform (if they exist)
      const socialMediaData = [
        { platform: 'facebook', url: facebook },
        { platform: 'instagram', url: instagram },
        { platform: 'tiktok', url: tiktok },
        { platform: 'x.com', url: x_com },
        { platform: 'telegram', url: telegram },
        { platform: 'youtube', url: youtube },
      ];

      socialMediaData.forEach(({ platform, url }) => {
        if (url) {
          stmt.run(id, platform, url);
        }
      });

      return res.status(201).json({ message: 'Social media updated successfully' });
    } catch (error) {
      console.error('Error updating social media:', error);
      return res.status(500).json({ message: 'Failed to update social media' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

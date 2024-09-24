import db from '../../lib/db';

export default function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const socialMedia = db.prepare('SELECT * FROM social_media').all(); // Ensure the table name is correct
            return res.status(200).json(socialMedia);
        } catch (error) {
            console.error("Error fetching social media:", error);
            return res.status(500).json({ message: 'Failed to fetch social media' });
        }
    }
    
    if (req.method === 'POST') {
        const { personId, facebook, instagram, tiktok, x_com, telegram, youtube } = req.body;

        if (!personId || !facebook) {
            return res.status(400).json({ message: 'personId and at least one social media link (facebook) are required' });
        }

        try {
            const stmt = db.prepare(`
                INSERT INTO social_media (person_id, facebook, instagram, tiktok, x_com, telegram, youtube) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(personId, facebook, instagram || "", tiktok || "", x_com || "", telegram || "", youtube || "");

            return res.status(201).json({ message: 'Social media created' });
        } catch (error) {
            console.error("Error inserting social media:", error);
            return res.status(500).json({ message: 'Failed to create social media entry' });
        }
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
}

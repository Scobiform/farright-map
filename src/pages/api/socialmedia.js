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

    if (req.method === 'PATCH') {
        const { personId, socialMediaLinks } = req.body;
        if (!personId || !Array.isArray(socialMediaLinks)) {
            return res.status(400).json({ message: 'Invalid data' });
        }

        // Begin transaction
        const transaction = db.transaction(() => {
            // Delete existing social media links
            const deleteStmt = db.prepare('DELETE FROM social_media WHERE person_id = ?');
            deleteStmt.run(personId);

            // Insert new social media links
            const insertStmt = db.prepare(
            'INSERT INTO social_media (platform, url, person_id) VALUES (?, ?, ?)'
            );
            for (const link of socialMediaLinks) {
            insertStmt.run(link.platform, link.url, personId);
            }
        });

        try {
            transaction();
            res.json({ message: 'Social media links updated successfully' });
        } catch (error) {
            console.error('Error updating social media links:', error);
            res.status(500).json({ message: 'Error updating social media links' });
        }
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
}

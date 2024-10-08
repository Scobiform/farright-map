import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Initialize the database
const db = new Database(path.resolve('public/data.db'));

// Drop database tables if they exist
const dropTables = () => {
    try {
        db.exec(`DROP TABLE IF EXISTS social_media`);
        db.exec(`DROP TABLE IF EXISTS event`);
        db.exec(`DROP TABLE IF EXISTS location`);
        db.exec(`DROP TABLE IF EXISTS entity`);
        db.exec(`DROP TABLE IF EXISTS person`);
        db.exec(`DROP TABLE IF EXISTS organization`);
        console.log("Tables dropped successfully.");
    } catch (error) {
        console.error("Error dropping tables:", error);
    }
};

// Create tables
const createTables = () => {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS organization (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL
            );
        `);
        console.log("Organization table created.");

        db.exec(`
            CREATE TABLE IF NOT EXISTS person (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT,
                name TEXT,
                votes INTEGER,
                profession TEXT,
                birth_year INTEGER,
                birthplace TEXT,
                residence TEXT,
                electoral_district INTEGER,
                voting_district INTEGER,
                lat REAL NOT NULL,
                lon REAL NOT NULL,
                mail TEXT,
                mobile TEXT,
                website TEXT,
                wikipedia TEXT,
                organization_id INTEGER,
                attributes TEXT,
                FOREIGN KEY (organization_id) REFERENCES organization(id)
            );
        `);
        console.log("Person table created.");

        db.exec(`
            CREATE TABLE IF NOT EXISTS location (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                lat REAL NOT NULL,
                lon REAL NOT NULL,
                organization_id INTEGER,
                person_id INTEGER,
                FOREIGN KEY (organization_id) REFERENCES organization(id),
                FOREIGN KEY (person_id) REFERENCES person(id)
            );
        `);
        console.log("Location table created.");

        db.exec(`
            CREATE TABLE IF NOT EXISTS event (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                date TEXT NOT NULL,
                location_id INTEGER,
                FOREIGN KEY (location_id) REFERENCES location(id)
            );
        `);
        console.log("Event table created.");

        // Create social media table
        db.exec(`
            CREATE TABLE IF NOT EXISTS social_media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT NOT NULL,
                url TEXT,
                person_id INTEGER,
                FOREIGN KEY (person_id) REFERENCES person(id)
            );
        `);
        console.log("Social media table created.");
        
    } catch (error) {
        console.error("Error creating tables:", error);
    }
};

// Load candidate data from JSON file
const loadData = (filePath) => {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    try {
        const parsedData = JSON.parse(jsonData);
        console.log("JSON Data Read Successfully.");
        return parsedData;
    } catch (error) {
        console.error("Error parsing JSON:", error.message);
        return null;
    }
};

// Insert a person into the database
const insertPerson = (candidate, personType, organizationId) => {
    const insertPersonStmt = db.prepare(`
        INSERT INTO person (
            name, type, profession, birth_year, birthplace, residence, 
            electoral_district, lat, lon, mail, mobile, website, wikipedia,
            votes, voting_district, organization_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return insertPersonStmt.run(
        candidate.name || "Unknown",
        personType,
        candidate.profession || "",
        candidate.birth_year || 0,
        candidate.birthplace || "",
        candidate.residence || "",
        candidate.electoral_district || "0",
        parseFloat(candidate.lat) || 52.5214295,
        parseFloat(candidate.lon) || 13.4136877,
        candidate.mail || "",
        candidate.mobile || "",
        candidate.website || "",
        candidate.wikipedia || "",
        candidate.votes || "0",
        candidate.voting_district || "0",
        organizationId
    );
};

// Insert organizations into the database
const insertOrganizations = (organizations) => {
    try {
        const insertOrgStmt = db.prepare(`
            INSERT OR IGNORE INTO organization (name, type) VALUES (?, ?)
        `);
        organizations.forEach(org => {
            insertOrgStmt.run(org.name, org.type);
        });
        console.log("Organizations inserted or ignored if already exist.");
    } catch (error) {
        console.error("Error inserting organizations:", error);
    }
};

// Insert candidates into the database
const insertCandidate = (candidate, organizationId) => {
    try { 
        let personType = candidate.type === "kreis" ? "district" : "state"; 
        // If organization ID is greater than 3, it is an legal entity
        if (organizationId > 3) {   
            personType = "entity";
        }
        const personResult = insertPerson(candidate, personType, organizationId);

        // Insert social media if it exists
        if (candidate.social_media && candidate.social_media.length > 0) {
            insertSocialMedia(candidate.social_media, personResult.lastInsertRowid);
        }

        return personResult.lastInsertRowid;
    } catch (error) {
        console.error("Error inserting candidate:", error);
        return null;
    }
};

// Insert location data for candidates
const insertLocation = (candidate, organizationId, personId) => {
    const latitude = parseFloat(candidate.lat);
    const longitude = parseFloat(candidate.lon);

    if (isNaN(latitude) || isNaN(longitude)) {
        console.error("Invalid latitude or longitude for candidate:", candidate);
        return;
    }

    const insertLocationStmt = db.prepare(`
        INSERT INTO location (name, lat, lon, organization_id, person_id)
        VALUES (?, ?, ?, ?, ?)
    `);
    
    insertLocationStmt.run(
        candidate.residence,
        latitude,
        longitude,
        organizationId,
        personId
    );
};

// Insert social media data for a candidate
const insertSocialMedia = (socialMediaArray, personId) => {
    try {
        const insertSocialMediaStmt = db.prepare(`
            INSERT INTO social_media (platform, url, person_id)
            VALUES (?, ?, ?)
        `);

        socialMediaArray.forEach(socialMedia => {
            for (const [platform, url] of Object.entries(socialMedia)) {
                if(url) {
                    insertSocialMediaStmt.run(
                        platform || "", 
                        url || "", 
                        personId
                    );
                }
            }
        });
    } catch (error) {
        console.error("Error inserting social media:", error);
    }
};

// Insert all candidates for an organization
const insertCandidates = (organizations) => {
    organizations.forEach(org => {
        if (Array.isArray(org.candidates)) {
            org.candidates.forEach(candidate => {
                const personId = insertCandidate(candidate, org.id);
                if (personId) {
                    insertLocation(candidate, org.id, personId);
                }
                
            });
        } else {
            console.error(`No candidates found for organization with ID ${org.id}`);
        }
    });
};

// Change person.type from district_candidate to district and state_candidate to state
const changePersonType = () => {
    try {
        db.exec(`
            UPDATE person SET type = 'district' WHERE type = 'district_candidate';
            UPDATE person SET type = 'state' WHERE type = 'state_candidate';
        `);
        console.log("Person types updated successfully.");
    } catch (error) {
        console.error("Error updating person types:", error);
    }
}

// Main execution
const main = () => {

    dropTables();
    createTables();

    const organizationsData = [
        { name: 'AfD', type: 'party' },
        { name: 'III_Weg', type: 'party' },
        { name: 'WU', type: 'party' },
        { name: 'Media', type: 'organization' },
        { name: 'Fraternities', type: 'association' },
        { name: 'Associations', type: 'association' },
        { name: 'Settlers', type: 'association' }
    ];

    insertOrganizations(organizationsData);

    const dataPath = path.resolve('src/data/data.json');
    // Add Saxony data
    const saxonyDataPath = path.resolve('src/data/saxony/sachsen_landtag2024_afd_direktbewerberin.json');
    const saxonyData = loadData(saxonyDataPath);
    // Load the rest of the data
    let data = loadData(dataPath);
    // Merge Saxony data with the rest of the data
    if (saxonyData && data) {
        data.AfD = data.AfD.concat(saxonyData.AfD);
    }
    // Array to hold all candidates
    let allCandidates = [];

    // Add all candidates to the array
    if (data) {
        allCandidates = [
            ...allCandidates,
            { candidates: data.AfD, id: 1 },
            { candidates: data.III_Weg, id: 2 },
            { candidates: data.WU, id: 3 },
            { candidates: data.Media, id: 4 },
            { candidates: data.Fraternities, id: 5 },
            { candidates: data.Associations, id: 6 },
            { candidates: data.Settlers, id: 7 }
        ];
    } else {
        console.error("No data loaded from data.json.");
    }

    // Add district candidates data
    const kreisDataPath = path.resolve('src/data/kreis_data.json');
    const kreis_data = loadData(kreisDataPath);
    if (kreis_data) {
        allCandidates.push({ candidates: kreis_data.AfD, id: 1 }); 
    } else {
        console.error("No data loaded from kreis_data.json.");
    }

    insertCandidates(allCandidates);
    changePersonType();
};

// Run once ;)
//main();

export default db;
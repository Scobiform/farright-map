import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Initialize the database
const db = new Database(path.resolve('public/data.db'));

// Drop database tables if they exist
const dropTables = () => {
    try {
        db.exec(`DROP TABLE IF EXISTS person_attributes;`);
        console.log("Person attributes table dropped.");
        db.exec(`DROP TABLE IF EXISTS social_media;`);
        console.log("Social media table dropped.");
        db.exec(`DROP TABLE IF EXISTS event;`);
        console.log("Event table dropped.");
        db.exec(`DROP TABLE IF EXISTS location;`);
        console.log("Location table dropped.");
        db.exec(`DROP TABLE IF EXISTS person;`);
        console.log("Person table dropped.");
        db.exec(`DROP TABLE IF EXISTS organization;`);
        console.log("Organization table dropped.");

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
                FOREIGN KEY (organization_id) REFERENCES organization(id)
            );
        `);
        console.log("Person table created.");

        db.exec(`
            CREATE TABLE IF NOT EXISTS person_attributes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                person_id INTEGER,
                key TEXT NOT NULL,
                value TEXT,
                FOREIGN KEY (person_id) REFERENCES person(id)
            );
        `);
        console.log("Person attributes table created.");

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
        personType || "state",
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
        organizationId || 0
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

// Insert a candidate
const insertCandidate = (candidate, organizationId) => {
    try {
        
        // Person type is based on the candidate type
        let personType = candidate.type 
        ? (candidate.type === "kreis" 
            ? "district" 
            : candidate.type === "federal" 
                ? "federal" 
                : "state") 
        : "state";
        
        console.log("Person type:", personType);

        // If organization ID is greater than 3, change to "entity"
        if (organizationId > 3) {
            personType = "entity";
        }

        const personResult = insertPerson(candidate, personType, organizationId);

        // Insert social media if it exists
        if (candidate.social_media && Array.isArray(candidate.social_media) && candidate.social_media.length > 0) {
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
                console.log("Inserting candidate:", candidate);
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
        { name: 'Settlers', type: 'association' },
        { name: 'Fundis', type: 'association' },
    ];

    insertOrganizations(organizationsData);

    const dataPath = path.resolve('src/data/data.json');
    // Load the rest of the data
    let data = loadData(dataPath);

    // Add federal data
    // Add baden-wuerttemberg data
    const federalDataPath = path.resolve('src/data/bund2025/candidates_bawue.json');
    const federalData = loadData(federalDataPath);
    // Merge federal data with the rest of the data
    if (federalData && data) {
        data.AfD = data.AfD.concat(federalData.AfD);
    }
    // Add Berlin data
    const berlinDataPath = path.resolve('src/data/bund2025/candidates_berlin.json');
    const berlinData = loadData(berlinDataPath);
    // Merge Berlin data with the rest of the data
    if (berlinData && data) {
        data.AfD = data.AfD.concat(berlinData.AfD);
    }
    // Add Saxony data
    const saxonyDataPath = path.resolve('src/data/saxony/sachsen_landtag2024_afd_direktbewerberin.json');
    const saxonyData = loadData(saxonyDataPath);
    // Merge Saxony data with the rest of the data
    if (saxonyData && data) {
        data.AfD = data.AfD.concat(saxonyData.AfD);
    }
    // Add Thuringia landtag direct data
    const thuringiaDataPath = path.resolve('src/data/thuringia/candidates_direkt.json');
    const thuringiaData = loadData(thuringiaDataPath);
    // Merge Thuringia data with the rest of the data
    if (thuringiaData && data) {
        data.AfD = data.AfD.concat(thuringiaData.AfD);
    }

    // Add Thuringia landtag list data
    const thuringiaListDataPath = path.resolve('src/data/thuringia/candidates_liste.json');
    const thuringiaListData = loadData(thuringiaListDataPath);
    // Merge Thuringia list data with the rest of the data
    if (thuringiaListData && data) {
        data.AfD = data.AfD.concat(thuringiaListData.AfD);
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
            { candidates: data.Settlers, id: 7 },
            { candidates: data.Fundis, id: 8 }
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
};

// Run once ;)
//main();

export default db;
import { useRef, useState, useEffect, use } from 'react';
import Head from 'next/head';

import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import Map from '@components/Map';
import Button from '@components/Button';

import styles from '@styles/Home.module.scss';
import landdata from '@data/data.json'
import kreisdata from '@data/kreis_data.json'

const appTitle = process.env.NEXT_PUBLIC_APP_TITLE;

// BERLIN BERLIN 52.521429561594175, 13.413687786049813
const DEFAULT_CENTER = [52.5214295, 13.4136877]

// Function to generate custom icon based on party
// CSS classes are in global.scss
const getIcon = (party) => {
  return new L.DivIcon({
    className: `marker-${party} invert`,
    iconSize: [21, 21],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

export default function Home() {

  const mapRef = useRef(null); // Ref to store the map instance
  const [isMapReady, setIsMapReady] = useState(true); // Track if the map is initialized

  const [visibleParties, setVisibleParties] = useState({
    AfD: true,
    III_Weg: true,
    WU: true,
    Media: true,
    Locations: true,
    Fraternities: true,
    Organizations: true,
    Settlers: true
  });

  // Function to toggle party visibility
  const toggleParty = (party) => {
    setVisibleParties((prevState) => ({
      ...prevState,
      [party]: !prevState[party],
    }));
  };

  
  // HandleClick function to handle button clicks for candidates
  const handleClick = (lat, lon) => {
    console.log(lat, lon);
  };

  // Combine landdata and kreisdata
  // ToDo: Add bunddata 
  // Assuming landdata and kreisdata are loaded as JavaScript objects
  const mergedData = Object.keys(landdata).reduce((acc, party) => {
    
    // Start with the party data from landdata
    acc[party] = [...landdata[party]];

    // If the party also exists in kreisdata, combine the entries
    if (kreisdata[party]) {
      acc[party] = acc[party].concat(kreisdata[party]);  // Add kreisdata entries to the existing landdata entries
    }

    return acc;
  }, {});

  // Include any parties that are only in kreisdata but not in landdata
  Object.keys(kreisdata).forEach((party) => {
    if (!mergedData[party]) {
      mergedData[party] = [...kreisdata[party]]; // Add parties that are only in kreisdata
    }
  });

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');

  // Function to filter candidates based on the search query dynamically in all fields of the person object
const filteredCandidates = Object.keys(mergedData).reduce((acc, party) => {
  const filteredPartyCandidates = mergedData[party].filter((person) => {
    const lowerSearchQuery = searchQuery.toLowerCase();

    // Iterate through all keys in the person object and check if any value contains the search query
    return Object.keys(person).some((key) => {
      const value = person[key];

      // Handle different data types (string, number, array, object)
      if (typeof value === 'string' || typeof value === 'number') {
        return value.toString().toLowerCase().includes(lowerSearchQuery);
      }

      // If the field is an array, check if any item in the array contains the search query
      if (Array.isArray(value)) {
        return value.some((item) => {
          if (typeof item === 'string' || typeof item === 'number') {
            return item.toString().toLowerCase().includes(lowerSearchQuery);
          } else if (typeof item === 'object') {
            // If the array contains objects, check their values too
            return Object.values(item).some((nestedValue) => 
              nestedValue && nestedValue.toString().toLowerCase().includes(lowerSearchQuery)
            );
          }
          return false;
        });
      }

      // If the field is an object, check if any value in the object contains the search query
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((nestedValue) =>
          nestedValue && nestedValue.toString().toLowerCase().includes(lowerSearchQuery)
        );
      }

      return false;
    });
  });

  if (filteredPartyCandidates.length > 0) {
    acc[party] = filteredPartyCandidates;
  }
  
  return acc;
}, {});

// Create polygons from the kreisdata
const polygonsData = Object.keys(kreisdata).reduce((acc, party) => {
  kreisdata[party].forEach((person) => {
    const boundingbox = person.boundingbox;
    
    // Ensure the bounding box has exactly 4 coordinates: [south, north, west, east]
    if (boundingbox.length === 4) {
      const [south, north, west, east] = boundingbox.map(coord => parseFloat(coord));

      // Create a polygon using the bounding box corners
      const polygonCoords = [
        [south, west], // Southwest corner
        [north, west], // Northwest corner
        [north, east], // Northeast corner
        [south, east], // Southeast corner
        [south, west]  // Close the loop by returning to the Southwest corner
      ];

      acc.push(polygonCoords); // Add the polygon coordinates to the array
    }
  });
  return acc;
}, []);

const getRandomCoordinate = (min, max) => {
  return Math.random() * (max - min) + min;
};

const getCenterCoordinate = (south, north, west, east) => {
  const centerLat = (south + north) / 2;
  const centerLon = (west + east) / 2;
  return [centerLat, centerLon];
};

const offsetDistance = 0.00021; // Set a distance to offset the markers horizontally


  return (
    <Layout>
      <Head>
        <title>{appTitle}</title>
        <meta name="description" content="Easy overview to see every politician and the corrosponding electoral district. Overview of social media metrics and follower graph." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Section>
        <Container>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by candidate name..."
            value={searchQuery}
            className={styles.inputText} 
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

          {/* Buttons to toggle visibility of parties */}
          <div className={styles.partyControls}>
            {Object.keys(visibleParties).map((party) => (
              <Button key={party} onClick={() => toggleParty(party)}>
                {visibleParties[party] ? `${party}` : `${party}`}
              </Button>
            ))}
          </div>

          {/* Candidate List with onClick handlers */}
          <div className={styles.candidateList}>
            <h3>Candidate List</h3>
            <ul>
              {Object.keys(filteredCandidates).map((party) =>
                filteredCandidates[party].map((person, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => handleClick(parseFloat(person.lat), parseFloat(person.lon))}
                      disabled={!isMapReady}
                    >
                      {person.name} - {party}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>


          <Map className={styles.homeMap} 
               center={DEFAULT_CENTER} 
               zoom={8}
               polygons={polygonsData}
              >
            {({ TileLayer, Marker, Popup, Tooltip }) => (
              <>
                <TileLayer
                  url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
                  attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
                />

                {/* Loop through parties and candidates */}
                {Object.keys(filteredCandidates).map((party) =>
                  visibleParties[party] ? filteredCandidates[party].map((person, index) => {

                    // Use regex to capture the part before 'OT' in the residence string
                    const match = person.residence.match(/^(.*?)\s+OT\b/) || [person.residence];
                    const residenceWithoutOT = match[1] || match[0];

                    // Extract bounding box values
                    const boundingbox = person.boundingbox || [];
                    let position = [person.lat, person.lon];
                    return (
                      <Marker key={index} position={position} icon={getIcon(party.toLowerCase())}>
                        <Tooltip>{person.name} - {party}</Tooltip>
                        <Popup className={styles.noBorder}>
                          <h2>{person.name} <p className="left">{party}</p></h2>
                          <ul>
                            {Object.entries(person).map(([key, value]) => {
                              // Exclude unnecessary properties
                              if (!value || ["name", "social_media", "position", "lat", "lon"].includes(key)) {
                                return null;
                              }

                              // Render websites as clickable links
                              if (["website", "wikipedia", "tuewat"].includes(key)) {
                                return (
                                  <li key={key}>
                                    <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
                                  </li>
                                );
                              }

                              // Default rendering for other properties
                              return <li key={key}>{key}: {value}</li>;
                            })}
                          </ul>

                          <hr />
                          <h3>Social Media Links</h3>
                          <ul>
                            {Object.entries(person.social_media[0]).map(([platform, url]) => 
                              url ? (
                                <li key={platform}>
                                  <a href={url} target="_blank" rel="noopener noreferrer">{platform}</a>
                                </li>
                              ) : null
                            )}
                          </ul>

                          <h3>Search on other sites</h3>
                          <ul>
                            <li>
                              <a
                                href={`https://www.northdata.de/${person.name}, ${residenceWithoutOT}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                northdata
                              </a>
                            </li>
                            <li>
                              <a
                                href={`https://www.abgeordnetenwatch.de/profile?politician_search_keys=${person.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                abgeordnetenwatch
                              </a>
                            </li>
                            <li>
                              <a
                                href={`https://www.google.com/search?q=${person.name} ${party}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                google.com search
                              </a>
                            </li>
                            <li>
                              <a
                                href={`https://yandex.ru/search/?text=${person.name} ${party}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                yandex.ru search
                              </a>
                            </li>
                            <li>
                              <a
                                href={`https://www.bing.com/search?q=${person.name} ${party}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                bing.com search
                              </a>
                            </li>
                          </ul>
                        </Popup>
                      </Marker>
                    );
                  }) : null
                )}

              </>
            )}
          </Map>
        </Container>
      </Section>
    </Layout>
  )
}

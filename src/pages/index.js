import { useRef, useState, useEffect } from 'react';
import Head from 'next/head';

import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import Map from '@components/Map';
import Button from '@components/Button';

import styles from '@styles/Home.module.scss';
import rechtelandeslistebrandenburg from '@data/data.json'


const appTitle = process.env.NEXT_PUBLIC_APP_TITLE;

// BERLIN BERLIN 52.521429561594175, 13.413687786049813
const DEFAULT_CENTER = [52.5214295, 13.4136877]

// Function to generate custom icon based on party
// CSS classes are in global.scss
const getIcon = (party) => {
  return new L.DivIcon({
    className: `marker-${party}`,
    iconSize: [21, 21],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Function to apply jitter if multiple markers are in the same spot
const jitterPosition = (lat, lon, index) => {
  const jitterAmount = 0.000001; 
  return [lat + jitterAmount * (index % 2 === 0 ? 1 : -1), lon + jitterAmount * (index % 2 === 0 ? 1 : -1)];
};

export default function Home() {

  const mapRef = useRef(null); // Ref to store the map instance
  const [isMapReady, setIsMapReady] = useState(true); // Track if the map is initialized

  const [visibleParties, setVisibleParties] = useState({
    AfD: true,
    III_Weg: true,
    WU: true,
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

  return (
    <Layout>
      <Head>
        <title>{appTitle}</title>
        <meta name="description" content="Easy overview to see every politician and the corrosponding electoral district. Overview of social media metrics and follower graph." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Section>
        <Container>

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
              {Object.keys(rechtelandeslistebrandenburg).map((party) =>
                rechtelandeslistebrandenburg[party].map((person, index) => (
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
               whenCreated={(mapInstance) => {
                mapRef.current = mapInstance; 
                console.log("Map instance created:", mapInstance);
                setIsMapReady(true); 
              }}
              >
            {({ TileLayer, Marker, Popup }) => (
              <>
                <TileLayer
                  url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
                  attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />

                {/* Loop through parties and candidates */}
                {Object.keys(rechtelandeslistebrandenburg).map((party) =>
                  visibleParties[party]
                    ? rechtelandeslistebrandenburg[party].map((person, index) => {
                        // Apply jitter to positions that are in the same spot
                        const position = jitterPosition(parseFloat(person.lat), parseFloat(person.lon), index);
                        // Regex to capture the part before 'OT'
                        var match = person.residence.match(/^(.*?)\s+OT\b/);

                        if (!match || !match[1]) {
                          match = [person.residence];
                        }
                        else
                        {
                          match = match[1];
                        }

                        

                        return (
                          <Marker key={index} position={position} icon={getIcon(party.toLowerCase())}>
                            <Popup>
                              <h2>{person.name}</h2>
                              <br />
                              {person.residence} <br /> ({party})
                              <br />
                              {person.birth_year}
                              <br />
                              {person.birthplace}
                              <br />
                              {person.profession}
                              <br />
                              {person.mail}
                              <br />
                              {person.mobile}
                              <br />
                              <a href={person.website} target="_blank" rel="noopener noreferrer">
                                {person.website}
                              </a>
                              <hr />
                              <h3>Social Media Links</h3>
                              <ul>
                                {Object.entries(person.social_media[0]).map(([platform, url]) => 
                                  url ? (
                                    <li key={platform}>
                                      <a href={url} target="_blank" rel="noopener noreferrer">
                                        {platform}
                                      </a>
                                    </li>
                                  ) : null
                                )}
                              </ul>
                              <h3>Search on other sites</h3>
                              <ul>
                                <li>
                                <a
                                href={`https://www.northdata.de/${(person.name)} ${(match)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                northdata
                              </a>
                                </li>
                                <li>
                                <a
                                  href={`https://www.abgeordnetenwatch.de/profile?politician_search_keys=${(person.name)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  abgeordnetenwatch
                                </a>
                              </li>
                              <li>
                                <a
                                  href={`https://www.google.com/search?q=${(person.name)} ${(party)} `}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                google.com search
                                </a>
                              </li>
                              <li>
                                <a
                                  href={`https://yandex.ru/search/?text=${(person.name)} ${(party)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                yandex.ru search
                                </a>
                              </li>
                              <li>
                                <a
                                  href={`https://www.bing.com/search?q=${(person.name)} ${(party)}`}
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
                      })
                    : null
                )}
              </>
            )}
          </Map>
        </Container>
      </Section>
    </Layout>
  )
}

import { useRef, useState, useEffect } from 'react';
import Head from 'next/head';

import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import Map from '@components/Map';
import Button from '@components/Button';

import styles from '@styles/Home.module.scss';

const appTitle = process.env.NEXT_PUBLIC_APP_TITLE;

// Default center for the map BERLIN
const DEFAULT_CENTER = [52.5214295, 13.4136877];

// Function to generate custom icon based on party
const getIcon = (type, orgname) => {
  return new L.DivIcon({
    className: `marker-${type} ${orgname} invert`,
    iconSize: [14, 14],
    iconAnchor: [14, 14],
    popupAnchor: [1, -34],
  });
};

export default function Home() {
  const [visibleParties, setVisibleParties] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [socialMedia, setSocialMedia] = useState([]);

  // Fetch data from API routes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [organizationsRes, personsRes, locationsRes, socialMediaRes] = await Promise.all([
          fetch('/api/organization').then((res) => res.json()),
          fetch('/api/person').then((res) => res.json()),
          fetch('/api/location').then((res) => res.json()),
          fetch('/api/socialmedia').then((res) => res.json()),
        ]);

        // Set organizations and initialize visibleParties
        setOrganizations(organizationsRes);
        setVisibleParties(
          organizationsRes.reduce((acc, org) => {
            acc[org.name] = true; // Initialize all organizations as visible
            return acc;
          }, {})
        );

        // Map locations by person_id
        const locationsMap = locationsRes.reduce((acc, location) => {
          acc[location.person_id] = [location.lat, location.lon];
          return acc;
        }, {});

        // Map social media by person_id
        const socialMediaMap = socialMediaRes.reduce((acc, sm) => {
          if (!acc[sm.person_id]) {
            acc[sm.person_id] = [];
          }
          acc[sm.person_id].push({ type: sm.type, url: sm.url });
          return acc;
        }, {});

        // Combine persons with their organizations
        const personsWithOrganizations = personsRes.map((person) => {
          const organization = organizationsRes.find(org => org.id === person.organization_id);
          return { ...person, organization };
        });

        setLocations(locationsMap);
        setSocialMedia(socialMediaMap);
        setCandidates(personsWithOrganizations);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Filter candidates based on the search query dynamically
  const filteredCandidates = candidates.filter(person => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    // Iterate through all fields of the candidate object
    return Object.entries(person).some(([key, value]) => {
      if (value) {
        if (typeof value === 'string' || typeof value === 'number') {
          // Convert value to string and compare with the search query
          return value.toString().toLowerCase().includes(lowerSearchQuery);
        } else if (Array.isArray(value)) {
          // If the field is an array (like social media), check its contents
          return value.some(item => 
            typeof item === 'object'
              ? Object.values(item).some(v => v.toString().toLowerCase().includes(lowerSearchQuery))
              : item.toString().toLowerCase().includes(lowerSearchQuery)
          );
        }
      }
      return false;
    });
  });

  // Function to toggle organization visibility
  const toggleParty = (orgName) => {
    setVisibleParties((prevState) => ({
      ...prevState,
      [orgName]: !prevState[orgName],
    }));
  };

  return (
    <Layout>
      <Head>
        <title>{appTitle}</title>
        <meta name="description" content="Overview of politicians and their corresponding electoral districts." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Section>
        <Container>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              className={styles.inputText}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Organization controls */}
          <div className={styles.partyControls}>
            {organizations.map((org) => (
              <Button key={org.id} onClick={() => toggleParty(org.name)}>
                {visibleParties[org.name] ? org.name : org.name}
              </Button>
            ))}
          </div>

          {/* Map Component */}
          <Map className={styles.homeMap} center={DEFAULT_CENTER} zoom={8}>
            {({ TileLayer, Marker, Popup, Tooltip }) => (
              <>
                <TileLayer
                  url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                {filteredCandidates.map((person, index) => {
                  const position = locations[person.id];
                  const orgName = person.organization?.name;
                  const socialLinks = socialMedia[person.id] || [];

                  return position && visibleParties[orgName] ? (
                    <Marker key={index} position={position} icon={getIcon(person.type, orgName.toLowerCase())}>
                      <Tooltip>{person.name} - {orgName}</Tooltip>
                      <Popup>
                        <h2>{person.name} <p className="left">{orgName}</p></h2>
                        <ul>
                          {Object.entries(person).map(([key, value]) => {
                            if (!value || ['name', 'organization', 'lat', 'lon'].includes(key)) {
                              return null;
                            }
                            return <li key={key}>{key}: {value}</li>;
                          })}
                        </ul>
                        <hr />   
                        {socialLinks.length > 0 ? (
                          <>
                          <h3>Social Media</h3>
                          <ul>
                            {socialLinks.map((link, index) => (
                              <li key={index}>
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                  {link.url}
                                </a>
                              </li>
                            ))}
                          </ul>
                          </>
                        ) : (
                          <></>
                        )}
                      </Popup>
                    </Marker>
                  ) : null;
                })}
              </>
            )}
          </Map>
        </Container>
      </Section>
    </Layout>
  );
}

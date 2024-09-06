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
  return (
    <Layout>
      <Head>
        <title>{appTitle}</title>
        <meta name="description" content="Easy overview to see every politician and the corrosponding electoral district. Overview of social media metrics and follower graph." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Section>
        <Container>
          <Map className={styles.homeMap} center={DEFAULT_CENTER} zoom={8}>
            {({ TileLayer, Marker, Popup }) => (
              <>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />

                {/* Loop through data */}
                {Object.keys(rechtelandeslistebrandenburg).map((party) =>
                  rechtelandeslistebrandenburg[party].map((person, index) => {
                    // Apply jitter to positions that are in the same spot
                    const position = jitterPosition(parseFloat(person.lat), parseFloat(person.lon), index);
                    // Regex to capture the part before 'OT'
                    var match = person.residence.match(/^(.*?)\s+OT\b/);

                    if (match !== null) {
                      console.log("Matched part before OT: ", match[1]);
                    } else {
                      // Fallback
                      match = [person.residence];
                    }

                    return (
                      <Marker key={index} position={position} icon={getIcon(party.toLowerCase())}>
                        <Popup>
                          <a 
                            href={`https://www.northdata.de/${(person.name)}, ${match[1]}`} 
                            target="_blank" 
                            rel="noopener noreferrer">
                            {person.name}
                          </a>
                          <br /> 
                          {person.residence} 
                          <br /> 
                          ({party})
                          <br />
                          {person.birth_year}
                          <br />
                          {person.birthplace}
                          <br />
                          {person.profession}
                        </Popup>
                      </Marker>
                    );
                  })
                )}
              </>
            )}
          </Map>
        </Container>
      </Section>
    </Layout>
  )
}

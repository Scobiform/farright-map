import Head from 'next/head';

import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import Map from '@components/Map';
import Button from '@components/Button';

import styles from '@styles/Home.module.scss';
import rechtelandeslistebrandenburg from '@data/rechtelandeslistebrandenburg_updated.json'

const DEFAULT_CENTER = [53.312339, 13.868030]

// Function to generate custom icon based on party
// CSS classes are in global
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

  // View
  return (
    <Layout>
      <Head>
        <title>Landesliste Brandenburg 2024 - FarRight politicians only</title>
        <meta name="description" content="Easy overview to see every politician and the corrosponding electoral district. Overview of social media metrics and follower graph." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section>
        <Container>
          <h1 className={styles.title}>
              Landesliste Brandenburg 2024 - FarRight politicians only
          </h1>

          <Map className={styles.homeMap} center={DEFAULT_CENTER} zoom={8}>
            {({ TileLayer, Marker, Popup }) => (
              <>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />

                {/* Loop through rechtelandeslistebrandenburg data */}
                {Object.keys(rechtelandeslistebrandenburg).map((party) =>
                  rechtelandeslistebrandenburg[party].map((person, index) => {
                    // Apply jitter to positions that are in the same spot
                    const position = jitterPosition(parseFloat(person.lat), parseFloat(person.lon), index);


                    return (
                      <Marker key={index} position={position} icon={getIcon(party.toLowerCase())}>
                        <Popup>
                          {person.name} <br /> {person.residence} <br /> ({party})
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

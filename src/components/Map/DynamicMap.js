import { useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import { useState } from 'react';
import Leaflet from 'leaflet';
import * as ReactLeaflet from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.scss';
// © Die Bundeswahlleiterin, Statistisches Bundesamt, Wiesbaden 2024,
// Wahlkreiskarte für die Wahl zum 21. Deutschen Bundestag
// Grundlage der Geoinformationen © Geobasis-DE / BKG 2024
import bundestagGeoData from '@data/bund2025/geo.json';
// © Der Landeswahlleiter Berlin/Amt für Statistik Berlin-Brandenburg
// Wahlkreise zur Landtagswahl 2024 in Brandenburg
import geodata from '@data/geo.json';
// © Der Landeswahlleiter Berlin/Amt für Statistik Berlin-Brandenburg
// Wahlkreise zur Wahl des Abgeordnetenhauses von Berlin 2023
import berlinGeoData from '@data/berlin/geo.json';
// Copyright: Jörg Reichert
// MIT License
// https://github.com/CodeforLeipzig/wahldaten/
import sachsenGeoData from '@data/saxony/geo.json';
// https://wahlen.thueringen.de/landtagswahlen/lw_informationen.asp
// © GDI-Th / Thüringer Landesamt für Statistik
// Lizenz: Datenlizenz Deutschland – Namensnennung – Version 2.0
// https://www.govdata.de/dl-de/by-2-0
import thuringiaGeoData from '@data/thuringia/geo.json';
// © Statistisches Landesamt Baden-Württemberg, Stuttgart 2020
// Wahlkreiskarte für die Landtagswahl 2021 in Baden-Württemberg
// Kartengrundlage: LGL (www.lgl-bw.de), Stadt Freiburg, Stadt Karlsruhe, Stadt Mannheim, Landeshauptstadt Stuttgart
import badenWuerttembergGeoData from '@data/baden-wuerttemberg/geo.json';
// © Landesamt für Statistik Niedersachsen
// Wahlkreiseinteilung zur Landtagswahl 2022 in Niedersachsen
// https://www.statistik.niedersachsen.de/startseite/
import niedersachsenGeoData from '@data/lower-saxony/geo.json';
//  Ministerium des Innern des Landes Nordrhein-Westfalen, IT.NRW, Düsseldorf
// Wahlkreiseinteilung des Landes Nordrhein-Westfalen zur Landtagswahl am 15. Mai 2022.
// https://www.it.nrw/
import nrwGeoData from '@data/north-rhine-westphalia/geo.json';
// © Bayerisches Landesamt für Statistik
// Wahlkreiseinteilung zur Landtagswahl 2023 in Bayern
// https://www.statistik.bayern.de/
import bavariaGeoData from '@data/bavaria/geo.json';
// © Statistisches Amt für Hamburg und Schleswig-Holstein, Hamburg 2024
// Wahlkreiseinteilung zur Bürgerschaftswahl 2025 in Hamburg
// https://www.statistik-nord.de/
import hamburgGeoData from '@data/hamburg/geo.json';
// © Die Landeswahlleiterin, Statistisches Amt Saarland, Saarbrücken 2022
// Wahlkreiseinteilung zur Landtagswahl 2022 im Saarland
// https://wahlergebnis.saarland.de
import saarlandGeoData from '@data/saarland/geo.json';
// © Statistisches Landesamt Bremen
// Wahlkreiseinteilung zur Bürgerschaftswahl 2023 in Bremen
// https://www.wahlen-bremen.de
import bremenGeoData from '@data/bremen/bremen_geo.json';
import bremerhavenGeoData from '@data/bremen/bremerhaven_geo.json';
// © Statistisches Amt für  Hamburg und Schleswig-Holstein 2022
// © GeoBasis-DE/ LVermGeo SH / BKG (2022)
import schleswigHolsteinGeoData from '@data/schleswig-holstein/geo.json';
// © Landesamt für innere Verwaltung, Mecklenburg-Vorpommern
// Amt für Geoinformation, Vermessungs- und Katasterwesen - Geodatenservice
// Wahlkreiseinteilung zur Landtagswahl 2021 in Mecklenburg-Vorpommern
// https://www.laiv-mv.de/
import mecklenburgVorpommernGeoData from '@data/mecklenburg/geo.json';
// © Statistisches Landesamt Sachsen-Anhalt, Magdeburg 2021
// Wahlkreiseinteilung zur Landtagswahl 2021 in Sachsen-Anhalt
// https://wahlergebnisse.sachsen-anhalt.de
import sachsenAnhaltGeoData from '@data/saxony-anhalt/geo.json';
// © Hessisches Statistisches Landesamts
// Wahlkreiseinteilung zur Landtagswahl 2023 in Hessen
// https://www.statistik-hessen.de
import hessenGeoData from '@data/hesse/geo.json';
// © Rheinland-Pfalz, Statistisches Landesamt
// Wahlkreiseinteilung zur Landtagswahl 2021 in Rheinland-Pfalz
// https://www.statistik.rlp.de
import rheinlandPfalzGeoData from '@data/rhineland-palatinat/geo.json';

// Other components
import DistrictCard from '@components/Card/DistrictCard';
import LoadingSpinner from '@components/Visual/LoadingSpinner'; 

// Import the required components from React-Leaflet
const { MapContainer, 
  TileLayer, 
  LayersControl, 
  Marker, 
  Popup, 
  Polygon, 
  ToolTip, 
  GeoJSON } = ReactLeaflet;

// Custom Map component
const DynamicMap = ({ polygons = [], 
  ToolTip = "", 
  children, 
  className, width = "100vw", height = "98vh", ...rest }) => {
  
  // Default to Bundestagwahl data
  const [selectedMap, setSelectedMap] = useState('bundestag');
  // Loading state for fetching data
  const [loading, setLoading] = useState(false);
  
  let mapClassName = styles.map;

  if (className) {
    mapClassName = `${mapClassName} ${className}`;
  }

  // Event handler for the dropdown
  const handleSwitch = (event) => {
    setSelectedMap(event.target.value);
  }; 

  // Function to fetch district data from the API
  const fetchDistrictData = async (code, state) => {
    try {
      const response = await fetch(`/api/district?code=${code}&state=${state}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch district data:', error);
    }
  };

  /* Function to fetch electoral district data from electIT */
  /* PLEASE PROVIDE OPEN API ENDPOINT */
  const fetchElectITData = async (properties, state) => {
    setLoading(true); 
    try {
      let electoralDistrict;
      switch (state.toLowerCase()) {
        case 'sh': // Schleswig-Holstein
          electoralDistrict = properties.WKNR_int;
          break;
        case 'brandenburg':
          electoralDistrict = properties.gebietNr;
          break;
        case 'berlin':
          // parentNr
          electoralDistrict = properties.parentNr;
          break;
        case 'bundestag':
          electoralDistrict = properties.WKR_NR;
          break;
        default:
          console.warn(`State '${state}' not recognized.`);
          electoralDistrict = null; // Fallback in case of an unrecognized state
          break;
      }

      // API endpoint for fetching district data
      // api/download?electoralDistrict=1&state=sh
      const response = await fetch(`/api/download?electoralDistrict=${electoralDistrict}&state=${state}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch district data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const electIT = (feature, layer, state) => {
    layer.on('click', async (e) => {
      try {
          // Fetch district data asynchronously
          const districtData = await fetchElectITData(feature.properties, state);
          // Render the DistrictCard component with the fetched data
          const popupContent = ReactDOMServer.renderToString(
              <DistrictCard district={districtData || feature.properties} state={state} />
          );
          // Bind the popup to the layer after the data is fetched
          layer.bindPopup(popupContent).openPopup();
      } catch (error) {
          console.error("Error fetching district data:", error);
          // Fallback to rendering feature properties if fetching fails
          const fallbackContent = ReactDOMServer.renderToString(
              <DistrictCard district={feature.properties} />
          );
          layer.bindPopup(fallbackContent).openPopup();
      }
  });
  };

  const rlphessen = (feature, layer, state) => {
    // Add a click event listener to the layer
    layer.on('click', async (e) => {
      try {
          // Fetch district data asynchronously
          const districtData = await fetchDistrictData(feature.properties.code, state);
          
          // Render the DistrictCard component with the fetched data
          const popupContent = ReactDOMServer.renderToString(
              <DistrictCard district={districtData || feature.properties} />
          );
          
          // Bind the popup to the layer after the data is fetched
          layer.bindPopup(popupContent).openPopup();
      } catch (error) {
          console.error("Error fetching district data:", error);
          // Fallback to rendering feature properties if fetching fails
          const fallbackContent = ReactDOMServer.renderToString(
              <DistrictCard district={feature.properties} />
          );
          layer.bindPopup(fallbackContent).openPopup();
      }
    });
  };

  const onEachFeature = (feature, layer, state) => {
    const stateHandlers = {
      sh: electIT,
      bremen: electIT,
      berlin: electIT,
      brandenburg: electIT,
      hessen: rlphessen,
      rlp: rlphessen,
      bundestag: electIT,
    };
  
    const handler = stateHandlers[state] || ((feature, layer) => {
      const popupContent = ReactDOMServer.renderToString(
        <DistrictCard district={feature.properties} />
      );
      layer.bindPopup(popupContent);
    });
  
    handler(feature, layer, state);
  };
  
  return (
    <>
    {/* Conditionally render LoadingSpinner */}
    {loading && <LoadingSpinner />}
    <MapContainer 
      className={mapClassName + " invert"} 
      style={{ width, height }} 
      keyboard={true} 
      ToolTip={ToolTip}
      {...rest}
    >
      {/* Electoral view Dropdown */}
      <div className={styles.electoralSwitch}>
        <label>
          <strong>Wahlkreise anzeigen: </strong>
          <select onChange={handleSwitch} value={selectedMap}>
            <option value="bundestag">Bundestagswahlkreise</option>
            <option value="landtag">Landtagswahlkreise</option>
          </select>
        </label>
      </div>

      {/* Add LayersControl to the Map */}
      <LayersControl position="topright">
        {/* Add OpenStreetMap Layer */}
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        {/* Add OpenTopoMap Layer */}
        <LayersControl.BaseLayer name="OpenTopoMap">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
          />
        </LayersControl.BaseLayer>
        {/* Add Cyclosm Layer */}
        <LayersControl.BaseLayer name="cyclosm">
          <TileLayer
            url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://cyclosm.openstreetmap.fr">cyclosm</a>'
          />
        </LayersControl.BaseLayer>
        {/* Add Satellite Layer */}
        <LayersControl.BaseLayer name="Esri World Imagery">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/en-us/home">Esri</a>, USGS, NOAA'
          />
        </LayersControl.BaseLayer>
        {/* Add the World Terrain Base Layer */}
        <LayersControl.BaseLayer name="Esri World Terrain">
          <TileLayer
            url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri, USGS, NOAA'
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {/* Render additional children passed into the Map component */}
      {children(ReactLeaflet, Leaflet)}

      {/* Conditional Rendering for Bundestagswahl and Landtagswahl */}
      {selectedMap === 'bundestag' && (
          <GeoJSON data={bundestagGeoData} 
            style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
            onEachFeature={(feature, layer) => onEachFeature(feature, layer, 'bundestag')}
          />
        )}

        {selectedMap === 'landtag' && (
          <>
            {/* Render all Landtagswahlkreise GeoJSONs */}
            <GeoJSON data={geodata} 
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => onEachFeature(feature, layer, 'brandenburg')}
            />
            <GeoJSON data={sachsenGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={onEachFeature}
            />
            <GeoJSON data={thuringiaGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={onEachFeature}
            />
            <GeoJSON data={badenWuerttembergGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={onEachFeature}
            />
            <GeoJSON data={berlinGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => onEachFeature(feature, layer, 'berlin')}
            />
            <GeoJSON data={niedersachsenGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={onEachFeature}
            />
            <GeoJSON data={nrwGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={onEachFeature}
            />
            <GeoJSON data={bavariaGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={onEachFeature}
            />
            <GeoJSON data={hamburgGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={onEachFeature}
            />
            <GeoJSON data={saarlandGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={onEachFeature}
            />
            <GeoJSON data={bremenGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={onEachFeature}
            />
            <GeoJSON data={bremerhavenGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={onEachFeature}
            />
            <GeoJSON data={schleswigHolsteinGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => onEachFeature(feature, layer, 'sh')}
            />
            <GeoJSON data={mecklenburgVorpommernGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={onEachFeature}
            />
            <GeoJSON data={sachsenAnhaltGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={onEachFeature}
            />
            <GeoJSON data={hessenGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => onEachFeature(feature, layer, 'hessen')}
            />
            <GeoJSON data={rheinlandPfalzGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => onEachFeature(feature, layer, 'rlp')}
            />
          </>
        )}
      </MapContainer>
    </>
  );
};

export default DynamicMap;

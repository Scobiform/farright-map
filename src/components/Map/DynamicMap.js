import { useEffect } from 'react';
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
  
  const [selectedMap, setSelectedMap] = useState('bundestag'); // Default to Bundestagwahl data
  
  let mapClassName = styles.map;

  if (className) {
    mapClassName = `${mapClassName} ${className}`;
  }

  const handleSwitch = (event) => {
    setSelectedMap(event.target.value);
  };

  return (
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

      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="OpenTopoMap">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
          />
        </LayersControl.BaseLayer>
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
      </LayersControl>

      {/* Render additional children passed into the Map component */}
      {children(ReactLeaflet, Leaflet)}

      {/* Conditional Rendering for Bundestagswahl and Landtagswahl */}
      {selectedMap === 'bundestag' && (
          <GeoJSON data={bundestagGeoData} 
            style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
            onEachFeature={(feature, layer) => {
              if (feature.properties && feature.properties.WKR_NAME) {
                layer.bindPopup(feature.properties.WKR_NAME);
              }
            }}
          />
        )}

        {selectedMap === 'landtag' && (
          <>
            {/* Render all Landtagswahlkreise GeoJSONs */}
            <GeoJSON data={geodata} 
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.name) {
                  layer.bindPopup(feature.properties.name);
                }
              }}
            />
            <GeoJSON data={sachsenGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.WahlkreisName) {
                  layer.bindPopup(feature.properties.WahlkreisName);
                }
              }}
            />
            <GeoJSON data={thuringiaGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.WK) {
                  layer.bindPopup(feature.properties.WK);
                }
              }}
            />
            <GeoJSON data={badenWuerttembergGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties['WK Name']) {
                  layer.bindPopup(feature.properties['WK Name']);
                }
              }}
            />
            <GeoJSON data={berlinGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.name) {
                  layer.bindPopup(feature.properties.name);
                }
              }}
            />
            <GeoJSON data={niedersachsenGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.WKName) {
                  layer.bindPopup(feature.properties.WKName);
                }
              }}
            />
            <GeoJSON data={nrwGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.Name) {
                  layer.bindPopup(feature.properties.Name);
                }
              }}
            />
            <GeoJSON data={bavariaGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.SKR_NAME) {
                  layer.bindPopup(feature.properties.SKR_NAME);
                }
              }}
            />
            <GeoJSON data={hamburgGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.WK_Name) {
                  layer.bindPopup(feature.properties.WK_Name);
                }
              }}
            />
            <GeoJSON data={saarlandGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.name) {
                  layer.bindPopup(feature.properties.name);
                }
              }}
            />
            <GeoJSON data={bremenGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.name) {
                  layer.bindPopup(feature.properties.name);
                }
              }}
            />
            <GeoJSON data={bremerhavenGeoData}
              style={() => ({ color: 'green', weight: 1, fillColor: 'green', fillOpacity: 0.1 })}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.name) {
                  layer.bindPopup(feature.properties.name);
                }
              }}
            />
          </>
        )}
      </MapContainer>
  );
};

export default DynamicMap;

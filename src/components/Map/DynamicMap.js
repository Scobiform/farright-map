import { useEffect } from 'react';
import Leaflet from 'leaflet';
import * as ReactLeaflet from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.scss';
import geodata from '@data/geo.json';
// Copyright: Jörg Reichert
// MIT License
// https://github.com/CodeforLeipzig/wahldaten/
import sachsenGeoData from '@data/saxony/geo.json';

const { MapContainer, TileLayer, LayersControl, Marker, Popup, Polygon, ToolTip, GeoJSON } = ReactLeaflet;

const DynamicMap = ({ polygons = [], ToolTip = "", children, className, width = "100vw", height = "100vh", ...rest }) => {
  let mapClassName = styles.map;

  if (className) {
    mapClassName = `${mapClassName} ${className}`;
  }


  return (
    <MapContainer 
      className={mapClassName + " invert"} 
      style={{ width, height }} 
      keyboard={true} 
      ToolTip={ToolTip}
      {...rest}
    >
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

      {/* Render Polygons */}
      {polygons.map((polygonCoords, index) => (
        <Polygon key={index} positions={polygonCoords} color="rgba(210,210,140,0.0)" />
      ))}

      {/* Render additional children passed into the Map component */}
      {children(ReactLeaflet, Leaflet)}
        
      {/* Render Brandenburg GeoJSON */}
      <GeoJSON data={geodata} 
        style={() => ({ 
          color: 'green',
          weight: 1,
          fillColor: 'green',
          fillOpacity: 0.1
        })}
      />
      {/* Render Sachsen GeoJSON */}
      <GeoJSON data={sachsenGeoData}
        style={() => ({
          color: 'green',
          weight: 1,
          fillColor: 'green',
          fillOpacity: 0.1
        })}
      />

    </MapContainer>
  );
};

export default DynamicMap;

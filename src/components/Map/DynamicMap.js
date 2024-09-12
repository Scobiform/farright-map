import { useEffect } from 'react';
import Leaflet from 'leaflet';
import * as ReactLeaflet from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import styles from './Map.module.scss';

const { MapContainer, TileLayer, LayersControl, Marker, LayerGroup, Popup } = ReactLeaflet;

const Map = ({ children, className, width = "100vw", height = "100vh", ...rest }) => {
  let mapClassName = styles.map;

  if (className) {
    mapClassName = `${mapClassName} ${className}`;
  }

  useEffect(() => {
    (async function init() {
      delete Leaflet.Icon.Default.prototype._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
        iconUrl: 'leaflet/images/marker-icon.png',
        shadowUrl: 'leaflet/images/marker-shadow.png',
      });
    })();
  }, []);

  return (
    <MapContainer 
      className={mapClassName} 
      style={{ width, height }}
      keyboard={true}
      {...rest}
    >
      <LayersControl position="topright">
        {/* Base layer */}
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>

        {/* Additional base layer */}
        <LayersControl.BaseLayer name="OpenTopoMap">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
          />
        </LayersControl.BaseLayer>

        {/* Overlay layer with markers */}
        <LayersControl.Overlay name="Marker Layer">
          <LayerGroup>
            <Marker position={[51.505, -0.09]}>
              <Popup>A popup for this marker.</Popup>
            </Marker>
          </LayerGroup>
        </LayersControl.Overlay>
      </LayersControl>

      {/* Render any additional children passed into the Map component */}
      {children(ReactLeaflet, Leaflet)}
    </MapContainer>
  )
}

export default Map;

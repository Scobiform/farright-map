import geopandas as gpd
from pyproj import CRS

# Load shapefile
shapefile = gpd.read_file('LWK.shp')

# Define the source CRS (EPSG:31466 for DHDN / Gauss-Krüger Zone 2) and target CRS (EPSG:4326 for WGS84)
source_crs = CRS("EPSG:31466")
target_crs = CRS("EPSG:4326")

# Reproject the shapefile to WGS84 (lat/lon)
shapefile = shapefile.to_crs(target_crs)

# Convert to GeoJSON and save
shapefile.to_file('geo.json', driver='GeoJSON')


import geopandas as gpd
from pyproj import CRS

# Load shapefile
shapefile = gpd.read_file('btw25_geometrie_wahlkreise_shp_geo.shp')

# Define the target CRS (EPSG:4326)
target_crs = CRS("EPSG:4326")

# Reproject the shapefile to WGS84 (lat/lon)
shapefile = shapefile.to_crs(target_crs)

# Convert to GeoJSON and save
shapefile.to_file('geo.json', driver='GeoJSON')
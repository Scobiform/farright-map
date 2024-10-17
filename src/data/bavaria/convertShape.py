import geopandas as gpd
from pyproj import CRS

# Load shapefile
shapefile = gpd.read_file('Stimmkreis.shp')

# EPSG:31468 is the code for the DHDN / 3-degree Gauss-Kruger zone 4 coordinate reference system
source_crs = CRS("EPSG:31468")
target_crs = CRS("EPSG:4326")

# Reproject the shapefile to WGS84 (lat/lon)
shapefile = shapefile.to_crs(target_crs)

# Convert to GeoJSON and save
shapefile.to_file('geo.json', driver='GeoJSON')


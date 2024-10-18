import geopandas as gpd
from pyproj import CRS

# Load shapefile
shapefile = gpd.read_file('HSL_Landtagswahlkreise_2023.shp')

# EPSG:25832 for ETRS_1989_UTM_Zone_32N and EPSG:4326 for WGS84
source_crs = CRS("EPSG:25832")
target_crs = CRS("EPSG:4326")

# Reproject the shapefile to WGS84 (lat/lon)
shapefile = shapefile.to_crs(target_crs)

# Convert to GeoJSON and save
shapefile.to_file('geo.json', driver='GeoJSON')

# Convert GeoPackage to GeoJSON
# Source: Thüringer Landesamt für Statistik
# 16TH_L24_Wahlkreiseinteilung.gpkg
# https://wahlen.thueringen.de/landtagswahlen/lw_informationen.asp
# © GDI-Th / Thüringer Landesamt für Statistik
# Lizenz: Datenlizenz Deutschland – Namensnennung – Version 2.0
# https://www.govdata.de/dl-de/by-2-0

import geopandas as gpd
import json

# Load the GeoPackage file
gdf = gpd.read_file("16TH_L24_Wahlkreiseinteilung.gpkg")

# Reproject to WGS84 (lat/lon)
gdf = gdf.to_crs(epsg=4326)

# Function to reformat properties and rename the 'WK' key to 'DistrictName'
def reformat_properties(properties):
    return {
        "WahlkreisNr": str(properties.get("WK_ID", "")),
        "DistrictName": properties.get("WK", "")  # Rename WK to DistrictName
    }

# Apply the reformatting to each feature's properties
gdf["properties"] = gdf.apply(lambda row: reformat_properties(row), axis=1)

# Convert the GeoDataFrame to GeoJSON format
geojson_output = json.loads(gdf.to_json())

# Ensure that the 'properties' column has the renamed values
for feature in geojson_output['features']:
    feature['properties'] = reformat_properties(feature['properties'])

# Save the corrected GeoJSON
with open("geo.json", "w") as f:
    json.dump(geojson_output, f, indent=4)

print("GeoJSON file created: geo.json")

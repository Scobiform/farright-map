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

# Function to reformat properties using only provided data
def reformat_properties(properties):
    formatted_properties = {
        "WahlkreisNr": str(properties.get("WK_ID", "")),
        "WahlkreisName": properties.get("WK", ""),
    }
    return formatted_properties

# Apply the reformatting to each feature's properties
gdf["properties"] = gdf.apply(lambda row: reformat_properties(row), axis=1)

# Convert the GeoDataFrame to GeoJSON and save it to a file
geojson_output = gdf.to_json()

# Save the reformatted GeoJSON to a file
with open("reformatted_geo.json", "w") as f:
    json.dump(json.loads(geojson_output), f, indent=4)


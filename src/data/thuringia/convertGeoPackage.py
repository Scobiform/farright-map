# Convert GeoPackage to GeoJSON
# Source: Thüringer Landesamt für Statistik
# 16TH_L24_Wahlkreiseinteilung.gpkg
# https://wahlen.thueringen.de/landtagswahlen/lw_informationen.asp
# © GDI-Th / Thüringer Landesamt für Statistik
# Lizenz: Datenlizenz Deutschland – Namensnennung – Version 2.0
# https://www.govdata.de/dl-de/by-2-0

import geopandas as gpd

# Load data
gdf = gpd.read_file("16TH_L24_Wahlkreiseinteilung.gpkg")

# Convert to GeoJSON
gdf.to_file("geo.json", driver="GeoJSON")

# Print first 5 rows
print(gdf.head())

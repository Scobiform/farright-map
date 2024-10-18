import geopandas as gpd
import json

# Load the GeoJSON file
gdf = gpd.read_file("geo.json")

# Simplify the polygons
# The tolerance parameter controls the degree of simplification (adjust it as needed)
gdf["geometry"] = gdf["geometry"].simplify(tolerance=0.001, preserve_topology=True)

# Convert the simplified GeoDataFrame back to GeoJSON format
geojson_output = json.loads(gdf.to_json())

# Save the simplified GeoJSON to a file
with open("simplified_geo.json", "w") as f:
    json.dump(geojson_output, f, indent=4)

print("Simplified GeoJSON file created: simplified_geo.json")

import geopandas as gpd
import json
from pyproj import CRS, Transformer
from shapely.geometry import shape
from svgwrite import Drawing

# Load the GeoPackage file
gdf = gpd.read_file("16TH_L24_Wahlkreiseinteilung.gpkg")

# Reproject to WGS84 (lat/lon)
# Assuming the current CRS is EPSG:25832 (UTM Zone 32N)
gdf = gdf.to_crs(epsg=4326)

# Function to reformat properties
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
with open("geo.json", "w") as f:
    json.dump(json.loads(geojson_output), f, indent=4)

# Function to draw the GeoJSON as an SVG file
def drawSVG():
    # Create an SVG drawing
    dwg = Drawing("output.svg", profile="tiny")

    # Parse GeoJSON and draw polygons
    for feature in json.loads(geojson_output)['features']:
        geom = shape(feature['geometry'])
        
        # Convert coordinates to a simple 2D projection (X, Y)
        if geom.geom_type == "MultiPolygon":
            # Iterate over each polygon in the MultiPolygon
            for polygon in geom.geoms:
                # Draw the exterior ring
                for ring in polygon.exterior.coords:
                    dwg.add(dwg.circle(center=ring, r=0.5, fill='black'))
                # Optionally, draw interior rings (holes)
                for interior in polygon.interiors:
                    for ring in interior.coords:
                        dwg.add(dwg.circle(center=ring, r=0.5, fill='red'))
                        
        elif geom.geom_type == "Polygon":
            # Draw the exterior ring
            for ring in geom.exterior.coords:
                dwg.add(dwg.circle(center=ring, r=0.5, fill='black'))
            # Optionally, draw interior rings (holes)
            for interior in geom.interiors:
                for ring in interior.coords:
                    dwg.add(dwg.circle(center=ring, r=0.5, fill='red'))

    # Save the SVG file
    dwg.save()
    print("SVG file created: output.svg")
# Call the function to draw the SVG
#drawSVG()


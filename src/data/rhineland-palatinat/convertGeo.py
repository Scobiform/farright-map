import json

def extract_coordinates(arcs, topo_arcs):
    """Convert TopoJSON arc indexes into actual coordinates"""
    coordinates = []
    for arc_idx in arcs:
        arc = topo_arcs[arc_idx if arc_idx >= 0 else ~arc_idx]
        if arc_idx < 0:
            arc = arc[::-1]  # If index is negative, reverse the arc
        coordinates.extend(arc)
    return coordinates

def convert_topojson_to_geojson(topojson_data):
    """Converts TopoJSON to GeoJSON format"""
    geojson = {
        "type": "FeatureCollection",
        "features": []
    }

    # Get the arcs from the TopoJSON
    topo_arcs = topojson_data["arcs"]
    
    for geometry in topojson_data["objects"]["geo"]["geometries"]:
        if geometry["type"] == "MultiPolygon":
            multipolygon_coords = []
            for polygon_arcs in geometry["arcs"]:
                polygon_coords = []
                for arcs in polygon_arcs:
                    # Convert arcs into coordinates
                    coords = extract_coordinates(arcs, topo_arcs)
                    polygon_coords.append(coords)
                multipolygon_coords.append(polygon_coords)
            
            # Create GeoJSON Feature
            geojson["features"].append({
                "type": "Feature",
                "geometry": {
                    "type": "MultiPolygon",
                    "coordinates": multipolygon_coords
                },
                "properties": geometry.get("properties", {})
            })
    
    return geojson

# Load each TopoJSON file
file_names = ['1000000000000.json','2000000000000.json', '3000000000000.json', '4000000000000.json']

for file_name in file_names:
    with open(file_name, encoding='utf-8') as f:
        topojson_data = json.load(f)

    # And Convert to GeoJSON
    geojson_data = convert_topojson_to_geojson(topojson_data)

    # Save the result as GeoJSON
    with open(file_name.replace('json', 'geojson'), 'w', encoding='utf-8') as f:
        json.dump(geojson_data, f, indent=2)

# Merge all GeoJSON files into one
all_geojson = {
    "type": "FeatureCollection",
    "features": []
}

for file_name in file_names:
    with open(file_name.replace('json', 'geojson')) as f:
        geojson_data = json.load(f)
        all_geojson["features"].extend(geojson_data["features"])

with open('geo.json', 'w', encoding='utf-8') as f:
    json.dump(all_geojson, f, indent=2)


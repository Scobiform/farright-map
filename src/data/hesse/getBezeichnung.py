import json

# Load wk-vec-tree.json
with open('wk-vec-tree.json', 'r', encoding='utf-8') as wk_vec_file:
    wk_vec_data = json.load(wk_vec_file)

# Load geo.json
with open('geo.json', 'r', encoding='utf-8') as geo_file:
    geo_data = json.load(geo_file)

# Loop through the features in geo.json
for feature in geo_data['features']:
    lwk = int(feature['properties']['LWK'])  # Get LWK value, convert to int
    index = lwk  # Adjust LWK to 0-based index

    # Check if the index is valid for wk-vec-tree.json
    if 0 <= index < len(wk_vec_data):
        bezeichnung = wk_vec_data[index].get('bezeichnung')
        # Add the "code" key with the corresponding bezeichnung
        feature['properties']['code'] = bezeichnung

# Write the updated geo.json back to a file
with open('geo.json', 'w', encoding='utf-8') as updated_geo_file:
    json.dump(geo_data, updated_geo_file, ensure_ascii=False, indent=4)

print("geo.json updated successfully with 'code' from wk-vec-tree.json!")

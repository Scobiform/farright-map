import json
import requests
import time
import re

# Load the JSON data from file
with open('data.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Base URL for the geocoding API
GEOCODE_API_URL = "https://geocode.maps.co/search?q="
GEOCODE_API_KEY = "IAMEMPTY" # GET API KEY FROM WEBSITE

def clean_residence(residence):
    # Apply the regex and return the cleaned part
    match = re.match(r'^(.*?)\s*OT\b', residence)
    if match:
        return match.group(1)  # Return the part before "OT"
    return residence  # Return the original if "OT" is not foun

# Function to get geocode data for a given address
def get_geocode(address):
    try:
        # Make a request to the geocoding API
        response = requests.get(GEOCODE_API_URL + address + GEOCODE_API_KEY)
        response.raise_for_status()  # Raise error for bad response
        geodata = response.json() 

        print(geodata)

        # If geocode data is found, return the first result's lat/lon
        if len(geodata) > 0:
            return geodata[0]['lat'], geodata[0]['lon']
        else:
            return None, None
    except Exception as e:
        print(f"Error fetching geocode for {address}: {e}")
        return None, None

# Loop over each party in the data
for party, candidates in data.items():
    print(f"Processing party: {party}")
    
    # Loop over each person in the party's candidates list
    for person in candidates:
        address = person.get('residence')
        address = clean_residence(address)
        
        if address:
            print(f"Fetching geocode for: {address} (Party: {party}, Name: {person.get('name')})")
            lat, lon = get_geocode(address)
            
            # Update person's data if geocode is available
            if lat and lon:
                person['lat'] = lat
                person['lon'] = lon
            else:
                print(f"No geocode found for {address}")
            
            # Be polite and avoid spamming the API too quickly
            time.sleep(7)  # Sleep for 1 second between requests to avoid overloading the server

# Write the updated data back to a new JSON file
with open('data.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)

print("Geocode update complete. Updated data saved ")

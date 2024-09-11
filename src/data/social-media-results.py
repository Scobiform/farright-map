import json
import requests
from bs4 import BeautifulSoup
import time
import random

# Search URL (be mindful of Google scraping limitations)
SEARCH_URL = "https://www.google.com/search?q="
YANDEX_SEARCH_URL = "https://yandex.ru/search/?text="
BING_SEARCH_URL = "https://www.bing.com/search?q="
#SEARCH_URL = BING_SEARCH_URL

# Function to search Google and get the first result matching the platform
def search_google(query, platform):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    # Replace spaces with "+" in the query
    formatted_query = query.replace(" ", "+")

    # Make the request with the formatted query
    response = requests.get(SEARCH_URL + formatted_query, headers=headers)
    
    # Check if the request was successful
    if response.status_code != 200:
        print(f"Error: Received status code {response.status_code} for {query}")
        return None

    soup = BeautifulSoup(response.text, "html.parser")

    print(soup.prettify())

    # Match platform with the corresponding social media domain
    platform_domains = {
        "facebook": "facebook.com",
        "instagram": "instagram.com",
        "tiktok": "tiktok.com",
        "x.com": "twitter.com",
        "telegram": "t.me",
        "youtube": "youtube.com"
    }

    # Find the first result that matches the social media platform
    for link in soup.find_all("a"):
        href = link.get('href')
        if href:
            if platform_domains[platform] in href:
                return href
    return None

def initialize_social_media(data):
    for party, candidates in data.items():
        for candidate in candidates:
            # Initialize social_media if not present or incomplete
            if not candidate.get("social_media"):
                candidate["social_media"] = [{
                    "facebook": "",
                    "instagram": "",
                    "tiktok": "",
                    "x.com": "", 
                    "telegram": "",
                    "youtube": ""
                }]
            else:
                # Ensure all platforms are available
                social_media = candidate["social_media"][0]
                for platform in ["facebook", "instagram", "tiktok", "x.com", "telegram", "youtube"]:
                    if platform not in social_media:
                        social_media[platform] = ""

# Function to update the candidate's social media in data.json
def update_candidate_social_media(party, name, platform, result):
    try:
        with open("data.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Find the candidate in the data
        for candidate in data[party]:
            if candidate["name"] == name:
                # Access the first dictionary inside the social_media array
                social_media_dict = candidate["social_media"][0]
                
                # Update the social media for the given platform
                social_media_dict[platform] = result
                break
        
        # Write the updated data back to data.json
        with open("data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Error updating social media for {name}: {e}")

# Main function to load candidates from data.json and perform the task
def main():
    try:
        # Load candidates from the data.json file
        with open("data.json", "r", encoding="utf-8") as f:
            data = json.load(f)

        # Initialize the social_media structure for all candidates
        initialize_social_media(data)

        # Write the initialized data back to data.json
        with open("data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

        input("Press enter to start scraping")

        # Iterate over each party and candidate
        for party, candidates in data.items():
            for candidate in candidates:
                name = candidate["name"]
                
                # Access the first dictionary inside the social_media array
                social_media = candidate["social_media"][0]

                # Search for each social media platform (Facebook, Instagram, etc.)
                for platform, handle in social_media.items():

                    if not handle: 
                        # Form the search query
                        search_query = f"{name} {party} {platform}"
                        print(f"Searching for {name}'s {platform} profile...")

                        # Perform the Google search and retrieve the actual social media link
                        result = search_google(search_query, platform)

                        print(result)
                        
                        if result:
                            # Update the candidate's social media profile in the data file
                            update_candidate_social_media(party, name, platform, result)
                            print(f"Updated {name} with {platform} profile: {result}")
                        else:
                            print(f"No results found for {name} on {platform}.")

                        # Introduce random sleep between 21-210 seconds
                        sleep_time = random.randint(21, 49)
                        print(f"Sleeping for {sleep_time} seconds...")
                        time.sleep(sleep_time)

    except Exception as e:
        print(f"Error in main function: {e}")

    # Keep the console open for debugging
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()

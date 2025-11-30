# location/utils.py
import requests
import os

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def google_places_search(query):
    url = f"https://maps.googleapis.com/maps/api/place/autocomplete/json"
    params = {
        "input": query,
        "key": GOOGLE_API_KEY,
        "types": "geocode",
        "language": "en"
    }
    response = requests.get(url, params=params)
    return response.json()

def reverse_geocode(lat, lng):
    url = f"https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "latlng": f"{lat},{lng}",
        "key": GOOGLE_API_KEY
    }
    response = requests.get(url, params=params)
    return response.json()
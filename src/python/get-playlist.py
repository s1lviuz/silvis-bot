import json
import os
import sys

from dotenv import load_dotenv
from spotdl import Spotdl

load_dotenv()

playlistUrl = sys.argv[1]

# playlistUrl = input()
    
CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID') or ''
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET') or ''

try :
    spotdl = Spotdl(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)

    songs = spotdl.search([playlistUrl])

    downloadUrls = spotdl.get_download_urls(songs)

    response = {
        'data': downloadUrls,
    }
    
    sys.stdout.write(json.dumps(response))
except Exception as e:
    response = {
        'data': str(e),
        'isError': True,
    }
    
    sys.stdout.write(json.dumps(response))

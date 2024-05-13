import json
import os
import sys

from dotenv import load_dotenv
from spotdl import Spotdl

load_dotenv()

songUrl = ''
for line in sys.stdin:
    songUrl += line

# songUrl = input()
    
CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID') or ''
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET') or ''

try :
    spotdl = Spotdl(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)

    songs = spotdl.search([songUrl])

    downloadUrls = spotdl.get_download_urls(songs)
    
    firstSong = downloadUrls[0]
    
    response = {
        'data': firstSong,
    }

    sys.stdout.write(json.dumps(response))
except Exception as e:
    response = {
        'data': str(e),
        'isError': True,
    }
    
    sys.stdout.write(json.dumps(response))

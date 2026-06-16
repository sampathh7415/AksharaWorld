import requests
import os
from dotenv import load_dotenv
load_dotenv('.env.local')

token = os.getenv('META_PAGE_ACCESS_TOKEN')
app_id = os.getenv('META_APP_ID')
app_secret = os.getenv('META_APP_SECRET')

# Debug token
debug_response = requests.get(
    'https://graph.facebook.com/debug_token',
    params={
        'input_token': token,
        'access_token': f'{app_id}|{app_secret}'
    }
)
print("Debug Token Response:", debug_response.json())

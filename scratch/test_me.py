import requests
import os
from dotenv import load_dotenv
load_dotenv('.env.local')

token = os.getenv('META_PAGE_ACCESS_TOKEN')
response = requests.get(
    'https://graph.facebook.com/v19.0/me',
    params={'access_token': token}
)
print("Me endpoint:", response.json())

import requests
import os
from dotenv import load_dotenv
load_dotenv('.env.local')

token = os.getenv('META_PAGE_ACCESS_TOKEN')
app_id = os.getenv('META_APP_ID')
app_secret = os.getenv('META_APP_SECRET')

# Get Facebook Pages
pages_response = requests.get(
    'https://graph.facebook.com/v19.0/me/accounts',
    params={'access_token': token}
)
pages_data = pages_response.json()
print("Pages:", pages_data)

# Get first page details
if pages_data.get('data'):
    page = pages_data['data'][0]
    page_id = page['id']
    page_token = page['access_token']
    print(f"Page ID: {page_id}")
    print(f"Page Name: {page['name']}")
    
    # Get Instagram Business Account
    ig_response = requests.get(
        f'https://graph.facebook.com/v19.0/{page_id}',
        params={
            'fields': 'instagram_business_account',
            'access_token': page_token
        }
    )
    ig_data = ig_response.json()
    print("Instagram:", ig_data)
    
    if ig_data.get('instagram_business_account'):
        ig_id = ig_data['instagram_business_account']['id']
        print(f"Instagram Account ID: {ig_id}")

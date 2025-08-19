import requests

# Will Do not share this key publicly
COINAPI_API_KEY = "your_coinapi_key_here"  # Replace with your actual CoinAPI key
currencies = ['ETH', 'BTC', 'SOL', 'AVAX']
base_url = "https://rest.coinapi.io/v1/exchangerate/{}/USD"
# chains = ['ETH', 'BTC', 'AVAX']
# metrics_url_template = "https://rest.coinapi.io/v1/metrics/{chain}/active_addresses/daily"

headers = {
    'Accept' : 'text/json',
    "X-CoinAPI-Key": COINAPI_API_KEY
}

def get_daily_metrics(currency):
    url = base_url.format(currency)
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"{currency} data: {data}")
    else:
        print(f"Error for {currency}: {response.status_code} - {response.text}")

for curr in currencies:
    get_daily_metrics(curr)


# def get_active_addresses_last_48_hours(chain):
#     url = metrics_url_template.format(chain=chain)
#     response = requests.get(url, headers=headers)
#     if response.status_code == 200:
#         data = response.json()
        
#         # Calculate date 48 hours ago
#         now = datetime.utcnow()
#         cutoff_date = now - timedelta(hours=48)
        
#         print(f"\n{chain} active addresses in the last 48 hours:")
#         for entry in data:
            
#             entry_date = datetime.strptime(entry['time_period_start'][:19], "%Y-%m-%dT%H:%M:%S")
#             if entry_date >= cutoff_date:
#                 print(f"Date: {entry_date}, Active Addresses: {entry['value']}")
#     else:
#         print(f"Error fetching active addresses for {chain}: {response.status_code} - {response.text}")

# for chain in chains:
#     get_active_addresses_last_48_hours(chain)
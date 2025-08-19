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



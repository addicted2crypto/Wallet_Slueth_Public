import requests

COINAPI_API_KEY = process.env.get('COINAPI_API_KEY')
currencies = ['ETH', 'BTC', 'SOL', 'AVAX']
base_url = "https://rest.coinapi.io/v1/exchangerate/{}/USD"

headers = {
    "X-CoinAPI-Key": API_KEY
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

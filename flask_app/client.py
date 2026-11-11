import sys
import requests

URL = "http://127.0.0.1:5000/api/stats"


def hole_daten(url):
    r = requests.get(url, timeout=5)   
    r.raise_for_status()               
    return r.json()                    


def main():
    try:
        daten = hole_daten(URL)
    except requests.exceptions.ConnectionError:
        print("Server nicht erreichbar")
        sys.exit(1)
    except requests.exceptions.HTTPError as e:
        print(f"Server meldet Fehler: {e}")
        sys.exit(1)

    print(f"{daten['anzahl']} Trades: Mit Gesamtpnl von {daten['gesamt']} $ und Winrate: {daten['winrate']:.2f}%")





if __name__ == "__main__":
    main()
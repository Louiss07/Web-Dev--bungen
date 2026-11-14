from flask import Flask, render_template, request, redirect, url_for
import csv
from pathlib import Path
from flask import abort
from datetime import datetime


app = Flask(__name__)


BASIS = Path(__file__).resolve().parent


def lade_trades():
    with open(BASIS / "trades.csv", newline="", encoding="utf-8") as f:
        zeilen = list(csv.DictReader(f))
    for z in zeilen:
        z["datum"] = (z["datum"])
        z["ticker"] = (z["ticker"])
        z["setup"] = (z["setup"])
        z["richtung"] = (z["richtung"])
        z["pnl"] = float(z["pnl"])
    return zeilen




def statistik(pnls):
    if not pnls:
        raise ValueError("Keine Trades vorhanden – Statistik nicht möglich")
    pnl = 0
    az_trades = len(pnls)
    winner = 0 
    for t in pnls:
        pnl += t
        if t > 0:
            winner += 1

    winrate = (winner / az_trades ) * 100


    return {"gesamt": pnl, "anzahl": az_trades, "winrate": winrate }

punktewert = {"MNQ": 2, "MES": 5, "SPY": 1 }



def punktewert_ticker(ticker):
    wert = punktewert.get(ticker)
    if wert is None:
        raise ValueError(f"Unbekannter ticker {ticker}")
    return wert

    

def berechne_pnl(ticker, richtung, einstieg, ausstieg, groesse):
    punkte = 0
    punktwert = punktewert_ticker(ticker);
    pnl = 0

    if richtung =="long":
        punkte = ausstieg - einstieg;
    elif richtung == "short": 
        punkte = einstieg - ausstieg;
    else: 
        raise ValueError("Das ist kein gültige Richtung, nur long oder short!");

    

    pnl = punkte * groesse * punktwert;

    return pnl




@app.route("/")
def startseite():
    return render_template("index.html",)


@app.route("/about")
def about():
    return "<p>Ich bin Louis</p>"


@app.route("/geheim")
def geheim():
    return "Kein Zugriff", 403

@app.route("/stats")
def stats():
    pnls = [s["pnl"] for s in lade_trades()]

    stat = statistik(pnls)
    return render_template("stats.html", stat=stat, trades=lade_trades(), titel="Statistik")

@app.route("/trade/<int:nummer>")
def trade_detail(nummer):
    trades = lade_trades()
    if nummer < 1 or nummer > len(trades):
        abort(404) 

    return render_template("trade.html", trade=trades[nummer - 1], titel="Trade")


@app.errorhandler(404)
def nicht_gefunden(fehler):
    return render_template("404.html",  title="ERROR"), 404


@app.route("/neu", methods=["GET", "POST"])
def neuer_trade():
    if request.method == "POST":
        
        setup = request.form["setup"]
        ticker = request.form["instrument"]
        richtung = request.form["richtung"]

        try: 
           datum = datetime.strptime(request.form["datum"], "%Y-%m-%d").strftime("%d.%m.%Y")
           stueckzahl = float(request.form["stueckzahl"])
           einstieg = float(request.form["einstieg"])
           ausstieg = float(request.form["ausstieg"])
        except ValueError:
            return render_template("neu.html", fehler="Stückzahl, Einstieg und Ausstieg müssen Zahlen sein"), 400
        if stueckzahl < 1:
            return render_template("neu.html", fehler="Stueckzahl muss mind. 1 sein"), 400

        if richtung not in ("long", "short"):
                    return render_template("neu.html", fehler="Nur long oder short"), 400

        if ticker not in punktewert:
            return render_template("neu.html", fehler=f"Unbekannter Ticker: {ticker}"), 400
        
        pnl = berechne_pnl(ticker, richtung, einstieg, ausstieg, stueckzahl)
        print(pnl)

        with open(BASIS / "trades.csv", "a", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow([datum, ticker, setup, richtung, pnl])

        return redirect(url_for("stats"))
    return render_template("neu.html", titel="Neuer Trade")


@app.route("/api/stats")
def api_stats():
    try: 
        pnls = [s['pnl'] for s in lade_trades()]
        stats = statistik(pnls)

        pnl = stats["gesamt"]
        az_trades = stats["anzahl"]
        winrate = stats["winrate"]
    except ValueError:
        return {"fehler": "Statistik nicht gefunden "}, 404
    return {"gesamt": pnl, "anzahl": az_trades, "winrate": winrate }  


@app.route("/api/trades")
def api_trades():
    trades = lade_trades()
    ticker = request.args.get("ticker")

    if ticker is None:
        return trades

    if ticker not in punktewert:
        return {"fehler": "Ticker nicht gefunden "}, 400

    treffer = [t for t in trades if t["ticker"] == ticker]
    return treffer


@app.route("/api/trade/<int:nummer>")
def api_trade_detail(nummer):
    trades = lade_trades()
    if nummer < 1 or nummer > len(trades):
        return {"fehler":"Unglültige nummer"}, 404

    return trades[nummer - 1]


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/api/trades", methods=["POST"])
def api_trade_neu():
    daten = request.get_json()
    try: 
        datum = datetime.strptime(daten['datum'], "%Y-%m-%d").strftime("%d.%m.%Y")
        ticker = daten['ticker']
        setup = daten['setup']
        richtung = daten['richtung']
        einstieg = float(daten['einstieg'])
        ausstieg = float(daten['ausstieg'])
        groesse = int(daten['stueckzahl'])

    except ValueError as e:
        return {"fehler": f"Nicht gefunden {e} "}, 404
    except KeyError:
        return {"fehler": "Fehlendes Feld"}, 400

    if groesse < 1:
        return {"fehler": "groesse nicht möglich "}, 400
    
    if richtung not in ("long", "short"):
        return {"fehler": "Richtung nur long oder short!"}, 400
    
    if ticker not in punktewert:
        return {"fehler": "Diesen ticker gibt es nicht "}, 400

    pnl = berechne_pnl(ticker, richtung, einstieg, ausstieg, groesse)

    with open(BASIS / "trades.csv", "a", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow([datum, ticker, setup, richtung, pnl])
    

    return {"datum":datum, "ticker":ticker, "setup": setup, "richtung": richtung,"pnl": pnl}, 201


if __name__ == "__main__":
    app.run(debug=True)


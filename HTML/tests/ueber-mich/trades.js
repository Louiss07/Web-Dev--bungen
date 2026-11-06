

const trades = [
    { datum: "09.10.2026", ticker: "MNQ", setup: "EQ", richtung: "long", einstieg: 25480.25, ausstieg: 25532.75, groesse: 2 },
    { datum: "12.10.2026", ticker: "MES", setup: "Liquidity Sweep", richtung: "short", einstieg: 6812.50, ausstieg: 6826.00, groesse: 2 },
    { datum: "13.10.2026", ticker: "SPY", setup: "FVG", richtung: "long", einstieg: 678.40, ausstieg: 681.15, groesse: 20 },
    { datum: "14.10.2026", ticker: "MNQ", setup: "Order Block", richtung: "short", einstieg: 25610.00, ausstieg: 25641.50, groesse: 2 },
    { datum: "15.10.2026", ticker: "MES", setup: "Breaker Block", richtung: "long", einstieg: 6798.25, ausstieg: 6819.75, groesse: 2 },
];
const punktwerte = { MNQ: 2, MES: 5, SPY: 1 };

const list = document.querySelector("#trade-liste");






function punktwertFuer(ticker) {
    const wert = punktwerte[ticker];
    if (wert === undefined) {
        throw new Error(`Unbekannter Ticker: ${ticker}`);
    }
    return wert;
}


function berechnePnl(ticker, richtung, einstieg, ausstieg, groesse) {
    let punkte = 0;
    const punktwert = punktwertFuer(ticker);

    if (richtung === "long") {
        punkte = ausstieg - einstieg;
    } else if (richtung === "short") {
        punkte = einstieg - ausstieg;
    } else {
        throw new Error("Das ist kein gültige Richtung, nur long oder short!");

    }

    const pnl = punkte * groesse * punktwert;

    return pnl;
}

function statistik(pnls) {
    if (pnls.length === 0) { throw new Error("Die liste ist leer"); }
    let gesamtPnl = 0;
    let gewinner = 0;
    let verlier = 0;
    let groessterG = null;
    let groessterL = null;


    for (const pnl of pnls) {
        gesamtPnl += pnl;

        if (pnl > 0) {
            gewinner += 1;
            if (groessterG === null || groessterG <= pnl) {
                groessterG = pnl;
            }
        } else {
            verlier += 1;
            if (groessterL === null || groessterL >= pnl) {
                groessterL = pnl;
            }
        }


    }
    const winrate = (gewinner / pnls.length) * 100;


    return { gesamtPnl, gewinner, verlier, winrate, groessterG, groessterL };
}


function zelleBauen(text) {
    const eintrag = document.createElement("td");
    eintrag.textContent = text;
    return eintrag
}



function tabelleZeichnen() {

    list.replaceChildren();
    const pnls = [];
    for (const t of trades) {

        const fertigePnl = berechnePnl(t.ticker, t.richtung, t.einstieg, t.ausstieg, t.groesse);
        pnls.push(fertigePnl);


        const zeile = document.createElement("tr");

        zeile.append(zelleBauen(t.datum));
        zeile.append(zelleBauen(t.ticker));
        zeile.append(zelleBauen(t.setup));
        zeile.append(zelleBauen(t.richtung));
        zeile.append(zelleBauen(`${t.einstieg.toFixed(2)}`));
        zeile.append(zelleBauen(`${t.ausstieg.toFixed(2)}`));
        const pnlZelle = zelleBauen(`${fertigePnl} $`);

        pnlZelle.classList.remove("gewinn", "verlust")

        if (fertigePnl > 0) {
            pnlZelle.classList.add("gewinn");
        }
        else {
            pnlZelle.classList.add("verlust");

        }
        zeile.append(pnlZelle);
        list.append(zeile);

        zeile.addEventListener("click", function (event) {
            zeile.classList.toggle("markiert");








        });
    }


    const ergebnis = statistik(pnls);



    const AnzGesamtPnl = document.querySelector("#gesamt-pnl");
    AnzGesamtPnl.textContent = `${ergebnis.gesamtPnl.toFixed(2)} $`;


    const tabelleGesamtPnl = document.querySelector("#summe");
    tabelleGesamtPnl.textContent = `${ergebnis.gesamtPnl.toFixed(2)} $`;

    tabelleGesamtPnl.classList.remove("gewinn", "verlust");
    if (ergebnis.gesamtPnl > 0) {
        tabelleGesamtPnl.classList.add("gewinn");
    }
    else {
        tabelleGesamtPnl.classList.add("verlust");

    }

    const AnzWinrate = document.querySelector("#winrate");
    AnzWinrate.textContent = `${ergebnis.winrate.toFixed(2)} %`;


    const versteckKnopf = document.querySelector("#verstecken");
    const karte = document.querySelector(".inhaltKarte2")

    versteckKnopf.addEventListener("click", function () {

        const anzeigeK = karte.classList.toggle("versteckt");


        if (anzeigeK === true) {

            versteckKnopf.textContent = `Statistik Anzeigen`;
        } else {

            versteckKnopf.textContent = `Statistik Verstecken`;
        }

    });






}




const formular = document.querySelector("#trade-form");

formular.addEventListener("submit", function (event) {
    event.preventDefault();

    const neuerTrade = {
        datum: document.querySelector("#datum").value,
        ticker: document.querySelector("#ticker").value,
        setup: document.querySelector("#setup").value,
        richtung: document.querySelector('input[name="richtung"]:checked').value,
        einstieg: Number(document.querySelector("#einstieg").value),
        ausstieg: Number(document.querySelector("#ausstieg").value),
        groesse: Number(document.querySelector("#stueckzahl").value),
    }

    trades.push(neuerTrade);

    tabelleZeichnen();
    formular.reset();



});

tabelleZeichnen();










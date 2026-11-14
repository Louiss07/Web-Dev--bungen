async function ladeTrades() {
    const antwort = await fetch("/api/trades");
    if (!antwort.ok) {
        throw new Error('Server meldet ${antwort.status}');
    }
    const trades = await antwort.json();
    return trades;

}

async function ladeStatistik() {
    const antwort = await fetch("/api/stats")
    if (!antwort.ok) {
        throw new Error('Server meldet ${antwort.status}')
    }
    const stats = await antwort.json();
    return stats;

}


function zelleBauen(text) {
    const eintrag = document.createElement("td");
    eintrag.textContent = text;
    return eintrag
}


function tabelleZeichnen(trades) {
    const list = document.querySelector("#trade-liste");
    list.replaceChildren();
    for (const t of trades) {


        const zeile = document.createElement("tr");

        zeile.append(zelleBauen(t.datum));
        zeile.append(zelleBauen(t.ticker));
        zeile.append(zelleBauen(t.setup));
        zeile.append(zelleBauen(t.richtung));
        const pnlZelle = zelleBauen(`${t.pnl.toFixed(2)} $`);

        pnlZelle.classList.remove("gewinn", "verlust")

        if (t.pnl > 0) {
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



}

function statsKarte(stats) {
    const AnzGesamtPnl = document.querySelector("#gesamt-pnl");
    const tabelleGesamtPnl = document.querySelector("#summe");
    const AnzWinrate = document.querySelector("#winrate");
    const versteckKnopf = document.querySelector("#verstecken");
    const karte = document.querySelector(".inhaltKarte2")



    AnzGesamtPnl.textContent = `${stats.gesamt.toFixed(2)} $`;
    AnzWinrate.textContent = `${stats.winrate.toFixed(2)} %`;


    tabelleGesamtPnl.textContent = `${stats.gesamt.toFixed(2)} $`;

    tabelleGesamtPnl.classList.remove("gewinn", "verlust");
    if (stats.gesamt > 0) {
        tabelleGesamtPnl.classList.add("gewinn");
    }
    else {
        tabelleGesamtPnl.classList.add("verlust");

    }



    versteckKnopf.addEventListener("click", function () {

        const anzeigeK = karte.classList.toggle("versteckt");


        if (anzeigeK === true) {

            versteckKnopf.textContent = `Statistik Anzeigen`;
        } else {

            versteckKnopf.textContent = `Statistik Verstecken`;
        }

    });

}





async function start() {
    try {
        const trades = await ladeTrades();
        const stats = await ladeStatistik();
        tabelleZeichnen(trades);
        statsKarte(stats);
    } catch (fehler) {
        const fehlerFeld = document.querySelector("#fehler");
        fehlerFeld.textContent = "Trades konnten nicht geladen werden.";
        fehlerFeld.classList.remove("versteckt");
        console.error(fehler);
    }
}

start();



const formular = document.querySelector("#trade-form")



formular.addEventListener("submit", async function (event) {
    event.preventDefault();

    const neuerTrade = {
        datum: document.querySelector("#datum").value,
        ticker: document.querySelector("#ticker").value,
        setup: document.querySelector("#setup").value,
        richtung: document.querySelector('input[name="richtung"]:checked').value,
        einstieg: Number(document.querySelector("#einstieg").value),
        ausstieg: Number(document.querySelector("#ausstieg").value),
        stueckzahl: Number(document.querySelector("#stueckzahl").value),
    }

    try {
        await speichereTrades(neuerTrade);
        await start();
        formular.reset();
    }
    catch (fehler) {
        const fehlerFeld = document.querySelector("#fehler");
        fehlerFeld.textContent = fehler.message;
        fehlerFeld.classList.remove("versteckt");
        console.error(fehler);
    }






})

async function speichereTrades(neuerTrade) {


    const antwort = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(neuerTrade),




    });
    if (!antwort.ok) {
        const info = await antwort.json();
        throw new Error(info.fehler);

    }

}






const anzahl = 15;
const preis = 24.5;
console.log(`Menge: ${anzahl}, Preis pro Stück:${preis}, Insgesamt: ${anzahl * preis}$ `);



/*const einstiegText = "25480.25";
const einstieg = Number(einstiegText);
const ticker = "MNQ";
const richtung = "long";
const ausstieg = 25532.75;
const groesse = 2;
const punktwertMNQ = 2; 




console.log(`Trade: ${ticker} ${richtung}, Eingestiegen bei ${einstieg} und Ausgestiegen bei ${ausstieg} `);
console.log(`Ergebnis: ${pnl}$ PNL, ${punkte} Punkte`);*/


const punktwerte = { MNQ: 2, MES: 5, SPY: 1 };

function punktwertFuer(ticker) {
    const wert = punktwerte[ticker];
    if (wert === undefined) {
        throw new Error(`Unbekannter Ticker: ${ticker}`);
    }
    return wert;
}


function berechnePnl(ticker, richtung, einstieg, ausstieg, groesse) {
    let punkte = 0;
    const punktwerte = punktwertFuer(ticker);

    if (richtung === "long") {
        punkte = ausstieg - einstieg;
    } else if (richtung === "short") {
        punkte = einstieg - ausstieg;
    } else {
        throw new Error("Das ist kein gültige Richtung, nur long oder short!");

    }

    const pnl = punkte * groesse * punktwerte;

    return pnl;
}


const t1 = berechnePnl("MNQ", "long", 25480.25, 25532.75, 2);
console.log(`MNQ long: ${t1}`);
const t2 = berechnePnl("MES", "short", 6812.50, 6826.00, 2);
console.log(`MES short: ${t2}`);
const t3 = berechnePnl("SPY", "long", 678.40, 681.15, 20);
console.log(`SPY long: ${t3}`);
const t4 = berechnePnl("MNQ", "short", 25610.00, 25641.50, 2);
console.log(`MNQ short: ${t4}`);
const t5 = berechnePnl("MES", "long", 6798.25, 6819.75, 2);
console.log(`MES long: ${t5}`);



const gesamtPnl = t1 + t2 + t3 + t4 + t5;

console.log(`Die gesamt PNL liegt bei ${gesamtPnl.toFixed(2)}$`);


const pnls = [210, -135, 55, -126, 215];

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




const ergebnis = statistik(pnls);

console.log(`Gesamt-P&L: ${ergebnis.gesamtPnl.toFixed(2)} $`);
console.log(`${ergebnis.gewinner} Gewinner, ${ergebnis.verlier} Verlierer, Winrate ${ergebnis.winrate.toFixed(2)} %`);
console.log(`Größter Gewinn: ${ergebnis.groessterG} $, größter Verlust: ${ergebnis.groessterL} $`);

pnls.push(-80);

const ergebnisNeu = statistik(pnls);
console.log(`Nach neuem Trade: Gesamt-P&L: ${ergebnisNeu.gesamtPnl.toFixed(2)} $, Winrate ${ergebnisNeu.winrate.toFixed(2)} %`);



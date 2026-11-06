
const knopf = document.querySelector("#zaehl-knopf");
const Zaehler = document.querySelector("#zaehler");


let zaehler = 0;

knopf.addEventListener("click", function () {
    zaehler += 1;

    Zaehler.textContent = `${zaehler} Klicks`;
});


/* Container Serraglio — logica del sito
   ------------------------------------------------------------------
   DA MODIFICARE QUANDO HAI I DATI VERI:
   - TELEFONO : numero WhatsApp su cui arrivano gli ordini (formato 39...)
   - ORARI    : un oggetto per giorno, da lunedi a domenica.
                ap/ch = apertura/chiusura in formato "HH:MM", null = chiuso.
   - MENU     : categorie e voci. Ogni voce ha un id univoco, nome,
                desc (anche vuota) e prezzo come numero, con il punto.
                Campo opzionale foto: percorso di un'immagine quadrata
                in img/. Se manca, la voce viene mostrata senza miniatura.
   Il resto del file non va toccato per aggiornare il menu.
   ------------------------------------------------------------------ */

const TELEFONO = "393270536624";

const ORARI = [
  {g:"Lunedì",    ap:"08:00", ch:"19:00"},
  {g:"Martedì",   ap:"08:00", ch:"19:00"},
  {g:"Mercoledì", ap:"08:00", ch:"19:00"},
  {g:"Giovedì",   ap:"08:00", ch:"19:00"},
  {g:"Venerdì",   ap:"08:00", ch:"19:00"},
  {g:"Sabato",    ap:"09:00", ch:"16:00"},
  {g:"Domenica",  ap:null,    ch:null}
];

const MENU = [
  {id:"lezione", nome:"Menù lezione", nota:"Due combo da ordinare al volo nella pausa.", voci:[
    {id:"l1", nome:"Combo schiacciata", desc:"Una schiacciata a scelta, bibita in lattina e caffè.", prezzo:8.00},
    {id:"l2", nome:"Combo burger", desc:"Un hamburger a scelta, patatine fritte e bibita.", prezzo:11.50}
  ]},
  {id:"schiacciate", nome:"Schiacciate", nota:"Schiacciata toscana del forno, tagliata al momento. Le foto sono dei prodotti davvero serviti al banco: quello che vedi è quello che ricevi.", voci:[
    {id:"s1", nome:"La Serraglio", desc:"Prosciutto crudo toscano, pecorino stagionato, rucola, crema di noci.", prezzo:6.50, foto:"img/schiacciata-crudo.png"},
    {id:"s2", nome:"Il Fuorisede", desc:"Mortadella, stracciatella, granella di pistacchio.", prezzo:6.00, foto:"img/schiacciata-banco.png"},
    {id:"s3", nome:"La Tesi", desc:"Porchetta, salsa verde, pomodoro.", prezzo:6.50},
    {id:"s4", nome:"Il Classico", desc:"Salame toscano e pecorino.", prezzo:5.00, foto:"img/schiacciata-salame.png"},
    {id:"s5", nome:"La Biblioteca", desc:"Melanzane grigliate, hummus, pomodori secchi, spinacino. Vegana.", prezzo:5.50},
    {id:"s6", nome:"La Petrino", desc:"Tonno, cipolla rossa, lattuga, maionese.", prezzo:5.50}
  ]},
  {id:"hamburger", nome:"Hamburger", nota:"Carne bovina toscana, pane al latte, cotti sulla piastra.", voci:[
    {id:"h1", nome:"Container 180", desc:"Burger 180 g, cheddar, insalata, pomodoro, salsa della casa.", prezzo:8.00},
    {id:"h2", nome:"Doppio Binario", desc:"Due burger da 100 g, doppio cheddar, bacon, cipolla croccante.", prezzo:9.50},
    {id:"h3", nome:"Bisenzio", desc:"Burger 180 g, brie, cipolle caramellate, rucola.", prezzo:8.50},
    {id:"h4", nome:"Orto", desc:"Burger di ceci e quinoa, hummus, zucchine grigliate. Vegetariano.", prezzo:7.50}
  ]},
  {id:"hotdog", nome:"Hot dog", nota:"Würstel grigliato e pane morbido, 100% suino salvo dove indicato.", voci:[
    {id:"d1", nome:"Classico", desc:"Senape, ketchup, niente fronzoli.", prezzo:4.00},
    {id:"d2", nome:"Prato Dog", desc:"Cheddar fuso, cipolla croccante, salsa barbecue.", prezzo:5.50},
    {id:"d3", nome:"Chili Dog", desc:"Chili di carne, cheddar, jalapeños.", prezzo:6.00},
    {id:"d4", nome:"Veggie Dog", desc:"Würstel vegetale, crauti, senape al miele.", prezzo:5.00}
  ]},
  {id:"fritti", nome:"Da aggiungere", nota:"", voci:[
    {id:"f1", nome:"Patatine fritte", desc:"Porzione singola.", prezzo:3.00},
    {id:"f2", nome:"Patatine cheddar e bacon", desc:"", prezzo:4.50},
    {id:"f3", nome:"Anelli di cipolla", desc:"Sei pezzi.", prezzo:3.50},
    {id:"f4", nome:"Nuggets di pollo", desc:"Sei pezzi, con salsa a scelta.", prezzo:4.00}
  ]},
  {id:"bevande", nome:"Bevande e caffè", nota:"", voci:[
    {id:"b1", nome:"Acqua 0,5 l", desc:"", prezzo:1.00},
    {id:"b2", nome:"Bibita in lattina", desc:"Cola, aranciata, tè al limone.", prezzo:2.00},
    {id:"b3", nome:"Birra alla spina 0,4 l", desc:"Solo dalle 17:00.", prezzo:4.00},
    {id:"b4", nome:"Caffè", desc:"", prezzo:1.10},
    {id:"b5", nome:"Cappuccino", desc:"", prezzo:1.50},
    {id:"b6", nome:"Cornetto", desc:"Vuoto, crema o marmellata.", prezzo:1.30}
  ]}
];

const VOCI = new Map();
MENU.forEach(c => c.voci.forEach(v => VOCI.set(v.id, v)));

const euro = n => n.toLocaleString("it-IT", {style:"currency", currency:"EUR"});
const min = s => { const [h,m] = s.split(":").map(Number); return h*60+m; };
const hhmm = n => String(Math.floor(n/60)).padStart(2,"0") + ":" + String(n%60).padStart(2,"0");
const indiceGiorno = d => (d.getDay() + 6) % 7; // 0 = lunedì

/* ---------- stato dell'ordine ---------- */
let ordine = {};
try {
  const salvato = localStorage.getItem("cs-ordine");
  if (salvato) ordine = JSON.parse(salvato) || {};
} catch (e) { ordine = {}; }

function salva(){
  try { localStorage.setItem("cs-ordine", JSON.stringify(ordine)); } catch (e) {}
}
const pezzi = () => Object.values(ordine).reduce((a,b) => a+b, 0);
const totale = () => Object.entries(ordine).reduce((a,[id,q]) => a + VOCI.get(id).prezzo*q, 0);

function cambia(id, delta){
  const q = (ordine[id] || 0) + delta;
  if (q <= 0) delete ordine[id]; else ordine[id] = q;
  salva(); disegnaTutto();
}

/* ---------- menù ---------- */
function disegnaMenu(){
  document.getElementById("menu-nav").innerHTML =
    MENU.map(c => `<a href="#cat-${c.id}">${c.nome}</a>`).join("");

  document.getElementById("menu-lista").innerHTML = MENU.map(c => `
    <section class="categoria" id="cat-${c.id}">
      <h3>${c.nome}</h3>
      ${c.nota ? `<p class="nota">${c.nota}</p>` : ""}
      <div class="voci">
        ${c.voci.map(v => `
          <article class="voce">
            ${v.foto ? `<img class="voce-foto" src="${v.foto}" alt="${v.nome}" width="206" height="206" loading="lazy">` : ""}
            <div class="voce-testo">
              <h4>${v.nome}</h4>
              ${v.desc ? `<p>${v.desc}</p>` : ""}
              <span class="prezzo">${euro(v.prezzo)}</span>
            </div>
            <div data-comando="${v.id}"></div>
          </article>`).join("")}
      </div>
    </section>`).join("");
}

function disegnaComandi(){
  document.querySelectorAll("[data-comando]").forEach(box => {
    const id = box.dataset.comando;
    const q = ordine[id] || 0;
    box.innerHTML = q === 0
      ? `<button class="aggiungi" type="button" data-piu="${id}" aria-label="Aggiungi ${VOCI.get(id).nome}">+</button>`
      : `<div class="contatore">
           <button type="button" data-meno="${id}" aria-label="Togli uno">−</button>
           <span aria-live="polite">${q}</span>
           <button type="button" data-piu="${id}" aria-label="Aggiungi uno">+</button>
         </div>`;
  });
}

/* ---------- riepilogo ---------- */
function disegnaRiepilogo(){
  const righe = document.getElementById("righe");
  const voci = Object.entries(ordine);
  document.getElementById("campi").hidden = voci.length === 0;
  document.getElementById("invia").disabled = voci.length === 0;

  righe.innerHTML = voci.length === 0
    ? `<p class="vuoto">Il tuo ordine è vuoto. Scegli qualcosa dal menù e torna qui.</p>`
    : voci.map(([id,q]) => {
        const v = VOCI.get(id);
        return `<div class="riga">
          <div class="riga-testo"><strong>${v.nome}</strong><span>${euro(v.prezzo)} × ${q} = ${euro(v.prezzo*q)}</span></div>
          <div class="contatore">
            <button type="button" data-meno="${id}" aria-label="Togli uno">−</button>
            <span>${q}</span>
            <button type="button" data-piu="${id}" aria-label="Aggiungi uno">+</button>
          </div>
        </div>`;
      }).join("");

  document.getElementById("totale").textContent = euro(totale());
}

function disegnaTutto(){
  disegnaComandi();
  disegnaRiepilogo();
  const n = pezzi();
  document.getElementById("conteggio").textContent = n;
  document.getElementById("barra-totale").textContent = euro(totale());
  document.getElementById("barra-pezzi").textContent = n === 1 ? "1 articolo" : n + " articoli";
  document.body.classList.toggle("ha-ordine", n > 0);
}

/* ---------- orari e fasce di ritiro ---------- */
function disegnaOrari(){
  const oggi = indiceGiorno(new Date());
  document.querySelector("#orari tbody").innerHTML = ORARI.map((o,i) => `
    <tr data-oggi="${i === oggi}">
      <th scope="row">${o.g}</th>
      <td>${o.ap ? o.ap + "–" + o.ch : "chiuso"}</td>
    </tr>`).join("");
}

function statoAttuale(){
  const ora = new Date();
  const o = ORARI[indiceGiorno(ora)];
  const adesso = ora.getHours()*60 + ora.getMinutes();
  if (!o.ap) return {aperto:false, testo:"Oggi chiuso · riapriamo lunedì alle 8:00"};
  if (adesso < min(o.ap)) return {aperto:false, testo:"Chiuso · apriamo oggi alle " + o.ap};
  if (adesso >= min(o.ch)) return {aperto:false, testo:"Chiuso per oggi · ordini sempre aperti"};
  return {aperto:true, testo:"Aperto ora · si chiude alle " + o.ch};
}

function disegnaStato(){
  const s = statoAttuale();
  document.getElementById("stato").dataset.chiuso = String(!s.aperto);
  document.getElementById("stato-testo").textContent = s.testo;
}

function fasceRitiro(){
  const ora = new Date();
  for (let salto = 0; salto < 8; salto++){
    const g = ORARI[(indiceGiorno(ora) + salto) % 7];
    if (!g.ap) continue;
    let inizio = min(g.ap);
    if (salto === 0){
      const prima = ora.getHours()*60 + ora.getMinutes() + 15;
      inizio = Math.max(inizio, Math.ceil(prima/10)*10);
    }
    const fine = min(g.ch) - 10;
    if (inizio > fine) continue;
    const etichetta = salto === 0 ? "oggi" : (salto === 1 ? "domani" : g.g.toLowerCase());
    const slot = [];
    for (let t = inizio; t <= fine; t += 10) slot.push({valore:`${etichetta} alle ${hhmm(t)}`, testo:`${etichetta} alle ${hhmm(t)}`});
    return slot;
  }
  return [{valore:"da concordare", testo:"da concordare via messaggio"}];
}

function disegnaFasce(){
  document.getElementById("orario").innerHTML =
    fasceRitiro().map(s => `<option value="${s.valore}">${s.testo}</option>`).join("") +
    `<option value="il prima possibile">il prima possibile</option>`;
}

/* ---------- invio ---------- */
function messaggio(){
  const nome = document.getElementById("nome").value.trim();
  const quando = document.getElementById("orario").value;
  const note = document.getElementById("note").value.trim();
  const righe = Object.entries(ordine)
    .map(([id,q]) => `• ${q}× ${VOCI.get(id).nome} — ${euro(VOCI.get(id).prezzo*q)}`)
    .join("\n");
  return [
    "Ciao Container Serraglio, vorrei ordinare:",
    "",
    righe,
    "",
    "Totale: " + euro(totale()),
    "Ritiro: " + quando,
    nome ? "Nome: " + nome : "",
    note ? "Note: " + note : ""
  ].filter(Boolean).join("\n");
}

/* ---------- eventi ---------- */
document.addEventListener("click", e => {
  const piu = e.target.closest("[data-piu]");
  const meno = e.target.closest("[data-meno]");
  if (piu)  cambia(piu.dataset.piu, 1);
  if (meno) cambia(meno.dataset.meno, -1);
  if (e.target.closest("[data-apri]") || e.target.closest("#apri-ordine")){
    disegnaFasce();
    document.getElementById("ordine").showModal();
  }
});

document.getElementById("chiudi-ordine").addEventListener("click", () => {
  document.getElementById("ordine").close();
});

document.getElementById("invia").addEventListener("click", () => {
  if (pezzi() === 0) return;
  const url = "https://wa.me/" + TELEFONO + "?text=" + encodeURIComponent(messaggio());
  window.open(url, "_blank", "noopener");
});

disegnaMenu();
disegnaOrari();
disegnaStato();
disegnaTutto();
setInterval(disegnaStato, 60000);

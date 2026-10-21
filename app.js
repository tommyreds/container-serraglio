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

/* Orari dal menu ufficiale: "OPEN 10.30 - 18.00".
   Il foglio non distingue i giorni della settimana, quindi la fascia è
   applicata a tutti. Da correggere se il locale ha giorni di chiusura. */
const ORARI = [
  {g:"Lunedì",    ap:"10:00", ch:"15:00"},
  {g:"Martedì",   ap:"10:00", ch:"15:00"},
  {g:"Mercoledì", ap:"10:00", ch:"15:00"},
  {g:"Giovedì",   ap:"10:00", ch:"15:00"},
  {g:"Venerdì",   ap:"10:00", ch:"15:00"},
  {g:"Sabato",    ap:null,    ch:null},
  {g:"Domenica",  ap:null,    ch:null}
];

/* Voci e prezzi trascritti dal menu ufficiale del Container Serraglio.
   Ogni categoria ha prezzo unico; il prezzo comprende bevuta e caffè. */
const MENU = [
  {id:"schiacciate", nome:"Schiacciate", nota:"Prezzo unico 6 \u20ac. Le foto sono indicative e servono a mostrare l\u2019aspetto del prodotto: vanno abbinate alle voci giuste insieme al banco.", voci:[
    {id:"sc1", nome:"Container Serraglio 1", desc:"Crudo, stracciatella, pomodori secchi, rucola.", prezzo:6.00, foto:"img/schiacciata-crudo.png"},
    {id:"sc2", nome:"Container Serraglio 2", desc:"Crudo, mozzarella, crema al tartufo.", prezzo:6.00, foto:"img/schiacciata-banco.png"},
    {id:"al1", nome:"Almanacco 1", desc:"Mortadella, pesto di pistacchio, pomodori secchi.", prezzo:6.00},
    {id:"al2", nome:"Almanacco 2", desc:"Mortadella, stracciatella, crema di carciofi.", prezzo:6.00},
    {id:"pg1", nome:"Playground 1", desc:"Cotto, crema di carciofi, insalata.", prezzo:6.00},
    {id:"pg2", nome:"Playground 2", desc:"Cotto, provola, zucchine.", prezzo:6.00},
    {id:"bi1", nome:"Bischero 1", desc:"Sbriciolona, provola, melanzane, insalata.", prezzo:6.00},
    {id:"bi2", nome:"Bischero 2", desc:"Sbriciolona, crema di carciofi, rucola.", prezzo:6.00, foto:"img/schiacciata-salame.png"},
    {id:"bis", nome:"Bisenzio", desc:"Tonno, pomodoro, maionese, insalata.", prezzo:6.00},
    {id:"cot", nome:"Panino con cotoletta", desc:"", prezzo:6.00}
  ]},
  {id:"pinsa", nome:"Pinsa", nota:"Prezzo unico 7 \u20ac.", voci:[
    {id:"pi1", nome:"Margherita", desc:"", prezzo:7.00},
    {id:"pi2", nome:"Salamino piccante", desc:"", prezzo:7.00},
    {id:"pi3", nome:"Cotto e wurstel", desc:"", prezzo:7.00},
    {id:"pi4", nome:"Napoli", desc:"", prezzo:7.00},
    {id:"pi5", nome:"Crudo", desc:"", prezzo:7.00}
  ]},
  {id:"griglia", nome:"Hamburgher e hot dog", nota:"Prezzo unico 8 \u20ac, patatine fritte comprese.", voci:[
    {id:"hb", nome:"Hamburgher", desc:"Con patatine fritte.", prezzo:8.00},
    {id:"hd", nome:"Hot dog", desc:"Con patatine fritte.", prezzo:8.00}
  ]},
  {id:"primi", nome:"Primi piatti", nota:"Prezzo unico 8 \u20ac.", voci:[
    {id:"pr1", nome:"Primo piatto", desc:"La proposta cambia di giorno in giorno: chiedi al banco quale c\u2019\u00e8 oggi.", prezzo:8.00}
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
  if (!o.ap) return {aperto:false, testo:"Oggi chiuso · ordini sempre aperti"};
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

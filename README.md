# Container Serraglio — sito per ordinare

Sito statico (solo HTML, CSS e JavaScript, nessun server) per ordinare
schiacciate, hamburger e hot dog al Container Serraglio di Prato.
L’ordine viene composto nel browser e inviato come messaggio WhatsApp
precompilato al numero del locale; il pagamento avviene al ritiro.

## File

| File | Cosa contiene |
|---|---|
| `index.html` | struttura della pagina |
| `style.css` | tutta la grafica, palette nelle variabili in `:root` |
| `app.js` | menù, orari, carrello, generazione del messaggio |

Non serve nessun passaggio di build: i file si aprono così come sono.
Per provarlo in locale basta aprire `index.html` con un doppio clic.

## Da aggiornare con i dati veri

Tutto nelle prime righe di `app.js`:

- `TELEFONO` — numero WhatsApp che riceve gli ordini, formato `39...`
  senza `+` e senza spazi.
- `ORARI` — un oggetto per giorno, da lunedì a domenica. `ap` e `ch` sono
  apertura e chiusura in formato `"HH:MM"`; metti `null` su entrambi per
  un giorno di chiusura. Da questi valori il sito calcola da solo il badge
  “Aperto ora / Chiuso” e le fasce di ritiro selezionabili.
- `MENU` — categorie e voci. Ogni voce vuole un `id` univoco (una sigla
  qualsiasi, serve solo al carrello), `nome`, `desc` (può essere `""`) e
  `prezzo` come numero con il punto decimale: `6.50`, non `6,50`.
  Il prezzo viene poi mostrato all’italiana dal codice.

In `index.html` restano da sistemare, quando li hai: indirizzo, testi di
“Dove siamo” e il link alla pagina Facebook.

**Avviso nel piè di pagina**: finché menù e prezzi non sono confermati dal
locale, lascia la riga che dichiara il sito come dimostrativo. Quando i
dati sono quelli veri e hai l’ok dei gestori, rimuovila.

## Pubblicare su GitHub Pages

1. Crea un repository **pubblico**, per esempio `container-serraglio`.
2. Carica i tre file nella radice del repository (non dentro una
   sottocartella: GitHub Pages cerca `index.html` alla radice).
3. `Settings` → `Pages` → Source: `Deploy from a branch`, branch `main`,
   cartella `/ (root)`. Salva.
4. Dopo circa un minuto il sito è online su
   `https://TUONOME.github.io/container-serraglio/`.

Ogni push successivo ripubblica il sito da solo.

Nota: sul piano gratuito GitHub Pages pubblica solo da repository
pubblici, e i termini di servizio escludono l’uso per attività
commerciali vere e proprie. Per un prototipo o un progetto universitario
va benissimo; se diventasse il sito ufficiale del locale conviene
spostarlo su Cloudflare Pages o Netlify.

## Limiti attuali

- Nessun backend: gli ordini non vengono salvati né confermati in
  automatico, arrivano come messaggio al banco.
- Nessuna gestione delle disponibilità: se un prodotto finisce, il sito
  non lo sa.
- Il carrello resta nel `localStorage` del singolo browser.

# Palette — generatore di palette di colori

Un generatore di palette veloce e riservato. Scegli un colore base e un'armonia, blocca i colori che ti piacciono, mescola gli altri ed esporta direttamente in codice. Niente registrazione, niente tracciamento, nessuna build: tutto gira e resta nel tuo browser.

Versione inglese: [README.md](README.md)

## Funzionalità

-   **Nove armonie**: analoga, monocromatica, complementare, complementare divisa, triadica, tetradica, quadrata, toni e tinte, e "sorprendimi". Il colore base è sempre presente nella palette.
-   **Blocca e mescola**: blocca un colore e premi <kbd>spazio</kbd> (o Genera) per averne di nuovi che si abbinano a quelli bloccati.
-   **Modifica ogni colore** con il selettore, **trascina per riordinare**, aggiungi o togli colori (da 2 a 10).
-   **Sfumature**: una scala di 11 toni (50–950) per ogni colore, con dettagli RGB, HSL e contrasto.
-   **Etichette di contrasto**: ogni colore mostra il livello WCAG (AAA / AA / AA Large) per il testo più leggibile.
-   **Nomi dei colori** per ogni campione.
-   **Anteprima daltonismo**: simulazione di protanopia, deuteranopia, tritanopia e scala di grigi.
-   **Palette da un'immagine**: trascina una foto e i suoi colori principali vengono estratti in locale (k-means nello spazio Lab); niente viene caricato.
-   **Esporta** in variabili CSS, SCSS, configurazione Tailwind, JSON, array o SVG, e scarica un'immagine PNG.
-   **Copia come** HEX, RGB o HSL.
-   Cronologia **annulla / ripeti**.
-   **Salva le palette** sul dispositivo e **condividile**: l'URL contiene sempre la palette attuale.
-   Tema chiaro e scuro, sei lingue (EN, IT, FR, DE, ES, JA), scorciatoie da tastiera, responsive dagli smartphone piccoli agli schermi larghi.

## Scorciatoie da tastiera

| Tasto                  | Azione                                  |
| ---------------------- | --------------------------------------- |
| <kbd>Spazio</kbd>      | Nuova palette (i colori bloccati restano) |
| <kbd>1</kbd>–<kbd>9</kbd> | Blocca o sblocca quel colore         |
| <kbd>C</kbd>           | Copia tutti i colori                    |
| <kbd>S</kbd>           | Salva la palette                        |
| <kbd>E</kbd>           | Apri esporta                            |
| <kbd>Ctrl</kbd> <kbd>Z</kbd> / <kbd>Ctrl</kbd> <kbd>Maiusc</kbd> <kbd>Z</kbd> | Annulla / ripeti |

## Avvio in locale

È un sito statico. Poiché usa moduli ES e carica i file di lingua con `fetch`, va servito via HTTP invece di aprire il file direttamente:

```bash
python3 -m http.server 8000
```

Poi apri `http://localhost:8000`.

## Struttura del progetto

```
colorPaletteGenerator/
├── index.html          # markup, finestre e filtri SVG per il daltonismo
├── css/style.css       # token di design (condivisi con egenesio.com), layout, componenti
├── js/
│   ├── app.js          # stato, cronologia, rendering e interazioni
│   ├── palette.js      # schemi di armonia, colori casuali, scale di toni
│   ├── colors.js       # conversioni, contrasto WCAG, nomi, estrazione da immagine
│   ├── names.js        # elenco dei nomi dei colori
│   ├── lang.js         # caricamento traduzioni
│   └── theme.js        # tema chiaro/scuro
├── lang/*.json         # testi EN, IT, FR, DE, ES, JA
├── fonts/              # Syne e DM Mono (SIL Open Font License)
└── icons/favicon.svg
```

## Licenza

MIT, vedi [LICENSE](LICENSE). I font sono sotto SIL Open Font License (vedi `fonts/`).

## Autrice

Creato da [Elisa](https://egenesio.com). Se ti è utile, puoi [offrirmi un caffè su Ko-fi](https://ko-fi.com/egenesio).

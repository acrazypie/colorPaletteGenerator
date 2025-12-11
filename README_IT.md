# Generatore di Palette di Colori

Un'applicazione web moderna per generare bellissime palette di colori armoniose con facilità. Perfetta per designer, sviluppatori e professionisti creativi che hanno bisogno di ispirazione cromatica rapida.

## Caratteristiche

✨ **Caratteristiche Principali:**

-   🎨 Genera palette di colori casuali con un solo clic
-   🔄 Rigenera singoli colori o intere palette
-   📋 Copia i colori negli appunti in formato hex
-   🌙 Attiva/disattiva tema scuro/chiaro per una visione confortevole
-   📱 Design completamente responsivo per tutti i dispositivi
-   ⌨️ Scorciatoie da tastiera per accesso rapido
-   💾 Salva le tue palette preferite (prossimamente)
-   🎯 Modalità di armonia colore multiple (prossimamente)

## Guida Rapida

### Prerequisiti

-   Browser web moderno (Chrome, Firefox, Safari, Edge)
-   Nessuna installazione richiesta - è un'applicazione basata su web

### Installazione

1. Clona il repository:

```bash
git clone https://github.com/tuonome/colorPaletteGenerator.git
cd colorPaletteGenerator
```

2. Apri l'applicazione:

```bash
# Apri semplicemente index.html nel tuo browser
open index.html
```

Oppure usa un server di sviluppo locale:

```bash
# Usando Python 3
python -m http.server 8000

# Usando Node.js (con http-server)
npx http-server
```

Quindi accedi a `http://localhost:8000` nel tuo browser.

## Utilizzo

### Uso Básico

1. **Genera Palette**: Fai clic sul pulsante "Genera" per creare una nuova palette di colori casuale
2. **Copia Colore**: Fai clic su qualsiasi campione di colore per copiare il suo codice hex negli appunti
3. **Blocca Colore**: Blocca i singoli colori per mantenerli quando rigenerando
4. **Cambia Tema**: Utilizza il pulsante del tema per passare tra i temi chiaro e scuro

### Scorciatoie da Tastiera

-   `Spazio` - Genera nuova palette
-   `C` - Copia l'ultimo colore copiato
-   `T` - Attiva/disattiva tema (scuro/chiaro)

## Struttura del Progetto

```
colorPaletteGenerator/
├── index.html              # File HTML principale
├── css/
│   └── style.css           # Foglio di stile
├── js/
│   ├── main.js             # Logica principale dell'applicazione
│   ├── colorPaletteGenerator.js  # Algoritmi di generazione colori
│   └── theme.js            # Gestione del tema
├── static/
│   ├── fonts/              # Font personalizzati
│   └── images/             # Immagini e icone
├── README.md               # File README (inglese)
├── README_IT.md            # File README (italiano)
└── LICENSE                 # Informazioni sulla licenza
```

## Tecnologie Utilizzate

-   **HTML5** - Markup semantico
-   **CSS3** - Stili moderni con flexbox/grid
-   **JavaScript (ES6+)** - Funzionalità dinamiche
-   **SVG** - Icone e grafica vettoriale

## Spiegazione delle Caratteristiche

### Generazione di Colori

Il generatore utilizza algoritmi accuratamente sintonizzati per creare palette di colori armoniose che funzionano bene insieme. I colori vengono generati nello spazio HSL per garantire un migliore equilibrio visivo.

### Supporto del Tema

Passa tra temi chiari e scuri con un solo clic. La tua preferenza viene ricordata nell'archivio locale.

### Design Responsivo

Funziona perfettamente su dispositivi desktop, tablet e mobili con layout ottimizzati per ogni dimensione dello schermo.

## Supporto Browser

| Browser | Supporto    |
| ------- | ----------- |
| Chrome  | ✅ Completo |
| Firefox | ✅ Completo |
| Safari  | ✅ Completo |
| Edge    | ✅ Completo |
| IE 11   | ❌ No       |

## Contribuire

I contributi sono benvenuti! Per contribuire:

1. Fai un fork del repository
2. Crea un branch di funzionalità (`git checkout -b feature/AmazingFeature`)
3. Esegui il commit delle tue modifiche (`git commit -m 'Aggiungi qualche AmazingFeature'`)
4. Esegui il push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

Assicurati che il tuo codice segua lo stile esistente e includa commenti appropriati.

## Miglioramenti Futuri

-   💾 Salva e gestisci le palette di colori
-   🎨 Modalità di armonia colore multiple (complementare, analoga, triadica, ecc.)
-   📤 Esporta palette in vari formati (JSON, CSS, PNG)
-   🔍 Integrazione del selezionatore di colori
-   📚 Cronologia colori
-   🎯 Intervalli di colori personalizzati

## Licenza

Questo progetto è concesso in licenza secondo la Licenza MIT - vedi il file [LICENSE](LICENSE) per i dettagli.

## Autore

Creato con ❤️ da [Il Tuo Nome]

## Ringraziamenti

-   Ispirato da moderni strumenti di palette di colori
-   Grazie alla comunità open-source per le librerie e le risorse
-   Icone da Bootstrap Icons

## Supporto

Hai domande o trovato un bug?

-   📧 Apri un problema su GitHub
-   💬 Sentiti libero di contribuire con miglioramenti

---

**Buon lavoro con i colori!** 🎨

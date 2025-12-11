import { generatePalette } from "./colorPaletteGenerator.js";

/**
 * Copia il colore hex negli appunti con feedback visivo
 * @param {HTMLElement} element - Elemento color-swatch da copiare
 *
 * @return {void}
 */
function copyColorToClipboard(element) {
    const color = element.textContent.trim();

    navigator.clipboard
        .writeText(color)
        .then(() => {
            // Aggiungi la classe per l'animazione
            element.classList.add("copied");

            // Rimuovi la classe dopo l'animazione
            setTimeout(() => {
                element.classList.remove("copied");
            }, 500);
        })
        .catch(() => {
            // Fallback per browser più vecchi
            const textarea = document.createElement("textarea");
            textarea.value = color;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        });
}

/**
 * Genera una palette
 * @param {HTMLElement} paletteContainer - Contenitore della palette
 * @param {HTMLInputElement} baseColorSelect - Input del colore base
 * @param {HTMLInputElement} numColorsInput - Input del numero di colori
 * @param {HTMLSelectElement} schemeSelect - Select del tipo di schema
 *
 * @return {void}
 */
function displayPalette(
    paletteContainer,
    baseColorSelect,
    numColorsInput,
    schemeSelect
) {
    const randomColor = baseColorSelect.value;
    const numColors = parseInt(numColorsInput.value, 10);
    const schemeType = schemeSelect.value;

    const palette = generatePalette(randomColor, schemeType, numColors);

    // Pulisce il contenuto precedente
    paletteContainer.innerHTML = "";

    // Crea e aggiunge i nuovi colori alla pagina
    palette.forEach((color) => {
        const colorDiv = document.createElement("div");
        colorDiv.className = "color-swatch";
        colorDiv.style.backgroundColor = color;
        colorDiv.textContent = color;

        // Aggiungi evento di click per copiare il colore
        colorDiv.addEventListener("click", () => {
            copyColorToClipboard(colorDiv);
        });

        paletteContainer.appendChild(colorDiv);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generate-palette-btn");
    const colorInput = document.getElementById("base-color");
    const numColorsInput = document.getElementById("num-colors");
    const schemeSelect = document.getElementById("scheme-type");
    const paletteContainer = document.getElementById("palette-container");

    // Mobile menu elements
    const menuToggle = document.getElementById("menu-toggle");
    const controlsMenu = document.getElementById("controls-menu");
    const generateBtnMobile = document.getElementById(
        "generate-palette-btn-mobile"
    );
    const colorInputMobile = document.getElementById("base-color-mobile");
    const numColorsInputMobile = document.getElementById("num-colors-mobile");
    const schemeSelectMobile = document.getElementById("scheme-type-mobile");

    // Genera una palette al caricamento
    displayPalette(paletteContainer, colorInput, numColorsInput, schemeSelect);

    // Desktop generate button
    generateBtn.addEventListener("click", () => {
        displayPalette(
            paletteContainer,
            colorInput,
            numColorsInput,
            schemeSelect
        );
    });

    // Mobile menu toggle
    menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        controlsMenu.classList.toggle("active");
    });

    // Sync inputs between desktop and mobile
    colorInput.addEventListener("change", () => {
        colorInputMobile.value = colorInput.value;
    });
    colorInputMobile.addEventListener("change", () => {
        colorInput.value = colorInputMobile.value;
    });

    numColorsInput.addEventListener("change", () => {
        numColorsInputMobile.value = numColorsInput.value;
    });
    numColorsInputMobile.addEventListener("change", () => {
        numColorsInput.value = numColorsInputMobile.value;
    });

    schemeSelect.addEventListener("change", () => {
        schemeSelectMobile.value = schemeSelect.value;
    });
    schemeSelectMobile.addEventListener("change", () => {
        schemeSelect.value = schemeSelectMobile.value;
    });

    // Mobile generate button
    generateBtnMobile.addEventListener("click", () => {
        displayPalette(
            paletteContainer,
            colorInputMobile,
            numColorsInputMobile,
            schemeSelectMobile
        );
        // Close menu after generating
        menuToggle.classList.remove("active");
        controlsMenu.classList.remove("active");
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
        if (
            !menuToggle.contains(e.target) &&
            !controlsMenu.contains(e.target)
        ) {
            menuToggle.classList.remove("active");
            controlsMenu.classList.remove("active");
        }
    });
});

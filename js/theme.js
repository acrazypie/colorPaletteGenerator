document.addEventListener("DOMContentLoaded", async () => {
    const body = document.body;
    const themeBtn = document.getElementById("theme-toggle");
    const lightIcon = document.getElementById("light-icon");
    const darkIcon = document.getElementById("dark-icon");

    // Legge il tema salvato (o imposta dark di default)
    const savedTheme = localStorage.getItem("theme") || "dark";
    body.classList.toggle("light-theme", savedTheme === "light");

    function setTheme(theme) {
        const isLight = theme === "light";
        body.classList.toggle("light-theme", isLight);
        lightIcon.style.display = isLight ? "none" : "block";
        darkIcon.style.display = isLight ? "block" : "none";
    }

    if (savedTheme === "light") {
        setTheme("light");
    } else {
        setTheme("dark");
    }

    function toggleTheme() {
        const currentTheme = body.classList.contains("light-theme")
            ? "light"
            : "dark";
        const newTheme = currentTheme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    }

    // Inizializza l'icona corretta
    themeBtn.addEventListener("click", toggleTheme);
});

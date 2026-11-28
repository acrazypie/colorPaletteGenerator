/* store.js — what the generator remembers (theme, lang, last palette, saved
   palettes, prefs). In a browser this is localStorage, exactly as before. The
   iOS / Android app can set window.PaletteStorage before this script runs: the
   same getItem / setItem as localStorage, plus an optional `ready` promise.
   Code that reads saved values on start-up waits for PaletteStore.ready, which
   is already resolved in a browser. */
(function () {
    function backend() {
        return window.PaletteStorage || window.localStorage;
    }

    var native = window.PaletteStorage;
    var ready = native && native.ready ? Promise.resolve(native.ready).catch(function () {}) : Promise.resolve();

    window.PaletteStore = {
        get: function (key) {
            try {
                return backend().getItem(key);
            } catch (e) {
                return null;
            }
        },
        set: function (key, value) {
            try {
                backend().setItem(key, String(value));
            } catch (e) {}
        },
        ready: ready,
    };
})();

/* platform.js — tells the generator whether it runs in a normal browser or
   inside the iOS / Android app (Capacitor). In a browser: isNative = false,
   platform = "web", and nothing else changes. Loaded before the other scripts. */
(function () {
    var cap = window.Capacitor;
    var isNative = !!(cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform());
    /* "ios" | "android" | "web" */
    var platform = isNative ? cap.getPlatform() : "web";

    document.documentElement.dataset.platform = platform;

    /* Optional hooks for the app. The app sets window.PaletteNative with any of:
         copy(text)            → Promise<boolean>, replaces the clipboard write
         save(blob, fileName)  → Promise, replaces the <a download> file save
         share({ title, text, url }) → Promise, replaces navigator.share / copy link
         generate(), lock(locked), reorder(), saved(isSaved), copied(), undo(), redo()
                               → feedback only (haptics)
         state(info)           → after every render, see Palette.info()
       Returns whatever the hook returns. In a browser there is no
       window.PaletteNative, so this does nothing and returns undefined. */
    function nativeHook(name) {
        var n = window.PaletteNative;
        if (!n || typeof n[name] !== "function") return undefined;
        try {
            return n[name].apply(n, Array.prototype.slice.call(arguments, 1));
        } catch (e) {
            return undefined;
        }
    }

    window.PalettePlatform = {
        isNative: isNative,
        platform: platform,
        nativeHook: nativeHook,
    };
})();

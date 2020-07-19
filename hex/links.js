function redirect_twitter() {
    window.open( 
        "https://twitter.com/VladZhukov0", "_blank"); 
}

register_plugin = function (importObject) {
    importObject.env.redirect_twitter = redirect_twitter;
}

on_init = function () {
    exports = wasm_exports;
    memory = wasm_memory;
    init();
}

init = function () {
    console.log("wasm init finish");
}

miniquad_add_plugin({register_plugin, on_init});
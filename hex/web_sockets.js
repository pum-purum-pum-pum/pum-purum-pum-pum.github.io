var ctx = null;
var buffer_size = 0;
var memory;
var exports;
var socket;
var is_socket_ready = false;
// var server_adress = 'wss://echo.websocket.org';
var server_adress = 'wss://207.154.218.166:9002';

on_init = function () {
    console.log("plugin ok");
    exports = wasm_exports;
    memory = wasm_memory;
    init();
}

function send_message_buffer(lenght) {
    var bytes = new Uint8Array(memory.buffer, exports.forward_buffer_ptr(), lenght);
    if (socket.readyState) {
        socket.send(bytes)
        return true;
    }
    return false;
}

register_plugin = function (importObject) {
    console.log("register plugin");
    importObject.env.ws_init = function () {
        console.log('js called from rust');
    }
    importObject.env.send_message_buffer = send_message_buffer;
    // importObject.loger
    console.log(importObject);
}

miniquad_add_plugin({register_plugin, on_init});

init = function () {
    // Create WebSocket connection.
    socket = new WebSocket(server_adress);

    socket.onopen = function(event) {
        console.log("OPENED");
    };


    socket.onmessage = function(event) {
        let lenght = event.data.size;
        let offset = exports.buffer_ptr();
        event.data.arrayBuffer()
        .then(buffer => {
            console.log("received")
            // if we define bytes earlier in parent scope then everything blows up(don't know (why) Javascript)
            let bytes = new Uint8Array(memory.buffer, offset, lenght);
            let data = new Uint8Array(buffer, 0, lenght)
            for (let i = 0; i < lenght; i++) {
                bytes[i] = data[i];
            }
            exports.receive_msg(lenght)
        })
        .catch((error) => {
            console.log(error)
            console.log("you are looser haha")
        });
    };


    socket.onclose = function(event) {
    };

    socket.onerror = function(error) {
    alert(`[error] ${error.message}`);
    };
    console.log("wasm init finish");
}
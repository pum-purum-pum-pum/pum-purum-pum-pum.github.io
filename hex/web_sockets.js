var ctx = null;
var buffer_size = 0;
var memory;
var exports;
var socket;
var is_socket_ready = false;
var server_adress = 'ws://127.0.0.1:9002';

on_init = function () {
    console.log("plugin ok");
    exports = wasm_exports;
    memory = wasm_memory;
    init();
}

// called from rust
function send_message_buffer(length) {
    var bytes = new Uint8Array(memory.buffer, exports.forward_buffer_ptr(), length);
    if (socket.readyState) {
        socket.send(bytes)
        return true;
    }
    return false;
}

// used when client press play button (server will connect and search the game)
function create_ws() {
    // Create WebSocket connection.
    socket = new WebSocket(server_adress);

    socket.onopen = function(event) {
        console.log("OPENED");
    };


    socket.onmessage = function(event) {
        let length = event.data.size;
        let offset = exports.buffer_ptr();
        event.data.arrayBuffer()
        .then(buffer => {
            console.log("received")
            // if we define bytes earlier in parent scope then everything blows up(don't know (why) Javascript)
            let bytes = new Uint8Array(memory.buffer, offset, length);
            let data = new Uint8Array(buffer, 0, length)
            for (let i = 0; i < length; i++) {
                bytes[i] = data[i];
            }
            exports.receive_msg(length)
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
}

register_plugin = function (importObject) {
    console.log("register plugin");
    importObject.env.ws_init = function () {
        console.log('js called from rust');
    }
    importObject.env.send_message_buffer = send_message_buffer;
    importObject.env.create_ws = create_ws;

    // importObject.loger
    console.log(importObject);
}

miniquad_add_plugin({register_plugin, on_init});

init = function () {
    console.log("wasm init finish");
}
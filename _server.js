// server.js
// a very simple node server using the express module
var express = require("express");
var server = express();
var wwwDir = "/www";
server.use("/", express.static(__dirname + wwwDir));
server.get("/", function(req, res) { res.render(wwwDir + "/index.html");});
server.listen(8080);
//server is listening to port

var io = require('socket.io').listen(3000);
// Listen for client connection event
// io.sockets.* is the global, *all clients* socket
// For every client that is connected, a separate callback is called
io.sockets.on('connection', function(socket){
    // Listen for this client's "send" event
    // remember, socket.* is for this particular client
    socket.on('send', function(data) {
        // Since io.sockets.* is the *all clients* socket,
        // this is a broadcast message.

        // Broadcast a "receive" event with the data received from "send"
        io.sockets.emit('receive', data);
    });
});
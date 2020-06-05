var express = require('express');
var router = express.Router();
var http = require("./server.js").http;
var io = require("socket.io")(http);



/****  secket traitement *****/

io.on("connection", function (socket) {

   

   

});




module.exports = {
    router,
    io,
}

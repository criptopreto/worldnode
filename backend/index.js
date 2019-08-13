const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.static(__dirname + '/public'));
app.use(cors());
var socketData = {};
var stats = {conexiones: 0, touch: 0, video: 0, pages: {}}

var servidor = require('http').Server(app);
var io = require('socket.io')(servidor);

var capture = io.of('/capture');
var dashboard = io.of('/dashboard');
capture.on('connection', function(socket){
    console.log("Tenemos una conexión");
    ++stats.conexiones;
    socket.on('datos-cliente', (data)=>{
        console.log("Conexión");
        socketData[socket.id] = data;
        stats.touch += (data.touch? 1:0);
        stats.video += (data.video? 1:0);
        var pageCount = stats.pages[data.url]||0;
        stats.pages[data.url] = ++pageCount;
        console.log("Emitieando stats")
        dashboard.emit('stats-updated', stats)
    });

    socket.on('disconnect', function(){
        console.log("Desconexión");
        --stats.conexiones;
        stats.touch -= (socketData[socket.id].touch? 1:0);
        stats.video -= (socketData[socket.id].touch? 1:0);
        stats.pages[socketData[socket.id].url];
        delete socketData[socket.id];
        dashboard.emit('stats-updated', stats)
    });
});
dashboard.on('connection', function(socket){
    socket.emit('stats-updated', stats);
})

var capture = io.of('/capture');
capture.on('connection', function(socket){
    console.log("Nueva Conexion");
    
});



servidor.listen(3002, ()=>{
    console.log("Iniciado en el puerto 3002");
})

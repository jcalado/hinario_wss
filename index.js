const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});

const WS_PORT = 4000;


io.on("connection", (socket) => {
 console.log('🆕 Nova ligação')
    socket.on('register-client', (room, number, index)=> {
        console.log(`👋 Registado cliente na sala ${room} com hino ${number + 1}`)
        socket.join(room)
        socket.to(room).emit('control-status', number, index)
    })

    socket.on('register-control', (room)=> {
        console.log(`🛂 Controlador: Novo controlador na sala ${room}`)

        socket.join(room)

        // Ask client status
        socket.to(room).emit('client-status')
    })

    socket.on('control-next', (room, activeIndex) => {
        console.log(`➡️ Sala ${room} \t - Avançar para index ${activeIndex}`)
        socket.to(room).emit('client-next', activeIndex)
    })

    socket.on('control-previous', (room, activeIndex) => {
        console.log(`⬅️ Sala ${room} \t - Retroceder para index ${activeIndex}`)
        socket.to(room).emit('client-previous', activeIndex)
    })

    socket.on('client-answer-status', (room, number, index) => {
        console.log(`📖 O cliente na sala ${room} responde que esta no numero ${number} e no index ${index}. Atualizar controlo`)
        socket.to(room).emit('control-status', number, index)
    })

    socket.on('client-picked-images', (room, backgroundImages) => {
        console.log(`📖 Sala ${room} \t - Enviou imagens. Atualizar controlo.`)
        socket.to(room).emit('control-images', backgroundImages)
    })

    socket.on('control-open', (room, index) => {
        console.log(`📂 Apresentador na sala ${room} vai abrir ${index}`)
        socket.to(room).emit('client-open', index)
    })

    socket.on('reset', (room) => {
        console.log(`💣 Reset aos apresentadores e controlo na sala ${room}`)
        socket.to(room).emit('reset', room)
    })
});

io.of("/").adapter.on("create-room", (room) => {
    console.log(`🚪 Room ${room} was created`);
});
  
io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`🤝🏻 Socket ${id} has joined room ${room}`);
});

server.listen(WS_PORT, ()=>{
    console.log(`👂 Now listening on port ${WS_PORT}`)
})
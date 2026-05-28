const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// VARIABEL GLOBAL: Nyimpen riwayat chat dina mémori server (Aman tina refresh HP)
let chatHistory = [];
let activeUsers = {};

io.on('connection', (socket) => {
    console.log('Aya nu lebet jaringan');

    socket.on('user login', (username) => {
        socket.username = username;
        activeUsers[username] = socket.id;
        io.emit('update user list', Object.keys(activeUsers));

        // Kirimkeun sadaya riwayat chat anu kasimpen di server ka jalma nu nembé refresh/login
        socket.emit('load history', chatHistory);
    });

    socket.on('chat message', (data) => {
        // Lebetkeun pesen anyar ka jero array sajarah di server
        chatHistory.push({
            sender: data.id,
            target: data.target,
            message: data.message
        });

        // Watesan maksima 200 pesen supados serverna teu beurat
        if (chatHistory.length > 200) {
            chatHistory.shift();
        }

        // Kirimkeun ka sadaya pangguna sacara real-time
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            delete activeUsers[socket.username];
            io.emit('update user list', Object.keys(activeUsers));
        }
        console.log('Aya nu kaluar jaringan');
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
    console.log(`Server nuju jalan dina port ${PORT}`);
});

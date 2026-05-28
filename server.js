const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// Objék kanggo nyimpen daptar pangguna anu aktip
let activeUsers = {};

io.on('connection', (socket) => {
    console.log('Aya nu lebet jaringan');

    // Nalika pangguna anyar ngasupkeun namina
    socket.on('user login', (username) => {
        socket.username = username;
        activeUsers[username] = socket.id; // Simpen nami sareng id socketna
        
        // Kirim daptar pangguna énggal ka sadaya jalma
        io.emit('update user list', Object.keys(activeUsers));
    });

    // Nalika aya nu ngirim pesen
    socket.on('chat message', (data) => {
        // data eusina: { id: pengirim, target: panampi, message: pesen }
        io.emit('chat message', data);
    });

    // Nalika pangguna kaluar / nutup aplikasi
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

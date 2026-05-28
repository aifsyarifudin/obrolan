const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

// Panyimpenan daptar pangguna anu online (ID: SocketID)
const panggunaOnline = {};

io.on('connection', (socket) => {
    
    // 1. Nalika pangguna anyar ngadaptarkeun ID-na
    socket.on('daftar id', (idPangguna) => {
        socket.idPangguna = idPangguna;
        panggunaOnline[idPangguna] = socket.id; // Nyimpen hubungan ID sareng jalur koneksina
        console.log(`Pangguna ${idPangguna} parantos online.`);
        
        // Bewara ka sadaya pangguna yén aya nu online
        io.emit('daptar online', Object.keys(panggunaOnline));
    });

    // 2. Nalika aya nu ngirim pesen pribadi (Private Message)
    socket.on('kirim pesen pribadi', (data) => {
        const socketIdTujuan = panggunaOnline[data.kaId];
        
        if (socketIdTujuan) {
            // Kirim pesen ka jalma nu dituju
            io.to(socketIdTujuan).emit('tampi pesen pribadi', {
                tiId: socket.idPangguna,
                pesen: data.pesen
            });
        } else {
            // Upami ID anu dituju teu kapendak/offline
            socket.emit('eror', `ID '${data.kaId}' nuju offline atanapi teu kapendak.`);
        }
    });

    // 3. Nalika pangguna kaluar / offline
    socket.on('disconnect', () => {
        if (socket.idPangguna) {
            delete panggunaOnline[socket.idPangguna];
            console.log(`Pangguna ${socket.idPangguna} parantos offline.`);
            io.emit('daptar online', Object.keys(panggunaOnline));
        }
    });
});

// Robah ieu supados Render tiasa ngatur port-na sorangan sacara otomatis
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server nuju jalan dina port ${PORT}`);
});
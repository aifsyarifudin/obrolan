const express = require('express');
const app = express();

const http = require('http').createServer(app);

const io = require('socket.io')(http, {
    maxHttpBufferSize: 1e8 // 100MB supaya VN/gambar teu gagal
});

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

let chatHistory = [];
let activeUsers = {};

io.on('connection', (socket) => {

    console.log('[SISTEM] Aya nu lebet jaringan (Koneksi Anyar)');

    // LOGIN USER
    socket.on('user login', (username) => {

        socket.username = username;

        activeUsers[username] = socket.id;

        // LOG TAMBAHAN: Nyatet saha anu login
        console.log(`[LOGIN] User "${username}" parantos lebet. Jumlah pangguna aktif: ${Object.keys(activeUsers).length}`);

        io.emit('update user list', Object.keys(activeUsers));

        socket.emit('load history', chatHistory);
    });

    // PESAN ASUP
    socket.on('chat message', (data) => {
        try {
            const messageId = data.msgId || Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            
            const newMessage = {
                msgId: messageId,
                id: data.id,
                sender: data.id,
                target: data.target,
                message: data.message || '',
                msgType: data.msgType || 'text',
                fileName: data.fileName || '',
                isDeleted: false,
                seen: false,
                timestamp: Date.now()
            };

            chatHistory.push(newMessage);

            // batas riwayat
            if (chatHistory.length > 200) {
                chatHistory.shift();
            }

            // LOG TAMBAHAN: Nyatet eusi pesen, tipe pesen (text/image/vn), sareng saha anu ngirimna
            if (newMessage.msgType === 'text') {
                console.log(`[PESEN] tina "${newMessage.sender}" ka "${newMessage.target}": ${newMessage.message}`);
            } else {
                console.log(`[MEDIA] tina "${newMessage.sender}" ka "${newMessage.target}" ngirim ${newMessage.msgType}: ${newMessage.fileName}`);
            }

            // kirim pesan ka sadayana
            io.emit('chat message', newMessage);

            // ✔ terkirim
            io.emit('message delivered', messageId);

        } catch (err) {
            console.log('ERROR CHAT:', err);
        }
    });

    // ✔✔ dibaca
    socket.on('chat seen', (data) => {

        chatHistory.forEach(msg => {

            if(
                msg.id === data.target &&
                msg.target === data.reader
            ){
                msg.seen = true;
            }

        });

        // LOG TAMBAHAN: Nyatet upami pesen tos dibaca
        console.log(`[SEEN] Pesen tina "${data.target}" parantos dibaca ku "${data.reader}"`);

        io.emit('message seen', data.target);

    });

    // ✍️ keur nulis
    socket.on('typing', (data) => {
    
        // LOG TAMBAHAN: Nyatet pangguna anu nuju ngetik (opsional, bakal sering muncul upami ngetik)
        if (data.isTyping) {
            console.log(`[TYPING] "${data.username}" nuju ngetik pesen...`);
        }

        io.emit('typing', data);
    
    });

    // HAPUS PESAN
    socket.on('delete message', (msgId) => {

        const msgIndex =
            chatHistory.findIndex(m => m.msgId === msgId);

        if (msgIndex !== -1) {

            // LOG TAMBAHAN: Nyatet saha pangguna anu ngahapus pesenna
            const sender = chatHistory[msgIndex].sender;
            console.log(`[HAPUS] Pesen ID: ${msgId} (dikirim ku "${sender}") parantos dihapus ku pangguna`);

            chatHistory[msgIndex].message =
                "🚫 Pesen ieu parantos dihapus";

            chatHistory[msgIndex].msgType = 'text';

            chatHistory[msgIndex].isDeleted = true;

            io.emit('message deleted', msgId);
        }

    });

    // =========================================================================
    // FITUR ENGGAL: MUPUS SADAYA SAJARAH OBROLAN ROOM TINA DATABASE ARRAY
    // =========================================================================
    socket.on('clear room history', (data) => {
        try {
            const { sender, target } = data;

            if (!sender || !target) return;

            // Nyaring array chatHistory, piceun chat anu saluyu sareng room eta
            chatHistory = chatHistory.filter(msg => {
                // Pariksa naha pesen ieu aya di jero room obrolan duaan eta
                const isTargetRoom = (msg.sender === sender && msg.target === target) || 
                                     (msg.sender === target && msg.target === sender);
                // Upami leres eta roomna, ulah diasupkeun deui (dihapus tina array)
                return !isTargetRoom;
            });

            // LOG SERVER: Nyatet yén room ieu tos dibersihkeun
            console.log(`[CLEAR CHAT] Sajarah obrolan antara "${sender}" jeung "${target}" parantos dihapus tina database.`);

            // Kirim konfirmasi balik ka pangguna nu mupus supados UI-na bersih
            socket.emit('room history cleared', { target: target });

            // (Opsional) Upami si target nuju online, bersihkeun ogé layar HP manéhna sacara real-time
            const targetSocketId = activeUsers[target];
            if (targetSocketId) {
                io.to(targetSocketId).emit('room history cleared', { target: sender });
            }

        } catch (err) {
            console.log('ERROR CLEAR ROOM HISTORY:', err);
        }
    });

    // USER KALUAR
    socket.on('disconnect', () => {

        // LOG TAMBAHAN: Nyatet nami pangguna anu kaluar jaringan
        if (socket.username) {
            console.log(`[KALUAR] User "${socket.username}" kaluar jaringan.`);
            delete activeUsers[socket.username];
        } else {
            console.log('[SISTEM] Aya nu kaluar (Koneksi can login / anonim)');
        }

        io.emit(
            'update user list',
            Object.keys(activeUsers)
        );

    });

});

// TEST SERVER
app.get('/', (req, res) => {
    res.send("Server chat jalan");
});

const PORT = process.env.PORT || 8080;

http.listen(PORT, () => {

    console.log(
        `Server nuju jalan dina port ${PORT}`
    );

});

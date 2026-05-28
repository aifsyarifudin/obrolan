const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// Nyimpen riwayat chat dina mémori server
let chatHistory = [];
let activeUsers = {};

io.on('connection', (socket) => {
    console.log('Aya nu lebet jaringan');

    socket.on('user login', (username) => {
        socket.username = username;
        activeUsers[username] = socket.id;
        io.emit('update user list', Object.keys(activeUsers));

        // Kirimkeun sajarah chat ka jalma nu nembé refresh/login
        socket.emit('load history', chatHistory);
    });

    socket.on('chat message', (data) => {
        // Masangkeun ID unik dumasar kana waktos (timestamp) dina unggal pesen
        const messageId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const newMessage = {
            msgId: messageId,
            sender: data.id,
            target: data.target,
            message: data.message,
            isDeleted: false
        };

        chatHistory.push(newMessage);

        if (chatHistory.length > 200) {
            chatHistory.shift();
        }

        // Kirimkeun pesen anyar ka sadayana
        io.emit('chat message', newMessage);
    });

    // --- FITUR ANYAR: PROSÉS HAPUS PESEN DI SERVER ---
    socket.on('delete message', (msgId) => {
        // Milari pesen dina sajarah server, teras robah eusina
        const msgIndex = chatHistory.findIndex(m => m.msgId === msgId);
        if (msgIndex !== -1) {
            chatHistory[msgIndex].message = "🚫 Pesen ieu parantos dihapus";
            chatHistory[msgIndex].isDeleted = true;
            
            // Béjaan ka sadaya pangguna yén aya pesen anu dihapus sacara real-time
            io.emit('message deleted', msgId);
        }
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

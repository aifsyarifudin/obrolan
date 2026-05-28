const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

let chatHistory = [];
let activeUsers = {};

io.on('connection', (socket) => {
    console.log('Aya nu lebet jaringan');

    socket.on('user login', (username) => {
        socket.username = username;
        activeUsers[username] = socket.id;
        io.emit('update user list', Object.keys(activeUsers));
        socket.emit('load history', chatHistory);
    });

    socket.on('chat message', (data) => {
        const messageId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const newMessage = {
            msgId: messageId,
            sender: data.id,
            target: data.target,
            message: data.message,      // Tiasa mangrupi téks atanapi kode file/sora (Base64)
            msgType: data.msgType || 'text', // 'text', 'image', 'file', atanapi 'audio'
            fileName: data.fileName || '',   // Husus kanggo nami file pami aya
            isDeleted: false
        };

        chatHistory.push(newMessage);
        if (chatHistory.length > 200) chatHistory.shift();

        io.emit('chat message', newMessage);
    });

    socket.on('delete message', (msgId) => {
        const msgIndex = chatHistory.findIndex(m => m.msgId === msgId);
        if (msgIndex !== -1) {
            chatHistory[msgIndex].message = "🚫 Pesen ieu parantos dihapus";
            chatHistory[msgIndex].msgType = 'text';
            chatHistory[msgIndex].isDeleted = true;
            io.emit('message deleted', msgId);
        }
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            delete activeUsers[socket.username];
            io.emit('update user list', Object.keys(activeUsers));
        }
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
    console.log(`Server nuju jalan dina port ${PORT}`);
});

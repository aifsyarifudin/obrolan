```js
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

    console.log('Aya nu lebet jaringan');

    // LOGIN USER
    socket.on('user login', (username) => {

        socket.username = username;

        activeUsers[username] = socket.id;

        io.emit('update user list', Object.keys(activeUsers));

        socket.emit('load history', chatHistory);
    });

    // PESAN ASUP
    socket.on('chat message', (data) => {

        try {

            const messageId =
                Date.now() +
                '-' +
                Math.random().toString(36).substr(2, 9);

            const newMessage = {

                msgId: messageId,

                sender: data.id,

                target: data.target,

                message: data.message || '',

                msgType: data.msgType || 'text',

                fileName: data.fileName || '',

                isDeleted: false,

                createdAt: new Date()

            };

            chatHistory.push(newMessage);

            // batas riwayat
            if (chatHistory.length > 200) {
                chatHistory.shift();
            }

            io.emit('chat message', newMessage);

        }
        catch (err) {

            console.log('ERROR CHAT:', err);

        }

    });

    // HAPUS PESAN
    socket.on('delete message', (msgId) => {

        const msgIndex =
            chatHistory.findIndex(m => m.msgId === msgId);

        if (msgIndex !== -1) {

            chatHistory[msgIndex].message =
                "🚫 Pesen ieu parantos dihapus";

            chatHistory[msgIndex].msgType = 'text';

            chatHistory[msgIndex].isDeleted = true;

            io.emit('message deleted', msgId);
        }

    });

    // USER KALUAR
    socket.on('disconnect', () => {

        console.log('Aya nu kaluar');

        if (socket.username) {

            delete activeUsers[socket.username];

            io.emit(
                'update user list',
                Object.keys(activeUsers)
            );
        }

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
```

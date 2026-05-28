const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

app.use(express.static(path.join(__dirname, 'public')));

// Setup Database SQLite (nyimpen file chat.db dina server)
const db = new sqlite3.Database('./chat.db', (err) => {
    if (err) console.error('Gagal muka database:', err.message);
    console.log('Database SQLite siap dianggo.');
});

// Jieun tabel pikeun nyimpen pesen upami teu acan aya
db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    target TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

let activeUsers = {};

io.on('connection', (socket) => {
    console.log('Aya nu lebet jaringan');

    socket.on('user login', (username) => {
        socket.username = username;
        activeUsers[username] = socket.id;
        io.emit('update user list', Object.keys(activeUsers));

        // AMBIL RIWAYAT CHAT: Kirim sadaya sajarah chat lami khusus ka jalma anu nembé login
        db.all("SELECT sender, target, message FROM messages ORDER BY timestamp ASC", [], (err, rows) => {
            if (err) {
                console.error(err.message);
                return;
            }
            // Kirimkeun sajarah chat ka pangguna anu nembé lebet
            socket.emit('load history', rows);
        });
    });

    socket.on('chat message', (data) => {
        // SIMPEN KA DATABASE: Lebetkeun pesen anyar ka tabel SQLite
        const stmt = db.prepare("INSERT INTO messages (sender, target, message) VALUES (?, ?, ?)");
        stmt.run(data.id, data.target, data.message, (err) => {
            if (err) console.error('Gagal nyimpen chat:', err.message);
        });
        stmt.finalize();

        // Kirim pesen ka sadaya jalma sacara real-time sapertos biasa
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

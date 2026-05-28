<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Aplikasi Chat WA</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; }
        body { background-color: #efeae2; display: flex; justify-content: center; height: 100vh; height: 100dvh; overflow: hidden; }
        #chat-container { display: flex; width: 100%; max-width: 1000px; height: 100vh; height: 100dvh; background: #efeae2; box-shadow: 0 2px 5px rgba(0,0,0,0.1); position: relative; overflow: hidden; }
        #sidebar { width: 30%; min-width: 280px; background: white; border-right: 1px solid #ddd; display: flex; flex-direction: column; height: 100%; z-index: 5; }
        .sidebar-header { background: #008069; color: white; padding: 15px; z-index: 10; padding-top: calc(15px + env(safe-area-inset-top)); position: relative; }
        .app-title { font-size: 20px; font-weight: bold; display: block; margin-bottom: 2px; letter-spacing: 0.5px; }
        .my-profile { font-size: 13px; color: #d9fdd3; font-weight: normal; display: block; margin-bottom: 8px; }
        .sub-title-kontak { font-size: 12px; color: #f0f2f5; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block; margin-top: 5px; opacity: 0.9; }
        
        .logout-btn { position: absolute; top: calc(18px + env(safe-area-inset-top)); right: 15px; background: #075e54; color: white; border: none; padding: 5px 10px; border-radius: 5px; font-size: 11px; cursor: pointer; font-weight: bold; }
        #user-list { list-style: none; overflow-y: auto; flex: 1; }
        #user-list li { padding: 15px; border-bottom: 1px solid #eee; cursor: pointer; font-weight: 500; font-size: 15px; color: #333; display: flex; justify-content: space-between; align-items: center; }
        #user-list li:hover { background: #f0f2f5; }
        #user-list li.active-chat { background: #e5ddd5; color: #008069; font-weight: bold; }
        .badge-notif { background-color: #25d366; color: white; font-size: 11px; padding: 2px 7px; border-radius: 10px; font-weight: bold; }
        
        #main-chat { width: 70%; display: flex; flex-direction: column; height: 100%; background: #efeae2; }
        .header { background-color: #008069; color: white; padding: 15px; font-size: 16px; font-weight: bold; display: flex; align-items: center; gap: 12px; min-height: 60px; padding-top: calc(15px + env(safe-area-inset-top)); }
        .back-btn { display: none; background: none; border: none; color: white; font-size: 20px; cursor: pointer; font-weight: bold; padding: 0 5px; }
        #login-area { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(239, 234, 226, 0.98); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 20; }
        #login-input { padding: 12px; width: 80%; max-width: 300px; border: 1px solid #ccc; border-radius: 20px; margin-bottom: 15px; text-align: center; font-size: 16px; outline: none; }
        #login-btn { background: #008069; color: white; border: none; padding: 10px 25px; border-radius: 20px; font-weight: bold; cursor: pointer; }
        
        #chat-rooms-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
        .chat-messages-holder { list-style-type: none; flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; height: 100%; }
        .chat-messages-holder li { max-width: 75%; padding: 8px 12px; border-radius: 8px; font-size: 15px; line-height: 1.4; word-wrap: break-word; box-shadow: 0 1px 1px rgba(0,0,0,0.1); position: relative; display: flex; flex-direction: column; }
        .my-message { background-color: #d9fdd3; align-self: flex-end; border-top-right-radius: 0; padding-right: 25px !important; }
        .other-message { background-color: #ffffff; align-self: flex-start; border-top-left-radius: 0; }
        .sender-id { font-size: 11px; font-weight: bold; color: #128c7e; margin-bottom: 2px; }
        .deleted-text { color: #8696a0; font-style: italic; }
        
        /* Desain tampilan media */
        .chat-img { max-width: 100%; max-height: 200px; border-radius: 5px; margin-top: 5px; cursor: pointer; }
        .chat-file-link { display: flex; align-items: center; gap: 8px; color: #008069; text-decoration: none; font-weight: bold; padding: 5px 0; font-size: 14px; }
        audio { max-width: 100%; margin-top: 5px; outline: none; }

        .del-btn { position: absolute; top: 6px; right: 6px; background: none; border: none; color: #8696a0; font-size: 12px; cursor: pointer; display: none; }
        .my-message:hover .del-btn { display: inline-block; }

        /* FORM INPUT CHAT DESAIN COCOK HP */
        #form { background: #f0f2f5; padding: 10px; display: flex; gap: 8px; align-items: center; padding-bottom: calc(10px + env(safe-area-inset-bottom)); position: relative; z-index: 15; }
        #input { border: none; padding: 10px 12px; flex: 1; border-radius: 20px; outline: none; font-size: 15px; background: white; resize: none; height: 40px; max-height: 100px; }
        
        /* Tombol Media & Actions */
        .action-btn { background: none; border: none; font-size: 22px; color: #54656f; cursor: pointer; padding: 0 4px; display: flex; align-items: center; justify-content: center; }
        .send-btn { background: #008069; color: white; border: none; padding: 0; border-radius: 50%; cursor: pointer; font-size: 16px; height: 40px; width: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .recording-active { color: #ea0038; animation: pulse 1s infinite; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        @media (max-width: 768px) {
            .back-btn { display: inline-block; }
            #sidebar { width: 100%; position: absolute; height: 100%; left: 0; top: 0; transition: transform 0.25s ease-in-out; transform: translateX(0); }
            #main-chat { width: 100%; position: absolute; height: 100%; left: 0; top: 0; transition: transform 0.25s ease-in-out; transform: translateX(100%); }
            #chat-container.in-room #sidebar { transform: translateX(-100%); }
            #chat-container.in-room #main-chat { transform: translateX(0); }
            .del-btn { display: inline-block; }
        }
    </style>
</head>
<body>

    <div id="chat-container">
        <div id="login-area">
            <h3 style="color: #008069; margin-bottom: 15px;">Lebetkeun ID / Nami Akang:</h3>
            <input type="text" id="login-input" placeholder="Contoh: Asep" autocomplete="off">
            <button id="login-btn">Lebet Chat</button>
        </div>

        <div id="sidebar">
            <div class="sidebar-header">
                <span class="app-title">Obrolan Kuring</span>
                <span class="my-profile" id="my-name-display">Akun: -</span>
                <span class="sub-title-kontak">Kontak Aktip</span>
                <button class="logout-btn" onclick="logoutUser()">Ganti ID</button>
            </div>
            <ul id="user-list"></ul>
        </div>

        <div id="main-chat">
            <div class="header">
                <button class="back-btn" onclick="backToContacts()">⬅</button>
                <span id="chat-target-title">📢 Sadaya Jalma</span>
            </div>
            
            <div id="chat-rooms-wrapper">
                <ul id="msg-room-Semua" class="chat-messages-holder"></ul>
            </div>
            
            <form id="form" action="">
                <button type="button" class="action-btn" onclick="document.getElementById('file-input').click()">📎</button>
                <input type="file" id="file-input" style="display: none;" onchange="handleFileSelect(this)">
                
                <textarea id="input" placeholder="Ketik pesen di dieu..." rows="1"></textarea>
                
                <button type="button" id="vn-btn" class="action-btn" onclick="toggleVoiceRecord()">🎙️</button>
                <button class="send-btn">▶</button>
            </form>
        </div>
    </div>

    <audio id="notifSound" src="notif.mp3" preload="auto"></audio>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io("https://obrolan-production.up.railway.app");

        let myId = "Anonim";
        let targetChat = "Semua"; 
        let unreadCounts = {}; 
        
        // Aturan rekam sora VN
        let mediaRecorder;
        let audioChunks = [];
        let isRecording = false;

        const container = document.getElementById('chat-container');
        const form = document.getElementById('form');
        const input = document.getElementById('input');
        const notifSound = document.getElementById('notifSound');
        const userList = document.getElementById('user-list');
        const chatTargetTitle = document.getElementById('chat-target-title');
        const roomsWrapper = document.getElementById('chat-rooms-wrapper');
        const myNameDisplay = document.getElementById('my-name-display');
        const vnBtn = document.getElementById('vn-btn');
        
        const loginArea = document.getElementById('login-area');
        const loginInput = document.getElementById('login-input');
        const loginBtn = document.getElementById('login-btn');

        socket.on('connect', () => {
            const savedId = localStorage.getItem('chat_username');
            if (savedId) {
                myId = savedId;
                loginArea.style.display = 'none';
                myNameDisplay.innerText = "Akun: " + myId;
                socket.emit('user login', myId);
            }
        });

        loginBtn.addEventListener('click', function() {
            const enteredName = loginInput.value.trim();
            if(enteredName !== "") {
                myId = enteredName;
                localStorage.setItem('chat_username', myId);
                loginArea.style.display = 'none';
                myNameDisplay.innerText = "Akun: " + myId;
                socket.emit('user login', myId);
            } else {
                alert("Nami teu kenging kosong nya, Kang!");
            }
        });

        function logoutUser() {
            localStorage.removeItem('chat_username');
            window.location.reload();
        }

        // --- PROSES PILIH GAMBAR ATAU FILE ---
        function handleFileSelect(inputElement) {
            const file = inputElement.files[0];
            if (!file) return;

            // Watesan ukuran file ulah langkung ti 4MB supados jaringan lancar
            if (file.size > 4 * 1024 * 1024) {
                alert("Ukuran file ageung teuing, Kang! Maksimal 4MB waé nya.");
                return;
            }

            const reader = new FileReader();
            let msgType = 'file';
            if (file.type.startsWith('image/')) msgType = 'image';

            reader.onload = function(e) {
                const data = {
                    id: myId,
                    target: targetChat,
                    message: e.target.result, // Data Base64 file
                    msgType: msgType,
                    fileName: file.name
                };
                socket.emit('chat message', data);
            };
            reader.readAsDataURL(file);
            inputElement.value = ''; // Reset inputan file
        }

        // --- PROSES VOICE NOTE (REKAMAN SORA) ---
        function toggleVoiceRecord() {
            if (!isRecording) {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        mediaRecorder = new MediaRecorder(stream);
                        audioChunks = [];
                        
                        mediaRecorder.ondataavailable = event => {
                            audioChunks.push(event.data);
                        };

                        mediaRecorder.onstop = () => {
                            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                socket.emit('chat message', {
                                    id: myId,
                                    target: targetChat,
                                    message: e.target.result,
                                    msgType: 'audio'
                                });
                            };
                            reader.readAsDataURL(audioBlob);
                        };

                        mediaRecorder.start();
                        isRecording = true;
                        vnBtn.classList.add('recording-active');
                        vnBtn.innerText = '🔴';
                    }).catch(err => alert("Punten kedah masihan izin mikrofon heula, Kang!"));
            } else {
                mediaRecorder.stop();
                isRecording = false;
                vnBtn.classList.remove('recording-active');
                vnBtn.innerText = '🎙️';
            }
        }

        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        });

        socket.on('update user list', function(users) {
            userList.innerHTML = `
                <li onclick="selectTarget('Semua')" id="target-Semua" class="${targetChat === 'Semua' ? 'active-chat' : ''}">
                    <span>📢 Sadaya Jalma</span>
                    <span class="badge-notif" id="badge-Semua" style="display: ${unreadCounts['Semua'] ? 'inline' : 'none'}">${unreadCounts['Semua'] || 0}</span>
                </li>`;
            
            users.forEach(user => {
                if(user !== myId) {
                    checkAndCreateRoom(user);
                    let displayBadge = unreadCounts[user] ? 'inline' : 'none';
                    userList.innerHTML += `
                        <li onclick="selectTarget('${user}')" id="target-${user}" class="${targetChat === user ? 'active-chat' : ''}">
                            <span>👤 ${user}</span>
                            <span class="badge-notif" id="badge-${user}" style="display: ${displayBadge}">${unreadCounts[user] || 0}</span>
                        </li>`;
                }
            });
        });

        function checkAndCreateRoom(user) {
            if (!document.getElementById(`msg-room-${user}`)) {
                const newRoom = document.createElement('ul');
                newRoom.id = `msg-room-${user}`;
                newRoom.className = 'chat-messages-holder';
                newRoom.style.display = 'none';
                roomsWrapper.appendChild(newRoom);
            }
        }

        socket.on('load history', function(chatHistory) {
            chatHistory.forEach(data => {
                appendMessageToRoom(data, false);
            });
        });

        function selectTarget(user) {
            targetChat = user;
            container.classList.add('in-room'); 

            document.querySelectorAll('#user-list li').forEach(li => li.classList.remove('active-chat'));
            const activeLi = document.getElementById(`target-${user}`);
            if(activeLi) activeLi.classList.add('active-chat');
            
            chatTargetTitle.innerText = user === 'Semua' ? "📢 Sadaya Jalma" : `👤 ${user}`;
            
            document.querySelectorAll('.chat-messages-holder').forEach(room => room.style.display = 'none');
            const activeRoom = document.getElementById(`msg-room-${user}`);
            if (activeRoom) activeRoom.style.display = 'flex';

            unreadCounts[user] = 0;
            const badge = document.getElementById(`badge-${user}`);
            if (badge) badge.style.display = 'none';
            
            setTimeout(() => { if(activeRoom) activeRoom.scrollTop = activeRoom.scrollHeight; }, 100);
        }

        function backToContacts() {
            container.classList.remove('in-room'); 
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (input.value.trim()) {
                const data = { id: myId, target: targetChat, message: input.value, msgType: 'text' };
                socket.emit('chat message', data);
                input.value = '';
                input.style.height = '40px';
            }
        });

        socket.on('chat message', function(data) {
            appendMessageToRoom(data, true);
        });

        socket.on('message deleted', function(msgId) {
            const msgBubble = document.getElementById(`msg-${msgId}`);
            if (msgBubble) {
                const textContainer = msgBubble.querySelector('.text-content');
                if (textContainer) {
                    textContainer.innerHTML = `<span class="deleted-text">🚫 Pesen ieu parantos dihapus</span>`;
                }
                const delBtn = msgBubble.querySelector('.del-btn');
                if (delBtn) delBtn.remove();
            }
        });

        function requestDeleteMessage(msgId) {
            if (confirm("Naha leres hoyong mupus pesen ieu kanggo sadayana?")) {
                socket.emit('delete message', msgId);
            }
        }

        function appendMessageToRoom(data, playSound) {
            let roomName = "";
            if (data.target === 'Semua') {
                roomName = "Semua";
            } else if (data.sender === myId) {
                roomName = data.target;
            } else if (data.target === myId) {
                roomName = data.sender;
            }

            checkAndCreateRoom(roomName);
            const targetRoom = document.getElementById(`msg-room-${roomName}`);
            
            if (targetRoom) {
                const item = document.createElement('li');
                item.id = `msg-${data.msgId}`;
                
                // Milih tampilan dumasar jinis pesen (Teks, Gambar, File, atawa Audio)
                let renderContent = '';
                if(data.isDeleted) {
                    renderContent = `<span class="deleted-text">${data.message}</span>`;
                } else if(data.msgType === 'image') {
                    renderContent = `<img src="${data.message}" class="chat-img" onclick="window.open(this.src)">`;
                } else if(data.msgType === 'audio') {
                    renderContent = `<audio src="${data.message}" controls controlsList="nodownload"></audio>`;
                } else if(data.msgType === 'file') {
                    renderContent = `<a href="${data.message}" download="${data.fileName}" class="chat-file-link">📂 ${data.fileName}</a>`;
                } else {
                    renderContent = data.message;
                }

                if (data.sender === myId) {
                    item.className = 'my-message';
                    let deleteButton = data.isDeleted ? '' : `<button class="del-btn" onclick="requestDeleteMessage('${data.msgId}')">🗑️</button>`;
                    item.innerHTML = `<div class="text-content">${renderContent}</div>${deleteButton}`;
                } else {
                    item.className = 'other-message';
                    item.innerHTML = roomName === 'Semua' ? `<div class="sender-id">${data.sender}</div><div class="text-content">${renderContent}</div>` : `<div class="text-content">${renderContent}</div>`;
                    
                    if (playSound && roomName !== targetChat) {
                        unreadCounts[roomName] = (unreadCounts[roomName] || 0) + 1;
                        const badge = document.getElementById(`badge-${roomName}`);
                        if (badge) {
                            badge.innerText = unreadCounts[roomName];
                            badge.style.display = 'inline';
                        }
                    }
                    if(playSound) notifSound.play().catch(err => console.log("Audio active"));
                }
                
                targetRoom.appendChild(item);
                targetRoom.scrollTop = targetRoom.scrollHeight;
            }
        }
    </script>
</body>
</html>

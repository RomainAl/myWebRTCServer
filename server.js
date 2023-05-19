const { createServer } = require("https");
const { readFileSync } = require("fs");
const { Server } = require("socket.io");

const options = {
    key: readFileSync('key.pem'),
    cert: readFileSync('cert.pem')
};

const httpServer = createServer(options, (req, res) => {
    res.writeHead(200);
    res.end('This is my WebRTC signaling server\n');
  }).listen(1337, () => {console.log("Server is running")});

const io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
});

let adminSId;
io.sockets.on('connection', (socket) => {
    console.log(Date.now(), socket.id, "New user connected");

    socket.on("join", function (roomName, isAdmin) {
        socket.join(roomName);
        if (isAdmin) {
            adminSId = socket.id; 
            console.log("Is admin :", adminSId)
            socket.emit("create");
        } else {
            console.log("Simple user", socket.id)
            socket.emit("create");
        }
    });


    //Triggered when the person who joined the room is ready to communicate.
    socket.on("ready", function (roomName) {
        socket.broadcast.to(roomName).emit("ready"); //Informs the other peer in the room.
    });

    //Triggered when server gets an offer from a peer in the room.
    socket.on("offer", function (offer) {
        socket.to(adminSId).emit("offer", offer, socket.id); //Sends Offer to the other peer in the room.
    });

    //Triggered when server gets an answer from a peer in the room.
    socket.on("answer", function (answer, clientId) {
        socket.to(clientId).emit("answer", answer); //Sends Answer to the other peer in the room.
    });

    //Triggered when server gets an icecandidate from a peer in the room.
    socket.on("candidate", function (candidate, roomName) {
        if (socket.id != adminSId){
            socket.to(adminSId).emit("candidate", candidate);
        } else {
            socket.broadcast.to(roomName).emit("candidate", candidate); //Sends Candidate to the other peer in the room.
        }
        //socket.broadcast.to(roomName).emit("candidate", candidate); //Sends Candidate to the other peer in the room.
    });

    socket.on('disconnect', function() {
        console.log(Date.now(), socket.id, "User has disconnected");
        io.sockets.emit('disuser', socket.id);
    });
});
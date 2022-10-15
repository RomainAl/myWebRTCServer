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
      origin: "https://127.0.0.1:5501"
    }
});

io.sockets.on('connection', (socket) => {
    console.log('nouvel utilisteur');
});
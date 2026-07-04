const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const PORT = process.env.PORT || 3000;

const rooms = {};

function randomCode() {
    return Math.random().toString(36).substring(2,8).toUpperCase();
}

function checkWinner(board){

const wins = [

[0,1,2],
[3,4,5],
[6,7,8],

[0,3,6],
[1,4,7],
[2,5,8],

[0,4,8],
[2,4,6]

];

for(const w of wins){

const [a,b,c]=w;

if(
board[a] &&
board[a]===board[b] &&
board[a]===board[c]
){

return board[a];

}

}

return null;

}

io.on("connection",(socket)=>{

socket.on("createRoom",()=>{

let room=randomCode();

while(rooms[room]){

room=randomCode();

}

rooms[room]={

board:["","","","","","","","",""],

turn:"X",

players:[socket.id]

};

socket.join(room);

socket.emit("roomCreated",{

room

});

});

socket.on("joinRoom",(room)=>{

if(!rooms[room]){

socket.emit("errorMessage","Room not found.");

return;

}

if(rooms[room].players.length>=2){

socket.emit("errorMessage","Room is full.");

return;

}

rooms[room].players.push(socket.id);

socket.join(room);

socket.emit("roomJoined",{

room

});

io.to(room).emit("startGame");

});

socket.on("move",(data)=>{

const room=data.room;

const index=parseInt(data.index);

if(!rooms[room]) return;

const game=rooms[room];

if(game.board[index]!="") return;

const symbol=

game.players[0]===socket.id ? "X":"O";

if(symbol!==game.turn) return;

game.board[index]=symbol;

game.turn=symbol==="X" ? "O":"X";

io.to(room).emit("updateBoard",{

board:game.board,

turn:game.turn

});

const winner=checkWinner(game.board);

if(winner){

io.to(room).emit(

"winner",

winner+" Wins!"

);

return;

}

        if (!game.board.includes("")) {
            io.to(room).emit("draw");
            return;
        }

    });

    socket.on("restart", (room) => {

        if (!rooms[room]) return;

        rooms[room].board = [
            "", "", "",
            "", "", "",
            "", "", ""
        ];

        rooms[room].turn = "X";

        io.to(room).emit(
            "restartGame",
            rooms[room].board
        );

    });

    socket.on("disconnect", () => {

        for (const room in rooms) {

            const game = rooms[room];

            const index = game.players.indexOf(socket.id);

            if (index !== -1) {

                game.players.splice(index, 1);

                io.to(room).emit(
                    "errorMessage",
                    "Opponent disconnected."
                );

                if (game.players.length === 0) {
                    delete rooms[room];
                }

                break;
            }

        }

    });

});

app.get("/", (req, res) => {
    res.send("DuelTac Server Running 🚀");
});

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

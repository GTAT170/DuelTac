const socket = io("YOUR_RENDER_BACKEND_URL");

const board = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

const createBtn = document.getElementById("createBtn");
const joinBtn = document.getElementById("joinBtn");
const restartBtn = document.getElementById("restartBtn");
const roomInput = document.getElementById("roomInput");

let room = "";
let symbol = "";
let myTurn = false;

function drawBoard(boardState){
    board.forEach((cell,index)=>{
        cell.textContent = boardState[index];

        cell.classList.remove("x");
        cell.classList.remove("o");

        if(boardState[index]=="X")
            cell.classList.add("x");

        if(boardState[index]=="O")
            cell.classList.add("o");
    });
}

createBtn.onclick=()=>{
    socket.emit("createRoom");
};

joinBtn.onclick=()=>{
    if(roomInput.value.trim()=="") return;

    socket.emit("joinRoom",roomInput.value.trim().toUpperCase());
};

socket.on("roomCreated",(data)=>{

    room=data.room;
    symbol="X";
    myTurn=true;

    roomInput.value=room;

    statusText.innerHTML=
    "Room: <b>"+room+"</b><br>Waiting for opponent...";
});

socket.on("roomJoined",(data)=>{

    room=data.room;
    symbol="O";
    myTurn=false;

    statusText.innerHTML=
    "Joined Room "+room;
});

socket.on("startGame",()=>{

    statusText.innerHTML=
    myTurn ? "Your Turn" : "Opponent's Turn";

});

board.forEach((cell)=>{

cell.addEventListener("click",()=>{

if(!myTurn) return;

const index=cell.dataset.index;

socket.emit("move",{

room:room,
index:index

});

});

});

socket.on("updateBoard",(data)=>{

drawBoard(data.board);

myTurn=data.turn===symbol;

statusText.innerHTML=
myTurn ? "Your Turn" : "Opponent's Turn";

});

socket.on("winner",(msg)=>{

statusText.innerHTML=msg;

restartBtn.style.display="block";

});

socket.on("draw",()=>{

statusText.innerHTML="Draw!";

restartBtn.style.display="block";

});

restartBtn.onclick=()=>{

socket.emit("restart",room);

restartBtn.style.display="none";

};

socket.on("restartGame",(boardState)=>{

drawBoard(boardState);

myTurn=symbol==="X";

statusText.innerHTML=
myTurn ? "Your Turn" : "Opponent's Turn";

});

socket.on("errorMessage",(msg)=>{

alert(msg);

});

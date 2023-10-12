function openContent(id) {
    let content = document.getElementById(id);
    content.style.display = "block";
}

function closeContent(id) {
    let content = document.getElementById(id);
    content.style.display = "none";
}

function changeInstructionsPage() {
    let gameRules = document.getElementById("game-rules-div");
    let howToPlay = document.getElementById("how-to-play-div");

    if (gameRules.style.display !== "none") {
        gameRules.style.display = "none";
        howToPlay.style.display = "block";
    } else {
        gameRules.style.display = "block";
        howToPlay.style.display = "none";
    }
}

function getSelectedValue(name) {
    const radio = document.getElementsByName(name);

    for (let value of radio) {
        if (value.checked) {
            return value.value;
        }
    }

    return null;
}

let game;
function startGame() {
    const boardSize = getSelectedValue("board-size");
    const opponent = getSelectedValue("play-against");
    const playerColor = getSelectedValue("pick-color");
    const curPlayer = getSelectedValue("start-color");
    const difficulty = getSelectedValue("difficulty-level");
    
    const gamePhase = document.getElementById("game-phase-text");
    const message = document.getElementById("game-message-text");
    const startGame = document.getElementById("start-game");
    const forfeit = document.getElementById("forfeit");
    const config = document.getElementById("config");
    const board = document.getElementById("board");

    game = new Game(parseInt(boardSize[0]), parseInt(boardSize[2]), curPlayer);

    startGame.style.display = "none";
    forfeit.style.display = "inline-block";
    config.style.display = "none";
    gamePhase.textContent = game.state + " pieces | " + curPlayer + " turn"; // move to game

    makeBoard(parseInt(boardSize[0]), parseInt(boardSize[2]));


}

function forfeitGame() {
    const startGame = document.getElementById("start-game");
    const forfeit = document.getElementById("forfeit");
    const config = document.getElementById("config");
    const board = document.getElementById("board");
    const whitePieces = document.getElementById("white-pieces");
    const blackPieces = document.getElementById("black-pieces");
    startGame.style.display = "inline-block";
    forfeit.style.display = "none";
    config.style.display = "inline-block";
    board.innerHTML = "";
    whitePieces.innerHTML = "";
    blackPieces.innerHTML = "";
    game.forfeit(); // make forfeit here
}

function makeBoard(rows, cols) {
    const board = document.getElementById("board");
    const whitePieces = document.getElementById("white-pieces");
    const blackPieces = document.getElementById("black-pieces");

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const box = document.createElement("div");
            box.setAttribute("box-id", i + "x" + j);
            box.classList.add("box");
            box.addEventListener("click", onBoxClick);
            board.append(box);
        }
    }

    for (let i = 0; i < 12; i++) {
        const whitePiece = document.createElement("div");
        const blackPiece = document.createElement("div");
        whitePiece.classList.add("white-piece");
        blackPiece.classList.add("black-piece");
        whitePieces.append(whitePiece);
        blackPieces.append(blackPiece);
    }
}

// for some reason game runs here also on click I play my turn check for win and play computer turn check for win
let pieceClicked = false;

function onBoxClick(e) {
    const boxPos = e.target.getAttribute("box-id");
    const piece = document.getElementById("white-pieces").firstChild;
    piece.addEventListener("click", onPieceClick);
    e.target.append(piece);
    if (pieceClicked) {

    }
}

function onPieceClick(e) {
    pieceClicked = true;
    const boxPos = e.target.parentElement.getAttribute("box-id");

}
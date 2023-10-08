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

class Game {
    board = []
    state = "placing"; // placing or moving
    insideWhitePieceCount = 0;
    insideBlackPieceCount = 0;

    constructor(rows, columns, difficulty, curPlayer) {
        this.rows = rows;
        this.columns = columns;
        this.difficulty = difficulty;
        this.curPlayer = curPlayer;

        for (let i = 0; i < rows; i++) {
            this.board.push([]);
            for (let j = 0; j < columns; j++) {
                this.board[i].push(' ');
            }
        }
    }

    switchTurn() {
        if (this.curPlayer === 'w') {
            this.curPlayer = 'b';
        } else {
          this.curPlayer = 'w';
        }
    }
    placePiece(row, column) {

    }

    movePiece(startingRow, startingColumn, endingRow, endingColumn) {

    }

    removePiece(row, column) {

    }

    checkInLinePiece(row, column) {
        return false;
    }

    gameWinner() {
        if (this.insideBlackPieceCount < 3 && this.state === "moving") {
            return 'w';
        } else if (this.insideWhitePieceCount < 3 && this.state === 'moving') {
            return 'b';
        }
        return ' ';
    }
}


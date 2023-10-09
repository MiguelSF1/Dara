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

    constructor(rows, columns, curPlayer) {
        this.rows = rows;
        this.columns = columns;
        this.curPlayer = curPlayer;
        this.board = [];
        this.state = "placing";
        this.insideWhitePieceCount = 0;
        this.insideBlackPieceCount = 0;
        this.winner = ' ';

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
        if (this.state === "placing" && this.board[row][column] === ' ') {
            this.board[row][column] = this.curPlayer;
            if (this.curPlayer === 'w') {
                this.insideWhitePieceCount++;
            } else {
                this.insideBlackPieceCount++;
            }
            this.switchTurn();
        } else if (this.state === "placing" && this.board[row][column] !== ' ') {
            // message saying cant place a piece there
        }
    }

    movePiece(startingRow, startingColumn, endingRow, endingColumn) {
        if (this.state === "moving" && this.isValidMove(startingRow, startingColumn, endingRow, endingColumn)) {
            this.board[endingRow][endingColumn] = this.board[startingRow][startingColumn];
            this.board[startingRow][startingColumn] = ' ';
            if (this.checkInLinePiece(endingRow, endingColumn)) {
                // message can remove piece
                // call removePiece
            }
            this.switchTurn();
        } else {
            // message illegal move
        }
    }

    removePiece(row, column) {
        if (this.board[row][column] !== ' ') {
            if (this.board[row][column] === 'w') {
                this.insideWhitePieceCount--;
            } else {
                this.insideBlackPieceCount--;
            }
            this.board[row][column] = ' ';
        }
        else {
            // message no piece there
        }
    }

    isValidMove(startingRow, startingColumn, endingRow, endingColumn) {
        const piece = this.board[startingRow][startingColumn];

        if (piece !== this.curPlayer || this.board[endingRow][endingColumn] !== ' ') {
            return false;
        }

        const rowDiff = Math.abs(endingRow - startingRow);
        const colDiff = Math.abs(endingColumn - startingColumn);

        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    checkInLinePiece(row, column) {
        const piece = this.board[row][column];

        // Check horizontally
        let horizontalCount = 1;
        for (let i = column + 1; i < this.columns; i++) {
            if (this.board[row][i] === piece) {
                horizontalCount++;
            } else {
                break;
            }
        }
        for (let i = column - 1; i >= 0; i--) {
            if (this.board[row][i] === piece) {
                horizontalCount++;
            } else {
                break;
            }
        }

        if (horizontalCount >= 3) {
            return true;
        }

        // Check vertically
        let verticalCount = 1;
        for (let i = row + 1; i < this.rows; i++) {
            if (this.board[i][column] === piece) {
                verticalCount++;
            } else {
                break;
            }
        }
        for (let i = row - 1; i >= 0; i--) {
            if (this.board[i][column] === piece) {
                verticalCount++;
            } else {
                break;
            }
        }

        return verticalCount >= 3;
    }

    gameWinner() {
        if (this.insideBlackPieceCount < 3 && this.state === "moving") {
            // message white won
            this.winner = 'w';
        } else if (this.insideWhitePieceCount < 3 && this.state === 'moving') {
            // message black won
            this.winner = 'b';
        }
        return this.winner;
    }

    forfeit() {
        if (this.curPlayer === 'w') {
            // message white forfeit so black won
            this.winner = 'b';
        } else if (this.curPlayer === 'b') {
            // message black forfeit so white won
            this.winner = 'w';
        } else {
            // message no game to forfeit
        }
    }
}

let game = new Game();

function startGame() {
    const boardSizeRadio = document.getElementsByName("board-size");
    const playAgainstRadio = document.getElementsByName("play-against");
    const pickColorRadio = document.getElementsByName("pick-color");
    const startColorRadio = document.getElementsByName("start-color");
    const difficultyLevelRadio = document.getElementsByName("difficulty-level");

    let boardSize;
    for (let value of boardSizeRadio) {
        if (value.checked) {
            boardSize = value.split('x');
            break;
        }
    }
    let rows = parseInt(boardSize[0]);
    let columns = parseInt(boardSize[1]);

    let opponent;
    for (let value of playAgainstRadio) {
        if (value.checked) {
            opponent = value;
            break;
        }
    }

    let playerColor;
    for (let value of pickColorRadio) {
        if (value.checked) {
            playerColor = value;
            break;
        }
    }

    let curPlayer;
    for (let value of startColorRadio) {
        if (value.checked) {
            curPlayer = value;
            break;
        }
    }

    let difficulty;
    for (let value of difficultyLevelRadio) {
        if (value.checked) {
            difficulty = value;
            break;
        }
    }

    game = new Game(rows, columns, curPlayer);

    // make the board and display the pieces
    let board = document.getElementById("board");
    board.style.width = (90 * columns).toString() + "px";
    board.style.height = (90 * rows).toString() + "px";

    while (game.gameWinner() === ' ') {
        if (playerColor === game.curPlayer) {

        } else if (opponent === "computer") {
            if (difficulty === "easy") {

            } else if (difficulty === "medium") {

            } else {

            }
        }
    }

    // message gameWinner won
}


class Game {
    constructor(rows, columns, curPlayer, playerColor, opponent) {
        this._gamePhaseText = document.getElementById("game-phase-text");
        this._gameMessages = document.getElementById("game-messages");
        this._whitePieces = document.getElementById("white-pieces");
        this._blackPieces = document.getElementById("black-pieces");
        this._htmlBoard = document.getElementById("board");
        this._startGame = document.getElementById("start-game");
        this._forfeit = document.getElementById("forfeit");
        this._config = document.getElementById("config");
        this._insideWhitePieceCount = 0;
        this._insideBlackPieceCount = 0;
        this._state = "placing";
        this._winner = " ";
        this._rows = rows;
        this._columns = columns;
        this._curPlayer = curPlayer;
        this._playerColor = playerColor;
        this._opponent = opponent;
        this._prevWhiteMove = [-1, -1, -1, -1];
        this._prevBlackMove = [-1, -1, -1, -1];
        this._board = [];

        for (let i = 0; i < 12; i++) {
            const whitePiece = document.createElement("div");
            const blackPiece = document.createElement("div");
            whitePiece.classList.add("white-piece");
            blackPiece.classList.add("black-piece");
            this._whitePieces.append(whitePiece);
            this._blackPieces.append(blackPiece);
        }

        let squareWidth = (600 / this._columns).toString() + "px";
        let squareHeight = (600 / this._rows).toString() + "px";

        for (let i = 0; i < this._rows; i++) {
            this._board.push([]);
            for (let j = 0; j < this._columns; j++) {
                this._board[i].push(" ");
                const square = document.createElement("div");
                square.id = i.toString() + "x" + j.toString();
                square.style.width = squareWidth;
                square.style.height = squareHeight;
                square.classList.add("square");
                square.addEventListener("click", getPlayerMove);
                this._htmlBoard.append(square);
            }
        }

        this._htmlBoard.style.gridTemplateColumns = "repeat(" + this._columns + ", 1fr)";
        this._startGame.style.display = "none";
        this._forfeit.style.display = "inline-block";
        this._config.style.display = "none";
        this._gameMessages.style.display = "inline-block";
        this._gamePhaseText.textContent = this._state + " pieces | " + this._curPlayer + " turn";
    }

    get state() {
        return this._state;
    }

    get curPlayer() {
        return this._curPlayer;
    }

    get opponent() {
        return this._opponent;
    }

    get board() {
        return this._board;
    }
    
    get rows() {
        return this._rows;
    }

    get columns() {
        return this._columns;
    }

    get winner() {
        return this._winner;
    }

    get playerColor() {
        return this._playerColor;
    }

    switchTurn() {
        if (this._curPlayer === "white") {
            this._curPlayer = "black";
        } else {
            this._curPlayer = "white";
        }
        this._gamePhaseText.textContent = this._state + " pieces | " + this._curPlayer + " turn";
    }

    isPlayerTurn() {
        return this._curPlayer === this._playerColor;
    }

    sendGameMessage(text) {
        let message = document.createElement("h3");
        message.textContent = text;
        this._gameMessages.append(message);
        this._gameMessages.append(document.createElement("hr"));
        this._gameMessages.scrollTop = this._gameMessages.scrollHeight;
    }

    placePiece(row, column) {
        if (this._board[row][column] === " " && this.checkPieceLimit(-1, -1, row, column, this._curPlayer)) {
            this._board[row][column] = this._curPlayer;
            this.updateBoard([row, column]);
            if (this._curPlayer === "white") {
                this._insideWhitePieceCount++;
            } else {
                this._insideBlackPieceCount++;
            }

            if (this._insideBlackPieceCount + this._insideWhitePieceCount === 24) {
                this._state = "moving";
            }

            this.switchTurn();
            return true;
        }

        if (this.isPlayerTurn()) {
            this.sendGameMessage("Illegal move from " + this._curPlayer);
        }
        return false;
    }

    movePiece(startingRow, startingColumn, endingRow, endingColumn) {
        if (this.isValidMove(startingRow, startingColumn, endingRow, endingColumn) && this.checkPieceLimit(startingRow, startingColumn, endingRow, endingColumn, this._curPlayer))  {
            this._board[endingRow][endingColumn] = this._board[startingRow][startingColumn];
            this._board[startingRow][startingColumn] = " ";
            this.updateBoard([startingRow, startingColumn, endingRow, endingColumn]);
            if (this._curPlayer === "white") {
                this._prevWhiteMove = [endingRow, endingColumn, startingRow, startingColumn];
            } else {
                this._prevBlackMove = [endingRow, endingColumn, startingRow, startingColumn];
            }
            if (this.checkInLinePiece(endingRow, endingColumn)) {
                this.sendGameMessage(this._curPlayer + " can remove a piece");
                this._state = "removing";
            } else {
                this.switchTurn();
            }
            return true;
        } 

        if (this.isPlayerTurn()) {
            this.sendGameMessage("Illegal move from " + this._curPlayer);
        }
        return false;
    }

    removePiece(row, column) {
        if (this._board[row][column] === this._curPlayer || this._board[row][column] === " ") {
            if (this.isPlayerTurn()) {
                this.sendGameMessage("Illegal move from " + this._curPlayer);
            }
            return false;
        }

        this._board[row][column] = " ";
        this.updateBoard([row, column]);
        this._state = "moving";

        if (this._curPlayer === "black") {
            this._insideWhitePieceCount--;
        } else {
            this._insideBlackPieceCount--;
        }

        this.switchTurn();
        return true;
    }

    updateBoard(move) {
        if (this._state === "placing") {
            let square = document.getElementById(move[0].toString() + "x" + move[1].toString());
            let piece;
            if (this._curPlayer === "white") {
                piece = this._whitePieces.firstChild;
            } else {
                piece = this._blackPieces.firstChild;
            }
            square.append(piece);
        } else if (this._state === "removing") {
            let piece = document.getElementById(move[0].toString() + "x" + move[1].toString()).firstChild;
            if (this._curPlayer === "white") {
                this._blackPieces.append(piece);
            } else {
                this._whitePieces.append(piece);
            }
        } else {
            let square = document.getElementById(move[2].toString() + "x" + move[3].toString());
            let piece = document.getElementById(move[0].toString() + "x" + move[1].toString()).firstChild;
            square.append(piece);
        }
    }

    checkPieceLimit(startingRow, startingColumn, endingRow, endingColumn, curPlayer) {
        let horizontalCount = 1;
        for (let i = endingColumn + 1; i < this._columns; i++) {
            if (this._board[endingRow][i] === curPlayer && !(startingRow === endingRow && startingColumn === i)) {
                horizontalCount++;
            } else {
                break;
            }
        }
        for (let i = endingColumn - 1; i >= 0; i--) {
            if (this._board[endingRow][i] === curPlayer && !(startingRow === endingRow && startingColumn === i)) {
                horizontalCount++;
            } else {
                break;
            }
        }
        if (horizontalCount > 3) {
            return false;
        }

        let verticalCount = 1;
        for (let i = endingRow + 1; i < this._rows; i++) {
            if (this._board[i][endingColumn] === curPlayer && !(startingRow === i && startingColumn === endingColumn)) {
                verticalCount++;
            } else {
                break;
            }
        }
        for (let i = endingRow - 1; i >= 0; i--) {
            if (this._board[i][endingColumn] === curPlayer && !(startingRow === i && startingColumn === endingColumn)) {
                verticalCount++;
            } else {
                break;
            }
        }

        return verticalCount <= 3;
    }

    isValidMove(startingRow, startingColumn, endingRow, endingColumn) {
        if (this.curPlayer === "white" && this._prevWhiteMove[0] === startingRow && this._prevWhiteMove[1] === startingColumn && this._prevWhiteMove[2] === endingRow && this._prevWhiteMove[3] === endingColumn) {
            return false;
        }
        if (this.curPlayer === "black" && this._prevBlackMove[0] === startingRow && this._prevBlackMove[1] === startingColumn && this._prevBlackMove[2] === endingRow && this._prevBlackMove[3] === endingColumn) {
            return false;
        }
        if (this._board[endingRow][endingColumn] !== " " || this._board[startingRow][startingColumn] !== this._curPlayer) {
            return false;
        }

        const rowDiff = Math.abs(endingRow - startingRow);
        const colDiff = Math.abs(endingColumn - startingColumn);

        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    checkInLinePiece(row, column) {
        let horizontalCount = 1;
        for (let i = column + 1; i < this._columns; i++) {
            if (this._board[row][i] === this._curPlayer) {
                horizontalCount++;
            } else {
                break;
            }
        }
        for (let i = column - 1; i >= 0; i--) {
            if (this._board[row][i] === this._curPlayer) {
                horizontalCount++;
            } else {
                break;
            }
        }
        if (horizontalCount === 3) {
            return true;
        }

        let verticalCount = 1;
        for (let i = row + 1; i < this._rows; i++) {
            if (this._board[i][column] === this._curPlayer) {
                verticalCount++;
            } else {
                break;
            }
        }
        for (let i = row - 1; i >= 0; i--) {
            if (this._board[i][column] === this._curPlayer) {
                verticalCount++;
            } else {
                break;
            }
        }
        return verticalCount === 3;
    }

    checkGameOver() {
        if (this._winner !== " ") {
            return true;
        }
        if (this._state === "placing") {
            return false;
        }
        if (this._insideWhitePieceCount < 3) {
            this._winner = "black";
            return true;
        }
        if (this._insideBlackPieceCount < 3) {
            this._winner = "white";
            return true;
        }

        let whiteHasMove = false;
        let blackHasMove = false;
        for (let i = 0; i < this._rows; i++) {
            for (let j = 0; j < this._columns; j++) {
                if (this._board[i][j] !== " ") {
                    let playerMoveColor = this._board[i][j];
                    if (j + 1 < this._columns && this._board[i][j + 1] === " " && this.checkPieceLimit(i, j, i, j + 1, playerMoveColor)) {
                        if (playerMoveColor === "white" && !(this._prevWhiteMove[0] === i && this._prevWhiteMove[1] === j && this._prevWhiteMove[2] === i && this._prevWhiteMove[3] === j + 1)) {
                            whiteHasMove = true;
                        } else if (playerMoveColor === "black" && !(this._prevBlackMove[0] === i && this._prevBlackMove[1] === j && this._prevBlackMove[2] === i && this._prevBlackMove[3] === j + 1)) {
                            blackHasMove = true;
                        }
                    } else if (j - 1 >= 0 && this._board[i][j - 1] === " " && this.checkPieceLimit(i, j, i, j - 1, playerMoveColor)) {
                        if (playerMoveColor === "white" && !(this._prevWhiteMove[0] === i && this._prevWhiteMove[1] === j && this._prevWhiteMove[2] === i && this._prevWhiteMove[3] === j - 1)) {
                            whiteHasMove = true;
                        } else if (playerMoveColor === "black" && !(this._prevBlackMove[0] === i && this._prevBlackMove[1] === j && this._prevBlackMove[2] === i && this._prevBlackMove[3] === j - 1)) {
                            blackHasMove = true;
                        }
                    } else if (i + 1 < this._rows && this._board[i + 1][j] === " " && this.checkPieceLimit(i, j, i + 1, j, playerMoveColor)) {
                        if (playerMoveColor === "white" && !(this._prevWhiteMove[0] === i && this._prevWhiteMove[1] === j && this._prevWhiteMove[2] === i + 1 && this._prevWhiteMove[3] === j)) {
                            whiteHasMove = true;
                        } else if (playerMoveColor === "black" && !(this._prevBlackMove[0] === i && this._prevBlackMove[1] === j && this._prevBlackMove[2] === i + 1 && this._prevBlackMove[3] === j)) {
                            blackHasMove = true;
                        }
                    } else if (i - 1 >= 0 && this._board[i - 1][j] === " " && this.checkPieceLimit(i, j, i - 1, j, playerMoveColor)) {
                        if (playerMoveColor === "white" && !(this._prevWhiteMove[0] === i && this._prevWhiteMove[1] === j && this._prevWhiteMove[2] === i - 1 && this._prevWhiteMove[3] === j)) {
                            whiteHasMove = true;
                        } else if (playerMoveColor === "black" && !(this._prevBlackMove[0] === i && this._prevBlackMove[1] === j && this._prevBlackMove[2] === i - 1 && this._prevBlackMove[3] === j)) {
                            blackHasMove = true;
                        }
                    }
                }
            }
        }

        if (whiteHasMove && blackHasMove) {
            return false;
        }
        if (!whiteHasMove && !blackHasMove) {
            if (this._curPlayer === "white") {
                this._winner = "black";
            } else {
                this._winner = "white";
            }
            return true;
        }
        if (!whiteHasMove) {
            this._winner = "black";
            return true;
        }
        this._winner = "white";
        return true;
    }

    findPieceInLine(startingRow, startingColumn, endingRow, endingColumn) {
        let horizontalCount = 1;
        for (let i = endingColumn + 1; i < this._columns; i++) {
            if (this._board[endingRow][i] === this._curPlayer && (startingRow !== endingRow || startingColumn !== i)) {
                horizontalCount++;
            } else {
                break;
            }
        }
        for (let i = endingColumn - 1; i >= 0; i--) {
            if (this._board[endingRow][i] === this._curPlayer && (startingRow !== endingRow || startingColumn !== i)) {
                horizontalCount++;
            } else {
                break;
            }
        }
        if (horizontalCount === 3) {
            return true;
        }

        let verticalCount = 1;
        for (let i = endingRow + 1; i < this._rows; i++) {
            if (this._board[i][endingColumn] === this._curPlayer && (startingRow !== i || startingColumn !== endingColumn)) {
                verticalCount++;
            } else {
                break;
            }
        }
        for (let i = endingRow - 1; i >= 0; i--) {
            if (this._board[i][endingColumn] === this._curPlayer && (startingRow !== i || startingColumn !== endingColumn)) {
                verticalCount++;
            } else {
                break;
            }
        }
        return verticalCount === 3;
    }

    forfeitGame() {
        if (this._playerColor === "white") {
            this._winner = "black";
        } else {
            this._winner = "white";
        }
        this._gamePhaseText.textContent = this._playerColor + " forfeit ";
    }

    gameOver() {
        this._startGame.style.display = "inline-block";
        this._forfeit.style.display = "none";
        this._config.style.display = "inline-block";
        this._htmlBoard.innerHTML = "";
        this._whitePieces.innerHTML = "";
        this._blackPieces.innerHTML = "";
        this._gameMessages.innerHTML = "";
        this._gameMessages.style.display = "none";
        this._gamePhaseText.textContent = this._winner + " wins";
    }
}

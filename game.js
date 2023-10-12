class Game {

    constructor(rows, columns, curPlayer) {
        this.rows = rows;
        this.columns = columns;
        this.board = [];
        this._curPlayer = curPlayer;
        this._state = "placing";
        this._insideWhitePieceCount = 0;
        this._insideBlackPieceCount = 0;
        this._winner = ' ';
        this.message = document.getElementById("game-message-text");
        this.gamePhase = document.getElementById("game-phase-text");

        for (let i = 0; i < rows; i++) {
            this.board.push([]);
            for (let j = 0; j < columns; j++) {
                this.board[i].push(' ');
            }
        }
        
    }


    get curPlayer() {
        return this._curPlayer;
    }

    get state() {
        return this._state;
    }

    get insideWhitePieceCount() {
        return this._insideWhitePieceCount;
    }

    get insideBlackPieceCount() {
        return this._insideBlackPieceCount;
    }

    get winner() {
        return this._winner;
    }

    switchState() {
        this._state = "moving";
    }

    switchTurn() {
        if (this._curPlayer === 'w') {
            this._curPlayer = 'b';
        } else {
          this._curPlayer = 'w';
        }
    }
    
    placePiece(row, column) {
        if (this._state === "placing" && this.board[row][column] === ' ') {
            this.board[row][column] = this._curPlayer;
            if (this._curPlayer === 'w') {
                this._insideWhitePieceCount++;
            } else {
                this._insideBlackPieceCount++;
            }
            this.switchTurn();
            return true;
        } 
        this.message.textContent = "Cant place piece";
        return false;
    }

    movePiece(startingRow, startingColumn, endingRow, endingColumn) {
        if (this._state === "moving" && this.isValidMove(startingRow, startingColumn, endingRow, endingColumn)) {
            this.board[endingRow][endingColumn] = this.board[startingRow][startingColumn];
            this.board[startingRow][startingColumn] = ' ';
            if (this.checkInLinePiece(endingRow, endingColumn)) {
                this.message.textContent = "Can remove a piece";
                return "remove";
            }
            this.switchTurn();
            return "moved";
        } 
        this.message.textContent = "Illegal move";
        return "illegal";
    }

    removePiece(row, column) {
        if (this.board[row][column] !== ' ') {
            if (this.board[row][column] === 'w') {
                this._insideWhitePieceCount--;
            } else {
                this._insideBlackPieceCount--;
            }
            this.board[row][column] = ' ';
            this.message.textContent = "Piece removed";
            return true;
        }
        this.message.textContent = "No piece there";
        return false;
    }

    isValidMove(startingRow, startingColumn, endingRow, endingColumn) {
        const piece = this.board[startingRow][startingColumn];

        if (piece !== this._curPlayer || this.board[endingRow][endingColumn] !== ' ') {
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
        if (this._insideBlackPieceCount < 3 && this._state === "moving") {
            this.gamePhase.textContent = "White won";
            this.message.textContent = "Black only has" + this._insideBlackPieceCount + " pieces";
            this._winner = 'w';
        } else if (this._insideWhitePieceCount < 3 && this._state === 'moving') {
            this.gamePhase.textContent = "Black won";
            this.message.textContent = "White only has" + this._insideWhitePieceCount + " pieces";
            this._winner = 'b';
        }
        return this._winner;
    }

    forfeit() {
        if (this._curPlayer === 'w') {
            this.message.textContent  = "White forfeit";
            this.gamePhase.textContent = "Black won";
            this._winner = 'b';
        }
        else {
            this.message.textContent = "Black forfeit";
            this.gamePhase.textContent = "White won";
            this._winner = 'w';
        }
    }
}

module.exports.placePiece = function placePiece(row, column, board, curPlayer) {
    return board[row][column] === "empty" && checkPieceLimit(-1, -1, row, column, curPlayer, board);

}

function checkPieceLimit(startingRow, startingColumn, endingRow, endingColumn, curPlayer, board) {
    let horizontalCount = 1;
    for (let i = endingColumn + 1; i < board[0].length; i++) {
        if (board[endingRow][i] === curPlayer && !(startingRow === endingRow && startingColumn === i)) {
            horizontalCount++;
        } else {
            break;
        }
    }
    for (let i = endingColumn - 1; i >= 0; i--) {
        if (board[endingRow][i] === curPlayer && !(startingRow === endingRow && startingColumn === i)) {
            horizontalCount++;
        } else {
            break;
        }
    }
    if (horizontalCount > 3) {
        return false;
    }

    let verticalCount = 1;
    for (let i = endingRow + 1; i < board.length; i++) {
        if (board[i][endingColumn] === curPlayer && !(startingRow === i && startingColumn === endingColumn)) {
            verticalCount++;
        } else {
            break;
        }
    }
    for (let i = endingRow - 1; i >= 0; i--) {
        if (board[i][endingColumn] === curPlayer && !(startingRow === i && startingColumn === endingColumn)) {
            verticalCount++;
        } else {
            break;
        }
    }
    return verticalCount <= 3;
}

module.exports.movePiece = function movePiece(startingRow, startingColumn, endingRow, endingColumn, curPlayer, board, prevWhiteMove, prevBlackMove) {
    return isValidMove(startingRow, startingColumn, endingRow, endingColumn, curPlayer, board, prevWhiteMove, prevBlackMove)
        && checkPieceLimit(startingRow, startingColumn, endingRow, endingColumn, curPlayer, board);


}

function isValidMove(startingRow, startingColumn, endingRow, endingColumn, curPlayer, board, prevWhiteMove, prevBlackMove) {
    if (curPlayer === "white" && prevWhiteMove[0] === startingRow && prevWhiteMove[1] === startingColumn && prevWhiteMove[2] === endingRow && prevWhiteMove[3] === endingColumn) {
        return false;
    }
    if (curPlayer === "black" && prevBlackMove[0] === startingRow && prevBlackMove[1] === startingColumn && prevBlackMove[2] === endingRow && prevBlackMove[3] === endingColumn) {
        return false;
    }
    if (board[endingRow][endingColumn] !== "empty" || board[startingRow][startingColumn] !== curPlayer) {
        return false;
    }

    const rowDiff = Math.abs(endingRow - startingRow);
    const colDiff = Math.abs(endingColumn - startingColumn);

    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

module.exports.checkInLinePiece = function checkInLinePiece(row, column, curPlayer, board) {
    let horizontalCount = 1;
    for (let i = column + 1; i < board.length; i++) {
        if (board[row][i] === curPlayer) {
            horizontalCount++;
        } else {
            break;
        }
    }
    for (let i = column - 1; i >= 0; i--) {
        if (board[row][i] === curPlayer) {
            horizontalCount++;
        } else {
            break;
        }
    }
    if (horizontalCount === 3) {
        return true;
    }

    let verticalCount = 1;
    for (let i = row + 1; i < board[0].length; i++) {
        if (board[i][column] === curPlayer) {
            verticalCount++;
        } else {
            break;
        }
    }
    for (let i = row - 1; i >= 0; i--) {
        if (board[i][column] === curPlayer) {
            verticalCount++;
        } else {
            break;
        }
    }
    return verticalCount === 3;
}

module.exports.removePiece = function removePiece(row, column, curPlayer, board) {
    return !(board[row][column] === curPlayer || board[row][column] === "empty");
}

module.exports.gameOver = function gameOver(board, prevWhiteMove, prevBlackMove, curPlayer) {
    let insideWhitePieceCount = 0;
    let insideBlackPieceCount = 0;

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] === "white") {
                insideWhitePieceCount++;
            } else if (board[i][j] === "black") {
                insideBlackPieceCount++;
            }
        }
    }

    if (insideWhitePieceCount < 3) {
        return "black";
    }
    if (insideBlackPieceCount < 3) {
        return "white";
    }

    let whiteHasMove = false;
    let blackHasMove = false;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] !== "empty") {
                let playerMoveColor = board[i][j];
                if (j + 1 < board[0].length && board[i][j + 1] === "empty" && checkPieceLimit(i, j, i, j + 1, playerMoveColor)) {
                    if (playerMoveColor === "white" && !(prevWhiteMove[0] === i && prevWhiteMove[1] === j && prevWhiteMove[2] === i && prevWhiteMove[3] === j + 1)) {
                        whiteHasMove = true;
                    } else if (playerMoveColor === "black" && !(prevBlackMove[0] === i && prevBlackMove[1] === j && prevBlackMove[2] === i && prevBlackMove[3] === j + 1)) {
                        blackHasMove = true;
                    }
                } else if (j - 1 >= 0 && board[i][j - 1] === "empty" && checkPieceLimit(i, j, i, j - 1, playerMoveColor)) {
                    if (playerMoveColor === "white" && !(prevWhiteMove[0] === i && prevWhiteMove[1] === j && prevWhiteMove[2] === i && prevWhiteMove[3] === j - 1)) {
                        whiteHasMove = true;
                    } else if (playerMoveColor === "black" && !(prevBlackMove[0] === i && prevBlackMove[1] === j && prevBlackMove[2] === i && prevBlackMove[3] === j - 1)) {
                        blackHasMove = true;
                    }
                } else if (i + 1 < board.length && board[i + 1][j] === "empty" && checkPieceLimit(i, j, i + 1, j, playerMoveColor)) {
                    if (playerMoveColor === "white" && !(prevWhiteMove[0] === i && prevWhiteMove[1] === j && prevWhiteMove[2] === i + 1 && prevWhiteMove[3] === j)) {
                        whiteHasMove = true;
                    } else if (playerMoveColor === "black" && !(prevBlackMove[0] === i && prevBlackMove[1] === j && prevBlackMove[2] === i + 1 && prevBlackMove[3] === j)) {
                        blackHasMove = true;
                    }
                } else if (i - 1 >= 0 && board[i - 1][j] === "empty" && checkPieceLimit(i, j, i - 1, j, playerMoveColor)) {
                    if (playerMoveColor === "white" && !(prevWhiteMove[0] === i && prevWhiteMove[1] === j && prevWhiteMove[2] === i - 1 && prevWhiteMove[3] === j)) {
                        whiteHasMove = true;
                    } else if (playerMoveColor === "black" && !(prevBlackMove[0] === i && prevBlackMove[1] === j && prevBlackMove[2] === i - 1 && prevBlackMove[3] === j)) {
                        blackHasMove = true;
                    }
                }
            }
        }
    }

    if (whiteHasMove && blackHasMove) {
        return null;
    }
    if (!whiteHasMove && !blackHasMove) {
        if (curPlayer === "white") {
            return "black";
        } else {
            return "white";
        }
    }
    if (!whiteHasMove) {
        return "black";
    }
    return "white";
}

module.exports.updateLeaderboard = function updateLeaderboard(game, oldLeaderboard) {
    const leaderboard = oldLeaderboard;
    const group = game["group"];
    const rows = game["size"]["rows"];
    const columns = game["size"]["columns"];
    const winner = game["gameState"]["winner"];
    let loser;
    for (let player in game["gameState"]["players"]) {
        if (player !== winner) {
            loser = player;
            break;
        }
    }

    let foundWinnerEntry = false;
    let foundLoserEntry = false;
    let foundTable = null;
    for (let table in leaderboard) {
        if (table["group"] === group && table["size"]["rows"] === rows && table["size"]["columns"] === columns) {
            foundTable = table;
            for (let player in table["ranking"]) {
                if (player["nick"] === winner) {
                    player["games"]++;
                    player["victories"]++;
                    foundWinnerEntry = true;
                } else if (player["nick"] === loser) {
                    player["games"]++;
                    foundLoserEntry = true;
                }
            }
            break;
        }
    }

    if (foundTable === null) {
        leaderboard.push({"group": group, "size": {"rows": rows, "columns": columns}, "ranking": []})
        foundTable = leaderboard[leaderboard.length-1];
    }
    if (!foundWinnerEntry) {
        foundTable["ranking"].push({"nick": winner, "games": 1, "victories": 1})
    }
    if (!foundLoserEntry) {
        foundTable["ranking"].push({"nick": loser, "games": 1, "victories": 0})
    }

    return leaderboard;
}
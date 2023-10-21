let username = "Player";
let game;
let leaderboard = [];

function startGame() {
    const rows = parseInt(getSelectedValue("board-size")[0]);
    const columns = parseInt(getSelectedValue("board-size")[2]);
    const curPlayer = getSelectedValue("start-color");
    const playerColor = getSelectedValue("pick-color");
    const opponent = getSelectedValue("play-against");
    game = new Game(rows, columns, curPlayer, playerColor, opponent);

    gameLoop();
}

function gameLoop() {
    if (!game.isPlayerTurn() && game.opponent === "computer") {
        makeAiMove();
    }

    if (!game.checkGameOver()) {
        setTimeout(gameLoop, 1000);
    } else {
        game.gameOver();
        updateLeaderboard();
    }
}

let isPieceClicked = false;
let pieceClickedRow;
let pieceClickedColumn;
function getPlayerMove(e) {
    if (game.isPlayerTurn()) {
        let row = parseInt(e.target.id[0]);
        let column = parseInt(e.target.id[2]);
        if (isNaN(row)) {
            row = parseInt(e.target.parentElement.id[0]);
            column = parseInt(e.target.parentElement.id[2]);
        }

        if (game.state === "placing") {
            game.placePiece(row, column);
        } else if (game.state === "moving") {
            if (isPieceClicked) {
                game.movePiece(pieceClickedRow, pieceClickedColumn, row, column)
                isPieceClicked = false;
            } else {
                isPieceClicked = true;
                pieceClickedRow = row;
                pieceClickedColumn = column;
            }
        } else {
            game.removePiece(row, column);
        }
    }
}

function makeAiMove() {
    const difficulty = getSelectedValue("difficulty-level");
    let i = getRandomInt(0, game.rows);
    let j = getRandomInt(0, game.columns)
    if (game.state === "placing") {
        while (!game.placePiece(i, j)) {
            i = getRandomInt(0, game.rows);
            j = getRandomInt(0, game.columns);
        }
    } else if (game.state === "moving") {
        if (difficulty === "easy") {
            computerEasyAi();
        } else if (difficulty === "medium") {
            computerMediumAi();
        } else {
            computerHardAi();
        }
        if (game.state === "removing") {
            while (!game.removePiece(i ,j)) {
                i = getRandomInt(0, game.rows);
                j = getRandomInt(0, game.columns);
            }
        }
    }
}

function computerEasyAi() {
    let move = [];
    let validMove = false;
    while (!validMove) {
        let i = getRandomInt(0, game.rows);
        let j = getRandomInt(0, game.columns);
        if (game.board[i][j] === game.curPlayer) {
            if (i + 1 < game.rows && game.movePiece(i, j, i + 1, j)) {
                move = [i, j, i + 1, j];
                validMove = true;
            } else if (i - 1 >= 0 && game.movePiece(i, j, i - 1, j)) {
                move = [i, j, i - 1, j];
                validMove = true;
            } else if (j + 1 < game.columns && game.movePiece(i, j, i, j + 1)) {
                move = [i, j, i, j + 1];
                validMove = true;
            } else if (j - 1 >= 0 && game.movePiece(i, j, i, j - 1)) {
                move = [i, j, i, j - 1];
                validMove = true;
            }
        }
    }

    return move;
}

function computerMediumAi() {
    const difficultyChoice = getRandomInt(0, 2);
    if (difficultyChoice === 0) {
        return computerEasyAi();
    }
    return computerHardAi();
}

function computerHardAi() {
    for (let i = 0; i < game.rows; i++) {
        for (let j = 0; j < game.columns; j++) {
            if (game.board[i][j] === game.curPlayer) {
                if (i + 1 < game.rows && game.findPieceInLine(i, j, i + 1, j) && game.movePiece(i, j, i + 1, j)) {
                    return [i, j, i + 1, j];
                } else if (i - 1 >= 0 && game.findPieceInLine(i, j, i - 1, j) && game.movePiece(i, j, i - 1, j)) {
                    return [i, j, i - 1, j];
                } else if (j + 1 < game.columns && game.findPieceInLine(i, j, i, j + 1) && game.movePiece(i, j, i, j + 1)) {
                    return [i, j, i, j + 1];
                } else if (j - 1 >= 0 && game.findPieceInLine(i, j, i, j - 1) && game.movePiece(i, j, i, j - 1)) {
                    return [i, j, i, j - 1];
                }
            }
        }
    }

    return computerEasyAi();
}


function updateLeaderboard() {
    let foundEntry = false;
    for (let i = 0; i < leaderboard.length; i++) {
        if (leaderboard[i].name === username && leaderboard[i].boardSize === game.rows.toString() + "x" + game.columns.toString()) {
            foundEntry = true;
            if (game.winner === game.playerColor) {
                leaderboard[i].wins++;
            } else {
                leaderboard[i].defeats++;
            }
        } 
    }

    if (!foundEntry) {
        if (game.winner === game.playerColor) {
            leaderboard.push({
                name: username,
                boardSize: game.rows.toString() + "x" + game.columns.toString(),
                wins: 1,
                defeats: 0
            });
        } else {
            leaderboard.push({
                name: username,
                boardSize: game.rows.toString() + "x" + game.columns.toString(),
                wins: 0,
                defeats: 1
            });
        }
    }

    const leaderboardHtml = document.getElementById("leaderboard");
    leaderboardHtml.innerHTML = "";

    let leaderboardHeader = document.createElement("tr");

    let leaderboardName = document.createElement("th");
    leaderboardName.textContent = "Name";
    leaderboardHeader.append(leaderboardName);

    let leaderboardBoardSize = document.createElement("th");
    leaderboardBoardSize.textContent = "Board Size"
    leaderboardHeader.append(leaderboardBoardSize);

    let leaderboardWins = document.createElement("th");
    leaderboardWins.textContent = "Wins";
    leaderboardHeader.append(leaderboardWins);

    let leaderboardDefeats = document.createElement("th");
    leaderboardDefeats.textContent = "Defeats";
    leaderboardHeader.append(leaderboardDefeats);

    leaderboardHtml.append(leaderboardHeader);

    leaderboard.sort(orderLeaderboard);
    for (let i = 0; i < leaderboard.length; i++) {
        let entry = document.createElement("tr");

        let entryName = document.createElement("td");
        entryName.textContent = leaderboard[i].name;
        entry.append(entryName);

        let entryBoardSize = document.createElement("td");
        entryBoardSize.textContent = leaderboard[i].boardSize;
        entry.append(entryBoardSize);

        let entryWins = document.createElement("td");
        entryWins.textContent = leaderboard[i].wins.toString();
        entry.append(entryWins);

        let entryDefeats = document.createElement("td");
        entryDefeats.textContent = leaderboard[i].defeats.toString();
        entry.append(entryDefeats);

        leaderboardHtml.append(entry);
    }
}

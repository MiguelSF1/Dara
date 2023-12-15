const url = "http://twserver.alunos.dcc.fc.up.pt:8008/";
//const url = "http://localhost:8008/"
let username;
let password;
let game = null;
let gameId;
gamePhaseText = document.getElementById("game-phase-text");
let leaderboard = [];
if (localStorage.getItem("leaderboard") !== null) {
    leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
    buildLeaderboard(leaderboard, "leaderboard-against-computer");
}
rankingGame();

function startGame() {
    const rows = parseInt(getSelectedValue("board-size")[0]);
    const columns = parseInt(getSelectedValue("board-size")[2]);
    const curPlayer = getSelectedValue("start-color");
    const playerColor = getSelectedValue("pick-color");
    const opponent = getSelectedValue("play-against");


   if (opponent === "computer") {
        game = new Game(rows, columns, curPlayer, playerColor, opponent);
        gameLoopAi();
    } else {
       joinGame(rows, columns);
    }
}

function gameLoopAi() {
    if (!game.isPlayerTurn() && game.opponent === "computer") {
        makeAiMove();
    }

    if (!game.checkGameOver()) {
        setTimeout(gameLoopAi, 1000);
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

    buildLeaderboard(leaderboard, "leaderboard-against-computer");
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function buildLeaderboard(leaderboard, htmlLeaderboard) {
    const leaderboardHtml = document.getElementById(htmlLeaderboard);
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

async function registerFetch(usernameValue, passwordValue) {
    const data = { nick: usernameValue, password: passwordValue };
    const response = await fetch(url + "register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (response.ok) {
        return response.json;
    } else {
        throw new Error("invalid status");
    }
}

function userRegisterOrLogin() {
    const usernameValue = document.getElementById("userId").value;
    const passwordValue = document.getElementById("password").value;
    const displayUsername = document.getElementById("logged-in-userId");
    registerFetch(usernameValue, passwordValue).then(() => {
        username = usernameValue;
        password = passwordValue;
        const loggedOut = document.querySelector('.logged-out');
        const loggedIn = document.querySelector('.logged-in');
        loggedOut.style.display = 'none';
        loggedIn.style.display = 'block';
        displayUsername.innerText = "Logged in as " + username;
    }).catch(reason => window.alert(reason));
}

function logout() {
    const loggedOut = document.querySelector('.logged-out');
    const loggedIn = document.querySelector('.logged-in');
    loggedOut.style.display = 'block';
    loggedIn.style.display = 'none';
    if (game !== null) {
        leaveGame();
    }
}

async function joinFetch(rows, columns) {
    const data = { group: 28, nick: username, password: password, size: { rows: rows, columns: columns } };
    const response = await fetch(url + "join", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (response.ok) {
        return response.json();
    } else {
        throw new Error("invalid status")
    }
}

function joinGame(rows, columns) {
    joinFetch(rows, columns).then(r => {
        gameId = r.game;
        document.getElementById("forfeit").style.display = "inline-block";
        document.getElementById("config").style.display = "none";
        gamePhaseText.textContent = "Awaiting for opponent";
        game = new Game(rows, columns, null, undefined, "player");
        updateGame();
    }).catch(reason => window.alert(reason));

}

async function leaveFetch() {
    const data = { group: 28, nick: username, password: password, game: gameId };
    const response = await fetch(url + "leave", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (response.ok) {
        return response.json();
    } else {
        throw new Error("invalid status");
    }
}


function leaveGame() {
    leaveFetch().then(() => {

    }).catch(reason => window.alert(reason));
}

async function notifyFetch(row, column) {
    const data = { group: 28, nick: username, password: password, game: gameId, move: { row: row, column: column } };
    const response = await fetch(url + "notify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (response.ok) {
        return response.json();
    } else {
        throw new Error(response.statusText);
    }
}

function notifyGame(row, column) {
    notifyFetch(row, column).then(() => {

    }).catch(reason => window.alert(reason));
}

async function rankingFetch(rows, columns) {
    const data = { group: 28, size: { rows: rows, columns: columns } };
    const response = await fetch(url + "ranking", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (response.ok) {
        return response.json();
    } else {
        throw new Error("invalid status");
    }
}

function rankingGame() {
    rankingFetch(6, 6).then(r => {
        const leaderboardPlayer = [];
        for (let i in r["ranking"]) {
            leaderboardPlayer.push({
                name: r["ranking"][i]["nick"],
                boardSize: 6 + "x" + 6,
                wins: r["ranking"][i]["victories"],
                defeats: r["ranking"][i]["games"] - r["ranking"][i]["victories"]
            });
        }

        rankingFetch(6, 5).then(r => {
            for (let i in r["ranking"]) {
                leaderboardPlayer.push({
                    name: r["ranking"][i]["nick"],
                    boardSize: 6 + "x" + 5,
                    wins: r["ranking"][i]["victories"],
                    defeats: r["ranking"][i]["games"] - r["ranking"][i]["victories"]
                });
            }

            rankingFetch(7, 7).then(r => {
                for (let i in r["ranking"]) {
                    leaderboardPlayer.push({
                        name: r["ranking"][i]["nick"],
                        boardSize: 7 + "x" + 7,
                        wins: r["ranking"][i]["victories"],
                        defeats: r["ranking"][i]["games"] - r["ranking"][i]["victories"]
                    });
                }

                rankingFetch(7, 6).then(r => {
                    for (let i in r["ranking"]) {
                        leaderboardPlayer.push({
                            name: r["ranking"][i]["nick"],
                            boardSize: 7 + "x" + 6,
                            wins: r["ranking"][i]["victories"],
                            defeats: r["ranking"][i]["games"] - r["ranking"][i]["victories"]
                        });
                    }

                    buildLeaderboard(leaderboardPlayer, "leaderboard-against-player");

                }).catch(reason => window.alert(reason));

            }).catch(reason => window.alert(reason));

        }).catch(reason => window.alert(reason));

    }).catch(reason => window.alert(reason));
}


function updateGame() {
    const eventSource = new EventSource(url + "update?nick=" + username + "&game=" + gameId);
    let opponentClickedRow;
    let opponentClickedColumn;
    let step, state;
    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);

        // end game
        if (data.hasOwnProperty("winner")) {
            eventSource.close();
            game.winner = data["winner"];
            game.curPlayer = "gameOver";
            game.gameOver();
            rankingGame();
            return;
        }

        // start game
        if (game.curPlayer === null) {
            game.playerColor = data["players"][username];
            if (data["turn"] === username) {
                game.curPlayer = game.playerColor;
            } else {
                if (game.playerColor === "white") {
                    game.curPlayer = "black";
                } else {
                    game.curPlayer = "white";
                }
            }
            for (let nick in data["players"]) {
                game.sendGameMessage(nick + " is " + data["players"][nick]);
            }
            gamePhaseText.textContent = game.state + " pieces | " + game.curPlayer + " turn";
        }


        // make opponent move
        if (data.hasOwnProperty("move") && !game.isPlayerTurn()) {
            if (state === "drop") {
                game.placePiece(data["move"]["row"], data["move"]["column"]);
            } else {
                if (step === "from") {
                    opponentClickedRow = data["move"]["row"];
                    opponentClickedColumn = data["move"]["column"];
                } else if (step === "to") {
                    game.movePiece(opponentClickedRow, opponentClickedColumn, data["move"]["row"], data["move"]["column"]);
                } else {
                    game.removePiece(data["move"]["row"], data["move"]["column"]);
                }
            }
        }

        state = data["phase"];
        step = data["step"];
    }
}

function forfeit() {
    if (game.opponent === "computer") {
        game.forfeitGame();
    } else {
        leaveGame()
    }
}





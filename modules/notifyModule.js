const fsp = require('fs').promises;
const serverConfig = require("./configModule");
const gameLogic = require("./gameModule")

module.exports = async function (request, response) {
    let answer = {};
    let status;

    try {
        const data = await serverConfig.readRequestBody(request);
        const userInput = JSON.parse(data);

        if (typeof userInput["move"] !== "object" || !Number.isInteger(userInput["move"]["row"]) || !Number.isInteger(userInput["move"]["column"]) || userInput["move"]["row"] < 0
            || userInput["move"]["column"] < 0) {
            answer.error = "invalid move value";
            response.writeHead(400, serverConfig.headers.plain);
            response.end(JSON.stringify(answer));
            return;
        }

        const fileData = await fsp.readFile('./data/gameData.json', 'utf8');
        const game = JSON.parse(fileData);
        const gameIdx = findGame(game, userInput);

        if (userInput["nick"] !== game[gameIdx]["gameState"]["turn"]) {
            answer.error = "Not your turn to play";
            response.writeHead(400, serverConfig.headers.plain);
            response.end(JSON.stringify(answer));
            return;
        }

        const row = userInput["move"]["row"];
        const column = userInput["move"]["column"];
        const board = game[gameIdx]["gameState"]["board"];
        const curPlayer = game[gameIdx]["gameState"]["players"][userInput["nick"]];
        const opponent = getOpponent(game[gameIdx]["gameState"], userInput["nick"]);

        if (game[gameIdx]["gameState"]["phase"] === "drop") {
            if (gameLogic.placePiece(row, column, board, curPlayer)) {
                game[gameIdx]["gameState"]["board"][row][column] = curPlayer;

                game[gameIdx]["gameState"]["move"] = {
                    "row": row,
                    "column": column
                }

                game[gameIdx]["gameState"]["turn"] = opponent;

                let pieceInsideCount = 0;
                for (let i = 0; i < board.length; i++) {
                    for (let j = 0; j < board[0].length; j++) {
                        if (board[i][j] !== "empty") {
                            pieceInsideCount++;
                        }
                    }
                }

                if (pieceInsideCount === 24) {
                    game[gameIdx]["gameState"]["phase"] = "move";
                }

                await fsp.writeFile('./data/gameData.json', JSON.stringify(game));
            } else {
                answer.error = "invalid move";
                response.writeHead(400, serverConfig.headers.plain);
                response.end(JSON.stringify(answer));
                return;
            }
        } else {
            if (game[gameIdx]["gameState"]["step"] === "from") {
                if (board[row][column] === curPlayer) {
                    game[gameIdx]["gameState"]["move"] = {
                        "row": row,
                        "column": column
                    }

                    game[gameIdx]["gameState"]["step"] = "to";

                    await fsp.writeFile('./data/gameData.json', JSON.stringify(game));
                } else {
                    answer.error = "invalid move";
                    response.writeHead(400, serverConfig.headers.plain);
                    response.end(JSON.stringify(answer));
                    return;
                }
            } else if (game[gameIdx]["gameState"]["step"] === "to") {
                const startingRow = game[gameIdx]["gameState"]["move"]["row"];
                const startingColumn = game[gameIdx]["gameState"]["move"]["column"];
                let prevWhiteMove = game[gameIdx]["gameState"]["prevWhiteMove"];
                let prevBlackMove = game[gameIdx]["gameState"]["prevBlackMove"];

                if (gameLogic.movePiece(startingRow, startingColumn, row, column, curPlayer, board, prevWhiteMove, prevBlackMove)) {
                    if (curPlayer === "white") {
                        prevWhiteMove = [row, column, startingRow, startingColumn];
                        game[gameIdx]["gameState"]["prevWhiteMove"] = prevWhiteMove;
                    } else {
                        prevBlackMove = [row, column, startingRow, startingColumn];
                        game[gameIdx]["gameState"]["prevBlackMove"] = prevBlackMove;
                    }

                    game[gameIdx]["gameState"]["board"][startingRow][startingColumn] = "empty";
                    game[gameIdx]["gameState"]["board"][row][column] = curPlayer;

                    game[gameIdx]["gameState"]["move"] = {
                        "row": row,
                        "column": column
                    }

                    if (gameLogic.checkInLinePiece(row, column, curPlayer, board)) {
                        game[gameIdx]["gameState"]["step"] = "take";
                    } else {
                        game[gameIdx]["gameState"]["turn"] = opponent;
                        game[gameIdx]["gameState"]["step"] = "from";
                    }

                    await fsp.writeFile('./data/gameData.json', JSON.stringify(game));
                } else {
                    answer.error = "invalid move";
                    response.writeHead(400, serverConfig.headers.plain);
                    response.end(JSON.stringify(answer));
                    return;
                }
            } else {
                if (gameLogic.removePiece(row, column, curPlayer, board)) {
                    game[gameIdx]["gameState"]["board"][row][column] = "empty";

                    game[gameIdx]["gameState"]["move"] = {
                        "row": row,
                        "column": column
                    }
                    game[gameIdx]["gameState"]["turn"] = opponent;
                    game[gameIdx]["gameState"]["step"] = "from";

                    await fsp.writeFile('./data/gameData.json', JSON.stringify(game));
                } else {
                    answer.error = "invalid move";
                    response.writeHead(400, serverConfig.headers.plain);
                    response.end(JSON.stringify(answer));
                    return;
                }
            }

            const colorWinner = gameLogic.gameOver(board, game[gameIdx]["gameState"]["prevWhiteMove"], game[gameIdx]["gameState"]["prevBlackMove"], curPlayer);
            if (colorWinner !== null) {
                let winner;
                for (let player in game[gameIdx]["gameState"]["players"]) {
                    if (game[gameIdx]["gameState"]["players"][player] === colorWinner) {
                        winner = player;
                    }
                }

                game[gameIdx]["gameState"]["winner"] = winner;

                await fsp.writeFile('./data/gameData.json', JSON.stringify(game));

                const leaderboardData = await fsp.readFile('./data/leaderboardData.json', 'utf8');
                const leaderboard = JSON.parse(leaderboardData);
                const updatedLeaderboard = gameLogic.updateLeaderboard(game[gameIdx], leaderboard);
                await fsp.writeFile('./data/leaderboardData.json', JSON.stringify(updatedLeaderboard));
            }
        }

        status = 200;
        response.writeHead(status, serverConfig.headers.plain);
        response.end(JSON.stringify(answer));
    } catch (error) {
        console.error('Error processing :', error);
        response.writeHead(500, serverConfig.headers.plain);
        response.end();
    }
}


function findGame(game, userInput) {
    for (let i = 0; i < game.length; i++) {
        if (game[i]["game"] === userInput["game"]) {
            return i;
        }
    }
    return -1;
}

function getOpponent(game, nick) {
    for (let player in game["players"]) {
        if (player !== nick) {
            return player;
        }
    }
}

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
            return value;
        }
    }

    return null;
}


function startGame() {
    // game configuration values
    const boardSize = getSelectedValue("board-size");
    const opponent = getSelectedValue("play-against");
    const playerColor = getSelectedValue("pick-color");
    const curPlayer = getSelectedValue("start-color");
    const difficulty = getSelectedValue("difficulty-level");

    const game = new Game(6, 6, curPlayer);

    // run game
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

function forfeitGame() {
    
}


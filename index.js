function openContent(id) {
    let content = document.getElementById(id);
    content.style.display = "block";
}

function closeContent(id) {
    let content = document.getElementById(id);
    content.style.display = "none";
}

function changeInstructionsPage() {
    let gameRules = document.getElementById("game-rules");
    let howToPlay = document.getElementById("how-to-play");

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

function orderLeaderboard(a, b) {
    if (a.wins > b.wins) {
      return -1;
    }

    if (a.wins < b.wins) {
      return 1;
    }

    if (a.defeats > b.defeats) {
        return 1;
    }

    if (a.defeats < b.defeats) {
        return -1;
    }

    return 0;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

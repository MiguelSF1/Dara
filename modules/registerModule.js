const fsp = require('fs').promises;
const serverConfig = require("./configModule");

module.exports = async function (request, response) {
    let answer = {};
    let status;

    try {
        const data = await serverConfig.readRequestBody(request);
        const userInput = JSON.parse(data);

        if (!userInput.hasOwnProperty("nick") || !userInput.hasOwnProperty("password")) {
            answer.error = "undefined nick or password";
            response.writeHead(400, serverConfig.headers.plain);
            response.end(JSON.stringify(answer));
            return;
        }

        const fileData = await fsp.readFile('./data/userData.json', 'utf8');
        const userData = JSON.parse(fileData);

        const login = tryLogin(userData, userInput);
        if (login === 2) {
            userData.push(userInput);
            await registerUser(userData);
            status = 200;
        } else if (login === 1) {
            status = 200;
        } else {
            status = 401;
            answer.error = "wrong password for nick";
        }

        response.writeHead(status, serverConfig.headers.plain);
        response.end(JSON.stringify(answer));
    } catch (error) {
        console.error('Error processing registration:', error);
        response.writeHead(500, serverConfig.headers.plain);
        response.end();
    }
}

async function registerUser(query) {
    await fsp.writeFile('./data/userData.json', JSON.stringify(query));
}

function tryLogin(data, query) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].nick === query.nick) {
            if (data[i].password === query.password) {
                return 1;
            }
            return 0;
        }
    }
    return 2;
}


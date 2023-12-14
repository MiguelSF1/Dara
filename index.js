const http = require('http');
const url  = require('url');
const serverRegister = require('./modules/registerModule');
const serverRanking = require('./modules/rankingModule');
const serverJoin = require("./modules/joinModule");
const serverLeave = require("./modules/leaveModule");
const serverNotify = require("./modules/notifyModule");
const serverUpdate = require("./modules/updateModule");
const serverConfig = require("./modules/configModule");


const server = http.createServer(function (request, response) {
    const parsedUrl = url.parse(request.url,true);
    const pathname = parsedUrl.pathname;

    switch (request.method) {
        case 'GET':
            let nickParam = null;
            let gameParam = null;
            if (parsedUrl.search !== null) {
                const idxGameParam = parsedUrl.search.indexOf("&");
                nickParam = parsedUrl.search.substring(6, idxGameParam);
                gameParam = parsedUrl.search.substring(idxGameParam + 6);
            }
            doGet(pathname, request, response, nickParam, gameParam);
            break;
        case 'POST':
            doPost(pathname, request, response);
            break;
        default:
            response.writeHead(501, serverConfig.headers.plain);
            response.end();
            break;
    }

});

server.listen(8008);


function doGet(pathname, request, response, nickParam, gameParam) {
    switch (pathname) {
        case '/update':
            serverUpdate(request, response, nickParam, gameParam).then(() => {});
            break;
        default:
            response.writeHead(404, serverConfig.headers.plain);
            response.end();
            break;
    }
}

function doPost(pathname, request, response) {
    switch (pathname) {
        case '/register':
            serverRegister(request, response).then(() => {});
            break;
        case '/join':
            serverJoin(request, response).then(() => {})
            break;
        case '/leave':
            serverLeave(request, response).then(() => {})
            break;
        case '/notify':
            serverNotify(request, response).then(() => {})
            break;
        case '/ranking':
            serverRanking(request, response).then(() => {});
            break;
        default:
            response.writeHead(404, serverConfig.headers.plain);
            response.end();
            break;
    }
}


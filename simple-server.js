
const http = require('http');
const fs = require('fs');
const url = require('url');

let fileToContentType = new Map();
fileToContentType.set('js', 'text/javascript');
fileToContentType.set('css', 'text/css');
fileToContentType.set('html', 'text/html');
fileToContentType.set('json', 'application/json');

function handleFile(data, extention, res) {
    res.writeHead(200, {'Content-Type': fileToContentType.get(extention)});
    res.write(data);
    res.end();
}

console.log(__filename, module, global)

http.createServer(function (req, res) {
    const q = url.parse(req.url);
    let extention = q.pathname.split('.')[1];    
    fs.readFile('public' + q.pathname, function(err, data) {
        if(data) {
            handleFile(data, extention, res);
        }
        else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not found');
        }
    })
}).listen(8080, function () {
    console.log('Client is available at http://localhost:8080');
});
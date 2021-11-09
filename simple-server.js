
const http = require('http');
const fs = require('fs');
const url = require('url');

let fileToContentType = new Map();
fileToContentType.set('js', 'text/javascript');
fileToContentType.set('css', 'text/css');
fileToContentType.set('html', 'text/html');
fileToContentType.set('json', 'application/json');

function handleFile(data, ending, res) {
    res.writeHead(200, {'Content-Type': fileToContentType.get(ending)});
    res.write(data);
    res.end();
}

console.log(__filename, module, global)

http.createServer(function (req, res) {
    const q = url.parse(req.url);
    //let ending = req.url.split('.').pop();
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
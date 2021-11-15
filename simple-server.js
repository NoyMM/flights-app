const http = require('http');
const fs = require('fs');
const url = require('url');

const fileExtentionToContentType = {'js': 'text/javascript', 
                                    'css': 'text/css', 
                                    'html': 'text/html',
                                    'json': 'application/json'}

const filters = ['from', 'by'];
let filterToValueMap;


function filterJsonFile(data, filterKey, filterValue) {
    return JSON.stringify(JSON.parse(data).filter(function(entry) {
        return entry[filterKey].toLowerCase() === filterValue.toLowerCase();
    }));
}


function updateFiltersValue(query) {
    let splitedQuery = query.split('&');
    splitedQuery.forEach(function(q) {
        let KeyAndValue = q.split('=');
        filterToValueMap.set(KeyAndValue[0], KeyAndValue[1].replace('_', ' '));
    } );
}


function getFilteredDataFromJson(query, dataToWrite){
    updateFiltersValue(query);
    filterToValueMap.forEach(function(value, key) {
        if(value !== '') {
            dataToWrite = filterJsonFile(dataToWrite, key, value);
        }
    });
    return dataToWrite;
}


function sendFileContentToClient(response, data, query, fileExtention) {
    let dataToWrite = data;
    if(fileExtention === 'json' && query) {
        dataToWrite = getFilteredDataFromJson(query, dataToWrite);
    }
    response.writeHead(200, {'Content-Type': fileExtentionToContentType[fileExtention]});
    response.write(dataToWrite);
    response.end();
}


function handleFileNotFound(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end('Not found');
}


function handleFile(response, pathname, query, fileExtention) {
    fs.readFile('public' + pathname, function(err, data) {
        if(data) {
            sendFileContentToClient(response, data, query, fileExtention);
        }
        else {
            handleFileNotFound(response);
        }
    })
}


http.createServer(function(request, response) {
    filterToValueMap = new Map();
    filters.forEach(filter => filterToValueMap.set(filter, ''));

    const parsedUrl = url.parse(request.url);
    const fileExtention = parsedUrl.pathname.split('.')[1]; 
    
    handleFile(response, parsedUrl.pathname, parsedUrl.query, fileExtention);

}).listen(8080, function() {
    console.log('Client is available at http://localhost:8080');
});

const FISRT_QUERY = 0;
const SECOND_QUERY = 1;

const http = require('http');
const fs = require('fs');
const url = require('url');

const fileToContentType = new Map();
fileToContentType.set('js', 'text/javascript');
fileToContentType.set('css', 'text/css');
fileToContentType.set('html', 'text/html');
fileToContentType.set('json', 'application/json');


// TODO: For improvment: Use directly filterKey 
function filterJsonFile(data, filterKey, filterValue) {
    if(filterKey === "by") {
        return JSON.parse(data).filter(function(entry) {
            return entry.by.toLowerCase() === filterValue.toLowerCase();
        });
    }
    else if(filterKey === "from") {
        return JSON.parse(data).filter(function(entry) {
            return entry.from.toLowerCase() === filterValue.toLowerCase();
        });
    }
}


function updateFiltersKeyAndValue(query, filtersKey, filtersValue, queryIndex) {
    let KeyAndValue = query.split('=');
    filtersKey[queryIndex] = KeyAndValue[0];
    filtersValue[queryIndex] = KeyAndValue[1].replace('_',' ');
}


function parseQueriesAndUpdateFilters(query, filtersKey, filtersValue) {
    let splitedQueries = query.split('&');
    if(splitedQueries[FISRT_QUERY]) {
        updateFiltersKeyAndValue(splitedQueries[FISRT_QUERY], filtersKey, filtersValue, FISRT_QUERY);
        if(splitedQueries[SECOND_QUERY]) {
            updateFiltersKeyAndValue(splitedQueries[SECOND_QUERY], filtersKey, filtersValue, SECOND_QUERY);
        } 
    }
}


function getDataFromJsonFile(query, dataToWrite){
    if(query) {
        let filtersKey = ['', ''];
        let filtersValue = ['', ''];
        parseQueriesAndUpdateFilters(query, filtersKey, filtersValue);
        if(filtersKey[FISRT_QUERY] !== '') {
            dataToWrite = JSON.stringify(filterJsonFile(dataToWrite, filtersKey[FISRT_QUERY], filtersValue[FISRT_QUERY]));
            if(filtersKey[SECOND_QUERY] !== '') {
                dataToWrite = JSON.stringify(filterJsonFile(dataToWrite, filtersKey[SECOND_QUERY], filtersValue[SECOND_QUERY]));
            }
        }
    }
    return dataToWrite;
}


function handleFile(res, data, query, extention) {
    let dataToWrite = data;
    if(extention === 'json') {
        dataToWrite = getDataFromJsonFile(query, dataToWrite);
    }
    res.writeHead(200, {'Content-Type': fileToContentType.get(extention)});
    res.write(dataToWrite);
    res.end();
}


console.log(__filename, module, global);


http.createServer(function (req, res) {
    const parsedUrl = url.parse(req.url);
    const extention = parsedUrl.pathname.split('.')[1]; 
    const query = parsedUrl.query;   
    
    fs.readFile('public' + parsedUrl.pathname, function(err, data) {
        if(data) {
            handleFile(res, data, query, extention);
        }
        else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not found');
        }
    })
}).listen(8080, function() {
    console.log('Client is available at http://localhost:8080');
});
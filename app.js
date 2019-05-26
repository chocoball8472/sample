const http = require('http');
const server = http.createServer();
const fs = require('fs');
const path = require('path');
const mine = {
  ".html": "text/html",
  ".css": "text/css",
  ".png": "image/png",
  ".gif": "image/gif",
  ".jpg": "image/jpg",
  ".js": "text/javascript"
};

server.on('request', doRequest);
server.listen(process.env.PORT || 3000);

function doRequest(req, res) {
  let fullpath;
  if(req.url == '/') {
    fullpath = __dirname + '/public/html/index.html';
  }else {
    fullpath = __dirname + '/public' + req.url;
  }
  console.log(req.url);
  console.log(__dirname);
  res.writeHead(200, {'Content-Type': mine[path.extname(fullpath)] || "text/plain"});
  fs.readFile(fullpath, (err, data) => {
    res.end(data, 'utf-8');
  });
}

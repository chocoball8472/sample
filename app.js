const http = require('http');
const server = http.createServer();
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const mine = {
  ".html": "text/html",
  ".css": "text/css",
  ".png": "image/png",
  ".gif": "image/gif",
  ".jpg": "image/jpg",
  ".js": "text/javascript",
  ".ejs": "text/html"
};

const index = fs.readFileSync('./public/views/index.ejs', 'utf-8');

server.on('request', doRequest);
server.listen(process.env.PORT || 3000);

function doRequest(req, res) {
  let fullpath;
  if(req.url == '/') {
    fullpath = __dirname + '/public/views/home.ejs';
  }else {
    fullpath = __dirname + '/public' + req.url;
  }
  console.log(req.url);
  console.log(__dirname);
  res.writeHead(200, {'Content-Type': mine[path.extname(fullpath)] || "text/plain"});
  if(path.extname(fullpath) == ".ejs") {
    const cont = fs.readFileSync(fullpath, 'utf-8');
    let page = ejs.render(index, {
      content: ejs.render(cont)
    });
    res.end(page, 'utf-8');
  }else {
    fs.readFile(fullpath, function(err, data) {
      res.end(data, 'utf-8');
    });
  }
}

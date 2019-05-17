const http = require('http');
const server = http.createServer();

server.on('request', doRequest);
server.listen(process.env.PORT || 3000);

function doRequest(req, res) {
  res.writeHead(200,{'content-type': 'text/plain'});
  res.write("Hello World");
  res.end();
}

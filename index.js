const express = require('express')
const path = require("path");
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('port', (process.env.PORT || 8000));
app.use(express.static(__dirname + '/public'));

app.get('/', function (request, response) {
  response.sendFile(path.join(__dirname + '/public/index.html'));
})

var server = app.listen(app.get('port'), function () {
  console.log("Node app is running at http://localhost:" + app.get('port'));
})

var io = require('socket.io').listen(server);

app.get('/video_names', function (req, res) {
  let names = [];
  fs.readdirSync('./assets').forEach((video_name) => {
    names.push(video_name.split('.')[0]);
  })
  res.send({ success: true, names: names })
});


app.get('/video', function (req, res) {
  const path = 'assets/sample.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1
    const chunksize = (end - start) + 1
    const file = fs.createReadStream(path, { start, end })
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
});


io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
  socket.on('chat message', function (msg) {
    console.log('message: ' + msg);
  });
  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
  });
});
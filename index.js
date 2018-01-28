const express = require('express')
const path = require("path");
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const User = require('./models/users.js');
const app = express();
const config = require('./config/database');
const mongoose = require('mongoose');


// Connect To Database
mongoose.Promise = global.Promise;
mongoose.connect(config.database);


// On Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to database '+config.database);
});

// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error: '+err);
});


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

// login
app.post('/login', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  User.getUserByUsername(username, (err, user) => {
    if(err) throw err;
    if(!user){
      return res.json({success: false, msg: 'User not found'});
    }
    console.log(user)
    User.comparePassword(password, user.password, (err, isMatch) => {
      if(err) throw err;
      if(isMatch){
        const token = jwt.sign(user.toObject(), config.secret, {
          expiresIn: 604800 // 1 week
        });

        res.json({
          success: true,
          token: 'JWT '+token,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        });
      } else {
        return res.json({success: false, msg: 'Wrong password'});
      }
    });
  });
});


// Register
app.post('/register', (req, res, next) => {
  console.log(req.body);
  let newUser = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });
  console.log(newUser);
  console.log("hello world");
  User.addUser(newUser, (err, user) => {
    console.log('no error 73')
    if(err){
      console.log('failed')
      res.json({success: false, msg:'Failed to register user'});
    } else {
      console.log('success')
      res.json({success: true, msg:'User registered'});
    }
  });
});

// Profile
app.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  res.json({user: req.user});
});

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
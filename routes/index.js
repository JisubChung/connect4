var express = require('express');
var router = express.Router();

var path = require('path');


router.get('/', function(req, res) {
  res.render('index.jade', { title: '484 project'});
});

// router.get('/landingPage', function(req, res) {
//   res.render('landing.jade');
// });

//
// router.use(express.static(path.resolve() + '/views/index.html' ));
//
// router.get('/', function(req, res) {
//   res.sendFile(path.resolve() + '/views/index.html');
// });

//This route is simply run only on first launch just to generate some chat history
router.post('/setup', function(req, res) {
  //Array of chat data. Each object properties must match the schema object properties
  var chatData = [{
    created: new Date(),
    content: 'Hi',
    username: 'Chris',
    room: 'php'
  }, {
    created: new Date(),
    content: 'Hello',
    username: 'Obinna',
    room: 'laravel'
  }, {
    created: new Date(),
    content: 'Ait',
    username: 'Bill',
    room: 'angular'
  }, {
    created: new Date(),
    content: 'Amazing room',
    username: 'Patience',
    room: 'socet.io'
  }];
  
  //Loop through each of the chat data and insert into the database
  for (var c = 0; c < chatData.length; c++) {
    //Create an instance of the chat model
    var newChat = new Chat(chatData[c]);
    //Call save to insert the chat
    newChat.save(function(err, savedChat) {
      console.log(savedChat);
    });
  }
  //Send a resoponse so the serve would not get stuck
  res.send('created');
});

//This route produces a list of chat as filterd by 'room' query
router.get('/msg', function(req, res) {
  //Find
  Chat.find({
    'room': req.query.room.toLowerCase()
  }).exec(function(err, msgs) {
    //Send
    res.json(msgs);
  });
});

module.exports = router;

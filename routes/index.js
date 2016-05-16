var express = require('express');
var router = express.Router();

var path = require('path');

router.get('/', function (req, res) {
    var share = generateRoom(6);
    res.render('index.jade', {shareURL: req.protocol + '://' + req.get('host') + req.path + share, share: share});
});

router.get('/:room([A-Za-z0-9]{6})', function (req, res) {
    var share = req.params.room;
    res.render('index.jade', {shareURL: req.protocol + '://' + req.get('host') + '/' + share, share: share});
});

router.get('/landingPage', function(req, res) {
  res.render('landing.jade');
});

//
// router.use(express.static(path.resolve() + '/views/index.html' ));
//
// router.get('/', function(req, res) {
//   res.sendFile(path.resolve() + '/views/index.html');
// });

function generateRoom(length) {
    var haystack = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var room = '';

    for (var i = 0; i < length; i++) {
        room += haystack.charAt(Math.floor(Math.random() * 62));
    }

    return room;
}

module.exports = router;

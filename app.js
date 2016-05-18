module.exports = app;
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('async');

// Database
// var mongo = require('mongodb');
// var monk = require('monk');
// var db = monk('localhost:27017/connect4');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

app.set('port', (process.env.PORT || 3001));

var usernames = [];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var games = {};

/**
 * This is the socket server
 * 'connection' is basically a listener (which listens to http server) for
 * incoming socket events
 */
io.on('connection', function (socket) {

    // when the server hears a 'join' request (data = {room: room})
    socket.on('join', function(data) {

        // if there is someone waiting for a game
        if(data.room in games) {
            games[data.room].player1.emit('notify', {connected: 1, turn: true});
            socket.emit('notify', {connected: 1, turn: false});
            if(typeof games[data.room].player2 != "undefined") {
                socket.emit('leave');
                return;
            }
            socket.color = '#fdbf56';
            socket.join(data.room);
            socket.room = data.room;
            socket.pid = -1;
            games[data.room].player2 = socket;
            // Set opponents
            socket.opponent = games[data.room].player1;
            games[data.room].player1.opponent = games[data.room].player2;

            // Set turn
            socket.turn = false;
            socket.opponent.turn = true;

            socket.emit('assign', {pid: 2});
        }

        // else we create a new room
        else {
            socket.color = '#5b4c93';
            socket.join(data.room);
            socket.room = data.room;
            socket.pid = 1;
            socket.turn = false;
            games[data.room] = {
                player1: socket,
                board: [[0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0]]
            };

            socket.emit('assign', {pid: 1});
        }
    });

    socket.on('click', function(data) {
        var results = [socket.turn, socket.opponent, socket.room, socket.pid ];
        results[1].emit('changeTurn');
        //room is undefined
        if(results[0]) {
            socket.turn = false;
            results[1].turn = true;

            var i = 5;
            while(i >= 0) {
                if(games[results[2]].board[i][data.col] == 0) {
                    break;
                }
                i--;
            }
            if(i >= 0 && data.col >= 0) {
                games[results[2]].board[i][data.col] = results[3]
                socket.emit('drop', {row: i, col: data.col, color: socket.color});
                results[1].emit('drop', {row: i, col: data.col, color: socket.color}); //TODO: replace this with opponent color

                var win = false;
                check.forEach(function(method) {
                    method(results[2], i, data.col, function(player, pairs) {
                        win = true;
                        if(player == 1) {
                            games[results[2]].player1.emit('reset', {text: 'You Won!', 'inc': [1,0], highlight: pairs });
                            games[results[2]].player2.emit('reset', {text: 'You Lost!', 'inc': [1,0], highlight: pairs });
                        }
                        else {
                            games[results[2]].player1.emit('reset', {text: 'You Lost!', 'inc': [0,1], highlight: pairs });
                            games[results[2]].player2.emit('reset', {text: 'You Won!', 'inc': [0,1], highlight: pairs });
                        }
                        games[results[2]].board = [[0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0]];
                    });
                });
                if(win) {
                    return;
                }
                check_draw(results[2], function() {
                    games[results[2]].board = [[0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0]];
                    io.sockets.in(results[2]).emit('reset', {'text': 'Game Drawn', 'inc': [0,0]});
                });
            }
        }
        else {
            console.log('Opponent\'s turn');
        }
    });

    socket.on('continue', function() {
        socket.turn = function(err, turn) {
            socket.emit('notify', {connected: 1, turn: turn});
        };
    });

    socket.on('disconnect', function() {
        socket.room = function(err, room) {
            io.sockets.in(room).emit('leave');
            if(room in games) {
                delete games.room;
                console.log(games);
            }
        };
    });
});

function getFour(row, col, direction) {
    var dir = [], i;
    for (i = 0; i < 4; i++) {
        dir.push([row, col]);
        row+=direction[0];
        col+=direction[1];
    }
    return dir;
}

//these are going to check the win conditions
var check = [];

check.push(function check_horizontal(room, row, startColumn, callback) {
    for(var i = 1; i < 5; i++) {
        var count = 0;
        var column = startColumn + 1 - i;
        var columnEnd = startColumn + 4 - i;
        //edge condition
        if(columnEnd > 6 || column < 0) {
            continue;
        }
        var pairs = getFour(row, column, [0,1]);
        for(var j = column; j < columnEnd + 1; j++) {
            count += games[room]['board'][row][j];
        }
        // you win
        if(count == 4) {
            callback(1, pairs);
        }
        // you lose
        else if(count == -4) {
            callback(2, pairs);
        }
    }
});

check.push(function check_vertical(room, startRow, column, callback) {
    for(var i = 1; i < 5; i++) {
        var count = 0;
        var row = startRow + 1 - i;
        var rowEnd = startRow + 4 - i;
        if(rowEnd > 5 || row < 0) {
            continue;
        }
        var pairs = getFour(row, column, [1,0]);
        for(var j = row; j < rowEnd + 1; j++) {
            count += games[room]['board'][j][column];
        }
        if(count == 4)
            callback(1, pairs);
        else if(count == -4)
            callback(2, pairs);
    }
});

check.push(function check_leftDiagonal(room, startRow, startColumn, callback) {
    for(var i = 1; i < 5; i++) {
        var count = 0;
        var row = startRow + 1 - i;
        var rowEnd = startRow + 4 - i;
        var column = startColumn + 1 - i;
        var columnEnd = startColumn + 4 - i;
        if(column < 0 || columnEnd > 6 || rowEnd > 5 || row < 0) {
            continue;
        }
        var pairs = getFour(row, column, [1,1]);
        for(var j = 0; j < pairs.length; j++) {
            count += games[room]['board'][pairs[j][0]][pairs[j][1]];
        }
        if(count == 4)
            callback(1, pairs);
        else if(count == -4)
            callback(2, pairs);
    }
});

check.push(function check_rightDiagonal(room, startRow, startColumn, callback) {
    for(var i = 1; i < 5; i++) {
        var count = 0;
        var row = startRow + 1 - i;
        var rowEnd = startRow + 4 - i;
        var column = startColumn -1 + i;
        var columnEnd = startColumn - 4 + i;
        if(column < 0 || columnEnd > 6 || rowEnd > 5 || row < 0) {
            continue;
        }
        var pairs = getFour(row, column, [1,-1]);
        for(var j = 0; j < pairs.length; j++) {
            count += games[room]['board'][pairs[j][0]][pairs[j][1]];
        }
        if(count == 4)
            callback(1, pairs);
        else if(count == -4)
            callback(2, pairs);
    }
});

function check_draw(room, callback) {
    for(var val in games[room]['board'][0]) {
        if(val == 0)
            return;
    }
    callback();
}

// Set server port and run it
server.listen(app.get('port'), function () {
    console.log('server is running on http://localhost:' + app.get('port'));
});

module.exports = app;

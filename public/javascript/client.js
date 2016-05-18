// frontend js
var table = $('<table></table>').addClass('board');
var socket = io();


var beforeColor = '#a9aba9';
var myColor = 'green';

function Player(room, pid) {
    this.room = room;
    this.pid = pid;
}

var room;// = $('input').attr('data-room');
var player;// = new Player(room, '', '');

// when we connect, join room
socket.on('connect', function() {
    console.log(window.location.host);
    room = $('input').attr('data-room');
    player = new Player(room, '', '');
    socket.emit('join', {room: room});
});

socket.on('notify', function(data) {
    if(data.connected === 1) {
        if(data.turn) {
            $('.turn-indicator').text('it\'s your turn').css('color', 'green');
        } else {
            $('.turn-indicator').text('it\'s NOT your turn').css('color', 'red');
        }
    }
    var url = window.location.host;
    $('.row3 .form-group').replaceWith('<span>Click here to start new game</span>').click(function() {
        $(this).slideUp();
        window.location.href = window.location.host;
    });
    $('.row3 input').css('display','none');
});

// listen for an 'assign' for which player we are
socket.on('assign', function(data) {
    player.pid = data.pid;
    $('.p1-score p').css('background', data.color);
    if (data.color === '#5b4c93') {
        $('.p2-score p').css('background', '#fdbf56')
    } else {
        $('.p2-score p').css('background', '#fdbf56')
    }
});

socket.on('reset', function(data) {
    if(data.highlight) {
        setTimeout(function() {
            data.highlight.forEach(function(pair) {
                $('[data-row="'+pair[0]+'"][data-column="'+pair[1]+'"]').css('background-color', '#65BD77');
            });
        }, 500);
    }

    setTimeout(function() {
        $('td').css('background-color', '');
        alert('new game beginning');
    }, 1200);

    // Set Scores
    p1 = parseInt($('.p1-score p').html())+data['inc'][0];
    $('.p1-score p').html(p1);
    p2 = parseInt($('.p2-score p').html())+data['inc'][1];
    $('.p2-score p').html(p2);
});

socket.on('leave', function() {
    console.log('testets');
    $('.turn-indicator').text('your opponent left').css('color', 'blue');
});

socket.on('drop', function(data) {
    var row = 0;
    var stopVal = setInterval(function() {
        if(row == data.row) {
            clearInterval(stopVal);
        }
        fillBox(row, data.col, data.color);
        row++;
    }, 75);
});


function fillBox(row, col, color) {
    myColor = color;
    var next = '#r' + row + 'c' + col;
    var before = '#r' + (row-1) + 'c' + col;
    $(before).css('background-color', beforeColor);
    $(next).css('background-color', color);
}

$(document).ready(function () {
    for(i=0; i<6; i++){
        var row = $('<tr></tr>');
        for(j=0; j<7; j++) {
            var col = $('<td></td>');
            $('#board').append(table.append(row.append(col.addClass('cell').attr('id', 'r'+i+'c'+j))));
            $('td').last().data('col', j).data('row', i);//.css('background-color', 'blue');
        }
    }
    $('.cell').click(function() {
        $('.turn-indicator').text('it\'s NOT your turn').css('color', 'red');
        // find the box to drop the disc to
        var click = {
            row: $(this).data('row'),
            col: $(this).data('col')
        };
        socket.emit('click', click);
    });
    $('.row3').click(function() {
        if($(this).text() === 'Click here to start new game') {
            window.location.href = window.location.protocol + '//' + window.location.host;
        }
    });
});

socket.on('changeTurn', function() {
    $('.turn-indicator').text('it\'s your turn').css('color', 'green');
});

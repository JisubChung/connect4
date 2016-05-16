// frontend js
var table = $('<table></table>').addClass('board');
var socket = io();

function Player(room, pid) {
    this.room = room;
    this.pid = pid;
}

var room = $('input').data('room');
var player = new Player(room, '', '');

socket.on('connect', function() {
    socket.emit('join', {room: room});
});

socket.on('assign', function(data) {
    player.color = data.color;
    player.pid = data.pid;
    if(player.pid == 1) {
        $('.p1-score p').addClass('current');
    }
    else {
        $('.p2-score p').addClass('current');
    }
});

$('.box').click(function() {
    // find the box to drop the disc to
    var click = {
        row: $(this).data('row'),
        column: $(this).data('column')
    };
    socket.emit('click', click);
});

$(document).ready(function () {
    for(i=0; i<6; i++){
        var row = $('<tr></tr>'); //.addClass('bar').text('result ' + i);
        for(j=0; j<7; j++) {
            row.append('<td></td>').addClass('box');
        }
        table.append(row);
    }

    $('#board').append(table);
});

// frontend js
var table = $('<table></table>').addClass('board');

$(document).ready(function () {
    for(i=0; i<6; i++){
        var row = $('<tr></tr>'); //.addClass('bar').text('result ' + i);
        for(j=0; j<7; j++) {
            row.append('<td></td>').addClass('box');
        }
        console.log(row);
        table.append(row);
    }

    $('#board').append(table);
});

$('.box').click(function() {
    // find the box to drop the disc to
    var click = {
        row: $(this).data('row'),
        column: $(this).data('column')
    };
    socket.emit('click', click);
});

    // for (var i = 0; i < 6; i++) {
    //     $('#board.col-xs-6').append('');
    //     $('#board').last().append($('#board tr'));
    //     $('#board').append($('#board td')).last().text('hi');
    //     console.log(i);
    //     for (var j = 0; j < 7; j++) {
    //         $('#board tr').last().append('by');
    //         $('#board td').last().append('hi');
    //         // $('#board tr').last().append('<h6>ppp</h6>');
    //         // $('#board td').last().addClass('box').attr('data-row', i).attr('data-column', j);
    //
    //     }
    // }
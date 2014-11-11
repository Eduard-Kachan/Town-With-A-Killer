
// Wait for DOM to Load
jQuery(function($) {
    
    // Create New Socket Connection using Socket.io
    var socket = io();

    var isPlayerTrue = false;

    //io.emit('name','Anonymous');

    //socket.on('sockets', function(sockets){
    //    $('.players').empty();
    //
    //    sockets.forEach(function(socket) {
    //        $('.players').append(
    //            $('<li>').text(socket.name)
    //        );
    //    });
    //});

    socket.on('player', function(){
        console.log('you are a player');
        isPlayerTrue = true;
    });

    socket.on('guest', function(){
        console.log('you are a guest');
        isPlayerTrue = false;
    });

    //var playerReady = function(){
    //
    //};

    socket.on('numOfPplOnline', function(count){
        console.log(count.players + ' player(s), ' + count.guests + ' guest(s)');
    });

});
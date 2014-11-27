
// Wait for DOM to Load
jQuery(function($) {
    
    // Create New Socket Connection using Socket.io
    var socket = io();

    $('a').on('click', function(){
        var text = $('input').val();
        socket.emit('.messages',text);
    });

    socket.on('update',function(msg){
        $('.messages').append(msg).append('<br>');
    });
    
});
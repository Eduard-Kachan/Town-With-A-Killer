
jQuery(function($) {
    // Create New Socket Connection using Socket.io
    var socket = io();

    var myID;

    //users id fo identification
    socket.on('myId', function(playerID){
        myID = playerID;
        console.log(myID);
    });

    //initial submit off all users
    socket.on('users', function(users){
        clearUsers('.players');
        users.players.forEach(function(player) {
            insertUser(player, '.players');
        });

        clearUsers('.guest');
        users.guests.forEach(function(guest) {
            insertUser(guest, '.guest');
        });
    });

    //new player joined
    socket.on('newPlayer',function(user){
        insertUser(user, '.players');
    });

    //new guest joined
    socket.on('newGuest',function(user){
        console.log(user);
        insertUser(user, '.guests');
    });

    var clearUsers = function(listClass){
        console.log('clear: ' + listClass);
        var list = $(listClass);
        list.empty();
    };

    var insertUser = function(user,listClass){
        var list = $(listClass);
        var item = $('<li>');
        var name = $('<span>').text(user.name);

        if(user.userID == myID){
            var nameInput = $('<input>').hide();
            ready = $('<button>').text('ready up').attr('class', 'ready');

            item.attr('class', 'me')
                .append(nameInput)
        }else{
            ready = $('<span>').text('(Ready)').attr('class', 'ready').hide();
        }

        item.attr('id', '' + user.userID)
            .append(name);

        list.append(item);
    };

});
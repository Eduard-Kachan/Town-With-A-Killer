
jQuery(function($) {
    // Create New Socket Connection using Socket.io
    var socket = io();

    var myID;
    var gameState;

    //initial submit off all users
    socket.on('initialSubmit', function(users){
        myID = users.userID;
        setGameState(users.gameState);

        clearUsers('.players');
        users.players.forEach(function(player) {
            insertUser(player, '.players');
        });

        //clearUsers('.guest');
        //users.guests.forEach(function(guest) {
        //    insertUser(guest, '.guest');
        //});
        console.log('initialSubmit:');
        console.log(users);
    });

    //new player joined
    socket.on('newPlayer',function(user){
        console.log('new Player joined');
        insertUser(user, '.players');
    });

    //new guest joined
    socket.on('newGuest',function(user){
        console.log(user);
        insertUser(user, '.guests');
    });

    //Game state changed
    socket.on('gameState',function(state){
        setGameState(state);
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

    var setGameState = function(state){
        gameState = state;
        console.log(gameState);
        $('.gameState').text(gameState);
    };

    var userDied = function(user){
        user.addClass( "died" );
    };

    //User clicked on their name to change it
    $(document).on ('click', '.me span', function () {
        $('.me span').hide();
        $('.me .ready').hide();
        $('.me input').val($('.me span').text()).show().focus();

    });

    //User presses 'enter' to submit their name change
    $(document).on ('keypress', '.me input', function (e) {
        var key = e.which;
        if(key == 13)  // the enter key code
        {
            var value =  $('.me input').val();

            $('.me span').text(value).show();
            $('.me .ready').show();
            $('.me input').hide();

            socket.emit('identify', value);
        }
    });

    $('button.send').on('click', function () {
        var message = $('input.message').val();
        socket.emit('message', message);
        $('input.message').val('');
    });

    $('input.message').on('keypress', function(e){
        var key = e.which;
        if(key == 13)  // the enter key code
        {
            var message = $('input.message').val();
            socket.emit('message', message);
            $('input.message').val('');
            $('input.message').focus();
        }
    });

    socket.on('messagelog', function(message){
        $('.chat ul').append(
            $('<li>').text(message)
        ).scrollTop(1E10);
    });

    //change user's name
    socket.on('identified', function(user){
        $('#' + user.userID + ' span').text(user.name);
    });

    //remove the user who left
    socket.on('remove', function(user){
        var currentUser = $('#' + user.userID);
        if(gameState == 'Day' || gameState == 'Night'){
            userDied(currentUser);
        }else{
            currentUser.remove();
        }
    });

    socket.on('gameAboutToStart', function(){
        console.log('Game about to start!')
    });

    socket.on('timer', function(time){
        //console.log('Game about to start!')
        if(gameState == 'About To Start'){
            $('h2.timer').text('Game starts in ' + time + 's');
        }else if(gameState == 'Day'){
            $('h2.timer').text('Day ends in ' + time + 's');
        }else if(gameState == 'Night'){
            $('h2.timer').text('Night ends in ' + time + 's');
        }
    });

    socket.on('type', function(type){
        $('h2.playerClass').text(type);
    });

    socket.on('vote', function(list){
        $('ul.couseList').empty();
        var voteList = $('ul.couseList');
        voteList.append(
          $('h3').text('Vote:')
        );
        list.forEach(function(item){
            voteList.append(
                $('<li>').append(
                    $('<button>')
                        .text(item.username)
                        .addClass(item.userID)
                )
            );
        });
    });

});
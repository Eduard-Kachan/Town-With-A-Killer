function Room(rooms) {
    this.rooms = rooms;
    this.states = {
        waiting:'Waiting For Users',
        aboutToStars:'About To Start',
        day:'Day',
        night:'Night'
    };

    this.roomName = undefined;
    this.roomState = this.states['waiting'];


    this.maxPlayers = 3;
    this.capacityReached = false;

    this.players = [];
    this.guests = [];

    this.roomTimer = 0;

    this.countDown = null;

    this.numOfReturns = 0;

    this.alive = this.maxPlayers;

    this.changeRoomState = function(state){
        this.roomState = this.states[state];
        this.emitToRoomUsers('gameState', this.roomState);
        //console.log(this.roomName + ' room state is now: ' + this.roomState);
        //console.log('timer ended, room state is: ' + this.roomState);
        console.log("It's " + this.roomState + " in: " + this.roomName);
    };

    this.addUser = function(socket){

        this.addEventListeners(socket);

        var isWaiting = (this.roomState === this.states['waiting']);
        var isCapacityNotReached = (this.players.length < this.maxPlayers);

        if(isWaiting && isCapacityNotReached) {

            this.players.push(socket);
            console.log(this.roomName + ' ' + socket.id + ' ' + this.players.length);

            this.broadcastToRoomUsers('newPlayer', {
                name:socket.name || 'Anonymous',
                userID: socket.id
            }, socket);
        } else {
            this.guests.push(socket);
            console.log(this.roomName + ' ' + socket.id + ' ' + this.guests.length);

            this.broadcastToRoomUsers('newGuest', {
                name: socket.name || 'Anonymous',
                userID: socket.id
            }, socket);
        }

        socket.emit('initialSubmit', this.getInitialSubmit(socket.id));

        if(!this.capacityReached && this.players.length == this.maxPlayers){
            this.capacityReached = true;
            this.startCountdown();
        }
    };

    this.getInitialSubmit = function(userID){
        var list = {
            userID:userID,
            gameState:this.roomState,
            players:[]
            //guests:[]
        };
        //refactored later
        this.players.forEach(function(player){
            list.players.push({
                name:player.name || 'Anonymous',
                userID: player.id,
                status: player.status || 'alive'
            });
        });
        //refactored later
        //this.guests.forEach(function(guest){
        //  list.guests.push({
        //    name:guest.name || 'Anonymous',
        //    userID: guest.id
        //  });
        //});
        return list;
    };

    this.removeUser = function(socket){
        var indexOfUser;

        if(this.players.indexOf(socket) != -1){

            this.broadcastToRoomUsers('remove', {
                userID: socket.id
            }, socket);

            console.log('removed user id: ' + socket.id);

            indexOfUser = this.players.indexOf(socket);
            this.players.splice(indexOfUser, 1);

            console.log(this.roomName + ' ' + this.players.length);

            //if(this.guests.length > 0) {
            //  //add guest to players
            //  var firstGuest = this.guests.splice(0, 1);
            //  players.push(firstGuest[0]);
            //  firstGuest[0].emit('player');
            //}

        }else{

            this.broadcastToRoomUsers('remove', {
                userID: socket.id
            }, socket);

            console.log('removed user id: ' + socket.id);


            indexOfUser = this.guests.indexOf(socket);
            this.guests.splice(indexOfUser, 1);

            console.log(this.roomName + ' '+ this.guests.length);
        }

    };

    this.getNumberOfUsers = function(){
        var num = this.players.length + this.guests.length;
        return num;
    };

    this.startCountdown = function(){
        var self = this;
        var timerLenght = 5;
        this.changeRoomState('aboutToStars');
        this.roomTimer = 0;
        console.log('game about to start in room: ' + this.roomName);

        this.countDown = setInterval(function(){
            var isCapacityNotReached = self.players.length < self.maxPlayers;

            if(isCapacityNotReached){
                console.log('not inofe people, clear the timer');
                clearInterval(self.countDown);
                self.capacityReached = false;
                self.changeRoomState('waiting');
                return;
            }

            if(self.roomTimer == timerLenght){
                console.log('game started in: ' + self.roomState);
                self.chouseMurderer();
                self.identifyPlayers();
                clearInterval(self.countDown);
                self.startDayNightCycle();
                return;
            }

            self.emitToRoomUsers('timer', timerLenght - self.roomTimer);

            self.roomTimer = self.roomTimer + 1;
        }, 1000);
    };

    this.startDayNightCycle = function(){
        var self = this;
        this.roomTimer = 0;
        var timerLenght = 10;

        this.changeRoomState('day');
        this.sendAlistOfUsersToVote();

        this.countDown = setInterval(function(){

            if(self.roomTimer == timerLenght){
                self.roomTimer = 0;
                if(self.roomState == 'Day'){
                    self.emitToRoomUsers('getVotes');
                    self.changeRoomState('night');
                }else{
                    self.changeRoomState('day');
                    self.sendAlistOfUsersToVote();
                }
            }

            self.emitToRoomUsers('timer', timerLenght - self.roomTimer);

            self.roomTimer += 1;
        }, 1000);
    };

    //this.startDayCycle = function(){
    //    var self = this;
    //
    //    this.changeRoomState('day');
    //    this.roomTimer = 0;
    //    var timerLenght = 10;
    //
    //
    //    this.sendAlistOfUsersToVote();
    //
    //    this.countDown = setInterval(function(){
    //
    //        if(self.roomTimer == timerLenght){
    //
    //            //self.emitToRoomUsers('getVotes');
    //            self.startNightCycle();
    //            clearInterval(self.countDown);
    //
    //            return;
    //        }
    //
    //        self.emitToRoomUsers('timer', timerLenght - self.roomTimer);
    //
    //        self.roomTimer = self.roomTimer + 1;
    //    }, 1000);
    //};

    //this.startNightCycle = function(){
    //    var self = this;
    //
    //    this.roomTimer = 0;
    //    var timerLenght = 10;
    //
    //    this.countDown = setInterval(function(){
    //        clearInterval(self.countDown);
    //        if(self.roomTimer == timerLenght){
    //            //self.startDayCycle();
    //            clearInterval(self.countDown);
    //            return;
    //        }
    //
    //        self.emitToRoomUsers('timer', timerLenght - self.roomTimer);
    //
    //        self.roomTimer = self.roomTimer + 1;
    //    }, 1000);
    //};

    this.emitToRoomUsers = function(emit, message){
        var send = {
            emit:emit,
            message:message,
            fromUser:null
        };
        this.emitToEvery(this.players, send);
        this.emitToEvery(this.guests, send);
    };

    this.broadcastToRoomUsers = function(emit, message, user){
        var send = {
            emit:emit,
            message:message,
            fromUser:user
        };
        this.emitToEvery(this.players, send);
        this.emitToEvery(this.guests, send);
    };

    this.emitToEvery = function(group, send){
        group.forEach(function (socket) {
            if(send.fromUser != socket){
                socket.emit(send.emit, send.message);
            }
        });
    };

    this.addEventListeners = function(socket){
        var self = this;

        socket.on('disconnect', function(message) {
            self.removeUser(socket);
            if(self.getNumberOfUsers() == 0){
                console.log('No users in room: ' + self.roomName +'. Gonna remove this room');
                delete self.rooms[self.roomName];
            }
        });

        socket.on('identify',function(name){
            socket.name = name;
            self.broadcastToRoomUsers('identified',{
                name:socket.name,
                userID: socket.id
            }, socket);
        });

        socket.on('message',function(message){
            var name = socket.name || 'Anonymous';
            var messagelog = name + ': ' + message;
            self.emitToRoomUsers('messagelog', messagelog);
        });

        socket.on('voteResult', function(voteID){

            //console.log(voteID);

            if(!voteID)return;

            self.players.forEach(function(player){
                if(player.id == voteID){
                    if(!player.votesAgainst){
                        player.votesAgainst = 1;
                    }else{
                        player.votesAgainst++;
                    }
                }
            });

            self.numOfReturns++;

            if(self.numOfReturns == self.alive){
                self.countVotes();
            }

        });

    };

    this.chouseMurderer = function(){
        var maxNum = this.players.length;
        var random = Math.floor(Math.random()*maxNum);

        this.players[random].type = 'Murderer';
        console.log('murderer is : ' + this.players[random].id);
    };

    this.identifyPlayers = function(){
        this.players.forEach(function(player){
            if(!player.type){
                player.type = 'Innocent'
            }
            player.emit('type', player.type);
        });
    };

    this.sendAlistOfUsersToVote = function(){
        var list = [];
        this.players.forEach(function(player){
            list.push({
                userID: player.id,
                username: player.name || 'Anonymous'
            })
        });

        this.emitToRoomUsers('voteList', list);
    };

    this.countVotes = function(){
        var votes = [];
        var names = [];

        this.players.forEach(function(player){
            names.push(player.id);

            if(!player.votesAgainst)player.votesAgainst = 0;
            votes.push(player.votesAgainst);
        });

        console.log(votes);
        console.log(names);

        // Get the max value from the array
        var largestVote = Math.max.apply(Math, votes);
        console.log('the largest vote is: ' + largestVote);

        var last = votes.lastIndexOf(largestVote);
        var first = votes.indexOf(largestVote);

        if(last != first){
            console.log('its a tie');
            //this.startNightCycle();
            return;
        }


        //player died
        var name = names[first];

        var self = this;

        this.players.forEach(function(player){
            if(player.id == name){
                console.log('player id:' + player.id + ' has died');
                player.status = 'dead';

                self.emitToRoomUsers('dead', player.id);
            }
        });

    }

}

exports.Room = Room;
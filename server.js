
// Require Native Node.js Libraries
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var players = [];
var guests = [];
var maxPeople = 3;

// Route our Assets
app.use('/assets/', express.static(__dirname + '/public/assets/'));

// Route our Home Page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

// Handle Socket Connection
io.on('connection', function(socket) {

  //Set users as guests if over 10
  if(players.length+1 > maxPeople){
    guests.push(socket);
    socket.emit('guest');
  }else{
    players.push(socket);
    socket.emit('player');
  }

  logNumOfPlayers();

  socket.on('disconnect', function(message) {
    //remove user from the game
    if(players.indexOf(socket) != -1){

      //remove player
      players.splice(players.indexOf(socket), 1);

      if(guests.length > 0) {
        //add guest to players
        var firstGuest = guests.splice(0, 1);
        players.push(firstGuest);
        firstGuest[0].emit('player');
      }
    }else{
      //remove guest
      guests.splice(guests.indexOf(socket), 1);
    }

    logNumOfPlayers();

  });

});

//let people know how many people playing
var logNumOfPlayers = function(){
  io.emit('numOfPplOnline', {players:players.length, guests:guests.length});
};



// Start Server
http.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = http.address();
  console.log("Server started at", addr.address + ":" + addr.port);
});

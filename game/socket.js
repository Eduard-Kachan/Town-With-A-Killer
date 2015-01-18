var oRoom = require('./Room');
var Room = oRoom.Room;


exports.startConnection = function (io, rooms) {
    io.on('connection', function(socket) {

        console.log('user connected: id=' + socket.id);

        var url = socket.handshake.headers.referer.split('/');
        var roomName = url[url.length-1];
        var room;

        var isInARoom = false;

        if(url[url.length-2] == 'room'){
            isInARoom = true;
        }

        if(isInARoom){
            if(rooms[roomName]){
                console.log('room exists: ' + roomName);
            }else{
                rooms[roomName] = new Room(rooms);
                rooms[roomName].roomName = roomName;
                console.log('gonna make a new room: ' + roomName);
            }

            rooms[roomName].addUser(socket);
        }
    });
};
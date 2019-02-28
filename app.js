var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var players = 0;
var root_path = process.cwd();
let roundScores

const scores_in_round = 3

const resetRoundScores = () => {
  roundScores = {berlin: 0, stockholm: 0}
}

resetRoundScores()

app.use(express.static(root_path + '/public'));

app.get('/', function(req, res) {
  res.sendFile(root_path + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket) {
  console.log('Client connected');

  
  socket.on('player_joined', function(data) {
    if(players < 2) {
      players++;

      if(players === 2) {
        io.emit('start_game', {
          direction: Math.random()<0.5 ? 'right' : 'left'
        }); 
        players = 0;
      }

      // if(players === 1) {
      //   socket.emit('player_enter', 1, data);
      //   socket.broadcast.emit('player_enter', 1, data);
      // }
      // else if(players === 2) {
      //   socket.emit('player_enter', 2, data);
      //   socket.broadcast.emit('player_enter', 2, data);
      //   io.emit('start_game', 'ok'); 
      //   players = 0;
      // }

      // if(players === 1)
      //   socket.emit('player_enter', 1);
      // else if(players === 2) {
      //   socket.emit('player_enter', 2);
      //   io.emit('start_game', 'ok'); 
      //   players = 0;
      // }
    }

    socket.on('move', function(data) {
      socket.broadcast.emit('move', data);
    });

    socket.on('round_over', function(data) {
      var winner = JSON.parse(data).winner;
      
      roundScores[winner]++

      io.emit('update_scores', roundScores);

      if (roundScores[winner] < scores_in_round) {
       io.emit('start_round', {
         direction: Math.random()<0.5 ? 'right' : 'left'
        });
      } else {
        io.emit('game_over', roundScores)
        resetRoundScores()
      }
    })
  })
});

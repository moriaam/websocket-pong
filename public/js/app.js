(function() {
  $(document).ready(function() {
    var socket = io();
    var canvas = $('#c')[0];
    var waiting = $('#waiting');
    var join = $('#join');
    var berlinPlayerText = $('#berlin-player');
    var berlinScore = $('#berlin-score');
    var stockholmScore = $('#stockholm-score');
    var stockholmPlayerText = $('#stockholm-player');
    var context = canvas.getContext('2d');
    var right = Math.random() > 0.5;
    var vertical_direction = 'up';
    var player_number;
    var game_started = false;
    const centered_ball_position = {
      x: 248,
      y: 126
    }

    const ball_step_px = 2

    waiting.hide()

    join[0].onclick = (e) => {
      const site = window.location.search.substring(1).split('=')[1]

      if (site === 'berlin') {
        berlinPlayerText.html('BERLIN')
        player_number = 1
      } else {
        stockholmPlayerText.html('STOCKHOLM')
        player_number = 2
      }

      socket.emit('player_joined', site)

      join.hide()
      waiting.show()
    }

    // Guard position
    var guard_postition = {
      left: {
        x: 20,
        y: 118
      },
      right: {
        x: 475,
        y: 118
      }
    }

    var ball_position = {
      x: 248,
      y: 126
    }

    function set_background() {
      context.fillStyle = 'black';
      context.fillRect(0, 0, 500, 376);
    }

    function set_left_guard(y, clear) {
      if(clear) {
        context.fillStyle = 'black';
        context.fillRect(guard_postition.left.x, y, 5, 20);
      }
      else {
        context.fillStyle = 'white';
        context.fillRect(guard_postition.left.x, y, 5, 20);
      }
    }

    function set_right_guard(y, clear) {
      if(clear) {
        context.fillStyle = 'black';
        context.fillRect(guard_postition.right.x, y, 5, 20);
      }
      else {
        context.fillStyle = 'white';
        context.fillRect(guard_postition.right.x, y, 5, 20);
      }
    }

    function set_ball(x, y, clear) {
      if(clear) {
        context.fillStyle = 'black';
        context.fillRect(ball_position.x, ball_position.y, 4, 4);
      }
      else {
        context.fillStyle = 'white';
        context.fillRect(x, y, 4, 4);
      }
    }

    function init() {
      set_background();
      set_left_guard(guard_postition.left.y);
      set_right_guard(guard_postition.right.y);
      set_ball(ball_position.x, ball_position.y);
    }

    init();

    setInterval(function() {
      if(game_started) {
        if(right) {
          if(ball_position.x < 470) {
            set_ball(ball_position.x, ball_position.y, true);

            if(vertical_direction === 'up') {
              ball_position.x += ball_step_px;
              ball_position.y -= ball_step_px;
            }
            else if(vertical_direction === 'down') {
              ball_position.x += ball_step_px;
              ball_position.y += ball_step_px;
            }

            set_ball(ball_position.x, ball_position.y, false);

            if((ball_position.y > guard_postition.right.y + 20 || ball_position.y < guard_postition.right.y) && ball_position.x >= 470) {
              socket.emit('round_over', JSON.stringify({winner: 'berlin'}));
              // game_started = false;
            }

            if(ball_position.y <= 0)
              vertical_direction = 'down'
            else if(ball_position.y >= 272)
              vertical_direction = 'up';
          }
          else
            right = false;
        }
        else if(!right) {
          if(ball_position.x > 26) {
            set_ball(ball_position.x, ball_position.y, true);
            if(vertical_direction === 'up') {
              ball_position.x -= ball_step_px;
              ball_position.y -= ball_step_px;
            }
            else if(vertical_direction === 'down') {
              ball_position.x -= ball_step_px;
              ball_position.y += ball_step_px;
            }

            set_ball(ball_position.x, ball_position.y, false);

            if((ball_position.y > guard_postition.left.y + 20 || ball_position.y < guard_postition.left.y) && ball_position.x <= 26) {
              socket.emit('round_over', JSON.stringify({winner: 'stockholm'}));
              // game_started = false;
            }

            if(ball_position.y <= 0)
              vertical_direction = 'down'
            else if(ball_position.y >= 272)
              vertical_direction = 'up';
          }
          else
            right = true;
        }
      }
    }, 16);

    $(document).keypress(function(data) {
      var charCode = data.charCode;
        if(game_started) {
          if(player_number === 1) {
            if(charCode === 119) {
              if(guard_postition.left.y > 0) {
                set_left_guard(guard_postition.left.y, true)
                guard_postition.left.y -= 8;
                guard_postition.left.direction = 'up';
                set_left_guard(guard_postition.left.y, false);

                var data = {
                  left: guard_postition.left,
                  player: player_number
                }
                socket.emit('move', JSON.stringify(data));
              }
            }
            else if(charCode === 115) {
              if(guard_postition.left.y < 256) {
                set_left_guard(guard_postition.left.y, true);
                guard_postition.left.y += 8;
                guard_postition.left.direction = 'down';
                set_left_guard(guard_postition.left.y, false);

                var data = {
                  left: guard_postition.left,
                  player: player_number
                }
                socket.emit('move', JSON.stringify(data));
              }
            }
          }

        else if(player_number === 2) {
          if(charCode === 119) {
            if(guard_postition.right.y > 0) {
              set_right_guard(guard_postition.right.y, true);
              guard_postition.right.y -= 8;
              guard_postition.right.direction = 'up';
              set_right_guard(guard_postition.right.y, false);

              var data = {
                right: guard_postition.right,
                player: player_number
              }
              socket.emit('move', JSON.stringify(data));
            }
          }
          else if(charCode === 115) {
            if(guard_postition.right.y < 256) {
              set_right_guard(guard_postition.right.y, true);
              guard_postition.right.y += 8;
              guard_postition.right.direction = 'down';
              set_right_guard(guard_postition.right.y, false);

              var data = {
                right: guard_postition.right,
                player: player_number
              }
              socket.emit('move', JSON.stringify(data));
            }
          }
        }
      }
    });

    socket.on('player_enter', function(playerNumber, site) {
      if(playerNumber === 1) {
        player_number = 1;
      }
      else {
        player_number = 2;
      }

      // rightPlayerText.html(data)
    });

    socket.on('start_game', function(data) {
      game_started = true;

      berlinPlayerText.html('BERLIN')
      stockholmPlayerText.html('STOCKHOLM')

      waiting.hide()
    });

    socket.on('start_round', function(data) {
      game_started = false

      set_ball(ball_position.x, ball_position.y, true);

      ball_position.x = centered_ball_position.x
      ball_position.y = centered_ball_position.y

      right = Math.random() > 0.5

      set_ball(ball_position.x, ball_position.y, false);

      setTimeout(() => {
        game_started = true
      }, 2000)
    });

    socket.on('move', function(data) {
      var parsed_data = JSON.parse(data);
      if(parsed_data.player === 2) {
        var position = parsed_data.right;
        set_right_guard(guard_postition.right.y, true);
        guard_postition.right.y = position.y;
        set_right_guard(guard_postition.right.y, false);
      }

      else if(parsed_data.player === 1) {
        var position = parsed_data.left;
        set_left_guard(guard_postition.left.y, true);
        guard_postition.left.y = position.y;
        set_left_guard(guard_postition.left.y, false);
      }
    });

    socket.on('update_scores', function(data) {
      berlinScore.html(data.berlin)
      stockholmScore.html(data.stockholm)

      // game_started = false;
    })
  });
}).call(this);

(function() {
  var BOARDHEIGHT, BOARDWIDTH, BRICK, DESERT, FOREST, MOUNTAIN, NOTHING, PLAIN, WATER, WHEAT, colors, evenBoard, evenPlay, evenRoll, houses, oddBoard, oddPlay, oddRoll;
  NOTHING = 0;
  WATER = 1;
  DESERT = 2;
  PLAIN = 3;
  BRICK = 4;
  MOUNTAIN = 5;
  FOREST = 6;
  WHEAT = 7;
  colors = {
    1: 'blue',
    2: 'tan',
    3: '#0f0',
    4: '#A52A2A',
    5: 'lightgray',
    6: 'darkgreen',
    7: 'gold'
  };
  evenBoard = [[0, 1, 1, 0], [1, 2, 2, 1], [1, 2, 2, 1], [1, 2, 2, 1], [1, 2, 2, 1], [0, 1, 1, 0]];
  oddBoard = [[0, 1, 0], [1, 2, 1], [2, 2, 2], [2, 2, 2], [2, 2, 2], [1, 2, 1], [0, 1, 0]];
  evenPlay = [];
  evenRoll = [];
  oddPlay = [];
  oddRoll = [];
  houses = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
  BOARDWIDTH = BOARDHEIGHT = 500;
  $(function() {
    var HEIGHT, RADII, WIDTH, XOFFSET, YOFFSET, ctx, drawHex, i, j, rolls, tiles, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
    ctx = $('#board')[0].getContext('2d');
    $('#board').attr({
      width: BOARDWIDTH,
      height: BOARDHEIGHT
    });
    YOFFSET = HEIGHT = 68;
    XOFFSET = 60;
    RADII = 40;
    WIDTH = RADII * 2;
    drawHex = function(x, y, num) {
      var i;
      ctx.save();
      ctx.beginPath();
      ctx.translate(x, y);
      ctx.moveTo(RADII, 0);
      for (i = 0; i < 6; i++) {
        ctx.rotate(-(Math.PI * 2) / 6);
        ctx.lineTo(RADII, 0);
      }
      ctx.stroke();
      ctx.fill();
      ctx.restore();
      if (num) {
        num = String(num);
        ctx.save();
        ctx.fillStyle = num === "6" || num === "8" ? 'red' : 'black';
        ctx.font = "20px Arial";
        ctx.translate(x - ctx.measureText(num).width / 2, y + 7);
        ctx.fillText(num, 0, 0);
        return ctx.restore();
      }
    };
    ctx.fillStyle = 'cyan';
    ctx.fillRect(0, 0, BOARDWIDTH, BOARDHEIGHT);
    ctx.translate(BOARDWIDTH / 2, BOARDHEIGHT / 2);
    ctx.strokeStyle = '1px solid black';
    ctx.save();
    ctx.translate(-((evenBoard[0].length + .5) * WIDTH) / 2, -(evenBoard.length * HEIGHT) / 2);
    for (i = 0, _ref = evenBoard.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      for (j = 0, _ref2 = evenBoard[i].length; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
        if (evenBoard[i][j] === 1) {
          ctx.fillStyle = colors[evenBoard[i][j]];
          drawHex(XOFFSET * 2 * j, YOFFSET * (i + .5));
        }
      }
    }
    ctx.restore();
    ctx.save();
    ctx.translate(-(oddBoard[0].length * WIDTH) / 2, -((oddBoard.length - 1) * HEIGHT) / 2);
    for (i = 0, _ref3 = oddBoard.length; 0 <= _ref3 ? i < _ref3 : i > _ref3; 0 <= _ref3 ? i++ : i--) {
      for (j = 0, _ref4 = oddBoard[i].length; 0 <= _ref4 ? j < _ref4 : j > _ref4; 0 <= _ref4 ? j++ : j--) {
        if (oddBoard[i][j] === 1) {
          ctx.fillStyle = colors[oddBoard[i][j]];
          drawHex(XOFFSET * 2 * j, YOFFSET * i);
        }
      }
    }
    ctx.restore();
    tiles = [PLAIN, PLAIN, PLAIN, PLAIN, BRICK, BRICK, BRICK, FOREST, FOREST, FOREST, FOREST, WHEAT, WHEAT, WHEAT, WHEAT, MOUNTAIN, MOUNTAIN, MOUNTAIN, DESERT].sort(function() {
      return 0.5 - Math.random();
    });
    rolls = [11, 12, 9, 4, 6, 5, 10, 3, 11, 4, 8, 8, 10, 9, 3, 5, 2, 6].sort(function() {
      return 0.5 - Math.random();
    });
    evenPlay = (function() {
      var _results;
      _results = [];
      for (i = 0; i < 4; i++) {
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (j = 0; j < 2; j++) {
            _results2.push(tiles.pop());
          }
          return _results2;
        })());
      }
      return _results;
    })();
    oddPlay = (function() {
      var _results;
      _results = [];
      for (i = 0; i < 5; i++) {
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (j = 0; j < 3; j++) {
            _results2.push((i === 0 || i === 4) && (j === 0 || j === 2) ? 0 : tiles.pop());
          }
          return _results2;
        })());
      }
      return _results;
    })();
    evenRoll = (function() {
      var _results;
      _results = [];
      for (i = 0; i < 4; i++) {
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (j = 0; j < 2; j++) {
            _results2.push(evenPlay[i][j] > DESERT ? rolls.pop() : 0);
          }
          return _results2;
        })());
      }
      return _results;
    })();
    oddRoll = (function() {
      var _results;
      _results = [];
      for (i = 0; i < 5; i++) {
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (j = 0; j < 3; j++) {
            _results2.push(oddPlay[i][j] > DESERT ? rolls.pop() : 0);
          }
          return _results2;
        })());
      }
      return _results;
    })();
    console.log(JSON.stringify(evenRoll));
    console.log(JSON.stringify(oddRoll));
    console.log(JSON.stringify(rolls));
    ctx.save();
    ctx.translate(-((evenBoard[0].length + .5) * WIDTH) / 2, -(evenBoard.length * HEIGHT) / 2);
    for (i = 0, _ref5 = evenBoard.length; 0 <= _ref5 ? i < _ref5 : i > _ref5; 0 <= _ref5 ? i++ : i--) {
      for (j = 0, _ref6 = evenBoard[i].length; 0 <= _ref6 ? j < _ref6 : j > _ref6; 0 <= _ref6 ? j++ : j--) {
        if (evenBoard[i][j] === 2) {
          ctx.fillStyle = colors[evenPlay[i - 1][j - 1]];
          drawHex(XOFFSET * 2 * j, YOFFSET * (i + .5), evenRoll[i - 1][j - 1]);
        }
      }
    }
    ctx.restore();
    ctx.save();
    ctx.translate(-(oddBoard[0].length * WIDTH) / 2, -((oddBoard.length - 1) * HEIGHT) / 2);
    for (i = 0, _ref7 = oddBoard.length; 0 <= _ref7 ? i < _ref7 : i > _ref7; 0 <= _ref7 ? i++ : i--) {
      for (j = 0, _ref8 = oddBoard[i].length; 0 <= _ref8 ? j < _ref8 : j > _ref8; 0 <= _ref8 ? j++ : j--) {
        if (oddBoard[i][j] === 2) {
          ctx.fillStyle = colors[oddPlay[i - 1][j]];
          drawHex(XOFFSET * 2 * j, YOFFSET * i, oddRoll[i - 1][j]);
        }
      }
    }
    ctx.restore();
    ctx.translate;
    ctx.fillStyle = "white";
    return ctx.fillRect(-10, -10, 10, 10);
  });
  /*
  	*
     | |
    * * *
   | | | |
    * * *
   | | | |
    * * *
   | | | |
    * * *
   | | | |
    * * *
     | |
      *
  */
}).call(this);

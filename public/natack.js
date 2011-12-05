(function() {
  var BOARDHEIGHT, BOARDWIDTH, BRICK, Board, BoardTile, DESERT, Edge, FOREST, Hex, HexMap, MOUNTAIN, NOTHING, PLAIN, ROLLS, TILECOLORS, TILERADII, TILESET, Vertex, WATER, WHEAT;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Array.prototype.shuffle = function() {
    return this.sort(function() {
      return 0.5 - Math.random();
    });
  };
  BOARDWIDTH = BOARDHEIGHT = 500;
  TILERADII = 40;
  NOTHING = 0;
  WATER = 1;
  DESERT = 2;
  PLAIN = 3;
  BRICK = 4;
  MOUNTAIN = 5;
  FOREST = 6;
  WHEAT = 7;
  TILECOLORS = {
    1: 'blue',
    2: 'tan',
    3: '#0f0',
    4: '#A52A2A',
    5: 'lightgray',
    6: 'darkgreen',
    7: 'gold'
  };
  TILESET = [PLAIN, PLAIN, PLAIN, PLAIN, BRICK, BRICK, BRICK, FOREST, FOREST, FOREST, FOREST, WHEAT, WHEAT, WHEAT, WHEAT, MOUNTAIN, MOUNTAIN, MOUNTAIN, DESERT];
  ROLLS = [11, 12, 9, 4, 6, 5, 10, 3, 11, 4, 8, 8, 10, 9, 3, 5, 2, 6];
  /*
  
  Hex map model
  
  http://stackoverflow.com/a/5040856
  
  Vertices:    Sides:
  				 0
    0__1          __
  5 /  \ 2     5 /  \ 1
    \__/       4 \__/ 2
    4  3           3
  
  Hexagon map:
  
     __    __
    /00\__/20\__   (x,y)
    \__/10\__/30\
    /01\__/21\__/
    \__/11\__/31\
       \__/  \__/
  
  In a 2D Matrix:
     __ __ __ __    
    |  |#?| ?| ?| 
    |__|__|__|__| 
    |# |#?|#?| ?|  
    |__|__|__|__|
    |# |# |#?|  |
    |__|__|__|__|
  
  */
  Edge = (function() {
    function Edge(board, x, y) {
      this.board = board;
      this.x = x;
      this.y = y;
    }
    Edge.prototype.getEnds = function() {
      return this.board.getEnds(this);
    };
    return Edge;
  })();
  Vertex = (function() {
    function Vertex(board, x, y) {
      this.board = board;
      this.x = x;
      this.y = y;
    }
    Vertex.prototype.getEdges = function() {
      return this.board.getEdges(this);
    };
    Vertex.prototype.getHexes = function() {
      return this.board.getHexes(this);
    };
    return Vertex;
  })();
  Hex = (function() {
    function Hex(board, x, y) {
      this.board = board;
      this.x = x;
      this.y = y;
    }
    Hex.prototype.getNeighbors = function() {
      return this.board.getNeighbors(this);
    };
    Hex.prototype.getVertices = function() {
      return this.board.getVertices(this);
    };
    Hex.prototype.getEdges = function() {
      return this.board.getEdges(this);
    };
    return Hex;
  })();
  HexMap = (function() {
    HexMap.prototype.HexClass = Hex;
    HexMap.prototype.EdgeClass = Edge;
    HexMap.prototype.VertexClass = Vertex;
    function HexMap(width, height) {
      var i, j;
      this.width = width;
      this.height = height;
      this.hexes = (function() {
        var _results;
        _results = [];
        for (i = 0; 0 <= width ? i < width : i > width; 0 <= width ? i++ : i--) {
          _results.push((function() {
            var _results2;
            _results2 = [];
            for (j = 0; 0 <= height ? j < height : j > height; 0 <= height ? j++ : j--) {
              _results2.push(new this.HexClass(this, i, j));
            }
            return _results2;
          }).call(this));
        }
        return _results;
      }).call(this);
      this.edges = (function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = (width + 1) * 2; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          _results.push((function() {
            var _ref2, _results2;
            _results2 = [];
            for (j = 0, _ref2 = (height + 1) * 2; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
              _results2.push(new this.EdgeClass(this, i, j));
            }
            return _results2;
          }).call(this));
        }
        return _results;
      }).call(this);
      this.vertices = (function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = (width + 1) * 2; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          _results.push((function() {
            var _ref2, _results2;
            _results2 = [];
            for (j = 0, _ref2 = (height + 1) * 2; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
              _results2.push(new this.VertexClass(this, i, j));
            }
            return _results2;
          }).call(this));
        }
        return _results;
      }).call(this);
    }
    HexMap.prototype.getNeighbors = function(hex) {
      var offset, x, y, _ref, _ref10, _ref11, _ref12, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      x = hex.x, y = hex.y;
      offset = x % 2 === 0 ? +1 : -1;
      if (x % 2 === 0) {
        return [(_ref = this.hexes[x]) != null ? _ref[y - 1] : void 0, (_ref2 = this.hexes[x + 1]) != null ? _ref2[y] : void 0, (_ref3 = this.hexes[x + 1]) != null ? _ref3[y + offset] : void 0, (_ref4 = this.hexes[x]) != null ? _ref4[y + 1] : void 0, (_ref5 = this.hexes[x - 1]) != null ? _ref5[y + offset] : void 0, (_ref6 = this.hexes[x - 1]) != null ? _ref6[y] : void 0];
      } else {
        return [(_ref7 = this.hexes[x]) != null ? _ref7[y - 1] : void 0, (_ref8 = this.hexes[x + 1]) != null ? _ref8[y + offset] : void 0, (_ref9 = this.hexes[x + 1]) != null ? _ref9[y] : void 0, (_ref10 = this.hexes[x]) != null ? _ref10[y + 1] : void 0, (_ref11 = this.hexes[x - 1]) != null ? _ref11[y] : void 0, (_ref12 = this.hexes[x - 1]) != null ? _ref12[y + offset] : void 0];
      }
    };
    HexMap.prototype.getVertices = function(hex) {
      var offset, x, y, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      x = hex.x, y = hex.y;
      offset = x % 2;
      return [(_ref = this.vertices[x + 1]) != null ? _ref[2 * y + offset] : void 0, (_ref2 = this.vertices[x + 1]) != null ? _ref2[2 * y + 1 + offset] : void 0, (_ref3 = this.vertices[x + 1]) != null ? _ref3[2 * y + 2 + offset] : void 0, (_ref4 = this.vertices[x]) != null ? _ref4[2 * y + 2 + offset] : void 0, (_ref5 = this.vertices[x]) != null ? _ref5[2 * y + 1 + offset] : void 0, (_ref6 = this.vertices[x]) != null ? _ref6[2 * y + offset] : void 0];
    };
    HexMap.prototype.getEdges = function(hex) {
      var offset, x, y, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      x = hex.x, y = hex.y;
      offset = x % 2;
      return [(_ref = this.edges[2 * x]) != null ? _ref[2 * y + offset] : void 0, (_ref2 = this.edges[2 * x]) != null ? _ref2[2 * y + 1 + offset] : void 0, (_ref3 = this.edges[2 * x + 1]) != null ? _ref3[2 * y + offset] : void 0, (_ref4 = this.edges[2 * x + 1]) != null ? _ref4[2 * y + 2 + offset] : void 0, (_ref5 = this.edges[2 * x + 2]) != null ? _ref5[2 * y + offset] : void 0, (_ref6 = this.edges[2 * x + 2]) != null ? _ref6[2 * y + 1 + offset] : void 0];
    };
    HexMap.prototype.getEnds = function(edge) {
      var x, y, _ref, _ref2, _ref3, _ref4;
      x = edge.x, y = edge.y;
      if (x % 2 === 0) {
        return [(_ref = this.vertices[x / 2]) != null ? _ref[y] : void 0, (_ref2 = this.vertices[x / 2]) != null ? _ref2[y + 1] : void 0];
      } else {
        return [(_ref3 = this.vertices[(x - 1) / 2]) != null ? _ref3[y] : void 0, (_ref4 = this.vertices[(x + 1) / 2]) != null ? _ref4[y] : void 0];
      }
    };
    HexMap.prototype.getEdges = function(vertex) {
      var x, y, _ref, _ref2, _ref3;
      x = vertex.x, y = vertex.y;
      return [(_ref = this.edges[x * 2]) != null ? _ref[y] : void 0, (_ref2 = this.edges[x * 2 + 1]) != null ? _ref2[y] : void 0, (_ref3 = this.edges[x * 2 - 1]) != null ? _ref3[y] : void 0];
    };
    HexMap.prototype.getHexes = function(vertex) {
      var x, xoffset, y, yoffset, _ref, _ref2, _ref3;
      x = vertex.x, y = vertex.y;
      xoffset = x % 2;
      yoffset = y % 2;
      return [(_ref = this.hexes[x - 1]) != null ? _ref[(y + xoffset) / 2 - 1] : void 0, (_ref2 = this.hexes[x - (1 - yoffset) * xoffset]) != null ? _ref2[(y - 1) / 2] : void 0, (_ref3 = this.hexes[x]) != null ? _ref3[(y - xoffset) / 2] : void 0];
    };
    return HexMap;
  })();
  BoardTile = (function() {
    __extends(BoardTile, Hex);
    function BoardTile() {
      BoardTile.__super__.constructor.apply(this, arguments);
    }
    BoardTile.prototype.type = NOTHING;
    BoardTile.prototype.roll = 0;
    return BoardTile;
  })();
  Board = (function() {
    __extends(Board, HexMap);
    Board.prototype.HexClass = BoardTile;
    function Board(ctx, width, height) {
      this.ctx = ctx;
      Board.__super__.constructor.call(this, width, height);
    }
    Board.prototype.newGame = function() {
      var high, i, j, low, range, rolls, tile, tileset, _i, _j, _k, _l, _len, _len2, _len3, _ref, _ref2, _results, _results2;
      this.water = [];
      for (i = 1; i < 8; i++) {
        low = (Math.abs(i - 4) / 2) | 0;
        high = 7 - ((Math.abs(i - 4) / 2) | 0) - (i % 2);
        range = i === 1 || i === 7 ? (function() {
          _results = [];
          for (var _i = low; low <= high ? _i < high : _i > high; low <= high ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this) : [low, high - 1];
        for (_j = 0, _len = range.length; _j < _len; _j++) {
          j = range[_j];
          this.water.push(this.hexes[i][j]);
        }
      }
      _ref = this.water;
      for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
        tile = _ref[_k];
        tile.type = WATER;
      }
      this.land = [];
      for (i = 2; i < 7; i++) {
        low = 1 + ((Math.abs(i - 4) / 2) | 0);
        high = 6 - ((Math.abs(i - 4) / 2) | 0) - (i % 2);
        for (j = low; low <= high ? j < high : j > high; low <= high ? j++ : j--) {
          this.land.push(this.hexes[i][j]);
        }
      }
      tileset = TILESET.slice().shuffle();
      rolls = ROLLS.slice().shuffle();
      _ref2 = this.land;
      _results2 = [];
      for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
        tile = _ref2[_l];
        tile.type = tileset.pop();
        _results2.push(tile.type > DESERT ? tile.roll = rolls.pop() : void 0);
      }
      return _results2;
    };
    Board.prototype.render = function() {
      var XOFFSET, YOFFSET, drawHex, i, j, _ref, _results;
      this.ctx.fillStyle = 'cyan';
      this.ctx.fillRect(0, 0, BOARDWIDTH, BOARDHEIGHT);
      this.ctx.translate(20, 50);
      XOFFSET = TILERADII * 1.5;
      YOFFSET = Math.sin(Math.PI / 3) * TILERADII * 2;
      drawHex = __bind(function(x, y, num) {
        var i;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(x, y);
        this.ctx.moveTo(TILERADII, 0);
        for (i = 0; i < 6; i++) {
          this.ctx.rotate(-(Math.PI * 2) / 6);
          this.ctx.lineTo(TILERADII, 0);
        }
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.restore();
        if (num) {
          num = String(num);
          this.ctx.fillStyle = 'tan';
          this.ctx.beginPath();
          this.ctx.arc(x, y, 15, 0, Math.PI * 2, true);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.save();
          this.ctx.fillStyle = num === "6" || num === "8" ? 'red' : 'black';
          this.ctx.font = "20px Arial";
          this.ctx.translate(x - this.ctx.measureText(num).width / 2, y + 7);
          this.ctx.fillText(num, 0, 0);
          return this.ctx.restore();
        }
      }, this);
      this.ctx.strokeStyle = '1px solid black';
      _results = [];
      for (i = 0, _ref = this.width; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        _results.push((function() {
          var _ref2, _results2;
          _results2 = [];
          for (j = 0, _ref2 = this.height; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
            if (this.hexes[i][j].type > NOTHING) {
              this.ctx.fillStyle = TILECOLORS[this.hexes[i][j].type];
              _results2.push(drawHex(i * XOFFSET, j * YOFFSET + (i % 2 === 0 ? 0 : YOFFSET / 2), this.hexes[i][j].roll));
            }
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    return Board;
  })();
  $(function() {
    var board, ctx;
    ctx = $('#board')[0].getContext('2d');
    $('#board').attr({
      width: BOARDWIDTH,
      height: BOARDHEIGHT
    });
    board = new Board(ctx, 9, 7);
    board.newGame();
    return board.render();
  });
}).call(this);

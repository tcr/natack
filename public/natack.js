(function() {
  var BOARDHEIGHT, BOARDWIDTH, BRICK, Board, BoardHouse, BoardRoad, BoardTile, ClickMap, DESERT, Edge, FOREST, HITBUFFER, Hex, HexMap, MOUNTAIN, NOTHING, PLAIN, PLAYERCOLORS, ROADBUFFER, ROLLS, TILECOLORS, TILERADII, TILESET, Vertex, WATER, WHEAT;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  Array.prototype.shuffle = function() {
    return this.sort(function() {
      return 0.5 - Math.random();
    });
  };
  Array.prototype.random = function() {
    return this[(Math.random() * this.length) | 0];
  };
  BOARDWIDTH = BOARDHEIGHT = 520;
  TILERADII = 40;
  ROADBUFFER = 8;
  HITBUFFER = 3;
  NOTHING = 0;
  WATER = 1;
  DESERT = 2;
  PLAIN = 3;
  BRICK = 4;
  MOUNTAIN = 5;
  FOREST = 6;
  WHEAT = 7;
  TILECOLORS = {
    1: '#00a',
    2: '#EBC79E',
    3: '#5a0',
    4: '#A52A2A',
    5: '#aaa',
    6: '#060',
    7: '#d90'
  };
  TILESET = [PLAIN, PLAIN, PLAIN, PLAIN, BRICK, BRICK, BRICK, FOREST, FOREST, FOREST, FOREST, WHEAT, WHEAT, WHEAT, WHEAT, MOUNTAIN, MOUNTAIN, MOUNTAIN, DESERT];
  ROLLS = [11, 12, 9, 4, 6, 5, 10, 3, 11, 4, 8, 8, 10, 9, 3, 5, 2, 6];
  PLAYERCOLORS = ['black', '#f00', '#00f', '#fff', '#fa0', '#0f0', '#AA6600'];
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
      var x, y, _ref, _ref2, _ref3, _ref4;
      x = this.x, y = this.y;
      if (x % 2 === 0) {
        return [(_ref = this.board.vertices[x / 2]) != null ? _ref[y] : void 0, (_ref2 = this.board.vertices[x / 2]) != null ? _ref2[y + 1] : void 0];
      } else {
        return [(_ref3 = this.board.vertices[(x - 1) / 2]) != null ? _ref3[y] : void 0, (_ref4 = this.board.vertices[(x + 1) / 2]) != null ? _ref4[y] : void 0];
      }
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
      var x, y, _ref, _ref2, _ref3;
      x = this.x, y = this.y;
      return [(_ref = this.board.edges[x * 2]) != null ? _ref[y] : void 0, (_ref2 = this.board.edges[x * 2 + 1]) != null ? _ref2[y] : void 0, (_ref3 = this.board.edges[x * 2 - 1]) != null ? _ref3[y] : void 0];
    };
    Vertex.prototype.getHexes = function() {
      var x, xoffset, y, yoffset, _ref, _ref2, _ref3;
      x = this.x, y = this.y;
      xoffset = x % 2;
      yoffset = y % 2;
      return [(_ref = this.board.hexes[x - 1]) != null ? _ref[(y + xoffset) / 2 - 1] : void 0, (_ref2 = this.board.hexes[x - (1 - yoffset) * xoffset]) != null ? _ref2[(y - 1) / 2] : void 0, (_ref3 = this.board.hexes[x]) != null ? _ref3[(y - xoffset) / 2] : void 0];
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
      var offset, x, y, _ref, _ref10, _ref11, _ref12, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      x = this.x, y = this.y;
      offset = x % 2 === 0 ? +1 : -1;
      if (x % 2 === 0) {
        return [(_ref = this.board.hexes[x]) != null ? _ref[y - 1] : void 0, (_ref2 = this.board.hexes[x + 1]) != null ? _ref2[y] : void 0, (_ref3 = this.board.hexes[x + 1]) != null ? _ref3[y + offset] : void 0, (_ref4 = this.board.hexes[x]) != null ? _ref4[y + 1] : void 0, (_ref5 = this.board.hexes[x - 1]) != null ? _ref5[y + offset] : void 0, (_ref6 = this.board.hexes[x - 1]) != null ? _ref6[y] : void 0];
      } else {
        return [(_ref7 = this.board.hexes[x]) != null ? _ref7[y - 1] : void 0, (_ref8 = this.board.hexes[x + 1]) != null ? _ref8[y + offset] : void 0, (_ref9 = this.board.hexes[x + 1]) != null ? _ref9[y] : void 0, (_ref10 = this.board.hexes[x]) != null ? _ref10[y + 1] : void 0, (_ref11 = this.board.hexes[x - 1]) != null ? _ref11[y] : void 0, (_ref12 = this.board.hexes[x - 1]) != null ? _ref12[y + offset] : void 0];
      }
    };
    Hex.prototype.getVertices = function() {
      var offset, x, y, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      x = this.x, y = this.y;
      offset = x % 2;
      return [(_ref = this.board.vertices[x]) != null ? _ref[2 * y + offset] : void 0, (_ref2 = this.board.vertices[x + 1]) != null ? _ref2[2 * y + offset] : void 0, (_ref3 = this.board.vertices[x + 1]) != null ? _ref3[2 * y + 1 + offset] : void 0, (_ref4 = this.board.vertices[x + 1]) != null ? _ref4[2 * y + 2 + offset] : void 0, (_ref5 = this.board.vertices[x]) != null ? _ref5[2 * y + 2 + offset] : void 0, (_ref6 = this.board.vertices[x]) != null ? _ref6[2 * y + 1 + offset] : void 0];
    };
    Hex.prototype.getEdges = function() {
      var offset, x, y, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      x = this.x, y = this.y;
      offset = x % 2;
      return [(_ref = this.board.edges[2 * x + 1]) != null ? _ref[2 * y + offset] : void 0, (_ref2 = this.board.edges[2 * x + 2]) != null ? _ref2[2 * y + offset] : void 0, (_ref3 = this.board.edges[2 * x + 2]) != null ? _ref3[2 * y + 1 + offset] : void 0, (_ref4 = this.board.edges[2 * x + 1]) != null ? _ref4[2 * y + 2 + offset] : void 0, (_ref5 = this.board.edges[2 * x]) != null ? _ref5[2 * y + 1 + offset] : void 0, (_ref6 = this.board.edges[2 * x]) != null ? _ref6[2 * y + offset] : void 0];
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
    return HexMap;
  })();
  BoardRoad = (function() {
    __extends(BoardRoad, Edge);
    function BoardRoad() {
      BoardRoad.__super__.constructor.apply(this, arguments);
    }
    BoardRoad.prototype.road = 0;
    return BoardRoad;
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
  BoardHouse = (function() {
    __extends(BoardHouse, Vertex);
    function BoardHouse() {
      BoardHouse.__super__.constructor.apply(this, arguments);
    }
    BoardHouse.prototype.house = 0;
    return BoardHouse;
  })();
  Board = (function() {
    var XOFFSET, YOFFSET;
    __extends(Board, HexMap);
    Board.prototype.HexClass = BoardTile;
    Board.prototype.EdgeClass = BoardRoad;
    Board.prototype.VertexClass = BoardHouse;
    function Board(ctx, cmap, width, height) {
      this.ctx = ctx;
      this.cmap = cmap;
      this._renderHex = __bind(this._renderHex, this);
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
    XOFFSET = TILERADII * 1.5;
    YOFFSET = Math.sin(Math.PI / 3) * TILERADII * 2;
    Board.prototype.renderWidth = function() {
      return TILERADII * 2 + (this.width - 1) * XOFFSET;
    };
    Board.prototype.renderHeight = function() {
      return this.height * YOFFSET;
    };
    Board.prototype.render = function() {
      var e, i, j, tile, tr, v, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4;
      this.cmap.reset();
      this.ctx.fillStyle = '#aef';
      this.ctx.fillRect(0, 0, BOARDWIDTH, BOARDHEIGHT);
      this.ctx.save();
      tr = new Transform();
      tr.translate(TILERADII, YOFFSET / 2);
      tr.translate((BOARDWIDTH - this.renderWidth()) / 2, (BOARDHEIGHT - this.renderHeight()) / 2);
      for (i = 0, _ref = this.width; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        for (j = 0, _ref2 = this.height; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
          this._renderHex(tr, this.hexes[i][j]);
        }
      }
      _ref3 = this.land;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        tile = _ref3[_i];
        for (e = 0; e < 6; e++) {
          this._renderRoad(tr, tile, e);
        }
      }
      _ref4 = this.land;
      for (_j = 0, _len2 = _ref4.length; _j < _len2; _j++) {
        tile = _ref4[_j];
        for (v = 0; v < 6; v++) {
          this._renderHouse(tr, tile, v);
        }
      }
      return this.ctx.restore();
    };
    Board.prototype._renderRoad = function(tr, hex, e) {
      var edge, tr2, x, x1, x2, y, y1, y2, _ref, _ref2;
      edge = hex.getEdges()[e];
      x = hex.x * XOFFSET;
      y = hex.y * YOFFSET + (hex.x % 2 === 0 ? 0 : YOFFSET / 2);
      tr2 = tr.clone();
      tr2.translate(x, y);
      tr2.rotate(-Math.PI * 2 / 3);
      tr2.rotate((Math.PI * 2) * e / 6);
      tr2.translate(TILERADII, 0);
      tr2.rotate(Math.PI / 6);
      if (edge.road) {
        this.ctx.save();
        tr2.apply(this.ctx);
        this.ctx.fillStyle = PLAYERCOLORS[edge.road];
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-3, ROADBUFFER, 6, TILERADII - ROADBUFFER * 2);
        this.ctx.fillRect(-3, ROADBUFFER, 6, TILERADII - ROADBUFFER * 2);
        this.ctx.restore();
      }
      _ref = tr2.transformPoint(-3 - HITBUFFER, 0), x1 = _ref[0], y1 = _ref[1];
      _ref2 = tr2.transformPoint(-3 + 6 + HITBUFFER, TILERADII), x2 = _ref2[0], y2 = _ref2[1];
      return this.cmap.polygon([[x1, y1], [x2, y1], [x2, y2], [x1, y2]], __bind(function() {
        edge.road = [1, 2, 3, 4, 5, 6].random();
        return this.render();
      }, this));
    };
    Board.prototype._renderHouse = function(tr, hex, v) {
      var tr2, vertex, x, y, _ref;
      vertex = hex.getVertices()[v];
      x = hex.x * XOFFSET;
      y = hex.y * YOFFSET + (hex.x % 2 === 0 ? 0 : YOFFSET / 2);
      tr2 = tr.clone();
      tr2.translate(x, y);
      tr2.rotate(-Math.PI * 2 / 3);
      tr2.rotate((Math.PI * 2) * v / 6);
      if (vertex.house) {
        this.ctx.save();
        tr2.apply(this.ctx);
        this.ctx.fillStyle = PLAYERCOLORS[vertex.house];
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(TILERADII, 0, 5, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
      }
      return (_ref = this.cmap).circle.apply(_ref, __slice.call(tr2.transformPoint(TILERADII, 0)).concat([5 + HITBUFFER], [__bind(function() {
        vertex.house = [1, 2, 3, 4, 5, 6].random();
        return this.render();
      }, this)]));
    };
    Board.prototype._renderHex = function(tr, hex) {
      var color, coords, i, num, tr2, tr3, x, y;
      if (hex.type === NOTHING) {
        return;
      }
      x = hex.x * XOFFSET;
      y = hex.y * YOFFSET + (hex.x % 2 === 0 ? 0 : YOFFSET / 2);
      num = hex.roll;
      color = TILECOLORS[hex.type];
      tr2 = tr.clone();
      tr2.translate(x, y);
      this.ctx.save();
      tr2.apply(this.ctx);
      this.ctx.fillStyle = color;
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
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
        this.ctx.save();
        tr2.apply(this.ctx);
        this.ctx.fillStyle = 'tan';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 15, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = num === "6" || num === "8" ? 'red' : 'black';
        this.ctx.font = "20px Arial";
        this.ctx.translate(-this.ctx.measureText(num).width / 2, 7);
        this.ctx.fillText(num, 0, 0);
        this.ctx.restore();
      }
      tr3 = tr2.clone();
      coords = [];
      for (i = 0; i < 6; i++) {
        tr3.rotate(-(Math.PI * 2) / 6);
        coords.push(tr3.transformPoint(TILERADII, 0));
      }
      return this.cmap.polygon(coords, function() {
        return console.log(hex, hex.x, hex.y);
      });
    };
    return Board;
  })();
  ClickMap = (function() {
    function ClickMap(elem) {
      this.elem = elem;
    }
    ClickMap.prototype.reset = function() {
      return $(this.elem).html('');
    };
    ClickMap.prototype.circle = function(x, y, r, cb) {
      return $(this.elem).prepend('<area shape="circle" coords="' + [x, y, r] + '">').children(':first').click(cb);
    };
    ClickMap.prototype.rect = function(x, y, w, h, cb) {
      return $(this.elem).prepend('<area shape="rect" coords="' + [x, y, x + w, y + h] + '">').children(':first').click(cb);
    };
    ClickMap.prototype.polygon = function(coords, cb) {
      return $(this.elem).prepend('<area shape="polygon" coords="' + coords + '">').children(':first').click(cb);
    };
    return ClickMap;
  })();
  $(function() {
    var board, cmap, ctx;
    ctx = $('#board-canvas')[0].getContext('2d');
    $('#board-canvas').attr({
      width: BOARDWIDTH,
      height: BOARDHEIGHT
    });
    cmap = new ClickMap($('#board-collision-map')[0]);
    board = new Board(ctx, cmap, 9, 7);
    board.newGame();
    board.hexes[4][2].getEdges()[2].road = 1;
    return board.render();
  });
}).call(this);

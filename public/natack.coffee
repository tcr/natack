# Base library
# ------------

Array.prototype.shuffle = -> this.sort -> 0.5 - Math.random()
Array.prototype.random = -> @[(Math.random()*@length)|0]

# Constants
# ---------

# Drawing constants.

BOARDWIDTH = BOARDHEIGHT = 520
TILERADII = 40
ROADBUFFER = 8
HITBUFFER = 3

# Tile constants.

NOTHING = 0
WATER = 1
DESERT = 2

PLAIN = 3
BRICK = 4
MOUNTAIN = 5
FOREST = 6
WHEAT = 7

TILECOLORS =
	1: '#00a'
	2: '#EBC79E'
	3: '#5a0'
	4: '#A52A2A'
	5: '#aaa'
	6: '#060'
	7: '#d90'

TILESET = [
	PLAIN, PLAIN, PLAIN, PLAIN
	BRICK, BRICK, BRICK
	FOREST, FOREST, FOREST, FOREST
	WHEAT, WHEAT, WHEAT, WHEAT
	MOUNTAIN, MOUNTAIN, MOUNTAIN
	DESERT
]
ROLLS = [11, 12, 9, 4, 6, 5, 10, 3, 11, 4, 8, 8, 10, 9, 3, 5, 2, 6]

PLAYERCOLORS = ['black', '#f00', '#00f', '#fff', '#fa0', '#0f0', '#AA6600']

###

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

###

class Edge
	constructor: (@board, @x, @y) ->

	getEnds: ->
		{x, y} = this
		return if x % 2 == 0
			[
				@board.vertices[x/2]?[y]
				@board.vertices[x/2]?[y+1]
			]
		else
			[
				@board.vertices[(x-1)/2]?[y]
				@board.vertices[(x+1)/2]?[y]
			]

class Vertex
	constructor: (@board, @x, @y) ->

	getEdges: ->
		{x, y} = this
		return [
			@board.edges[x*2]?[y]
			@board.edges[x*2+1]?[y]
			@board.edges[x*2-1]?[y]
		]
	
	getHexes: ->
		{x, y} = this
		xoffset = x % 2
		yoffset = y % 2
		return [
			@board.hexes[x-1]?[(y+xoffset)/2-1]
			@board.hexes[x-(1-yoffset)*xoffset]?[(y-1)/2]
			@board.hexes[x]?[(y-xoffset)/2]
		]

class Hex
	constructor: (@board, @x, @y) ->
	
	getNeighbors: ->
		{x, y} = this
		offset = if x % 2 == 0 then +1 else -1
		return if x % 2 == 0
			[
				@board.hexes[x]?[y-1]
				@board.hexes[x+1]?[y]
				@board.hexes[x+1]?[y+offset]
				@board.hexes[x]?[y+1]
				@board.hexes[x-1]?[y+offset]
				@board.hexes[x-1]?[y]
			]
		else
			[
				@board.hexes[x]?[y-1]
				@board.hexes[x+1]?[y+offset]
				@board.hexes[x+1]?[y]
				@board.hexes[x]?[y+1]
				@board.hexes[x-1]?[y]
				@board.hexes[x-1]?[y+offset]
			]
	
	getVertices: ->
		{x, y} = this
		offset = x % 2
		return [
			@board.vertices[x]?[2*y+offset]
			@board.vertices[x+1]?[2*y+offset]
			@board.vertices[x+1]?[2*y+1+offset]
			@board.vertices[x+1]?[2*y+2+offset]
			@board.vertices[x]?[2*y+2+offset]
			@board.vertices[x]?[2*y+1+offset]
		]

	getEdges: ->
		{x, y} = this
		offset = x % 2
		return [
			@board.edges[2*x+1]?[2*y+offset]
			@board.edges[2*x+2]?[2*y+offset]
			@board.edges[2*x+2]?[2*y+1+offset]
			@board.edges[2*x+1]?[2*y+2+offset]
			@board.edges[2*x]?[2*y+1+offset]
			@board.edges[2*x]?[2*y+offset]
		]

class HexMap
	HexClass: Hex
	EdgeClass: Edge
	VertexClass: Vertex

	constructor: (@width, @height) ->
		@hexes = for i in [0...width]
			for j in [0...height]
				new @HexClass this, i, j

		@edges = for i in [0...(width+1)*2]
			for j in [0...(height+1)*2]
				new @EdgeClass this, i, j
		@vertices = for i in [0...(width+1)*2]
			for j in [0...(height+1)*2]
				new @VertexClass this, i, j

# Game Board
# ----------

class BoardRoad extends Edge
	road: 0

class BoardTile extends Hex
	type: NOTHING
	roll: 0

class BoardHouse extends Vertex
	house: 0

class Board extends HexMap
	HexClass: BoardTile
	EdgeClass: BoardRoad
	VertexClass: BoardHouse

	constructor: (@ctx, @cmap, width, height) ->
		super width, height
	
	newGame: ->
		# Assign water tiles.
		@water = []
		for i in [1...8]
			low = (Math.abs(i-4)/2)|0
			high = 7 - ((Math.abs(i-4)/2)|0) - (i % 2)
			range = if i in [1, 7] then [low...high] else [low, high-1]
			for j in range
				@water.push @hexes[i][j]
		for tile in @water
			tile.type = WATER
		
		# Assign land tiles.
		@land = []
		for i in [2...7]
			low = 1 + ((Math.abs(i-4)/2)|0)
			high = 6 - ((Math.abs(i-4)/2)|0) - (i % 2)
			for j in [low...high]
				@land.push @hexes[i][j]
		
		# Distribute lands/rolls
		tileset = TILESET.slice().shuffle()
		rolls = ROLLS.slice().shuffle()
		for tile in @land
			tile.type = tileset.pop()
			if tile.type > DESERT
				tile.roll = rolls.pop()
	
	# Tile drawing constants.		
	XOFFSET = TILERADII*1.5
	YOFFSET = Math.sin(Math.PI/3)*TILERADII*2

	renderWidth: -> TILERADII*2 + (@width-1)*XOFFSET
	renderHeight: -> @height*YOFFSET
		
	render: ->
		# Reset hit map.
		@cmap.reset()
		# Reset canvas.
		@ctx.fillStyle = '#aef'
		@ctx.fillRect 0, 0, BOARDWIDTH, BOARDHEIGHT
		
		@ctx.save()
		tr = new Transform()
		# Half-tile offsets.
		tr.translate TILERADII, YOFFSET/2
		# Center tiles.
		tr.translate (BOARDWIDTH - @renderWidth())/2, (BOARDHEIGHT - @renderHeight())/2
		# Draw tiles.
		for i in [0...@width]
			for j in [0...@height]
				@_renderHex tr, @hexes[i][j]
		for tile in @land
			for e in [0...6]
				@_renderRoad tr, tile, e
		for tile in @land
			for v in [0...6]
				@_renderHouse tr, tile, v
		# Done.
		@ctx.restore()
	
	_renderRoad: (tr, hex, e) ->
		edge = hex.getEdges()[e]

		x = hex.x*XOFFSET
		y = hex.y*YOFFSET + (if hex.x % 2 == 0 then 0 else YOFFSET/2)

		# transforms
		tr2 = tr.clone()
		tr2.translate x, y
		tr2.rotate -Math.PI*2/3
		tr2.rotate (Math.PI*2)*e/6
		tr2.translate TILERADII, 0
		tr2.rotate Math.PI/6

		# Draw road.
		if edge.road
			@ctx.save()
			tr2.apply @ctx
			@ctx.fillStyle = PLAYERCOLORS[edge.road]
			@ctx.strokeStyle = 'black'
			@ctx.lineWidth = 2
			@ctx.strokeRect -3, ROADBUFFER, 6, TILERADII - ROADBUFFER*2
			@ctx.fillRect -3, ROADBUFFER, 6, TILERADII - ROADBUFFER*2
			@ctx.restore()

		# Rectangle hit map.
		[x1, y1] = tr2.transformPoint -3 - HITBUFFER, 0
		[x2, y2] = tr2.transformPoint -3 + 6 + HITBUFFER, TILERADII
		@cmap.polygon [[x1, y1], [x2, y1], [x2, y2], [x1, y2]], =>
			edge.road = [1..6].random()
			@render()
	
	_renderHouse: (tr, hex, v) ->
		vertex = hex.getVertices()[v]

		x = hex.x*XOFFSET
		y = hex.y*YOFFSET + (if hex.x % 2 == 0 then 0 else YOFFSET/2)

		# transforms
		tr2 = tr.clone()
		tr2.translate x, y
		tr2.rotate -Math.PI*2/3
		tr2.rotate (Math.PI*2)*v/6

		# Draw house.
		if vertex.house
			@ctx.save()
			tr2.apply @ctx
			@ctx.fillStyle = PLAYERCOLORS[vertex.house]
			@ctx.strokeStyle = 'black'
			@ctx.lineWidth = 2
			@ctx.beginPath()
			@ctx.arc TILERADII, 0, 5, 0, Math.PI*2, true
			@ctx.closePath()
			@ctx.fill()
			@ctx.stroke()
			@ctx.restore()

		# Circular hit map.
		@cmap.circle (tr2.transformPoint TILERADII, 0)..., 5+HITBUFFER, =>
			vertex.house = [1..6].random()
			@render()
	
	_renderHex: (tr, hex) =>
		# Get hex
		return if hex.type == NOTHING

		# Get hex constants, center of hex coords.
		x = hex.x*XOFFSET
		y = hex.y*YOFFSET + (if hex.x % 2 == 0 then 0 else YOFFSET/2)
		num = hex.roll
		color = TILECOLORS[hex.type]

		# Move to tile origin.
		tr2 = tr.clone()
		tr2.translate x, y

		# Draw hex.
		@ctx.save()
		tr2.apply @ctx
		@ctx.fillStyle = color
		@ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
		@ctx.lineWidth = 1
		@ctx.beginPath()
		@ctx.moveTo TILERADII, 0
		for i in [0...6]
			@ctx.rotate -(Math.PI*2)/6
			@ctx.lineTo TILERADII, 0
		@ctx.stroke()
		@ctx.fill()
		@ctx.restore()

		# Draw roll indicator
		if num
			num = String(num)

			@ctx.save()
			tr2.apply @ctx

			@ctx.fillStyle = 'tan'
			@ctx.beginPath();
			@ctx.arc 0, 0, 15, 0, Math.PI*2, true
			@ctx.closePath();
			@ctx.fill();

			@ctx.fillStyle = if num in ["6", "8"] then 'red' else 'black' 
			@ctx.font = "20px Arial"
			@ctx.translate -@ctx.measureText(num).width/2, 7
			@ctx.fillText num, 0, 0
			@ctx.restore()

		# Hexagon hit map.
		tr3 = tr2.clone()
		coords = []
		for i in [0...6]
			tr3.rotate -(Math.PI*2)/6
			coords.push tr3.transformPoint TILERADII, 0
		@cmap.polygon coords, ->
			console.log hex, hex.x, hex.y

# Click Map
# ---------

class ClickMap
	constructor: (@elem) ->

	reset: -> $(@elem).html('')

	circle: (x, y, r, cb) ->
		$(@elem)
			.prepend('<area shape="circle" coords="' + [x,y,r] + '">')
			.children(':first').click cb
	rect: (x, y, w, h, cb) ->
		$(@elem)
			.prepend('<area shape="rect" coords="' + [x,y,x+w,y+h] + '">')
			.children(':first').click cb
	polygon: (coords, cb) ->
		$(@elem)
			.prepend('<area shape="polygon" coords="' + coords + '">')
			.children(':first').click cb

# Initialize
# ----------

$ ->
	ctx = $('#board-canvas')[0].getContext '2d'
	$('#board-canvas').attr width: BOARDWIDTH, height: BOARDHEIGHT

	cmap = new ClickMap $('#board-collision-map')[0]

	# Create board.
	board = new Board ctx, cmap, 9, 7
	board.newGame()

	board.hexes[4][2].getEdges()[2].road = 1

	board.render()
		
# Base library
# ------------

Array.prototype.shuffle = -> this.sort -> 0.5 - Math.random()

# Constants
# ---------

# Drawing constants.

BOARDWIDTH = BOARDHEIGHT = 500
TILERADII = 40

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
	1: 'blue'
	2: 'tan'
	3: '#0f0'
	4: '#A52A2A'
	5: 'lightgray'
	6: 'darkgreen'
	7: 'gold'

TILESET = [
	PLAIN, PLAIN, PLAIN, PLAIN
	BRICK, BRICK, BRICK
	FOREST, FOREST, FOREST, FOREST
	WHEAT, WHEAT, WHEAT, WHEAT
	MOUNTAIN, MOUNTAIN, MOUNTAIN
	DESERT
]
ROLLS = [11, 12, 9, 4, 6, 5, 10, 3, 11, 4, 8, 8, 10, 9, 3, 5, 2, 6]

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
	getEnds: -> @board.getEnds this

class Vertex
	constructor: (@board, @x, @y) ->
	getEdges: -> @board.getEdges this
	getHexes: -> @board.getHexes this

class Hex
	constructor: (@board, @x, @y) ->
	getNeighbors: -> @board.getNeighbors this
	getVertices: -> @board.getVertices this
	getEdges: -> @board.getEdges this

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
	
	getNeighbors: (hex) ->
		{x, y} = hex
		offset = if x % 2 == 0 then +1 else -1
		return if x % 2 == 0
			[
				@hexes[x]?[y-1]
				@hexes[x+1]?[y]
				@hexes[x+1]?[y+offset]
				@hexes[x]?[y+1]
				@hexes[x-1]?[y+offset]
				@hexes[x-1]?[y]
			]
		else
			[
				@hexes[x]?[y-1]
				@hexes[x+1]?[y+offset]
				@hexes[x+1]?[y]
				@hexes[x]?[y+1]
				@hexes[x-1]?[y]
				@hexes[x-1]?[y+offset]
			]
	
	getVertices: (hex) ->
		{x, y} = hex
		offset = x % 2
		return [
			@vertices[x+1]?[2*y+offset]
			@vertices[x+1]?[2*y+1+offset]
			@vertices[x+1]?[2*y+2+offset]
			@vertices[x]?[2*y+2+offset]
			@vertices[x]?[2*y+1+offset]
			@vertices[x]?[2*y+offset]
		]

	getEdges: (hex) ->
		{x, y} = hex
		offset = x % 2
		return [
			@edges[2*x]?[2*y+offset]
			@edges[2*x]?[2*y+1+offset]
			@edges[2*x+1]?[2*y+offset]
			@edges[2*x+1]?[2*y+2+offset]
			@edges[2*x+2]?[2*y+offset]
			@edges[2*x+2]?[2*y+1+offset]
		]

	getEnds: (edge) ->
		{x, y} = edge

		return if x % 2 == 0
			[
				@vertices[x/2]?[y]
				@vertices[x/2]?[y+1]
			]
		else
			[
				@vertices[(x-1)/2]?[y]
				@vertices[(x+1)/2]?[y]
			]
	
	getEdges: (vertex) ->
		{x, y} = vertex
		return [
			@edges[x*2]?[y]
			@edges[x*2+1]?[y]
			@edges[x*2-1]?[y]
		]
	
	getHexes: (vertex) ->
		{x, y} = vertex
		xoffset = x % 2
		yoffset = y % 2
		return [
			@hexes[x-1]?[(y+xoffset)/2-1]
			@hexes[x-(1-yoffset)*xoffset]?[(y-1)/2]
			@hexes[x]?[(y-xoffset)/2]
		]

# Game Board
# ----------

class BoardTile extends Hex
	type: NOTHING
	roll: 0

class Board extends HexMap
	HexClass: BoardTile

	constructor: (@ctx, width, height) ->
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
		
	
	render: ->
		# Background.

		@ctx.fillStyle = 'cyan'
		@ctx.fillRect 0, 0, BOARDWIDTH, BOARDHEIGHT
		
		# Center board.

		#ctx.translate BOARDWIDTH/2, BOARDHEIGHT/2
		@ctx.translate 20, 50

		# Draw tiles.

		XOFFSET = TILERADII*1.5
		YOFFSET = Math.sin(Math.PI/3)*TILERADII*2

		drawHex = (x, y, num) =>
			@ctx.save()
			@ctx.beginPath()
			@ctx.translate x, y
			@ctx.moveTo TILERADII, 0
			for i in [0...6]
				@ctx.rotate -(Math.PI*2)/6
				@ctx.lineTo TILERADII, 0
			@ctx.stroke()
			@ctx.fill()
			@ctx.restore()

			if num
				num = String(num)
				@ctx.save()
				@ctx.fillStyle = if num in ["6", "8"] then 'red' else 'black' 
				@ctx.font = "20px Arial"
				@ctx.translate x - @ctx.measureText(num).width/2, y + 7
				@ctx.fillText num, 0, 0
				@ctx.restore()

		@ctx.strokeStyle = '1px solid black'
		for i in [0...@width]
			for j in [0...@height] when @hexes[i][j].type > NOTHING
				@ctx.fillStyle = TILECOLORS[@hexes[i][j].type]
				drawHex i*XOFFSET, j*YOFFSET + (if i % 2 == 0 then 0 else YOFFSET/2), @hexes[i][j].roll

# Initialize
# ----------

$ ->
	ctx = $('#board')[0].getContext '2d'
	$('#board').attr width: BOARDWIDTH, height: BOARDHEIGHT

	# Create board.
	board = new Board ctx, 9, 7
	board.newGame()
	board.render()
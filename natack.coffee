NOTHING = 0
WATER = 1
DESERT = 2

PLAIN = 3
BRICK = 4
MOUNTAIN = 5
FOREST = 6
WHEAT = 7

colors =
	1: 'blue'
	2: 'tan'
	3: '#0f0'
	4: '#A52A2A'
	5: 'lightgray'
	6: 'darkgreen'
	7: 'gold'

evenBoard = [
 [0, 1, 1, 0]
 [1, 2, 2, 1]
 [1, 2, 2, 1]
 [1, 2, 2, 1]
 [1, 2, 2, 1]
 [0, 1, 1, 0]
]

oddBoard = [
 [0, 1, 0]
 [1, 2, 1]
 [2, 2, 2]
 [2, 2, 2]
 [2, 2, 2]
 [1, 2, 1]
 [0, 1, 0]
]

evenPlay = []; evenRoll = []
oddPlay = []; oddRoll = []

houses = [
 [0, 0, 0, 0, 0, 0]
 [0, 0, 0, 0, 0, 0]
 [0, 0, 0, 0, 0, 0]
 [0, 0, 0, 0, 0, 0]
 [0, 0, 0, 0, 0, 0]
 [0, 0, 0, 0, 0, 0]
 [0, 0, 0, 0, 0, 0]
 [0, 0, 0, 0, 0, 0]
 [0, 0, 0, 0, 0, 0]
 [0, 0, 0, 0, 0, 0]
 [0, 0, 0, 0, 0, 0]
]

BOARDWIDTH = BOARDHEIGHT = 500

$ ->
	ctx = $('#board')[0].getContext '2d'
	$('#board').attr width: BOARDWIDTH, height: BOARDHEIGHT

	YOFFSET = HEIGHT = 68
	XOFFSET = 60
	RADII = 40
	WIDTH = RADII*2

	drawHex = (x, y, num) ->
		ctx.save()
		ctx.beginPath()
		ctx.translate x, y
		ctx.moveTo RADII, 0
		for i in [0...6]
			ctx.rotate -(Math.PI*2)/6
			ctx.lineTo RADII, 0
		ctx.stroke()
		ctx.fill()
		ctx.restore()

		if num
			num = String(num)
			ctx.save()
			ctx.fillStyle = if num in ["6", "8"] then 'red' else 'black' 
			ctx.font = "20px Arial"
			ctx.translate x - ctx.measureText(num).width/2, y + 7
			ctx.fillText num, 0, 0
			ctx.restore()

	ctx.fillStyle = 'cyan'
	ctx.fillRect 0, 0, BOARDWIDTH, BOARDHEIGHT
	
	ctx.translate BOARDWIDTH/2, BOARDHEIGHT/2

	# Draw ocean.

	ctx.strokeStyle = '1px solid black'

	ctx.save()
	ctx.translate -((evenBoard[0].length + .5)*WIDTH)/2, -(evenBoard.length*HEIGHT)/2
	for i in [0...evenBoard.length]
		for j in [0...evenBoard[i].length] when evenBoard[i][j] == 1
			ctx.fillStyle = colors[evenBoard[i][j]]
			drawHex XOFFSET*2*j, YOFFSET*(i+.5)
	ctx.restore()
	
	ctx.save()
	ctx.translate -(oddBoard[0].length*WIDTH)/2, -((oddBoard.length - 1)*HEIGHT)/2
	for i in [0...oddBoard.length]
		for j in [0...oddBoard[i].length] when oddBoard[i][j] == 1
			ctx.fillStyle = colors[oddBoard[i][j]]
			drawHex XOFFSET*2*j, YOFFSET*i
	ctx.restore()

	# Randomize even/odd boards

	tiles = [
		PLAIN, PLAIN, PLAIN, PLAIN
		BRICK, BRICK, BRICK
		FOREST, FOREST, FOREST, FOREST
		WHEAT, WHEAT, WHEAT, WHEAT
		MOUNTAIN, MOUNTAIN, MOUNTAIN
		DESERT
	].sort -> 0.5 - Math.random()

	rolls = [11, 12, 9, 4, 6, 5, 10, 3, 11, 4, 8, 8, 10, 9, 3, 5, 2, 6].sort -> 0.5 - Math.random()

	evenPlay = for i in [0...4]
		for j in [0...2]
			tiles.pop()
	oddPlay = for i in [0...5]
		for j in [0...3]
			if i in [0, 4] and j in [0, 2] then 0 else tiles.pop()

	evenRoll = for i in [0...4]
		for j in [0...2]
			if evenPlay[i][j] > DESERT then rolls.pop() else 0
	oddRoll = for i in [0...5]
		for j in [0...3]
			if oddPlay[i][j] > DESERT then rolls.pop() else 0
	
	console.log JSON.stringify evenRoll
	console.log JSON.stringify oddRoll
	console.log JSON.stringify rolls

	# Draw Playable tiles.

	ctx.save()
	ctx.translate -((evenBoard[0].length + .5)*WIDTH)/2, -(evenBoard.length*HEIGHT)/2
	for i in [0...evenBoard.length]
		for j in [0...evenBoard[i].length] when evenBoard[i][j] == 2
			ctx.fillStyle = colors[evenPlay[i-1][j-1]]
			drawHex XOFFSET*2*j, YOFFSET*(i+.5), evenRoll[i-1][j-1]
	ctx.restore()
	
	ctx.save()
	ctx.translate -(oddBoard[0].length*WIDTH)/2, -((oddBoard.length - 1)*HEIGHT)/2
	for i in [0...oddBoard.length]
		for j in [0...oddBoard[i].length] when oddBoard[i][j] == 2
			ctx.fillStyle = colors[oddPlay[i-1][j]]
			drawHex XOFFSET*2*j, YOFFSET*i, oddRoll[i-1][j]
	ctx.restore()

	ctx.translate 
	ctx.fillStyle = "white"
	ctx.fillRect -10, -10, 10, 10

###
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
###
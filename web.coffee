express = require 'express'

app = express.createServer express.logger()
app.use express.static __dirname + '/public'

app.get '/', (req, res) ->
	res.send '<h1><a href="natack.html">Play online</a></h1>'

port = process.env.PORT || 3000
app.listen port, ->
	console.log "Listening on " + port
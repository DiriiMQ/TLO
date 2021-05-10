'use scrict'
const express = require("express")
const app = express();
const http = require("http")
const fs = require("fs")
const _path = require('path')
const bodyParser = require('body-parser')
const localIpV4Address = require("local-ipv4-address")

const server = http.createServer(app).listen(80, () => {
	localIpV4Address().then(function(ipAddress){
		console.log(ipAddress)
		console.log("Running")
	})
})

const io = require("socket.io").listen(server)

///middleware

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
	res.json = (obj) => {
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify(obj))
	}
	next()
})

io.on("connection", (socket) => {
	socket.on("message", (msg) => {
		io.emit("message", msg)
	})
	socket.on("disconnected", () => {
		io.emit("shit")
	})
})

app.use(express.static("public"))

app.get('/', (req, res) => {
	return res.sendFile(__dirname + '/public/templates/aboutMe.html')
})

app.get('/index', (req, res) => {
	return res.sendFile(__dirname + '/public/templates/index.html')
})

app.get('/controller', (req, res) => {
	return res.sendFile(__dirname + '/public/templates/control.html')
})

app.get('/viewer/:rnd', (req, res) => {
	try{
		return res.sendFile(__dirname + '/public/templates/rounds/' + req.params.rnd + '_viewer.html')
	}
	catch(e){
		return e
	}
})

app.get('/mc/:rnd', (req, res) => {
	try{
		return res.sendFile(__dirname + '/public/templates/rounds/' + req.params.rnd + '_mc.html')
	}
	catch(e){
		return e
	}
})

app.get('/contestant/:rnd/:id', (req, res) => {
	try{
		return res.sendFile(__dirname + '/public/templates/rounds/' + req.params.rnd + '_' + req.params.id + '_contestant.html')
	}
	catch(e){
		return e
	}
})

app.get('/summary', (req, res) => {
	return res.sendFile(__dirname + '/public/templates/summary.html')
})

app.get('/apix/update_file', (req, res) => {
	var path = __dirname + '/public/' + req.query.file
	var data = req.query.data
	fs.writeFile(path, data, (err) => {if(err) console.log(err)})
	res.status(200).send('OK')
})

app.get('/apix/read_file', (req, res) => {
	// console.log(req)
	var path = _path.resolve(__dirname, './public/' + req.query.file)
	// console.log(path)
	try{
		let data = fs.readFileSync(path, {encoding: 'utf-8'}).toString()
		// console.log(data)
		res.end(data)

	}
	catch(e){
		console.log(e);
	}
})

app.get('/test', (req, res) => {
	return res.sendFile(__dirname + '/public/templates/test.html')
})

app.post('/apix/read_file', (req, res) => {
	// console.log(req.body.file)
	var path= _path.resolve(__dirname, './public/' + req.body.file)
	try{
		let data = fs.readFileSync(path, {encoding: 'utf-8'}).toString()
		// console.log(data)
		res.end(data)
	}
	catch(err){console.log(err)}
})


app.post('/apix/update_file', (req, res) => {
	var path = _path.resolve(__dirname, './public/' + req.body.file)
	var data = req.body.data
	fs.writeFileSync(path, data, (err) => {if(err) console.log(err)})
	res.status(200).send('OK')
})

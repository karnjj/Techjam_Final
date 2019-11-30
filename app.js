const express = require('express')
const bodyParser = require("body-parser")
var logger = require('morgan');
require('dotenv').config()
var app = express()
var PORT = process.env.PORT || 8000
var DEC = process.env.DECIMAL_PLACES || 2
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended : true
}))
app.use(logger('dev'));
var fi_pos = {}
var se_pos = {}
app.post('/distance', (req,res) => {
	//console.log(req);
	var data = req.body
	console.log(data);
	fi_pos = data.first_pos
	se_pos = data.second_pos
	var absX = Math.abs(fi_pos.x-se_pos.x) 
	var absY = Math.abs(fi_pos.y-se_pos.y)
	var dist = Math.sqrt(absX*absX+absY*absY)
	if(!Number.isInteger(dist)) dist = Number(dist.toFixed(3))
	res.status(200).json({
		distance : dist
	}) 
	
	
})

app.listen(PORT,() => {
	console.log("Starting server at PORT " + PORT)
})

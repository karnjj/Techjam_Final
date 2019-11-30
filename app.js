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
var robot = {}
var distance = function(a,b) {
	var absX = Math.abs(a.x-b.x) 
	var absY = Math.abs(a.y-b.y)
	return Math.sqrt(absX*absX+absY*absY)
}
app.post('/distance', (req,res) => {
	var data = req.body
	console.log(data);
	fi_pos = data.first_pos
	se_pos = data.second_pos
	if(typeof(fi_pos) == 'string') {
		var txt = fi_pos.split('#')
		fi_pos = robot[txt[1]]
	}
	if(typeof(se_pos) == 'string') {
		var txt = se_pos.split('#')
		se_pos = robot[txt[1]]
	}
	var absX = Math.abs(fi_pos.x-se_pos.x) 
	var absY = Math.abs(fi_pos.y-se_pos.y)
	var dist
	if(data.metric === 'manhattan') dist = absX + absY
	else dist = distance(fi_pos,se_pos)
	res.status(200).json({
		distance : dist.toFixed(3)
	}) 
})
app.put('/robot/:id/position',(req,res) => {
	var data = req.body;
	var id = req.params.id;
	robot[id] = data.position
	res.status(204).send('')
})
app.get('/robot/:id/position',(req,res) => {
	var id = req.params.id;
	if(robot[id] === undefined) res.status(404).send('')
	else res.json({
		position : robot[id]
	})
})
app.post('/nearest',(req,res) => {
	var data = req.body
	var arr = []
	var ref = data.ref_position
	var minn = Number.MAX_SAFE_INTEGER
	var idx = 1000000
	for(var e in robot) {
		var dist  = distance(ref,robot[e])
		//console.log(e  + "  " + dist);
		if(minn > dist) {
			minn = dist
			idx = e
		}else if(minn == dist && e < idx) idx = e
	}
	if(idx!=1000000)arr.push(Number(idx))
	//console.log(idx);
	res.json({
		robot_ids : arr
	})
})
app.listen(PORT,() => {
	console.log("Starting server at PORT " + PORT)
})

const express = require('express')
const bodyParser = require("body-parser")
var logger = require('morgan');
require('dotenv').config()
var app = express()
var PORT = process.env.PORT || 8000
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended : true
}))
app.use(logger('dev'));
var fi_pos = {}
var se_pos = {}
var robot = {}
var point = []
var distance = function(a,b) {
	var absX = Math.abs(a.x-b.x) 
	var absY = Math.abs(a.y-b.y)
	return Math.sqrt(absX*absX+absY*absY)
}
var closestpair = function(l,r) {
	if(r-l+1 == 2) return distance(point[l],point[r])
	if(r-l+1 == 1) return Number.MAX_SAFE_INTEGER
	var T = (l + r)/2
	var mn = Math.min(closestpair(l,T),closestpair(T,r))
	var strip = []
	for(var i = l; i <= r; i++) {
		if(Math.abs(point[T].x-point[i].x) < mn) {
		strip.push(point[i])
		}
	}
	var sz = strip.length;
	strip.sort((a,b) => {
		if(a.y == b.y) {
			if(a.x > b.x) return 1;
			else return -1
		}else if(a.y > b.y) return 1;
		else return -1;
	})
	for(var i = 0; i < sz-1; i++) {
		for(var j = i + 1; j < sz; j++) {
		if(strip[j].y-strip[i].y >= mn) break;
		mn = Math.min(distance(strip[i],strip[j]),mn);
		}
	}
	return mn;
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
	var tmp = []
	var ref = data.ref_position
	for(var e in robot) {
		var dist  = distance(ref,robot[e])
		//console.log(e  + "  " + dist);
		tmp.push({dist,e})
	}
	tmp.sort((a,b) => {
		if(a.dist == b.dist) {
			if(a.e > b.e) return 1
			else return -1
		}else if(a.dist > b.dist) return 1
		else return -1
	})
	if(data.k === undefined) data.k = 1
	var n = Math.min(data.k,tmp.length)
	for(var i = 0; i < n; i++) arr.push(Number(tmp[i].e)) 
	//console.log(tmp);
	res.json({
		robot_ids : arr
	})
})
app.get('/closestpair',(req,res) => {
	point = [];
	for(var e in robot) point.push(robot[e])
	if(point.length < 2) {
		res.status(424).send('')
	}else {
		point.sort((a,b) => {
			if(a.x == b.x) {
				if(a.y > b.y) return 1;
				else return -1
			}else if(a.x > b.x) return 1;
			else return -1;
		})
		//console.log(point);
		res.json({
			distance: Number(closestpair(0,point.length-1).toFixed(3))
		})
	}
})
app.listen(PORT,() => {
	console.log("Starting server at PORT " + PORT)
})

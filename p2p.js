var http = require('http');
var express = require('express');
var querystring = require('querystring');

console.log(process.argv);
var port = process.argv[2];
var remotePort = process.argv[3];

if (!port)
	port = 8080;

var transceiver = function(port, hiCallback, queryCallback,hoCallback) {

	var app = express();

	function hook(urlPart, callback) {
		app.get(urlPart, function(req, res) {
			console.log("GOT hi", port, req.params, req.query);
			// return;
			if (callback)
				callback(req.query, function(data) {
					res.send(JSON.stringify(data));
				});
			else
				res.send(JSON.stringify("nope"));
		});
	}
	hook('/');
	hook('/hi', hiCallback);
	hook('/ho', hoCallback);
	hook('/query', queryCallback);
	app.listen(port);

	var get = function(host, port, functionName, options, callback) {

		http.get({
			host : host,
			port : port,
			path : '/' + functionName + '?' + querystring.stringify(options),
			agent : false,
			params : options
		}, function(res) {
			// Do stuff
			res.on('data', function(buffer) {
				console.log("GOT", buffer.toString("utf8"));
				var j = JSON.parse(buffer.toString("utf8"));
				if (callback)
					callback(j);
			});
		});
	};
	function getter(url) {
		return function(target, query, callback) {
			get(target.host, target.port, url, query, callback);
		};
	}
	return {
		hi : getter('hi'),
		ho : getter('ho'),
		query : getter("query")
	};
};

var node = function(config) {
	var o = {};
	var neighbors = [];
	var neighborsToCheck = [];
	var hiHandler = function(options, callback) {
		console.log("HI called", options);
		console.log("neighbors", neighbors);
		
		callback({
			text : "HEY",
			data : options
		});
		checkIfServer(options);
	};
	var hoHandler = function(ops,callback) {
		console.log("HO handler");
		callback("YAYP2P");
	};
	function checkIfServer(options) {
		console.log("HOOOO",options);
		
		tx.ho(options,{},function(data) {
			console.log("HOooooooo");
			if (data == "YAYP2P") {
				neighbors.push(options);
				console.log("New neighbor",options);
			} else {
				console.log("HO failed for",options);
			}
		});
	}

	var queryHandler = function(options, callback) {
		callback(neighbors);
	};

	var tx = transceiver(config.port, hiHandler, queryHandler,hoHandler);
	o.id = config.id;
	if (config.master) {
		tx.hi(config.master, {
			id : config.id,
			host : config.host,
			port : config.port
		}, function() {
			tx.query(config.master, {}, function(result) {
				console.log("found neighbors", result);
			});
		});
	}

	return o;
};

node({
	id : 1,
	port : 8080,
	host:'localhost'
});

node({
	id : 2,
	port : 8081,
	host:'localhost',
	master : {
		host : 'localhost',
		port : 8080
	}
});

var http = require('http');
var express = require('express');
var querystring = require('querystring');

console.log(process.argv);
var port = process.argv[2];
var remotePort = process.argv[3];

if (!port)
	port = 8080;

var transceiver = function(port, hiCallback, queryCallback) {

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
		query : getter("query")
	};
};

var node = function(config) {
	var o = {};
	var neighbors = [];
	var hiHandler = function(options, callback) {
		console.log("HI called", options);
		neighbors.push(options);
		console.log("neighbors", neighbors);
		callback({
			text : "HEY",
			data : options
		});
	};

	var queryHandler = function(options, callback) {
		callback(neighbors);
	};

	var tx = transceiver(config.port, hiHandler, queryHandler);
	o.id = config.id;
	if (config.master) {
		tx.hi(config.master, {
			id : config.id,
			host : config.localhost,
			port : config.port
		}, function() {
			tx.query(config.master, {}, function(result) {
				console.log("QUERY RESULT", result);
			});
		});
	}

	return o;
};

// transceiver(port);
// transceiver(port + 1);
node({
	id : 1,
	port : 8080
});
node({
	id : 2,
	port : 8081,
	master : {
		host : 'localhost',
		port : 8080
	}
});

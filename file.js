var fs = require('fs');

this.storage = function(filename, blockSize) {
	var fd;
	var buffer = new Buffer(blockSize);

	try {
		fd = fs.openSync(filename, "r+");
	} catch (e) {
		fd = fs.openSync(filename, "w+");
	}
	console.log("OPENED :-)", fd);

	this.read = function(pos, callback) {

		var ret = fs.read(fd, buffer, 0, blockSize, pos * blockSize, callback);
		console.log("RET", ret);
	};
};
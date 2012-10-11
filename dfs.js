var file=require('./file.js');

var storage=new file.storage("test.txt",2);


console.log("FILE..");
console.log(file);

storage.read(0,function(err, bytesRead, buffer){
	console.log("READ callback",err, bytesRead, buffer,buffer.toString('utf8',0,bytesRead));
});

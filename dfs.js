var file=require('./file.js');

var storage=new file.storage("test.txt",1);


console.log("FILE..");
console.log(file);

storage.read(1,function(err, bytesRead, buffer){
	console.log(err, bytesRead, buffer);
});
var express = require('express');
var downldr = require('./lib/downloader.js');
var fs      = require('fs');
var exec   = require('child_process').exec;

var app = express.createServer();

app.get('/channel.js', function(req, res) {
        res.header('Content-Type', 'text/javascript');
        res.send('function _bulkr_download(data) { '+
                'if(data.error !== false) { ' +
                	          ' alert(data.id);' +
                '} else { alert("Error processing bulkr request:\\n "+data.error); } }');
});
     
app.get('/set/([0-9a-zA-Z_]+)', function(req, res) { 
	console.log(req);
});

app.get('/', function(req, res) {
        res.header('Access-Control-Allow-Origin','*');
        res.header('Content-Type','text/javascript');

        var photos  = req.query.photos.split(",");
        var error   = false;
        var baseuri = "http://farm1.static.flickr.com/";
        var id        = (parseInt(new Date().getTime())) + "_" + (Math.random() * 1000);
        var savepath  = "/tmp/bulkr/" + id;
        var zip_savepath = "./files/";
        var completed = 0;
        
        var onComplete = function() {
            completed++;
            
            if(completed == photos.length) {
                var zip   = exec('zip -9 ' + zip_savepath + id + ' ' + savepath + "/*", function(aError, stdout, stderr) { 
                	if(aError !== null) {
                		error = aError; 
                		res.send("_bulkr_download("+JSON.stringify({"id":"", "error": error})+")");
                	} else {
                		res.send("_bulkr_download("+JSON.stringify({"id": id, "error": false})+")");	
                	}
                });
				
                
            }
        };

        fs.mkdir(savepath, 0777, function() {
        
	        for(var i = 0; i < photos.length; i++) {
	                var remote_file = baseuri + photos[i] + "_b.jpg";
	                var local_file  = savepath+"/"+(i+1)+".jpg";
	                
	                var dl = new downldr.Downloader(remote_file, local_file);
	                dl.on("completed", onComplete);
	                dl.run();
	        }

        });

        
});

app.listen('8080','127.0.0.1');

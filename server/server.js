var express = require('express');
var downldr = require('./lib/downloader.js');
var fs      = require('fs');
var exec    = require('child_process').exec;
var path    = require('path');

var app = express.createServer();

app.get('/channel.js', function(req, res) {
        res.header('Content-Type', 'text/javascript');
        res.send('function _bulkr_download(data) { '+
                'if(data.error == false) { ' +
                	          'var txtLink = document.getElementById("txtBulkZipLink");' +
                	          'txtLink.value = txtLink.getAttribute("endpoint") + "/set/" + data.id;' +
                	          'document.getElementById("bulkTip").style.display = "block"; ' +
                '} else { alert("Error processing bulkr request:\\n "+data.error); } }');
});
     
app.get('/set/([0-9a-zA-Z_\.]+)', function(req, res) { 
	path.exists(filePath, function(exists) { 
		if(exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
                    res.writeHead(500);
                    res.end();
                }
                else {
                    res.writeHead(200, { 'Content-Type': 'application/zip','Content-disposition': 'attachment' });
                    res.end(content, 'utf-8');
                }
	
			});
		} else {
			res.writeHead(404);
            res.end();
		}
	});
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
                	// Do some cleaning...
                	for(var i = 0; i < photos.length; i++) {
	        			var local_file  = savepath+"/"+(i+1)+".jpg";
	                	fs.unlink(local_file);
	                }
                	fs.unlink(savepath);
                	
                	// Send error or successful id of the zip.
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

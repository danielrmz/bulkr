ar express = require('express');
var downldr = require('./downloader.js');
var fs = require('fs');

var app = express.createServer();

app.get('/channel.js', function(req, res) {
        res.header('Content-Type', 'text/javascript');
        res.send('function _bulkr_download(data) { '+
                'if(data.error !== false) { ' +
                ' alert(data.url);' +
                '} else { alert("Error processing bulkr request, \\n "+data.error); } }');
});

app.get('/', function(req, res) {
        res.header('Access-Control-Allow-Origin','*');
        res.header('Content-Type','text/javascript');

        var photos  = req.query.photos.split(",");
        var error   = false;
        var baseuri = "http://farm1.static.flickr.com/";
        var savepath= "/tmp/bulkr/" + (new Date()).getTime() + "_" + (Math.random() * 1000);

        fs.mkdir(savepath, 0777, function() {

        for(var i = 0; i < photos.length; i++) {
                var file = baseuri + photos[i] + "_b.jpg";
                var dl = new downldr.Downloader();

                dl.set_remote_file(file);
                dl.set_local_file(savepath+"/"+(i+1)+".jpg");
                dl.run();
        }

        });

        res.send("_bulkr_download("+JSON.stringify({"url":"", "error": error})+")");
});

app.listen('8080','127.0.0.1');

var path   = require('path');
var url    = require('url');
var http   = require('http');
var fs     = require('fs');
var events = require("events");



//create the downloader 'class'
function Downloader (remote_file, local_file) {
    events.EventEmitter.call(this);
    
    remote_file = remote_file || null;
    local_file  = local_file  || null;
    
    if(remote_file) {
    	this.setRemoteFile(remote_file);
    } 
    if(local_file) {
    	this.setLocalFile(local_file);
    }
};

Downloader.super_ = events.EventEmitter;
Downloader.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: Downloader,
        enumerable: false
    }
});

Downloader.prototype.remote_file = null;
Downloader.prototype.local_file  = null;
Downloader.prototype.write_file  = null;
Downloader.prototype.complete       = false;
Downloader.prototype.content_length = 0;
Downloader.prototype.downloaded_bytes = 0;

/**
 * Sets the remote file to download.
 * @param {string} file
 */
Downloader.prototype.setRemoteFile = function(file) {
	this.remote_file = file;
	this.local_file  = path.basename(this.remote_file);
};
    
/**
 * Sets the local file where it will be downloaded to, 
 * defaults to remote_file's name
 * 
 * @param {string} file
 */
Downloader.prototype.setLocalFile = function(file) {
	file = file || null;
	if(!file) {
		throw new Exception("Local file name must be provided.");
	}
	this.local_file = file;
};

/**
 * Triggers the download.
 */
Downloader.prototype.run = function() {
    //start the download
    this._download( this.remote_file, this.local_file, 0 );
}

/**
 * Downloads the file, if it contains redirect it recursively calls itself.
 * on completed it emits the "completed" event.
 * 
 * @param {string} remote
 * @param {string} local
 * @param {number} num
 * @private
 */
Downloader.prototype._download = function(remote, local, num) {
    if ( num > 10 ) {
      console.log( 'Too many redirects' );
    }
    
    //remember who we are
    var self = this;
    
    //set some default values  
    var redirect = false;
    var new_remote = null;
    var write_to_file = false;
    var write_file_ready = false;
    
    //parse the url of the remote file
    var u = url.parse(remote);
    
    //set the options for the 'get' from the remote file
    var opts = {
      host: u.hostname,
      port: u.port,
      path: u.pathname
    };
    
    //get the file
    var request = http.get(opts, function(response ) {
      switch(response.statusCode) {
        case 200:
          //this is good
          //what is the content length?
          self.content_length = response.headers['content-length'];
          break;
        case 302:
          new_remote = response.headers.location;
          self._download(new_remote, self.local_file, num + 1 );
          return;
          break;
        case 404:
          console.log("File Not Found");
        default:
          //what the hell is default in this situation? 404?
          request.abort();
          return;
      }
      
      response.on('data', function(chunk) {
      
        //are we supposed to be writing to file?
        if(!write_file_ready) {
          //set up the write file
          self.write_file = fs.createWriteStream(self.local_file);
          write_file_ready = true;
        }
        
        self.write_file.write(chunk);
        self.downloaded_bytes+=chunk.length;
        percent = parseInt( (self.downloaded_bytes/self.content_length) * 100 );
        //console.log(self.remote_file + " ... " + percent + "%");
      });
      
      response.on('end', function() {
        self.complete = true;
        self.write_file.end();
        self.emit("completed");
      });
    });
    
    request.on('error', function(e) {
      console.log("Got error: " + e.message);
    });

}; // ends download


exports.Downloader = Downloader;
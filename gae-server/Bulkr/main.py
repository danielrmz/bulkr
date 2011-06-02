#!/usr/bin/env python

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api import urlfetch
from google.appengine.ext import db
from StringIO import StringIO
import zipfile
import hashlib

# Code extracted from: http://stackoverflow.com/questions/583791/is-it-possible-to-generate-and-return-a-zip-file-with-app-engine
# Adds a file to the Zip Stream
def addFile(zipstream, url, fname):
    result = urlfetch.fetch(url)
    f = StringIO(result.content)
    length = result.headers['Content-Length']
    
    f.seek(0)
    while True:
        buff = f.read(int(length))
        if buff == "": 
            break
        zipstream.writestr(fname, buff)
    return zipstream
    
    # Creates a zip file
def ZipFiles(self, files):
    zipstream=StringIO()
    file = zipfile.ZipFile(zipstream, "w")
    filenum = 1
    for url in files:
        file = addFile(file, url, str(filenum) + ".jpg")
        filenum = filenum + 1
    file.close()
    zipstream.seek(0)
    self.response.headers['Content-Type'] = 'application/zip'
    self.response.headers['Content-Disposition'] = 'attachment; filename="pictures.zip"'
    while True:
        buf= zipstream.read(2048)
        if buf == "": 
            break;
        self.response.out.write(buf)

def Base62ToString(fromValue):
    mod = 0
    baseNum = 62
    toValue = "0" if str == 0 else ""
    baseDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    
    while fromValue <> 0:
        mod = int(fromValue % baseNum)
        toValue = baseDigits[mod] + toValue
        fromValue = fromValue / baseNum
    
    return toValue
                  

# Model definition
class Set(db.Model):
    id     = db.IntegerProperty(required=True)
    photos = db.StringListProperty(required=True)
    short  = db.StringProperty(required=True, indexed=True)
    created_at = db.DateTimeProperty(auto_now_add=True)

# Handlers
class MainHandler(webapp.RequestHandler):
    def get(self):
        tmp = self.request.get("photos").split(",")
        tmp.sort()
        shaId = hashlib.sha256("-".join(tmp)).hexdigest()
        all = Set.all().order('-created_at').get()
        
        last_id = 1
        
        if type(all) <> type(None):
            last_id = all.id + 1
            #short = Set.all().count() + 1
            
        short = Base62ToString(last_id)
        
        # Check if the query has been served before. 
        set = Set.get_by_key_name(shaId)
        if set is None:
            # If not create a new entry
            set = Set(photos = tmp, key_name=shaId, short=short, id = last_id)
            set.put()
         
        self.response.out.write('_bulkr_download({"id":"'+str(set.short)+'", "error":false});')

class SetHandler(webapp.RequestHandler):
    def get(self, id):
        set = Set.all().filter("short =", id).get();
        baseuri = "http://farm1.static.flickr.com/";
        files = []
        for file in set.photos:
            files.append(baseuri + file + "_b.jpg")
        ZipFiles(self, files)

# Initializatio of WSGI App for GAE
def main():
    application = webapp.WSGIApplication([('/', MainHandler), ('/set/([a-zA-Z0-9]+).zip', SetHandler)],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()

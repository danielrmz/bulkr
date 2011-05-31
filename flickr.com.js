if(window.jQuery) {

    var service_endpoint = "http://localhost:8080";
    var in_detail_view   = (location + "").indexOf("sets") >= 0;
    
    if(in_detail_view) {
        // Add our js functions for processing the request via jsonp
        $("body").append("<script type='text/javascript' src='" + service_endpoint + "/channel.js'></script>");

        // Add UI Button and checkboxes for Bulk Download selection.
        $(".share-this-wrapper").append("<ul class='share-options-list'>" +
                                            "<li class='first last'><a id='bulkDownload' class='Butt'>Bulk Download</a></li>" +
                                        "</ul>");
	
        $(".photo-display-item").each(function() {
            var value = $(this).find("img").attr("src").replace("_s.jpg","").replace(/http:\/\/farm[0-9]+.static.flickr.com\//g,'');
            var chkbx = "<input type='checkbox' value='"+value+"' class='js-chkBulkItem' style='position:absolute;margin-top:-15px;margin-left:4px;' />";
            var transbx="<div style='height:20px;background:black;margin-top:-20px;width:75px;opacity:0.5;float:left;'></div>";
            $(this).append("<div class='js-divBulk'>" + transbx + chkbx + "</div>");
	
        });

        // Handle the download click. 
        $("#bulkDownload").click(function() { 
            var selected = [];
            $(".js-chkBulkItem").filter(function(){ return $(this)[0].checked; }).each(function() { selected.push($(this).attr("value")); });
        
            if(selected.length > 0) {
                $.getJSON(service_endpoint + "/?callback=?", {photos: selected.join(",")}, function(data) {});
            }
        });
	
    }

}

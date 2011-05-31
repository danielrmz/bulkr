if(window.jQuery) {

    var service_endpoint = "http://bulkr.danielrmz.com";
    var in_detail_view   = (location + "").indexOf("sets") >= 0;
    
    if(in_detail_view) {
        // Add our js functions for processing the request via jsonp
        $("body").append("<script type='text/javascript' src='" + service_endpoint + "/channel.js'></script>");

        // Add UI Button and checkboxes for Bulk Download selection.
        $(".share-this-wrapper").append("<ul class='share-options-list'>" +
                                            "<li class='first last'><a id='bulkDownload' class='Butt'>Download Selected</a></li>" +
                                        "</ul>");
		$("#main").append('<div class="yui3-popover-content-hider" style="left:-999em;"> '+
			'<div id="bulkTip" class="yui3-widget yui3-popover yui3-widget-positioned yui3-widget-stacked" style=" width: 300px; left: 12660px; top: -1220px; z-index: 0; ">'+
				'<div id="share-menu-v3" class="share-menu-bs yui3-popover-content yui3-widget-stdmod" style="z-index:100;width:300px;"> ' +
				'<div style="padding:6px 7px; height:17px; background:#F6F6F6;color:#0063DC;font-weight:bold;border-bottom:1px solid #E3E3E3;z-index:1002;">'+
					'<img src="http://l.yimg.com/g/images/window_close_grey.gif" alt="" style="float:right;position:relative;top:2px;cursor:pointer;" onclick="document.getElementById(\'bulkTip\').style.display=\'none\';"/>'+
					'Share the set!'+
				'</div>'+
				'<div class="share-options-inner share-options-placeholder" style="background:white;">' +
				'<input type="text" endpoint="'+service_endpoint+'" id="txtBulkZipLink" readonly="readonly" style="width:90%;height:18px;border:1px solid silver;"/> '+ 
				' <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="110" height="14" id="clippy" > ' +
'    <param name="movie" value="'+service_endpoint+'/clippy.swf"/>' +
'    <param name="allowScriptAccess" value="always" />' +
'    <param name="quality" value="high" />' +
'    <param name="scale" value="noscale" />' +
'    <param name="FlashVars" value="text=HOLA">' +
'    <param name="bgcolor" value="#FFFFFF">' +
'    <embed src="'+service_endpoint+'/clippy.swf" FlashVars="text=HOLA"  width="110" height="14" name="clippy" quality="high" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" bgcolor="#FFFFFF" ' +
'    />' +
 
				'</div>'+
				'<div class="clearfix"></div>' +
				'</div>' +
				'<span style="left:250px;color:#F6F6F6;" class="yui3-popover-arrow yui3-popover-arrow-t">◣</span>'+
				'<span class="yui3-popover-arrow-mask yui3-popover-arrow-mask-t" style="margin-left:70px;z-index:0;"></span>' +
				'</div>' +
			'</div>');
		
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

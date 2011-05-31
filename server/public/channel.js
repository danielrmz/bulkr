/**
 * @author Daniel Ramirez
 */

function _bulkr_download(data) {
   if(data.error == false) { 
   		var txtLink = document.getElementById("txtBulkZipLink");
        txtLink.value = txtLink.getAttribute("endpoint") + "/set/" + data.id + ".zip";
        document.getElementById("bulkTip").style.display = "block"; 
   } else { 
   		alert("Error processing bulkr request:\\n "+data.error); 
   } 
}
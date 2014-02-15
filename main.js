/* The local API for BS */
function bs(DEBUG_SET){
	this.request;//Handle for opening database
	this.db;//Used for IndexedDB functions
	this.DEBUG;//To set output
	
	if(DEBUG_SET != undefined){
		this.DEBUG = DEBUG_SET;	
	} else{
		this.DEBUG = false;
	}
	
	this.init = function(){//Initalize IndexedDB
		if("indexedDB" in window){
			bs.request = indexedDB.open("BS_DB");//Get handle
			
			bs.request.onupgradeneeded = function(event){
				bs.log("Upgrading database");
			};
			
			bs.request.onsuccess = function(event){
				bs.log("Connected to db");
				bs.db = event.target.result;
			};
			
			bs.request.onerror = function(event){
				bs.log(event.target.errorCode, true);
			};
		} else{
			bs.log("A crucial library(IndexDB) is not supported in your browser", true);
		}
	};
	
	this.alert = function(alertString){
		alert(alertString);
	};
	
	this.log = function(logString, userError){//userError <-- Display in console, disregaurding DEBUG
		if(bs.DEBUG == true){
			if(userError != undefined && userError == true){
				console.log("Bug Swatter ERROR: " + logString);
			} else{
				console.log("BS: " + logString);
			}
		} else{
			if(userError != undefined && userError == true){
				console.log("Bug Swatter ERROR: " + logString);
			}
		}
	};
	
	/* Constructor */
	this.init();
	/**************/
}

function bug(id, status){
	this.id = id;
	this.status = status;
}

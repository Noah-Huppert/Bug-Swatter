/* The local API for BS */

function task(id, status){
	this.id = id;
	this.status = status;
	this.lastMod = newDate().getTime();
}

function status(sName, sShared){
	this.name = sName;
	this.shared = sShared;
	
	this.setShared = function(sShare){
		status.shared = sShare;
	};
}

function bs(DEBUG_SET){
	this.db;//Used for IndexedDB functions
	this.DEBUG;//To set output
	
	//Set database varribles for later
	this.tasks;
	this.statuses;
	
	if(DEBUG_SET != undefined){
		this.DEBUG = DEBUG_SET;	
	} else{
		this.DEBUG = false;
	}
	
	/* DB Actions */
	this.addToDB = function(db, object){
		var request = bs.db.add(object);
		
		request.onerror = function(event){
			bs.log(event.target, "object");
		};
		
		request.onsuccess = function(event){
			bs.log("Added " + object + " to " + db);
		};
	};
	
	this.removeFromDB = function(db, object){
		bs.log("Function bs.removeFromDB(db, object) not implimented yet\nRequested DB: " + db + "\nRequested OBJECT: " + object, true);
	};
	/***********/
	
	
	/* Status Actions */
	this.addStatus = function(status){
		bs.addToDB(bs.statuses, status);
	};
	
	this.removeStatus = function(status){
		bs.removeFromDB(bs.statuses, status);
	};
	/**********/
	
	
	/* Task Actions */
	this.addTask= function(task){
		bs.addToDB(bs.tasks, task);
	};
	
	this.removeTask = function(task){
		bs.log("Function bs.removeTask(task) not implimented yet.", true);
	};
	/**********/
	
	
	/* BS Actions */
	this.alert = function(alertString){
		alert(alertString);
	};
	
	this.log = function(logString, userError){//userError <-- Display in console, disregaurding DEBUG
		if(bs.DEBUG == true){
			if(userError != undefined){
				switch(userError){
					case true:
						console.log("Bug Swatter ERROR: " + logString);
					break;
					
					case "object":
						console.log("Bug Swatter ERROR: ");
						console.log(userError);
					break;
				}
			} else{
				console.log("BS: " + logString);
			}
		} else{
			if(userError != undefined && userError == true){
				console.log("Bug Swatter ERROR: " + logString);
			}
		}
	};
	/**********/
	
	
	this.init = function(){//Initalize IndexedDB
		if("indexedDB" in window){
			var request = indexedDB.open("BS_DB", 1);//Get handle
			
			request.onupgradeneeded = function(event){//First time setup
				bs.log("Setting up database");
				var thisDB = event.target.result;
				
				if(!thisDB.objectStoreNames.contains("tasks")){
					thisDB.createObjectStore("tasks", { keyPath: "id"});
				}
				
				if(!thisDB.objectStoreNames.contains("statuses")){
					thisDB.createObjectStore("statuses", { keyPath: "name"});
				}
			};
			
			request.onsuccess = function(event){
				bs.log("Connected to db");
				bs.db = event.target.result;
				
				//bs.statuses = 
			};
			
			request.onerror = function(event){
				bs.log(event.target, "object");
			};
		} else{
			bs.log("A crucial library(IndexDB) is not supported in your browser", true);
		}
	};
	
	
	/* Constructor */
	this.init();
	/**************/
}

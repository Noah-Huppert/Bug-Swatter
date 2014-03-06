/* Bug Swatter Object */
var bs = {};
bs.db = {};
bs.db.data = {};
bs.DEBUG = false;
bs.db.tasksName = "tasks";
bs.db.statusesName = "statuses";

bs.events = {
	onAlert: function(sData){},
	db: {
		onOpen: function(sData){},
		onUpgrade: function(sData){},
		onAdd: function(sData){},
		onRemove: function(sData){},
		onGetDBData: function(sData){}
	},
	tasks: {
		onAdd: function(sData){},
		onRemove: function(sData){},
		onUpdate: function(sData){}
	},
	statuses: {
		onAdd: function(sData){},
		onRemove: function(sData){},
		onUpdate: function(sData){}
	}
};

bs.alert = function(sMessage, sLocation, sDebugStatement){
	var location = "";
	var debugStatement = false;
	var showMessage = true;

	if(bs.DEBUG && typeof sLocation == 'string'){
		location = " - " + sLocation;
	} else if(typeof sLocation == 'boolean'){
		debugStatement = sLocation
	}

	if(typeof sDebugStatement == 'boolean'){
		debugStatement = sDebugStatement;
	}

	if(debugStatement == true)
		if(bs.DEBUG == false)
			showMessage = false;

	if(showMessage){
		if(typeof sMessage === 'object'){
			console.log("Bug Swatter" + location + ":");
			console.log(sMessage);
			console.log("");
		} else{
			console.log("Bug Swatter" + location + ": " + sMessage);
		}
	}

	bs.events.onAlert({ "message" : sMessage, "location" : sLocation, "debugStatement": debugStatement});
};

bs.db.open = function(dbName){
	var version = 1;
	var request = indexedDB.open(dbName, version);

	request.onupgradeneeded = function(e){
		var db = e.target.result;

		e.target.transaction.onerror = bs.db.onerror;

		if(db.objectStoreNames.contains(dbName)){
			db.deleteObjectStore(dbName);
		}

		var store = db.createObjectStore(dbName, 
		{
			keyPath: "id"	
		});

		bs.events.db.onUpgrade({ "dbName": dbName });
	};

	request.onsuccess = function(e){
		bs.db[dbName] = e.target.result;
		bs.db.data[dbName] = {};
		bs.db.getDBData(dbName);
		bs.events.db.onOpen({ "dbName": dbName });
	};

	request.onerror = bs.db.onerror;
};

bs.db.add = function(sName, sData){
	var db = bs.db[sName];
	var transaction = db.transaction([sName], "readwrite");
	var store = transaction.objectStore(sName);
	var request = store.put(sData);
	
	request.onsuccess = function(e){
		bs.events.db.onAdd({ "dbName": sName, "data": sData });
	};

	request.onerror = function(e){
		bs.alert(e.value, "bs.db.add() onerror");
	};

	return request;
};

bs.db.remove = function(sName, sData){
	var db = bs.db[sName];
	var transaction = db.transaction([sName], "readwrite");
	var store = transaction.objectStore(sName);

	if(sData.id != undefined){
		var request = store.delete(sData.id);
	} else{
		bs.alert("To delete an object the object needs and 'id' key", "bs.db.remove() sData id check");
		return;
	}

	request.onsuccess = function(e){
		bs.events.bs.onRemove({ "dbName": sName, "data": data });
	};

	request.onerror = function(e){
		console.log(e);
	};
};

bs.db.getDBData = function(dbName){
	var db = bs.db[dbName];
	var transaction = db.transaction([dbName], "readwrite");
	var store = transaction.objectStore(dbName);

	var keyRange = IDBKeyRange.lowerBound(0);
	var cursorRequest = store.openCursor(keyRange);

	var dbStoreVar = [];

	cursorRequest.onsuccess = function(e){
		var result = e.target.result;
		if(!!result == false){
			bs.db.data[dbName] = dbStoreVar;
			bs.events.db.onGetDBData({ "dbName": dbName, "dbStoreVar": dbStoreVar });
			return;
		}

		dbStoreVar.push(result.value);
		result.continue();
	};

	cursorRequest.onerror = bs.db.onerror;
};

bs.db.addTask = function(sTask){
	var request = bs.db.add(bs.db.tasksName, sTask);
	
	request.onsuccess = function(e){
		bs.db.updateTasks();
		bs.events.tasks.onAdd({ "task": sTask });
	};

	request.onerror = function(e){
		bs.alert(e.value, "bs.db.addTask() onerror");
	};
};

bs.db.removeTask = function(sTask){
	var request = bs.db.remove(bs.db.tasksName, sTask);

	request.onsuccess = function(e){
		bs.db.updateTasks();
		bs.events.tasks.onRemove({ "task": sTask });
	}

	request.onerror = function(e){
		bs.alert(e.value, "bs.db.removeTask() onerror");
	};
};

bs.db.updateTasks = function(){
	bs.db.getDBData(bs.db.tasksName);
	bs.events.tasks.onUpdate({});
};

bs.db.addStatus = function(sStatus){
	var request = bs.db.add(bs.db.statusesName, sStatus);
	
	request.onsuccess = function(e){
		bs.db.updateStatuses();
		bs.events.statuses.onAdd({ "status": sStatus });
	};

	request.onerror = function(e){
		bs.alert(e.value, "bs.db.addStatus() onerror");
	};
};

bs.db.removeStatus = function(sStatus){
	var request = bs.db.remove(bs.db.statusesName, sStatus);

	request.onsuccess = function(e){
		bs.db.updateStatuses();
		bs.events.statuses.onRemove({ "status": sStatus });
	}

	request.onerror = function(e){
		bs.alert(e.value, "bs.db.removeStatus() onerror");
	};
};

bs.db.updateStatuses = function(){
	bs.db.getDBData(bs.db.statusesName);
	bs.events.statuses.onUpdate({});
};

/* Task Object */
function task(sID, sStatus){
	this.id = sID;
	this.status = sStatus;
};

/* Status Object */
function status(sID, sDisplayName, sShared){
	this.id = sID;
	this.displayName = sDisplayName;
	this.shared = sShared;
};

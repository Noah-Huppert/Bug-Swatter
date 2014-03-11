/* Bug Swatter Object */
var bs = {};
bs.db = {};
bs.db.data = ko.observableArray();
bs.DEBUG = ko.observable(false);
bs.db.tasksName = ko.observable("tasks");
bs.db.statusesName = ko.observable("statuses");
bs.db.inlineTasksStatus = ko.observableArray();
bs.db.detailedTasksStatus = ko.observableArray();

bs.events = {
	onAlert: function(sData){},
	db: {
		onOpen: function(sData){},
		onUpgrade: function(sData){},
		onAdd: function(sData){},
		onRemove: function(sData){},
		onSet: function(sData){},
		onGetDBData: function(sData){},
		onFetchInitialData: function(sData){}
	},
	tasks: {
		onAdd: function(sData){},
		onRemove: function(sData){},
		onSet: function(sData){},
		onUpdate: function(sData){}
	},
	statuses: {
		onAdd: function(sData){},
		onRemove: function(sData){},
		onSet: function(sData){},
		onUpdate: function(sData){}
	}
};


/********************* General Functions *********************/
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


/********************* Database Functions *********************/
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
		bs.db[dbName] = ko.observable(e.target.result);
		bs.db.data()[dbName] = ko.observableArray();
		bs.db.getDBData(dbName, "open");
		bs.events.db.onOpen({ "dbName": dbName });
	};

	request.onerror = bs.db.onerror;
};

bs.db.add = function(sName, sData){
	var db = bs.db[sName]();
	var transaction = db.transaction([sName], "readwrite");
	var store = transaction.objectStore(sName);
	var request = store.put(sData.dump);
	
	request.onsuccess = function(e){
		bs.events.db.onAdd({ "dbName": sName, "data": sData });
	};

	request.onerror = function(e){
		bs.alert(e.value, "bs.db.add() onerror");
	};

	return request;
};

bs.db.remove = function(sName, sData){
	var db = bs.db[sName]();
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

	return request;
};

bs.db.set = function(sName, sData){
	var db = bs.db[sName]();
	var transaction = db.transaction([sName], "readwrite");
	var store = transaction.objectStore(sName);
	var request = store.put(sData.dump);

	request.onsuccess = function(e){
		bs.events.db.onSet({ "dbName": sName, "data": sData });
	}

	request.onerror = function(e){
		console.log(e);
	};

	return request;
}

bs.db.getDBData = function(dbName, sData){
	var db = bs.db[dbName]();
	var transaction = db.transaction([dbName], "readwrite");
	var store = transaction.objectStore(dbName);

	var keyRange = IDBKeyRange.lowerBound(0);
	var cursorRequest = store.openCursor(keyRange);

	var dbStoreVar = [];

	cursorRequest.onsuccess = function(e){
		var result = e.target.result;
		if(!!result == false){
			bs.db.data()[dbName](dbStoreVar);
			bs.events.db.onGetDBData({ "dbName": dbName, "dbStoreVar": dbStoreVar, "data": sData });
			switch(dbName){
				case bs.db.tasksName():
					bs.events.tasks.onUpdate({});
				break;

				case bs.db.statusesName():
					bs.events.statuses.onUpdate({});
				break;
			}
			return;
		}

		dbStoreVar.push(result.value);
		result.continue();
	};
	
	cursorRequest.onerror = bs.db.onerror;
};


/********************* Task Functions *********************/
bs.db.addTask = function(sTask){
	var request = bs.db.add(bs.db.tasksName(), sTask);
	
	request.onsuccess = function(e){
		bs.db.updateTasks();
		bs.events.tasks.onAdd({ "task": sTask });
	};

	request.onerror = function(e){
		bs.alert(e.value, "bs.db.addTask() onerror");
	};
};

bs.db.removeTask = function(sTask){
	var editTask;
	if(typeof sTask == 'number'){
		editTask = bs.db.data()[bs.db.tasksName()]()[bs.db.findTaskByID(sTask)];
	} else{
		editTask = sTask;
	}

	if(editTask == undefined){
		bs.alert("Error removing task, task ID must be for a valid task", "bs.db.removeTask");
		return;
	}

	var request = bs.db.remove(bs.db.tasksName(), editTask);

	request.onsuccess = function(e){
		bs.db.updateTasks();
		bs.events.tasks.onRemove({ "task": sTask });
	}

	request.onerror = function(e){
		bs.alert(e.value, "bs.db.removeTask() onerror");
	};
};

bs.db.setTask = function(sObject){
	if(sObject.id == undefined){
		bs.alert("Error setting task, task ID not set", "bs.db.setTask");
		return;
	}

	var editObject;

	$(bs.db.data()[bs.db.tasksName()]()).each(function(){//Finding existing task
		if(this.id == sObject.id){
			editObject = this;
			editObject = new task(this.id, this.status.id);
		}
	});
	
	if(editObject == undefined){
		editObject = new task(sObject.id, !!sObject.statusID ? sObject.statusID : 0);
	}

	if(sObject.statusID != undefined){
		prevOb = editObject;
		editObject = new task(prevOb.id(), sObject.statusID);
	}

	$.each(sObject, function(key, value){
		editObject.set(key, value);
	});

	//bs.alert(editObject);

	var request = bs.db.set(bs.db.tasksName(), editObject);

	request.onsuccess = function(e){
		bs.db.updateTasks();
		bs.events.tasks.onSet(sObject);
	}

	request.onerror = function(e){
		bs.alert(e.value, "bs.db.setTask() onerror");
	};
};

bs.db.updateTasks = function(){
	bs.db.getDBData(bs.db.tasksName());
	bs.events.tasks.onUpdate({});
};

bs.db.findTaskByID = function(tID){
	var taskData = bs.db.data()[bs.db.tasksName()]();//Get bs.db.data[tasks] for future use
	var taskDataKey = undefined;
	$.each(taskData, function(key, value){
		if(value.id == tID){
			taskDataKey = key;
		}
	});

	return taskDataKey;
};

/********************* Status Functions *********************/
bs.db.addStatus = function(sStatus){
	var request = bs.db.add(bs.db.statusesName(), sStatus);
	
	request.onsuccess = function(e){
		bs.db.updateStatuses();
		bs.events.statuses.onAdd({ "status": sStatus });
	};

	request.onerror = function(e){
		bs.alert(e.value, "bs.db.addStatus() onerror");
	};
};

bs.db.removeStatus = function(sStatus){
	var request = bs.db.remove(bs.db.statusesName(), sStatus);

	request.onsuccess = function(e){
		bs.db.updateStatuses();
		bs.events.statuses.onRemove({ "status": sStatus });
	}

	request.onerror = function(e){
		bs.alert(e.value, "bs.db.removeStatus() onerror");
	};
};

bs.db.setStatus = function(sObject){
	if(sObject.id == undefined){
		bs.alert("Error setting status, status ID not set", "bs.db.setStatus");
		return;
	}

	var editObject = {};
	$(bs.db.data()[bs.db.statusesName()]()).each(function(){
		if(this.id == sObject.id){
			editObject = this;
		}
	});
	
	$.each(sObject, function(key, value){
		if(key != 'id' && editObject[key] != undefined){
			editObject[key] = value;
		}
	});

	var request = bs.db.set(bs.db.statusesName(), editObject);

	request.onsuccess = function(e){
		bs.db.updateStatuses();
		bs.events.statuses.onSet(sObject);
	}

	request.onerror = function(e){
		bs.alert(e.value, "bs.db.setStatus() onerror");
	};
}

bs.db.updateStatuses = function(){
	bs.db.getDBData(bs.db.statusesName());
	bs.events.statuses.onUpdate({});
};

bs.db.findStatusByID = function(sID){
	var statusData = bs.db.data()[bs.db.statusesName()]();//Get bs.db.data[statuses] for future use
	var statusDataKey = undefined;
	$.each(statusData, function(key, value){
		if(value.id == sID){
			statusDataKey = key;
		}
	});

	return statusDataKey;
};

/********************* Task Object *********************/
function task(sID, sStatus){
	var self = this;
	self.id = ko.observable(sID);
	if(typeof sStatus == 'object'){
		self.status = ko.observable(sStatus);
	} else if(typeof sStatus == 'number'){
		self.status = ko.observable(bs.db.data()[bs.db.statusesName()]()[sStatus]);
	} else{
		bs.alert("A valid status must be suplied in setting a task", "task constructor", true);
		return;
	}
	self.lastMod = ko.observable(Date.now());

	self.dump = { "id": self.id(), "status": self.status(), "lastMod": self.lastMod() };

	/* Getters */
	self.getID = function(){
		return self.id();
	};

	self.getStatus = function(){
		return self.status();
	};

	self.getLastMod = function(){
		return self.lastMod();
	};

	self.getDump = function(){
		return self.dump;
	};


	/* Setters */
	self.setID = function(sID){
		self.id(sID);
		self.updateLastMod();
	};

	self.setStatus = function(sStatus){
		self.status(sStatus);
		self.updateLastMod();
	};

	self.setLastMod = function(sLastMod){
		self.lastMod(sLastMod);
		self.updateLastMod();
	};

	self.updateLastMod = function(){
		self.lastMod(Date.now());
	};

	self.setDump = function(sDump){
		self.dump = sDump;
		self.updateLastMod();
	};

	self.set = function(sIndex, sValue){
		if( typeof self[sIndex] == 'function'){//If sIndex is a ko.observable
			self[sIndex](sValue);
		} else{
			self[sIndex] = sValue;
		}
		self.updateLastMod();
	};
};


/********************* Status Object *********************/
function status(sID, sDisplayName, sShared, sColor){
	var self = this;
	self.id = ko.observable(sID);
	self.displayName = ko.observable(sDisplayName);
	self.color = ko.observable(sColor)
	self.shared = ko.observable(sShared);
	self.lastMod = ko.observable(Date.now());

	self.dump = { "id": self.id(), "displayName": self.displayName(), "color": self.color(), "shared": self.shared(), "lastMod": self.lastMod() };

	/* Getters */
	self.getID = function(){
		return self.id();
	};

	self.getDisplayName = function(){
		return self.displayName();
	};

	self.getColor = function(){
		return self.color();
	};

	self.getShared = function(){
		return self.shared();
	};

	self.getLastMod = function(){
		return self.lastMod();
	};

	self.getDump = function(){
		return self.dump();
	};


	/* Setters */
	self.setID = function(sID){
		self.id(sID);
		self.updateLastMod();
	};

	self.setDisplayName = function(sDisplayName){
		self.displayName(sDisplayName);
		self.updateLastMod();
	};

	self.setColor = function(sColor){
		self.color(sColor);
		self.updateLastMod();
	};

	self.setShared = function(sShared){
		self.shared(sShared);
		self.updateLastMod();
	};

	self.setLastMod = function(sLastMod){
		self.lastMod(sLastMod);
		self.updateLastMod();
	};

	self.updateLastMod = function(){
		self.lastMod(Date.now());
	};

	self.setDump = function(sDump){
		self.dump = sDump;
		self.updateLastMod();
	};

	self.set = function(sIndex, sValue){
		if( typeof self[sIndex] == 'function'){//If sIndex is a ko.observable
			self[sIndex](sValue);
		} else{
			self[sIndex] = sValue;
		}
		self.updateLastMod();
	};
};

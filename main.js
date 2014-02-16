function bs(DEBUG_SET){
	//Set DEBUG status
	this.DEBUG;
	if(DEBUG_SET != undefined){
		this.DEBUG = DEBUG_SET;
	} else{
		this.DEBUG = false;
	}
	
	var db = new jsonDB("tasks", task);
	var clear = new status("Clear", false);
	var tempTask = new task(324, clear);
	/*db.add(tempTask);
	db.add(new task(322, clear));
	db.add(new task(325, new status("Clear", false)));
	console.log(db.data);*/
	
}

function jsonDB(sName, sObject){
	this.name = sName;//The name of the database
	this.object = sObject;//The object type you will be storing
	this.namespace = chrome.storage.sync;//Quicker way to use browser storage
	this.data = [];
	
	this.init = function(){
		var name = this.name;
		var data = [];
		this.namespace.get(this.name, function(result){
			if(result != undefined){//Check if jsonDB exists
				data = result[name].data;
				console.log(data);
			}
		});	
		console.log(data);
		this.data = data;
	};
	
	
	//Getters
	this.getName = function(){
		return this.name;
	};
	
	this.getObject = function(){
		return this.object;
	};
	
	this.get = function(sIndex, sValue){
		var tempResults = [];
		for(var key in this.data){
			if(this.data[key][sIndex] == sValue){
				tempResults.push(this.data[key]);
			}
		}
		
		if(tempResults.length == 1){
			return tempResults[0];
		} else{
			return tempResults;
		}
	};
	
	
	//Setters
	this.add = function(sObject){
		if($.inArray(sObject, this.data) == -1){//Duplicate check
			this.data.push(sObject);
		}
		this.save();
	};
	
	this.remove = function(sObject){
		if($.inArray(sObject) != -1){//Check to make sure object exists in db
			this.data.splice(this.data.indexOf(sObject), 1);
		}
		this.save();
	};
	
	this.save = function(){
		var sname = this.name;
		var sdata = this.data;
		this.namespace.set({ sname: sdata });
	};
	
	this.init();
	console.log(this.data);
}

function task(sID, sStatus){
	this.id = sID;
	this.status = sStatus;
	this.lastMod = new Date().getTime();
	
	
	//Getters
	this.getID = function(){
		return this.id;
	};
	
	this.getStatus = function(){
		return this.status;
	};
	
	
	//Setters
	this.setStatus = function(sStatus){
		this.status = sStatus;
		this.lastMod = new Date().getTime();
	};
	
	
	//Actions
	//TODO add actions
}

function status(sName, sShared){
	this.name = sName;
	this.shared = sShared;
	
	
	//Getters
	this.getName = function(){
		return this.name;
	};
	
	this.getShared = function(){
		return this.shared;
	};
	
	
	//Setters
	this.setName = function(sName){
		this.name = sName;
	};
	
	this.setShared = function(sShared){
		this.shared = sShared;
	};
	
	
	//Actions
	//TODO add actions
}


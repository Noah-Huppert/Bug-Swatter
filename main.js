function bs(DEBUG_SET){
	//Set DEBUG status
	this.DEBUG;
	var parent = this;
	if(DEBUG_SET != undefined){
		this.DEBUG = DEBUG_SET;
	} else{
		this.DEBUG = false;
	}
	
	this.markTasks = function(s, t){
		console.log(s.data);
	};
	
	var tasks = new jsonDB("tasks", task);
	var statuses = new jsonDB("statuses", status);
	
	statuses.run(function(){
		console.log(statuses.data.length);
		if(statuses.data.length != 0){
			console.log("1");
			parent.markTasks(statuses, tasks);
		} else{//Init setup
			//statuses.add(new status("Clear", false));
			//statuses.add(new status("Marked as duplicate"), false);
			//statuses.add(new status("Bookmarked"), false);
			console.log("2");
			parent.markTasks(statuses, tasks);
		}
	});
	
}

function jsonDB(sName, sObject){
	this.name = sName;//The name of the database
	this.object = sObject;//The object type you will be storing
	this.namespace = chrome.storage.sync;//Quicker way to use browser storage
	this.data = [];
	var parent = this;
	this.loadingFlag = false;
	
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
		
		return tempResults;
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
		console.log("Saving? Maybe?");
	};
	
	
	//Actions
	this.run = function(rFunc){
		this.namespace.get(this.name, function(result){
			if(result[parent.name] != undefined){
				console.log("01");
				parent.data = result[parent.name].data;
			} else{
				console.log(result);
				parent.data = [];
			}
			rFunc();
			parent.save();
		});
	};
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


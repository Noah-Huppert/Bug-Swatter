ko.applyBindings(bs);

bs.DEBUG = true;

bs.db.open(bs.db.tasksName);
bs.db.open(bs.db.statusesName);

var clearedStatus = new status(0, "Cleared", false);
var testTask = new task(3166, clearedStatus);
var testTask2 = new task(3266, clearedStatus);

bs.events.db.onOpen = function(sData){
	if(sData.dbName == bs.db.tasksName){

	} else if(sData.dbName == bs.db.statusesName){
		if(bs.db.data[sData.dbName].length == 0){
			var clear = new status(0, "Clear", false);
			var dupe = new status(1, "Duplicate", false);
			var bookmark = new status(2, "Bookmark", false);

			bs.db.addStatus(clear);
			bs.db.addStatus(dupe);
			bs.db.addStatus(bookmark);
		}
	}
}

bs.events.tasks.onAdd = function(sData){
	
}

bs.events.tasks.onUpdate = function(sData){

}

bs.events.db.onGetDBData = function(sData){

}
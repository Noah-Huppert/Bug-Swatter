bs.DEBUG = true;
bs.boop = ko.observable('HI');

bs.db.open(bs.db.tasksName);
bs.db.open(bs.db.statusesName);

var clearedStatus = new status(0, "Cleared", false);
var testTask = new task(3166, clearedStatus);
var testTask2 = new task(3266, clearedStatus);

bs.events.db.onOpen = function(sData){
	if(sData.dbName == bs.db.tasksName){

	} else if(sData.dbName == bs.db.statusesName){
		
	}
}

bs.events.tasks.onAdd = function(sData){
	
}

bs.events.tasks.onUpdate = function(sData){
	
}

bs.events.statuses.onSet = function(sData){
	bs.alert(sData);
	bs.alert(bs.db.data[bs.db.statusesName]);
}

bs.events.statuses.onUpdate = function(sData){
	if(bs.db.data[bs.db.statusesName].length == 0){//Initial statuses add
		bs.alert("Adding initial statuses", "bs.events.db.onGetDBData", true);
		var clear = new status(0, "Clear", false);
		var dupe = new status(1, "Duplicate", false);
		var bookmark = new status(2, "Bookmark", false);

		bs.db.addStatus(clear);
		bs.db.addStatus(dupe);
		bs.db.addStatus(bookmark);
	}
}

bs.events.db.onGetDBData = function(sData){

}

bs.events.db.onUpgrade = function(sData){
	bs.alert(sData, "bs.events.db.onUpgrade", true);
}

/********** DOM **********/

$(document).ready(function(){
	$('#tasklist_table tbody tr').each(function(){
		var id = parseInt($(this).attr('id').substr(4));

		var taskListInjectCode = "" + 
		"<div data-bind='foreach: db.data[db.statusesName]'>" +
			"<button data-bind='text: displayName'></button>" +
		"</div>";

		$('.task_summary', this).append(taskListInjectCode);
	});

	ko.applyBindings(bs);
});
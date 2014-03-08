bs.DEBUG(true);

bs.db.open(bs.db.tasksName());
bs.db.open(bs.db.statusesName());

bs.events.db.onOpen = function(sData){
	if(sData.dbName == bs.db.tasksName()){

	} else if(sData.dbName == bs.db.statusesName()){
		
	}
}

bs.events.tasks.onAdd = function(sData){
	
}

bs.events.tasks.onUpdate = function(sData){
	
}

bs.events.statuses.onSet = function(sData){
	
}

bs.events.statuses.onUpdate = function(sData){
	if(bs.db.data()[bs.db.statusesName()]().length == 0){//Initial statuses add
		bs.alert("Adding initial statuses", "bs.events.db.onUpdate", true);
		var clear = new status(0, "Clear", false);
		var dupe = new status(1, "Duplicate", false);
		var bookmark = new status(2, "Bookmark", false);
		
		bs.db.addStatus(clear);
		bs.db.addStatus(dupe);
		bs.db.addStatus(bookmark);
	}
	
}

bs.events.db.onGetDBData = function(sData){
	if(sData.dbName == bs.db.statusesName() && sData.data != undefined && sData.data == 'open'){
		$(document).ready(function(){
			var i = 0;
			$('#tasklist_table tbody tr').each(function(){
				var id = parseInt($(this).attr('id').substr(4));

				var taskListInjectCode = "" + 
				"<div class='bs_inlineStatusUpdate' data-bind='foreach: db.data()[db.statusesName()]()'>" +
					"<button data-bind='text: displayName'></button>" +
				"</div>";

				$('.task_summary', this).append(taskListInjectCode);
				ko.applyBindings(bs, $('.bs_inlineStatusUpdate')[i]);
				i++;
			});
		});
	}
}

bs.events.db.onUpgrade = function(sData){
	bs.alert(sData, "bs.events.db.onUpgrade", true);
}

/********** DOM **********/

bs.testClick = function(){
	bs.db.setStatus({"id": 0, "displayName": "POOP"});
}

$(document).ready(function(){
	$('#ecblocknews').append("<button data-bind='click: testClick'>Test</button>");

	ko.applyBindings(bs);
});
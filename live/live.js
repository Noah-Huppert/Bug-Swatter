bs.DEBUG(true);

bs.db.open(bs.db.tasksName());
bs.db.open(bs.db.statusesName());

bs.currentTaskID = 0;

bs.events.db.onOpen = function(sData){
	if(sData.dbName == bs.db.tasksName()){

	} else if(sData.dbName == bs.db.statusesName()){
		
	}
};

bs.events.tasks.onAdd = function(sData){
	
};

bs.events.tasks.onUpdate = function(sData){
	
};

bs.events.statuses.onSet = function(sData){
	
};

bs.events.tasks.onSet = function(sData){
	
};

bs.events.statuses.onUpdate = function(sData){
	if(bs.db.data()[bs.db.statusesName()]().length == 0){//Initial statuses add
		bs.alert("Adding initial statuses", "bs.events.db.onUpdate", true);
		var clear = new status(0, "Clear", false, "#27ae60");
		var dupe = new status(1, "Duplicate", false, "#e74c3c");
		var bookmark = new status(2, "Bookmark", false, "#8e44ad");
		
		bs.db.addStatus(clear);
		bs.db.addStatus(dupe);
		bs.db.addStatus(bookmark);
	}
	
};

bs.events.db.onGetDBData = function(sData){
	if(sData.dbName == bs.db.statusesName() && sData.data != undefined && sData.data == 'open'){
		$(document).ready(function(){
			bs.injectCode();
		});
	}
}

bs.events.db.onUpgrade = function(sData){
	bs.alert(sData, "bs.events.db.onUpgrade", true);
};

/********** DOM **********/

bs.testClick = function(){
	
};

bs.updateInlineStatus = function(){
	bs.alert("Updating statuses");
	$('#tasklist_table tbody tr').each(function(key, value){//Iterate though task list
		var taskID = parseInt($(this).attr('id').substr(4));//Get task ID from current row id

		bs.db.inlineTasksStatus()[taskID] = ko.computed(function(){
			var dbTask = bs.db.data()[bs.db.tasksName()]()[bs.db.findTaskByID(taskID)];
			if(dbTask != undefined){
				return dbTask.status;
			} else{
				return false;
			}
		});

		bs.currentInlineStatus = bs.db.inlineTasksStatus()[taskID]();

		if($('.bs_inlineStatus', this).length == 0){
			$('.task_summary', this).append( "" +
				"<span class='bs_inlineStatus' data-bind='" + 
									"style: { background: db.inlineTasksStatus()[" + taskID + "]() ? db.inlineTasksStatus()[" + taskID + "]().color :" + '"#FFFFFF"' + " }," +
									"visible: db.inlineTasksStatus()[" + taskID + "]()," +
				 					"text: db.inlineTasksStatus()[" + taskID + "]().displayName'>" + 
				 "</span>" +
				"<span class='bs_inlineArrow'><span></span>"
			);
			ko.applyBindings(bs, $('.bs_inlineStatus', this)[0]);
		}
	});
};

bs.injectCode = function(){
	/* Inline Status Indicator */
	bs.updateInlineStatus();

	/* Inline Status Box Injection */
	var taskListInjectCode = "" + 
	"<div class='bs_inlineStatusUpdate'>" +
		"<div data-bind='foreach: db.data()[db.statusesName()]()'>" +
			"<button data-bind='text: displayName, click: function() { bs.db.setTaskInline(bs.currentTaskID , id) }'></button>" +
		"</div>" +
		"<button data-bind='click: function() { bs.db.removeTaskInline(bs.currentTaskID) }'>Remove</button>"
	"</div>";

	$('body').prepend(taskListInjectCode);
	ko.applyBindings(bs, $('.bs_inlineStatusUpdate')[0]);


	/* Inline Status Box Handlers */
	$('.bs_inlineArrow').mouseenter(function(e){
		$('.bs_inlineStatusUpdate').css({
			'x': e.pageX + 2, 
			'y': e.pageY - $(window).scrollTop()
		});
		$('.bs_inlineStatusUpdate').show();
		bs.currentTaskID = parseInt($(this).parent().parent().attr('id').substr(4));
	});


	$('.bs_inlineArrow').mouseleave(function(e){
		if($('.bs_inlineStatusUpdate:hover').length == 0){
			$('.bs_inlineStatusUpdate').hide();
		}
	});

	$('.bs_inlineStatusUpdate').mouseleave(function(){
		$('.bs_inlineStatusUpdate').hide();
	});
};

$(document).ready(function(){
	$('#ecblocknews').append("<button data-bind='click: testClick'>Test</button>");

	ko.applyBindings(bs);
});
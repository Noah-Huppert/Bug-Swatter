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
	//bs.alert(sData);
	//bs.alert(bs.db.data()[bs.db.tasksName()]()[bs.db.findTaskByID(sData.id)]);
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

bs.injectInlineStatus = function(){
	$('#tasklist_table tbody tr').each(function(key, value){//Iterate though task list
		var taskID = parseInt($(this).attr('id').substr(4));//Get task ID from current row id

		if($('.bs_inlineStatus', this).length == 0){
			$('.task_summary', this).append( "" +
				"<span class='bs_inlineStatus' data-bind='" + 
									"style: { background: !!db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")] ? db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")].status.color :" + '"#FFFFFF"' + " }," +
									"visible: !!db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")]," +
				 					"text: !!db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")] ? db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")].status.displayName : " + '""' + "''>" + 
				 "</span>" +
				"<span class='bs_inlineArrow'><span></span>"
			);
			ko.applyBindings(bs, $('.bs_inlineStatus', this)[0]);
		}
	});
};

bs.injectDetailedStatus = function(){
	var taskID = parseInt($('.summary').html().replace(/\s+/g, '').substr(3, 4));
	
	if($('.bs_detailedStatus').length == 0){
		$('.summary').append("" +
			"<span class='bs_detailedStatus' data-bind='" + 
					"style: {background: !!db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")] ? db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")].status.color : " + '"white"' + "}," +
			 		"text: !!db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")] ? db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")].status.displayName : " + '""' + "'></span>" +
			"<div class='bs_detailedStatuses'>"+
				"<div data-bind='foreach: db.data()[db.statusesName()]()'>" +
					"<button data-bind='style: {background: color}, text: displayName, click: function() { bs.db.setTask({" + '"id": ' + taskID + " , " + '"statusID":' + "id}) }'></button>" +
				"</div>" +
				"<button data-bind='style: {border: " + '"1px solid #95a5a6"' + ", color: " + '"#000000"' + "}, click: function() { bs.db.removeTask(" + taskID + ") }'>Remove</button>" +
			"</div>"
		);
		ko.applyBindings(bs, $('.bs_detailedStatus')[0]);
		ko.applyBindings(bs, $('.bs_detailedStatuses')[0]);
	}
};

bs.showSettings = function(){

};

bs.injectCode = function(){
	/* Inline Status Indicator */
	if($('#tasklist_table').length != 0){
		bs.injectInlineStatus();
	}

	/* Detailed View Status Indicator */
	if($('.summary').length != 0){
		bs.injectDetailedStatus();
	}

	/* Inline Status Box Injection */
	var taskListInjectCode = "" + 
	"<div class='bs_inlineStatusUpdate'>" +
		"<div data-bind='foreach: db.data()[db.statusesName()]()'>" +
			"<button data-bind='style: {background: color}, text: displayName, click: function() { bs.db.setTask({" + '"id": ' + "bs.currentTaskID , " + '"statusID":' + "id}) }'></button>" +
		"</div>" +
		"<button data-bind='style: {border: " + '"1px solid #95a5a6"' + ", color: " + '"#000000"' + "}, click: function() { bs.db.removeTask(bs.currentTaskID) }'>Remove</button>" +
	"</div>";

	$('body').prepend(taskListInjectCode);
	ko.applyBindings(bs, $('.bs_inlineStatusUpdate')[0]);

	/* Settings Tab Inject code */
	var settingsTabInjectCode = "" + 
		"<li data-bind='click: (function(){ showSettings() })'><a>Bug Swatter Settings</a></li>";

	$('#pm-menu-list').append(settingsTabInjectCode);


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
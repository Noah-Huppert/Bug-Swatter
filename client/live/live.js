bs.DEBUG(true);

bs.db.open(bs.db.statusesName());
bs.db.open(bs.db.tasksName());

bs.currentTaskID = 0;
bs.currentTaskSummary = "Not available";

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
			//bs.alert(!!bs.db.data()[bs.db.tasksName()]()[bs.db.findTaskByID(taskID)] ? bs.db.data()[bs.db.tasksName()]()[bs.db.findTaskByID(taskID)].getDump() : "Nope", "bs.injectInlineStatus");
			$('.task_summary', this).append( "" +
				"<span class='bs_inlineStatus' data-bind='" + 
									"style: { background: !!db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")] ? db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")].getStatus().getColor() :" + '"#FFFFFF"' + " }," +
									"visible: !!db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")]," +
				 					"text: !!db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")] ? db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")].getStatus().getDisplayName() : " + '""' + "''>" + 
				 "</span>" +
				"<span class='bs_inlineArrow'><span></span>"
			);
			
			ko.applyBindings(bs, $('.bs_inlineStatus', this)[0]);
		}
	});
};

bs.injectDetailedStatus = function(){
	var taskID = parseInt($('.summary').html().replace(/\s+/g, '').substr(3, 4));
	var taskSummary = $('.summary').html().replace(/[\n\r]/g, '').replace(/\t+/g, '').substr(taskID.toString().length + 7);
	
	if($('.bs_detailedStatus').length == 0){
		$('.summary').append("" +
			"<span class='bs_detailedStatus' data-bind='" + 
					"style: {background: !!db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")] ? db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")].getStatus().getColor() : " + '"white"' + "}," +
			 		"text: !!db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")] ? db.data()[db.tasksName()]()[db.findTaskByID(" + taskID + ")].getStatus().getDisplayName() : " + '""' + "'></span>" +
			"<div class='bs_detailedStatuses'>"+
				"<div data-bind='foreach: db.data()[db.statusesName()]()'>" +
					"<button data-bind='style: {background: color}, text: displayName, click: function() { bs.db.setTask({" + '"id": ' + taskID + ", " + '"summary":"' + taskSummary + '"' + ", " + '"status":' + "id}) }'></button>" +
				"</div>" +
				"<button data-bind='style: {border: " + '"1px solid #95a5a6"' + ", color: " + '"#000000"' + "}, click: function() { bs.db.removeTask(" + taskID + ") }'>Remove</button>" +
			"</div>"
		);
		ko.applyBindings(bs, $('.bs_detailedStatus')[0]);
		ko.applyBindings(bs, $('.bs_detailedStatuses')[0]);
	}
};
bs.injectSettings = function(){
	/* Setting pages content */
	//Overview page

	var settingsPageContent = "" + 
	"<div id='settings' style='height: " + ($(window).height() - 120) + "px;'>" +
	 	"<div id='settings_menu'>" + 
	 		"<div id='BS_version'>Bug Swatter - <span data-bind='text: version'></span></div>" + 
	 		"<div id='settings_menu_pointer'>&nbsp;</div>" + 
	 		"<div class='settings_menu_option' data-page='overview'>Overview</div>" + 
	 		"<div class='settings_menu_option' data-page='tasks'>Tasks</div>" +
	 		"<div class='settings_menu_option' data-page='statuses'>Statuses</div>" +
	 		"<div class='settings_menu_option' data-page='settings'>General Settings</div>" +
	 	"</div>" +
	 	"<div id='settings_content'>"+
	 		"<!----------------------------------- OVERVIEW PAGE ----------------------------------->" +
	 		"<div data-bind='visible: settings.page() == " + '"overview"' + "'>" +
	 			"<div id='settings_overview_stats'>" + 
	 				"Tracking <span data-bind='text: db.data()[db.tasksName()]().length'></span> task<span data-bind='visible: db.data()[db.tasksName()]().length != 1'>s</span>" +
	 				" with <span data-bind='text: db.data()[db.statusesName()]().length'></span> statuses" +
	 			"</div>" + 
	 			"<!-- ko if: bs.db.data()[bs.db.tasksName()]().length != 0 -->" +
	 			"<div id='settings_overview_tasksList' data-bind='foreach: $(db.data()[db.tasksName()]()).splice(0, 10)'>" + 
	 				"<!-- ko if: $index() == 0 -->" + 
	 				"<div class='title'>Recent Tasks</div>" + 
	 				"<!-- /ko -->" + 
	 				"<div class='task'>" + 
	 					"<span class='task_id' data-bind='text: (" + '"FS#"' + " + id())'></span>" +
	 					"<span class='task_summary' data-bind='text: summary'></span>" +
	 					"<span class='task_status' data-bind='style: {background: bs.db.data()[bs.db.tasksName()]()[bs.db.findTaskByID(id())].getStatus().getColor()}, text: status().displayName()'></span>" +
	 				"</div>" +
	 			"</div>" + 
	 			"<!-- /ko -->" +
	 			"" +
	 			"" +
	 			"" +
	 			"<!-- ko if: bs.db.data()[bs.db.tasksName()]().length == 0 -->" + 
	 			"<div id='settings_overview_tasksList'>" +
	 				"<div class='title'>Recent Tasks</div>" + 
 					"<div class='task'>" + 
 						"<div class='task_summary'>There are no tasks being tracked</div>" +
 					"</div>" +
 				"</div>" +
 				"<!-- /ko -->" + 
 				"<!-- ko if: bs.db.data()[bs.db.statusesName()]().length != 0 -->" +
	 			"<div id='settings_overview_statusesList' data-bind='foreach: $(db.data()[db.statusesName()]()).splice(0, 10)'>" + 
	 				"<!-- ko if: $index() == 0 -->" + 
	 				"<div class='title'>Recent Statuses</div>" + 
	 				"<!-- /ko -->" + 
	 				"<div class='status'>" + 
	 					"<span class='status_name' data-bind='text: displayName'></span>" +
	 					"<span class='status_shared' data-bind='text: (shared() ? " + '"Yes":' + '"No"' + ")'></span>" +
	 					"<span class='status_color' data-bind='style: {background: bs.db.data()[bs.db.statusesName()]()[bs.db.findStatusByID(id())].getColor()}'> </span>" +
	 				"</div>" +
	 			"</div>" + 
	 			"<!-- /ko -->" +
	 			"<!-- ko if: bs.db.data()[bs.db.statusesName()]().length == 0 -->" + 
	 			"<div id='settings_overview_statusesList'>" +
	 				"<div class='title'>Recent Statuses</div>" + 
 					"<div class='status'>" + 
 						"<div class='status_name'>There are no statuses being used</div>" +
 					"</div>" +
 				"</div>" +
 				"<!-- /ko -->" + 
	 		"</div>" +
	 		"<!----------------------------------- TASKS PAGE ----------------------------------->" +
	 		"<div data-bind='visible: settings.page() == " + '"tasks"' + "'>" +
	 			"<div class='settings_tasks_tracking'>Currently Tracking <span data-bind='text: db.data()[db.tasksName()]().length'></span> task<span data-bind='visible: db.data()[db.tasksName()]().length != 1'>s</span></div>" +
	 			"<div class='settings_tasks_taskList'>" +
	 				"<div class='header'>" +
	 					"<div class='task'>" +
	 						"<div class='id'><strong>ID</strong></div>" +
	 						"<div class='summary'><strong>Summary</strong></div>" +
	 						"<div class='status'><strong>Status</strong></div>" +
	 					"</div>" +
	 				"</div>" +
	 				"<div data-bind='foreach: bs.db.data()[bs.db.tasksName()]()'>" +
	 					"<div class='task'>" +
	 						"<div class='id' data-bind='text: (" + '"FS#"' + " + id()) '></div>" +
	 						"<div class='summary' data-bind='text: summary()'></div>" +
	 						"<div class='status' data-bind='text: status().displayName()'></div>" +
	 					"</div>" +
	 				"</div>" +
	 			"</div>" +
	 		"</div>" +
	 	"</div>" +
	 	"<div id='settings_close'>X</div>" +
	 "</div>";

	 $('#content').after(settingsPageContent);
	 ko.applyBindings(bs, $('#settings')[0]);

	 /* Moving Menu Option Pointer */
	 $('.settings_menu_option').mouseenter(function(){
	 	var self = this;
	 	
		$('#settings_menu_pointer').transition({
				'top': $(self).offset().top,
				'queue': false
		 });
	 });

	 $('.settings_menu_option').mouseleave(function(){
	 	var self = this;
	 	$('#settings_menu_pointer').transition({
				'top': $('.settings_menu_option[data-page="' + bs.settings.page() + '"]').offset().top,
				'queue': false
		 });
	 })

	 /* Changing settings page */
	 $('.settings_menu_option').click(function(){
	 	bs.settings.page($(this).attr('data-page'));
	 	$('#settings_menu_pointer').transition({
				'border-left-color': '#e74c3c',
				'duration': 300
		 }).transition({
				'border-left-color': '#3498db',
				'duration': 300
		 });
	 });
};

bs.showSettings = function(){
	$('#content').hide();
	$('#settings').show();
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
			"<button data-bind='style: {background: color}, text: displayName, click: function() { bs.db.setTask({" + '"id": ' + "bs.currentTaskID , " + '"summary":' + 'bs.currentTaskSummary , ' + '"status":' + "id}) }'></button>" +
		"</div>" +
		"<button data-bind='style: {border: " + '"1px solid #95a5a6"' + ", color: " + '"#000000"' + "}, click: function() { bs.db.removeTask(bs.currentTaskID) }'>Remove</button>" +
	"</div>";

	$('body').prepend(taskListInjectCode);
	ko.applyBindings(bs, $('.bs_inlineStatusUpdate')[0]);


	/* Settings Tab Inject code */
	bs.injectSettings();
	var settingsTabInjectCode = "" + 
		"<li data-bind='click: function(){ showSettings() }'><a>Bug Swatter Settings</a></li>";

	$('#pm-menu-list').append(settingsTabInjectCode);
	ko.applyBindings(bs, $('#pm-menu-list')[0]);


	/* Inline Status Box Handlers */
	$('.bs_inlineArrow').mouseenter(function(e){
		$('.bs_inlineStatusUpdate').css({
			'x': e.pageX + 2, 
			'y': e.pageY - $(window).scrollTop()
		});
		$('.bs_inlineStatusUpdate').show();
		bs.currentTaskID = parseInt($(this).parent().parent().attr('id').substr(4));
		bs.currentTaskSummary = $(this).parent().text().substr(0, $(this).parent().text().length - (!!bs.db.data()[bs.db.tasksName()]()[bs.db.findTaskByID(bs.currentTaskID)] ? bs.db.data()[bs.db.tasksName()]()[bs.db.findTaskByID(bs.currentTaskID)].getStatus().getDisplayName().length : 0));
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
	$('#ecblocknews').append("<button id='testButton' data-bind='click: testClick'>Test</button>");

    bs.io.connect();

	ko.applyBindings(bs);
});
bs.DEBUG(true);

bs.db.open(bs.db.tasksName());
bs.db.open(bs.db.statusesName());

bs.currentTaskID = 0;

bs.events.db.onOpen = function(sData){
	if(sData.dbName == bs.db.tasksName()){

	} else if(sData.dbName == bs.db.statusesName()){
		
	}
}

bs.events.tasks.onAdd = function(sData){
	bs.alert(sData, "bs.events.tasks.onAdd", true);
}

bs.events.tasks.onUpdate = function(sData){
	
}

bs.events.statuses.onSet = function(sData){
	
}

bs.events.tasks.onSet = function(sData){
	bs.alert(sData, "bs.events.tasks.onSet", true);
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
			bs.db.setTaskInline = function(tID, sID){
				if(bs.db.data()[bs.db.tasksName()]()[tID] != undefined){//Task Exists
					bs.db.setTask({ "id": tID, "status": sID });
				} else{//Task does not exist
					bs.db.addTask(new task(tID, sID));
				}
			}

			$('#tasklist_table tbody tr').each(function(){
				var currentTaskKey = bs.db.data()[bs.db.tasksName()]();
				var id = parseInt($(this).attr('id').substr(4));
				$.each(currentTaskKey, function(key, value){
					if(value.id == id){
						currentTaskKey = key;
					}
				});
				if(currentTaskKey.id == undefined){
					currentTaskKey = undefined;
				}

				if(currentTaskKey != undefined){
					$('.task_summary', this).append("<span class='bs_inlineStatus' data-bind='bs.db.data()[bs.db.tasksName()]()[" + currentTaskKey + "]'></span>");
				}
				$('.task_summary', this).append("<span class='bs_inlineArrow'><span></span>");
			});

			var taskListInjectCode = "" + 
			"<div class='bs_inlineStatusUpdate' data-bind='foreach: db.data()[db.statusesName()]()'>" +
				"<button data-bind='text: displayName, click: bs.db.setTaskInline(bs.currentTaskID , id)'></button>" +
			"</div>";

			$('body', this).prepend(taskListInjectCode);
			ko.applyBindings(bs, $('.bs_inlineStatusUpdate')[0]);

			$('.bs_inlineArrow').mouseenter(function(e){
				$('.bs_inlineStatusUpdate').css({
					'x': e.pageX + 2, 
					'y': e.pageY - $(window).scrollTop()
				});
				$('.bs_inlineStatusUpdate').show();
				bs.currentTaskID = parseInt($(this).parent().parent().attr('id').substr(4));
			});


			$('.bs_inlineArrow').mouseleave(function(e){
				if(!$('.bs_inlineStatusUpdate').is(":hover")){
					$('.bs_inlineStatusUpdate').hide();
				}
			});

			$('.bs_inlineStatusUpdate').mouseleave(function(){
				$('.bs_inlineStatusUpdate').hide();
			});
		});
	}
}

bs.events.db.onUpgrade = function(sData){
	bs.alert(sData, "bs.events.db.onUpgrade", true);
}

/********** DOM **********/

bs.testClick = function(){
	
}

$(document).ready(function(){
	$('#ecblocknews').append("<button data-bind='click: testClick'>Test</button>");

	ko.applyBindings(bs);
});
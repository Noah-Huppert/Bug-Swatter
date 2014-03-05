ko.applyBindings(bs);
$('.ecblock').append('<div data-bind="foreach: db.dbData.tasks"><li>Yo</li></div>');

bs.db.open(bs.db.tasksName);
bs.db.open(bs.db.statusesName);

bs.events.db.onOpen = function(sData){
	if(sData.dbName == bs.db.tasksName){
		console.log("Opened tasks");
	} else if(sData.dbName == bs.db.statusesName){
		console.log("Opened statuses");
	}
}
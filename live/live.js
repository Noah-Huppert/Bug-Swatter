/*
-Statuses
  -Cleared --> #2ecc71 --> bs_cleared
  -Marked as dupe --> #e74c3c --> bs_duped
  -Bookmarked --> #8e44ad --> bs_bookmarked
*/
var reloadPage = true;
var bugs = [];
var gVars = location.search.replace('?', '').split('&').map(function(val){
  return val.split('=');
});
var id = 'No data';
var autoSub = false;
function getAutosub(){
	chrome.storage.sync.get('autoSub', function(result){//Setting bugs from storage\
		if(result != undefined){
			autoSub = result.autoSub;
		} else{
			chrome.storage.sync.set(
				{
				 	"autoSub": 'true'
				}
			);
			autoSub = true;
		}
	});
	return autoSub;
}

$(gVars).each(function(){//Get task id
	if(this[0] == "task_id"){
		id = this[1];
	}
});

$('.summary:contains("' + id + '")').append(//For inside task
	'<br>' + 
	'<button class="bs_button bs_clearButton" data-bsAction="bs_cleared" data-bsID="' + id + '">Clear</button>' + 
	'<button class="bs_button bs_dupeButton" data-bsAction="bs_duped" data-bsID="' + id + '">Mark as duplicate</button>' + 
	'<button class="bs_button bs_bookmarkButton" data-bsAction="bs_bookmarked" data-bsID="' + id + '">Bookmark</button>' +
	'<button class="bs_button bs_removeButton" data-bsAction="bs_remove" data-bsID="' + id + '">Remove</button>'); 

	
function Bug(sID, sStatus){
	this.id = sID;
	this.status = sStatus;
	
	$('.task_id a:contains("' + this.id + '")').addClass(this.status).addClass("bs_listItem");//For tasks list
	$('.summary:contains("' + this.id + '")').addClass(this.status);//For inside marked tasks
}
chrome.storage.sync.get('BS_bugs', function(result){//Setting bugs from storage
	parsedJSON = JSON.parse(result.BS_bugs);
	if(parsedJSON != undefined){
		$(parsedJSON).each(function(){
			bugs.push(new Bug(this.id, this.status));
		});
	}
});

$('.bs_button').click(function(){
	var bugID = $(this).attr('data-bsID');
	var bugAction = $(this).attr('data-bsAction');
	var found = false;
	
	
	if(bugAction == "bs_duped" && getAutosub() == true){
		reloadPage = false;
	}
	
	if(bugAction == "bs_remove"){
		for(var bugKey = 0; bugKey < bugs.length; bugKey++){
			if(bugs[bugKey].id == bugID){
				bugs.splice(bugKey, 1);
				chrome.storage.sync.set(
					{
					 	"BS_bugs": JSON.stringify(bugs)
					}
				);
			}
		}
	} else{
		//Check if bug exists in storage
		for(var bugKey = 0; bugKey < bugs.length; bugKey++){
			if(bugs[bugKey].id == bugID){
				bugs[bugKey].status = bugAction;
				chrome.storage.sync.set(
					{
					 	"BS_bugs": JSON.stringify(bugs)
					}
				);
				found = true;
			}
		}
		
		if(found == false){
			bugs.push(new Bug(bugID, bugAction));
			chrome.storage.sync.set(
				{
				 	"BS_bugs": JSON.stringify(bugs)
				}
			);
		}
	}
	
	if(reloadPage == true){
		location.reload();
	} else{
		reloadPage = true;
	}
	
	if(bugAction == "bs_duped" && getAutosub() == true){
		window.location.href = $('a:contains("(watch task)")').attr("href");
		console.log("Watching");
	}
});

$('#closeform button').click(function(){
	reloadPage = false;
	$('.bs_dupeButton').click();
});
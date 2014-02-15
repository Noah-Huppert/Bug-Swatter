var bs_type = "all";

function setList(){
	chrome.storage.sync.get('BS_bugs', function(result){//Setting bugs from storage
		parsedJSON = JSON.parse(result.BS_bugs);
		if(parsedJSON != undefined){
			$('.bug').remove();
			$(parsedJSON).each(function(){
				if(this.status == bs_type || bs_type == "all"){
					$('#tasks').append(
					'<div class="bug" data-status="' + this.status.substring(3, this.status.length) + '">' +
						'<div class="title"><a href="http://pa.lennardf1989.com/Tracker/index.php?do=details&task_id=' + this.id + '">FS#' + this.id + '</a></div>' +
						'<div class="status">' + this.status.substring(3, this.status.length) + '</div>' +
					'</div>'
					);	
				}
			});
		}
	});
}

$(document).ready(function(){
	setList();
   $('body').on('click', 'a', function(){
     chrome.tabs.create({url: $(this).attr('href')});
     return false;
   });
   
   $('.bs_button').click(function(){
		bs_type = $(this).attr('data-catagory');
		setList();
	});
	
	chrome.storage.sync.get('autoSub', function(result){//Setting bugs from storage\
		if(result != undefined){
			console.log(result.autoSub);
			if(result.autoSub == true){
				$('#autoSub').attr('checked', false);
			} else{
				$('#autoSub').attr('checked', true);
			}
		} else{
			chrome.storage.sync.set(
				{
				 	"autoSub": 'true'
				}
			);
		}
	});
	
	$('#autoSub').change(function(){
		chrome.storage.sync.set(
			{
			 	"autoSub": this.checked
			}
		);
	});
});

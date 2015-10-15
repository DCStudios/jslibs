var DefineTask;

( function() {

	DefineTask = function( taskContainer ) {

		$( taskContainer ).each( function(i,e) {
			var $taskContainer = $(e);

			$taskContainer.html(
				'<div class="createTaskListModal" title="Create new TaskList">'+
		          '<form>'+
		            '<fieldset>'+
		              '<label for="name">TaskList Name</label>'+
		              '<input type="text" name="tasklistName" class="tasklistName" value="TODO" class="text ui-widget-content">'+

		              '<!-- Allow form submission with keyboard without duplicating the dialog button -->'+
		              '<input type="submit" tabindex="-1" style="position:absolute; top:-1000px">'+
		            '</fieldset>'+
		          '</form>'+
		        '</div>'+
				'<div class="createTaskListButton">+</div>'+
				$taskContainer.html() +
				'<div style="clear:both;"></div>'
			);

			$taskContainer.find(".taskList").sortable({
				placeholder: "taskPlaceholder",
				helper: "clone",
				cursorAt: { left: 64, top: 16 },
				connectWidth: ".taskList"
			});

			$taskContainer.find( "form" ).each( function( fi,fe) {
				$form = $(fe);
				$form.off("submit").on("submit", function(evt){
					evt.preventDefault();
					console.log( "Create new TaskList '"+$form.find(".tasklistName").val()+"'" );
				});
			});

			$createTaskListModal = $taskContainer.find( ".createTaskListModal" ).dialog({
				autoOpen: false,
				width: 400,
				height: 200,
				modal: true,
				buttons: {
					"Create TaskList": function() {
						console.log( "Creating tasklist '"+$(".tasklistName",$createTaskListModal).val()+"'" );
						$createTaskListModal.dialog( "close" );
					},
					Cancel: function(){ $createTaskListModal.dialog( "close" ); }
				}
			});
		});

	};

})();

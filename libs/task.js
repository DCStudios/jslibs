var DefineTask;

( function() {

	DefineTask = function( taskContainer ) {

		$( taskContainer ).each( function(i,e) {
			var $taskContainer = $(e);
			var $createTaskListModal;

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
				'<div class="dummy" style="clear:both;"></div>'
			);

			// TODO: FIX LIST CONNECTION PROBLEM
			$taskContainer.find( "form" ).each( function( fi,fe) {
				$form = $(fe);
				$form.off("submit").on("submit", function(evt){
					evt.preventDefault();
					$form.closest(".createTaskListModal").dialog("close");
					var $tasklist = $("<div></div>");
					createTask( "Demo", "This is a demo task generated with 'createTask()'.", "" ).appendTo( $tasklist);
					$tasklist.attr("class","taskList")
						.attr("data-category", $form.find(".tasklistName").val() )
						.insertBefore( $taskContainer.find(".dummy") )
						.sortable({
							placeholder: "taskPlaceholder",
							dropOnEmpty: true,
							containment: $taskContainer,
							helper: "clone",
							cursorAt: { left: 64, top: 16 },
							connectWidth: ".taskContainer"
						});
				});
			});

			$createTaskListModal = $taskContainer.find( ".createTaskListModal" ).dialog({
				autoOpen: false,
				width: 400,
				height: 200,
				modal: true,
				buttons: {
					"Create TaskList": function() {
						$createTaskListModal.find( "form" ).submit();
					},
					Cancel: function(){ $createTaskListModal.dialog( "close" ); }
				}
			});

			$taskContainer.find(".createTaskListButton").on("click", function(){
				$createTaskListModal.dialog("open")
			});
		});

	};

	function createTask( name, content, tags ) {
		var $task = $("<div></div>").attr("class","task");
		var $taskTitle = $("<h1></h1>").attr("class","task-name");
		var $taskContent = $("<p></p>").attr("class","task-content");
		$taskTitle.html(name).appendTo( $task );
		$taskContent.html(content).appendTo( $task );
		return $task;
	}

})();

var DefineTask;

/*
	#COMPLETED:0 Add 'Add','Edit','Remove' options to .taskList
	#DOING:0 Add 'Add', 'Edit', 'Remove' otpions to .task
*/

( function() {

	/*
		#TODO:0 Save configuration to taskID.json
		#TODO:10 Load configuration when DefineTask is called

		Syntax of the task.js .json container:

		{
			"todo": [
				{ name:"Demo", content:"Some Content", tags:"ced cedrik dubois" },
				{ name:"Dem2o", content:"Some2 Content2", tags:"ced2 cedrik2 dubois2" },
			]
		}
	*/

	/**
	 * Transform all 'taskContainer' into TaskManagers
	 * @param  {selector} taskContainer The elements selector to use as TaskContainer
	 */
	DefineTask = function( taskContainer ) {

		$( taskContainer ).each( function(i,e) {
			var $taskContainer = $(e);
			var $createTaskListModal;

			$taskContainer.html("");
			$taskContainer.append( generateCreateTasklistModal() );
			$taskContainer.append( $('<div class="createTaskListButton"><i class="fa fa-plus"></i></div>') );
			$taskContainer.append( $('<div class="dummy" style="clear:both;"></div>') );

			// #COMPLETED:10 Fix the connectWith with .taskList
			$taskListForm = $taskContainer.find( ".createTaskListModal form" );
			$taskListForm.off("submit").on("submit", function(evt){
				evt.preventDefault();
				$taskListForm.closest(".createTaskListModal").dialog("close");

				var tasklist = {};

				tasklist.$tasklist = createNewTaskList( $taskListForm.find(".tasklistName").val() );
				tasklist.$taskForm = tasklist.$tasklist.find(".createTaskModal form");
				tasklist.$editForm = tasklist.$tasklist.find(".editTaskListModal form");
				tasklist.$tasklist.insertBefore( $taskContainer.find(".dummy") ).sortable({
					placeholder: "taskPlaceholder",
					handle: ".task-name",
					cancel: ".task-close",
					dropOnEmpty: true,
					helper: "clone",
					cursorAt: { left: 64, top: 16 },
					connectWidth: ".taskList"
				});

				tasklist.$createTaskModal = tasklist.$tasklist.find( ".createTaskModal" ).dialog({
					autoOpen: false,
					width: 400,
					modal: true,
					buttons: {
						"Create Task": function() { tasklist.$taskForm.submit(); },
						Cancel: function(){ tasklist.$createTaskModal.dialog("close"); }
					}
				});

				tasklist.$editTaskListModal = tasklist.$tasklist.find( ".editTaskListModal" ).dialog({
					autoOpen: false,
					width: 400,
					modal: true,
					buttons: {
						"Edit Task": function() { tasklist.$editForm.submit(); },
						Cancel: function() { tasklist.$editTaskListModal.dialog("close"); }
					}
				});

				tasklist.onFormSubmit = function(evt) {
					evt.preventDefault();
					this.$createTaskModal.dialog("close");
					var $task = createNewTask(
						this.$taskForm.find(".taskName").val(),
						this.$taskForm.find(".taskContent").val(),
						this.$taskForm.find(".taskTags").val()
					);
					this.$tasklist.append( $task );
				}.bind( tasklist );
				tasklist.$taskForm.on("submit", tasklist.onFormSubmit );

				tasklist.onEditFormSubmit = function(evt) {
					evt.preventDefault();
					this.$editTaskListModal.dialog("close");
					this.$tasklist.attr("data-category", this.$editForm.find(".tasklistName").val() );
				}.bind( tasklist );
				tasklist.$editForm.on("submit", tasklist.onEditFormSubmit );

				tasklist.onAdd = function() {
					this.$createTaskModal.dialog("open");
				}.bind( tasklist );
				tasklist.$tasklist.find( ".taskList-add" ).on("click", tasklist.onAdd );

				tasklist.onEdit = function() {
					this.$editTaskListModal.dialog("open");
				}.bind( tasklist );
				tasklist.$tasklist.find( ".taskList-edit" ).on("click", tasklist.onEdit );

				tasklist.onRemove = function() {
					this.$tasklist.remove();
				}.bind( tasklist );
				tasklist.$tasklist.find( ".taskList-close" ).on("click", tasklist.onRemove );

				$taskContainer.find(".taskList").each( function( ti,te ){
					$(te).sortable("option","connectWith",".taskList");
				});

				$taskListForm[0].reset();
			});

			$createTaskListModal = $taskContainer.find( ".createTaskListModal" ).dialog({
				autoOpen: false,
				width: 400,
				modal: true,
				buttons: {
					"Create TaskList": function() {
						$createTaskListModal.find( "form" ).submit();
					},
					Cancel: function(){ $createTaskListModal.dialog( "close" ); }
				}
			});



			$taskContainer.find(".createTaskListButton").on("click", function(){
				$createTaskListModal.dialog("open");
				$createTaskListModal.find(".tasklistName").select();
			});
		});

	};

	/**
	 * Create the modal that will be used for creating new TaskList
	 * @return {jQuery} A jQuery.Dialog object
	 */
	function generateCreateTasklistModal() {
		var $modal = $("<div></div>").attr("class","createTaskListModal").attr("title","Create new TaskList");
		var $form = $("<form></form>");
		var $field = $("<fieldset></fieldset>");
		$field.append( $("<label></label>").attr("for","tasklistName").html("TaskList's Name") );
		$field.append( $("<input></input>")
			.attr("type","text")
			.attr("name","tasklistName")
			.attr("class","tasklistName text ui-widget-content formInput")
			.attr("value","TODO"));
		$field.append( $("<input></input>")
			.attr("type","submit")
			.attr("tabindex","-1")
			.attr("style","position:absolute; top: -1000px;")
		);
		$modal.append( $form.append( $field ) );
		return $modal;
	}

	/**
	 * Create the modal that will be used for editing TaskList name
	 * @return {jQuery} A jQuery.Dialog object
	 */
	function generateEditTasklistModal( currentName ) {
		var $modal = $("<div></div>").attr("class","editTaskListModal").attr("title","Edit TaskList Name");
		var $form = $("<form></form>");
		var $field = $("<fieldset></fieldset>");
		$field.append( $("<label></label>").attr("for","tasklistName").html("TaskList's Name") );
		$field.append( $("<input></input>")
			.attr("type","text")
			.attr("name","tasklistName")
			.attr("class","tasklistName text ui-widget-content formInput")
			.attr("value", currentName ) );
		$field.append( $("<input></input>")
			.attr("type","submit")
			.attr("tabindex","-1")
			.attr("style","position:absolute; top: -1000px;")
		);
		$modal.append( $form.append( $field ) );
		return $modal;
	}


	/**
	 * Create the modal that will be used for creating new Task
	 * @return {jQuery} A jQuery.Dialog object
	 */
	function generateCreateTaskModal() {
		var $modal = $("<div></div>").attr("class","createTaskModal").attr("title","Create new Task");
		var $form = $("<form></form>");
		var $field = $("<fieldset></fieldset>");
		$field.append( $("<label></label>").attr("for","taskName").html("Task's Name") );
		$field.append( $("<input></input>")
			.attr("type","text")
			.attr("name","taskName")
			.attr("class","taskName text ui-widget-content formInput")
			.attr("value","New Task"));
		$field.append( $("<label></label>").attr("for","taskContent").html("Task's Description") );
		$field.append( $("<input></input>")
			.attr("type","text")
			.attr("name","taskContent")
			.attr("class","taskContent text ui-widget-content formInput")
			.attr("value",""));
		$field.append( $("<label></label>").attr("for","taskTags").html("Task's Tags") );
		$field.append( $("<input></input>")
			.attr("type","text")
			.attr("name","taskTags")
			.attr("class","taskTags text ui-widget-content formInput")
			.attr("value",""));
		$field.append( $("<input></input>")
			.attr("type","submit")
			.attr("tabindex","-1")
			.attr("style","position:absolute; top: -1000px;")
		);
		$modal.append( $form.append( $field ) );
		return $modal;
	}

	/**
	 * Create a new Task
	 * @param  {string} name    Name of the task
	 * @param  {string} content The description of the task
	 * @param  {string} tags    OPTIONAL | The tags of the task
	 * @return {jQuery}         A jQuery object ready to be injected
	 */
	function createNewTask( name,content,tags ) {
		var $task = $("<div></div>").attr("class","task");
		$("<h1></h1>").attr("class","task-name").html(name).appendTo($task);
		$("<p></p>").attr("class","task-content").html(content).appendTo($task);
		var data = { "name":name, "content":content, "tags":tags };
		$task.data("taskData",data);
		return $task;
	}

	/**
	 * Create a new TaskList
	 * @param  {string} name The name of the tasklist
	 * @return {jQuery}      A jQuery object ready to be injected
	 */
	function createNewTaskList( name ) {
		return $("<div></div>")
		.append( generateCreateTaskModal() )
		.append( generateEditTasklistModal() )
		.append($("<div></div>").attr("class","taskList-button taskList-close")
			.append( $("<i></i>").attr("class","fa fa-trash")))
		.append($("<div></div>").attr("class","taskList-button taskList-edit")
			.append( $("<i></i>").attr("class","fa fa-pencil")))
		.append($("<div></div>").attr("class","taskList-button taskList-add")
				.append( $("<i></i>").attr("class","fa fa-plus")))
		.attr("class","taskList")
		.attr("data-category", name );
	}

})();

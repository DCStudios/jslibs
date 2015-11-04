/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jqueryui/jqueryui.d.ts" />

/*
	ImDone stuff:
	#COMPLETED:50 Fix the connectWith with .taskList
	#COMPLETED:40 Add 'Add','Edit','Remove' options to .taskList
	#COMPLETED:30 Add 'Remove' otpions to .task
	#TODO:20 Save configuration to taskID.json
	#TODO:30 Load configuration when DefineTask is called
	#COMPLETED:10 Rewrite Task.js to be object oriented +Typescript
	#COMPLETED:20 Create and add a Task in a TaskList
	#TODO:0 Add tags to Task
	#TODO:10 Add READONLY support to task.js +UserRights
*/

/**
 * The TaskContainer is the root object which manages a taskboard.
 */
class TaskContainer {
	protected dummy:JQuery;
	protected container:JQuery;
	protected tasklistForm:JQuery;
	protected tasklistModal:JQuery;
	protected createTasklistButton:JQuery;

	/**
	 * Create a new TaskContainer
	 * @param  {HTMLElement} sourceElement The root element which will contain the Tasks
	 */
	constructor( sourceElement:JQuery ) {
		this.container = sourceElement;

		this.dummy = null;
		this.tasklistForm = null;
		this.tasklistModal = null;
		this.createTasklistButton = null;

		this.generateElements();
		this.buildContainer();
	}

	/**
	 * Generate all the needed jQuery elements which will
	 * then be added later.
	 */
	private generateElements():void {
		this.generateDummyDiv();
		this.generateCreateTasklistModal();
		this.generateCreateTaskListButton();
	}

	/**
	 * Create the necessary modals to start adding TaskLists
	 * to the TaskContainer.
	 */
	private buildContainer():void {
		this.container.empty();
		this.container.append( this.createTasklistButton );
		this.container.append( this.dummy );
	}

	/**
	 * Create a div which will make sure TaskContainer correctly
	 * contains the floating TaskLists.
	 */
	private generateDummyDiv():void {
		this.dummy = $("<div></div>").attr("style","clear:both;");
	}

	/**
	 * Create the button to add TaskList in the TaskContainer
	 */
	private generateCreateTaskListButton():void {
		this.createTasklistButton = $("<div></div>").attr("class","createTaskListButton");
		this.createTasklistButton.on( "click", this.onButtonCreateTasklist.bind( this ) );
		this.createTasklistButton.append( $("<i></i>").attr("class","fa fa-plus") );
	}

	/**
	 * Create the modal that will be used for creating new TaskList
	 */
	private generateCreateTasklistModal():void {
		var html:JQuery = $("<div></div>").attr("class","createTaskListModal").attr("title","Create new TaskList");
		this.tasklistForm = $("<form></form>");
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
		html.append( this.tasklistForm.append( $field ) );
		this.tasklistModal = html.dialog({
			autoOpen: false,
			width: 400,
			modal: true,
			buttons:{
				"Create Category": this.onTasklistModalCreate.bind( this ),
				"Cancel": this.onTasklistModalCancel.bind( this )
			}
		});
		this.tasklistForm.on( "submit", this.onTasklistModalSubmit.bind( this ) );
	}

	/**
	 * Open the CreateTasklist Modal
	 */
	private onButtonCreateTasklist():void {
		this.tasklistModal.dialog("open");
		( <HTMLFormElement>this.tasklistForm[0] ).reset();
		this.tasklistForm.find(".tasklistName").select();
	}

	/**
	 * Clicked 'Create Category' in the CreateTasklist Modal
	 */
	private onTasklistModalCreate():void {
		this.tasklistForm.submit();
	}

	/**
	 * Clicked 'Cancel' in the CreateTasklist Modal
	 */
	private onTasklistModalCancel():void {
		this.tasklistModal.dialog("close");
	}

	/**
	 * Create a new TaskList and add it to the TaskContainer
	 * @param {JQueryEventObject} e The modal's form submit event
	 */
	private onTasklistModalSubmit( event:JQueryEventObject ):void {
		event.preventDefault();
		this.tasklistModal.dialog("close");
		new TaskList( this.tasklistForm.find(".tasklistName").val() ).Handle().insertBefore( this.dummy );
	}
}

/**
 * A TaskList is a category in which task can be organized.
 */
class TaskList {
	private _category:string;
	private tasklist:JQuery;
	private title:JQuery;

	private createTaskForm:JQuery;
	private editTasklistForm:JQuery;
	private createTaskModal:JQuery;
	private editTasklistModal:JQuery;


	get category():string { return this._category; }
	set category( val:string ) {
		if( this._category != val ) {
			this._category = val;
			this.tasklist.attr("data-category",val);
		}
	}

	constructor( category:string ) {
		this.tasklist = null;
		this.title = null;
		this.createTaskForm = null;
		this.createTaskModal = null;
		this.editTasklistForm = null;
		this.editTasklistModal = null;

		this.generateElements();
		this.buildSelf();

		this.category = category;
	}

	private generateElements():void {
		this.generateCreateTaskModal();
		this.generateEditTasklistModal();
	}

	private buildSelf():void {
		this.tasklist = $("<div></div>").attr("class","taskList");
		this.tasklist.append( this.generateButton( "taskList-close", "fa-trash", this.onClosed ) );
		this.tasklist.append( this.generateButton( "taskList-edit", "fa-pencil", this.onEditCategory ) );
		this.tasklist.append( this.generateButton( "taskList-add", "fa-plus", this.onCreateNewTask ) );
		this.tasklist.sortable({
			placeholder: "taskPlaceholder",
			handle: ".task-name",
			cancel: ".task-button",
			dropOnEmpty: true,
			helper: "clone",
			cursorAt: {
				left: 64,
				top: 16
			},
			connectWith: '.taskList'
		});
	}

	private generateButton( buttonClass:string, iconClass:string, buttonCallback:()=>void ):JQuery {
		return $("<div></div>").attr("class", "taskList-button "+buttonClass).html("<i class='fa "+iconClass+"'></i>")
			.on("click", buttonCallback.bind( this ) );
	}

	/**
	 * Create the modal that will be used for creating new Task
	 */
	private generateCreateTaskModal():void {
		this.createTaskModal = $("<div></div>").attr("class","createTaskModal").attr("title","Create new Task");
		this.createTaskForm = $("<form></form>");
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
		this.createTaskModal.append( this.createTaskForm.append( $field ) );
		this.createTaskModal.dialog({
			autoOpen: false,
			width: 400,
			modal: true,
			buttons: {
				"Create Task": this.onModalCreateTaskCreate.bind( this ),
				"Cancel": this.onModalCreateTaskCancel.bind( this )
			}
		});
		this.createTaskForm.on( "submit", this.onCreateTaskSubmit.bind( this ) );
	}

	/**
	 * Create the modal that will be used for editing TaskList name
	 */
	private generateEditTasklistModal():void {
		this.editTasklistModal = $("<div></div>").attr("class","editTaskListModal").attr("title","Edit TaskList Name");
		this.editTasklistForm = $("<form></form>");
		var $field = $("<fieldset></fieldset>");
		$field.append( $("<label></label>").attr("for","tasklistName").html("TaskList's Name") );
		$field.append( $("<input></input>")
			.attr("type","text")
			.attr("name","tasklistName")
			.attr("class","tasklistName text ui-widget-content formInput")
			.attr("value", this.category ) );
		$field.append( $("<input></input>")
			.attr("type","submit")
			.attr("tabindex","-1")
			.attr("style","position:absolute; top: -1000px;")
		);
		this.editTasklistModal.append( this.editTasklistForm.append( $field ) ).dialog({
			autoOpen: false,
			width: 400,
			modal: true,
			buttons: {
				"Edit Category": this.onModalEditTasklistEdit.bind( this ),
				"Cancel": this.onModalEditTasklistCancel.bind( this )
			}
		});
		this.editTasklistForm.on("submit", this.onEditFormSubmit.bind( this ) );
	}

	private onCreateNewTask():void {
		this.createTaskModal.dialog("open");
		( <HTMLFormElement>this.createTaskForm[0] ).reset();
		this.createTaskForm.find(".taskName").select();
	}

	private onEditCategory():void {
		this.editTasklistModal.dialog("open");
		( <HTMLFormElement>this.editTasklistForm[0] ).reset();
		this.editTasklistForm.find(".tasklistName").val( this.category ).select();
	}

	/**
	 * Clicked on 'Create Task' in the CreateTask Modal
	 */
	private onModalCreateTaskCreate():void {
		this.createTaskForm.submit();
	}

	/**
	 * Clicked on 'Cancel' in the CreateTask Modal
	 */
	private onModalCreateTaskCancel():void {
		this.createTaskModal.dialog( "close" );
	}

	/**
	 * Clicked on 'Edit Category' in the EditTask Modal
	 */
	private onModalEditTasklistEdit():void {
		this.editTasklistForm.submit();
	}

	/**
	 * Clicked on 'Cancel' in the EditTask Modal
	 */
	private onModalEditTasklistCancel():void {
		this.editTasklistModal.dialog("close");
	}

	/**
	 * Create a new Task and add it to this TaskList.
	 * @param {JQueryEventObject} event The CreateTask's form event
	 */
	private onCreateTaskSubmit( event:JQueryEventObject ):void {
		event.preventDefault();
		this.createTaskModal.dialog("close");
		this.tasklist.append( new Task(
			this.createTaskForm.find(".taskName").val(),
			this.createTaskForm.find(".taskContent").val(),
			this.createTaskForm.find(".taskTags").val()
		).Handle() );
	}

	private onEditFormSubmit( event:JQueryEventObject ):void {
		event.preventDefault();
		this.editTasklistModal.dialog("close");
		this.category = this.editTasklistForm.find(".tasklistName").val();
	}

	/**
	 * Delete the TaskList
	 */
	private onClosed():void {
		this.tasklist.remove();
		this.tasklist = null;
		this.title = null;
		this.createTaskForm = null;
		this.editTasklistForm = null;
		this.createTaskModal = null;
		this.editTasklistModal = null;
	}

	/**
	 * Returns the JQuery object to use to add the TaskList in a TaskContainer
	 * @return {JQuery} The TaskList's JQuery representation
	 */
	public Handle():JQuery {
		return this.tasklist;
	}
}

/**
 * A task can be moved from a TaskList to another.
 * It usually contains useful information about a task.
 */
class Task {
	private _name:string;
	private task:JQuery;
	private taskName:JQuery;

	get name():string { return this._name; }
	set name( val:string ) {
		if( this._name != val ) {
			this._name = val;
			this.taskName.html( val );
		}
	}

	/**
	 * Create a new Task
	 * @param  {string} name    The name of the Task
	 * @param  {string} content The description of the Task
	 * @param  {string} tags    The tags of the Task ( space seperated )
	 */
	constructor( name:string, content:string, tags:string ) {
		this.buildSelf( content );
		this.name = name;
	}

	/**
	 * Build the task's HTML
	 * @param {string} content The description to include
	 */
	private buildSelf( content:string ):void {
		this.task = $("<div></div>").attr("class","task");
		this.taskName = $("<h1></h1>").attr("class","task-name").html( this.name );
		this.task.append( this.taskName );
		$("<div></div>").attr("class","task-button task-close").append($("<i></i>").attr( "class","fa fa-trash"))
			.appendTo( this.task ).on( "click", this.onClosed.bind( this ) );
		this.task.append( $("<p></p>").attr("class","task-content").attr("contenteditable","true").html(content) );
	}

	/**
	 * Delete the Task
	 */
	private onClosed():void {
		this.task.remove();
		this.task = null;
		this.taskName = null;
	}

	/**
	 * Returns the JQuery object to use to add the Task in a TaskList
	 * @return {JQuery} The Task's JQuery representation
	 */
	public Handle():JQuery {
		return this.task;
	}
}

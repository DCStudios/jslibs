var TaskContainer = (function () {
    function TaskContainer(sourceElement) {
        this.container = sourceElement;
        this.dummy = null;
        this.tasklistForm = null;
        this.tasklistModal = null;
        this.createTasklistButton = null;
        this.generateElements();
        this.buildContainer();
    }
    TaskContainer.prototype.generateElements = function () {
        this.generateDummyDiv();
        this.generateCreateTasklistModal();
        this.generateCreateTaskListButton();
    };
    TaskContainer.prototype.buildContainer = function () {
        this.container.empty();
        this.container.append(this.createTasklistButton);
        this.container.append(this.dummy);
    };
    TaskContainer.prototype.generateDummyDiv = function () {
        this.dummy = $("<div></div>").attr("style", "clear:both;");
    };
    TaskContainer.prototype.generateCreateTaskListButton = function () {
        this.createTasklistButton = $("<div></div>").attr("class", "createTaskListButton");
        this.createTasklistButton.on("click", this.onButtonCreateTasklist.bind(this));
        this.createTasklistButton.append($("<i></i>").attr("class", "fa fa-plus"));
    };
    TaskContainer.prototype.generateCreateTasklistModal = function () {
        var html = $("<div></div>").attr("class", "createTaskListModal").attr("title", "Create new TaskList");
        this.tasklistForm = $("<form></form>");
        var $field = $("<fieldset></fieldset>");
        $field.append($("<label></label>").attr("for", "tasklistName").html("TaskList's Name"));
        $field.append($("<input></input>")
            .attr("type", "text")
            .attr("name", "tasklistName")
            .attr("class", "tasklistName text ui-widget-content formInput")
            .attr("value", "TODO"));
        $field.append($("<input></input>")
            .attr("type", "submit")
            .attr("tabindex", "-1")
            .attr("style", "position:absolute; top: -1000px;"));
        html.append(this.tasklistForm.append($field));
        this.tasklistModal = html.dialog({
            autoOpen: false,
            width: 400,
            modal: true,
            buttons: {
                "Create Category": this.onTasklistModalCreate.bind(this),
                "Cancel": this.onTasklistModalCancel.bind(this)
            }
        });
        this.tasklistForm.on("submit", this.onTasklistModalSubmit.bind(this));
    };
    TaskContainer.prototype.onButtonCreateTasklist = function () {
        this.tasklistModal.dialog("open");
        this.tasklistForm[0].reset();
        this.tasklistForm.find(".tasklistName").select();
    };
    TaskContainer.prototype.onTasklistModalCreate = function () {
        this.tasklistForm.submit();
    };
    TaskContainer.prototype.onTasklistModalCancel = function () {
        this.tasklistModal.dialog("close");
    };
    TaskContainer.prototype.onTasklistModalSubmit = function (event) {
        event.preventDefault();
        this.tasklistModal.dialog("close");
        new TaskList(this.tasklistForm.find(".tasklistName").val()).Handle().insertBefore(this.dummy);
    };
    return TaskContainer;
})();
var TaskList = (function () {
    function TaskList(category) {
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
    Object.defineProperty(TaskList.prototype, "category", {
        get: function () { return this._category; },
        set: function (val) {
            if (this._category != val) {
                this._category = val;
                this.tasklist.attr("data-category", val);
            }
        },
        enumerable: true,
        configurable: true
    });
    TaskList.prototype.generateElements = function () {
        this.generateCreateTaskModal();
        this.generateEditTasklistModal();
    };
    TaskList.prototype.buildSelf = function () {
        this.tasklist = $("<div></div>").attr("class", "taskList");
        this.tasklist.append(this.generateButton("taskList-close", "fa-trash", this.onClosed));
        this.tasklist.append(this.generateButton("taskList-edit", "fa-pencil", this.onEditCategory));
        this.tasklist.append(this.generateButton("taskList-add", "fa-plus", this.onCreateNewTask));
    };
    TaskList.prototype.generateButton = function (buttonClass, iconClass, buttonCallback) {
        return $("<div></div>").attr("class", "taskList-button " + buttonClass).html("<i class='fa " + iconClass + "'></i>")
            .on("click", buttonCallback.bind(this));
    };
    TaskList.prototype.generateCreateTaskModal = function () {
        this.createTaskModal = $("<div></div>").attr("class", "createTaskModal").attr("title", "Create new Task");
        this.createTaskForm = $("<form></form>");
        var $field = $("<fieldset></fieldset>");
        $field.append($("<label></label>").attr("for", "taskName").html("Task's Name"));
        $field.append($("<input></input>")
            .attr("type", "text")
            .attr("name", "taskName")
            .attr("class", "taskName text ui-widget-content formInput")
            .attr("value", "New Task"));
        $field.append($("<label></label>").attr("for", "taskContent").html("Task's Description"));
        $field.append($("<input></input>")
            .attr("type", "text")
            .attr("name", "taskContent")
            .attr("class", "taskContent text ui-widget-content formInput")
            .attr("value", ""));
        $field.append($("<label></label>").attr("for", "taskTags").html("Task's Tags"));
        $field.append($("<input></input>")
            .attr("type", "text")
            .attr("name", "taskTags")
            .attr("class", "taskTags text ui-widget-content formInput")
            .attr("value", ""));
        $field.append($("<input></input>")
            .attr("type", "submit")
            .attr("tabindex", "-1")
            .attr("style", "position:absolute; top: -1000px;"));
        this.createTaskModal.append(this.createTaskForm.append($field));
        this.createTaskModal.dialog({
            autoOpen: false,
            width: 400,
            modal: true,
            buttons: {
                "Create Task": this.onModalCreateTaskCreate.bind(this),
                "Cancel": this.onModalCreateTaskCancel.bind(this)
            }
        });
        this.createTaskForm.on("submit", this.onCreateTaskSubmit.bind(this));
    };
    TaskList.prototype.generateEditTasklistModal = function () {
        this.editTasklistModal = $("<div></div>").attr("class", "editTaskListModal").attr("title", "Edit TaskList Name");
        this.editTasklistForm = $("<form></form>");
        var $field = $("<fieldset></fieldset>");
        $field.append($("<label></label>").attr("for", "tasklistName").html("TaskList's Name"));
        $field.append($("<input></input>")
            .attr("type", "text")
            .attr("name", "tasklistName")
            .attr("class", "tasklistName text ui-widget-content formInput")
            .attr("value", this.category));
        $field.append($("<input></input>")
            .attr("type", "submit")
            .attr("tabindex", "-1")
            .attr("style", "position:absolute; top: -1000px;"));
        this.editTasklistModal.append(this.editTasklistForm.append($field)).dialog({
            autoOpen: false,
            width: 400,
            modal: true,
            buttons: {
                "Edit Category": this.onModalEditTasklistEdit.bind(this),
                "Cancel": this.onModalEditTasklistCancel.bind(this)
            }
        });
        this.editTasklistForm.on("submit", this.onEditFormSubmit.bind(this));
    };
    TaskList.prototype.onCreateNewTask = function () {
        this.createTaskModal.dialog("open");
    };
    TaskList.prototype.onEditCategory = function () {
        this.editTasklistModal.dialog("open");
    };
    TaskList.prototype.onModalCreateTaskCreate = function () {
        this.createTaskForm.submit();
    };
    TaskList.prototype.onModalCreateTaskCancel = function () {
        this.createTaskModal.dialog("close");
    };
    TaskList.prototype.onModalEditTasklistEdit = function () {
        this.editTasklistForm.submit();
    };
    TaskList.prototype.onModalEditTasklistCancel = function () {
        this.editTasklistModal.dialog("close");
    };
    TaskList.prototype.onCreateTaskSubmit = function (event) {
        event.preventDefault();
        this.createTaskModal.dialog("close");
        this.tasklist.append(new Task(this.createTaskForm.find(".taskName").val(), this.createTaskForm.find(".taskContent").val(), this.createTaskForm.find(".taskTags").val()).Handle());
    };
    TaskList.prototype.onEditFormSubmit = function (event) {
        event.preventDefault();
        this.editTasklistModal.dialog("close");
        this.category = this.editTasklistForm.find(".tasklistName").val();
    };
    TaskList.prototype.onClosed = function () {
        this.tasklist.remove();
        this.tasklist = null;
        this.title = null;
        this.createTaskForm = null;
        this.editTasklistForm = null;
        this.createTaskModal = null;
        this.editTasklistModal = null;
    };
    TaskList.prototype.Handle = function () {
        return this.tasklist;
    };
    return TaskList;
})();
var Task = (function () {
    function Task(name, content, tags) {
        this.buildSelf(content);
        this.name = name;
    }
    Object.defineProperty(Task.prototype, "name", {
        get: function () { return this._name; },
        set: function (val) {
            if (this._name != val) {
                this._name = val;
                this.taskName.html(val);
            }
        },
        enumerable: true,
        configurable: true
    });
    Task.prototype.buildSelf = function (content) {
        this.task = $("<div></div>").attr("class", "task");
        this.taskName = $("<h1></h1>").attr("class", "task-name").html(this.name).appendTo(this.task);
        this.taskName.append($("<div></div>").attr("class", "task-button task-close").append($("<i></i>").attr("class", "fa fa-trash"))
            .on("click", this.onClosed.bind(this)));
        this.task.append($("<p></p>").attr("class", "task-content").attr("contenteditable", "true").html(content));
    };
    Task.prototype.onClosed = function () {
        this.task.remove();
        this.task = null;
        this.taskName = null;
    };
    Task.prototype.Handle = function () {
        return this.task;
    };
    return Task;
})();
//# sourceMappingURL=task.js.map
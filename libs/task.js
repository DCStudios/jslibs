var DefineTask;

( function() {

	DefineTask = function( taskContainer ) {

		$( taskContainer+" .taskList" ).sortable({
			placeholder: "taskPlaceholder",
			helper: "clone",
			cursorAt: { left: 64, top: 16 },
			connectWith: ".taskList"
		});

	};

})();

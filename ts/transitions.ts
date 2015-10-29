/// <reference path="../typings/jquery/jquery.d.ts" />

/*
	#DOING:0 Add a manual transition trigger to Transition.js
*/

class Transition {

	protected container:JQuery;
	protected timer:number;
	protected newContent:JQuery;
	protected canLoadNewContent:boolean;

	protected introLength:number;
	protected exitLenth:number;
	protected exitClass:string;
	protected excludeClass:string;

	protected _onIntroCompleted:()=>void;
	protected _onExitCompleted:()=>void;
	protected _onLoadNextPage:()=>void;
	protected _onLoadNextPageCompleted:()=>void;

	constructor( containerID:JQuery, option:TransitionOptions ) {

		this.container = containerID;
		this.timer = null;
		this.newContent = null;
		this.canLoadNewContent = false;
		this.introLength = option.intro;
		this.exitLenth = option.exit;
		this.exitClass = option.exitClass;
		this.excludeClass = option.excludeClass;
		this._onIntroCompleted = option.introCompleted;
		this._onExitCompleted = option.exitCompleted;
		this._onLoadNextPage = option.loadNextPage;
		this._onLoadNextPageCompleted = option.loadCompleted;

		this.initialize();
		this.makeTransitionPublic();
	}

	// -- PUBLIC -------------------------------------------------------------

	public Goto( url:string ):void {
		$.ajax({
			url: url,
			beforeSend: this.onBindedBeforeSend.bind(this),
			complete: this.onBindedComplete.bind(this),
		});
	}

	// -- PROTECTED ----------------------------------------------------------

	protected initialize():void {
		this.timer = setTimeout( this._onIntroCompleted, this.introLength );
		this.bindEverything();
		$(".transition-evalme",this.container).each( this.evaluateRequestedScripts );
	}

	protected makeTransitionPublic():void {
		this.container.data( "transition", this );
	}

	protected fakeClick(evt:JQueryEventObject):void {
		evt.preventDefault();
	}

	protected bindEverything():void {
		this.bindAnchors();
		this.bindForms();
	}

	protected bindAnchors():void {
		$("a",this.container).each( this.doBindAnchor.bind(this) );
	}

	protected doBindAnchor( index:number, a:HTMLAnchorElement ):void {
		if( $(a).parents( "."+this.excludeClass ).length == 0 )
			$(a).on("click", this.onAnchorClick.bind( this ));
	}

	protected bindForms():void {
		$("form",this.container).each( this.doBindForm.bind(this) );
	}

	protected doBindForm( index:number, form:HTMLFormElement ):void {
		var $form:JQuery = $(form);
		if( $form.parents("."+this.excludeClass).length == 0 ) {
			$form.attr("data-valid","valid");
			$form.on("submit", this.onFormSubmit.bind(this));
		}
	}

	protected onAnchorClick(evt:JQueryEventObject):void {
		evt.preventDefault();
		var $a:JQuery = $(evt.delegateTarget)
		$a.off("click");
		$a.on("click", this.fakeClick);
		$.ajax({
			url: $a.attr("href"),
			beforeSend: this.onBindedBeforeSend.bind(this),
			complete: this.onBindedComplete.bind(this),
		});
	}

	protected onFormSubmit(evt:JQueryEventObject):boolean {
		evt.preventDefault();
		var $form:JQuery = $(evt.delegateTarget);
		if( $form.attr("data-valid") == "valid") {
			$.ajax({
				url: $form.attr("action"),
				type: $form.attr("method"),
				data: $form.serialize(),
				dataType: 'json',
				beforeSend: this.onBindedBeforeSend.bind(this),
				complete: this.onBindedComplete.bind(this)
			});
		}
		return false;
	}

	protected onBindedBeforeSend():void {
		this.newContent = null;
		this.canLoadNewContent = false;
		this.container.addClass( this.exitClass );
		this.timer = setTimeout( this.onBindedDelayComplete.bind( this ), this.exitLenth );
	}

	protected onBindedComplete(x:JQueryXHR):void {
		this.newContent = this.findIdInArray( $(x.responseText), this.container.selector );
		if( this.canLoadNewContent ) this.injectNewContent();
	}

	protected onBindedDelayComplete():void {
		this.canLoadNewContent = true;
		this._onExitCompleted();
		if( this.newContent !== null ) this.injectNewContent();
	}

	protected injectNewContent():void {
		if( this.newContent === undefined ) {
			console.warn( "TransitionJS: Tried to follow an invalid link!" );
			this.timer = setTimeout( this._onIntroCompleted, this.introLength );
			this.bindEverything();
			this.container.removeClass( this.exitClass );
			this._onLoadNextPageCompleted();
		}
		else if( this.newContent.attr("reload") != "full" ) {
			this.container.empty();
			this.container.html( this.newContent.html() );
			this.timer = setTimeout( this._onIntroCompleted.bind(this), this.introLength );
			this.bindEverything();
			$(".transition-evalme",this.container).each( this.evaluateRequestedScripts );
			this.container.removeClass( this.exitClass );
			this._onLoadNextPageCompleted();
		}
		else location.reload();
	}

	protected evaluateRequestedScripts( index:number, script:HTMLElement ):void {
		console.log( script );
		$.globalEval( $(script).html() );
		$(script).removeClass("transition-evalme");
	}

	protected findIdInArray( array:JQuery, lookup:string ):JQuery {
		var i:number;
		lookup = lookup.replace( "#", "" );
		for( i=0; i<array.length; i++ ) {
			if( $(array[i]).attr("id") == lookup ) return $(array[i]);
		}
	}
}

class TransitionOptions {

	intro:number = 0;
	exit:number = 0;
	exitClass:string = "is-exiting";
	excludeClass:string = "transition-exclude";
	introCompleted:()=>void = this.emptyFunction;
	exitCompleted:()=>void = this.emptyFunction;
	loadNextPage:()=>void = this.emptyFunction;
	loadCompleted:()=>void = this.emptyFunction;

	emptyFunction():void {}

}

function DefineTransition( containerID:string, options:any ):void {
	var container:JQuery = $("#"+containerID );

	var realOptions = new TransitionOptions();
	if( typeof options.intro !== "undefined" ) realOptions.intro = options.intro;
	if( typeof options.exit !== "undefined" ) realOptions.exit = options.exit;
	if( typeof options.exitClass !== "undefined" ) realOptions.exitClass = options.exitClass;
	if( typeof options.excludeClass !== "undefined" ) realOptions.excludeClass = options.excludeClass;
	if( typeof options.introCompleted !== "undefined" ) realOptions.introCompleted = options.introCompleted;
	if( typeof options.exitCompleted !== "undefined" ) realOptions.exitCompleted = options.exitCompleted;
	if( typeof options.loadNextPage !== "undefined" ) realOptions.loadNextPage = options.loadNextPage;
	if( typeof options.loadCompleted !== "undefined" ) realOptions.loadCompleted = options.loadCompleted;

	var transition = new Transition( container, realOptions );
	container.data( "transition", transition );
}

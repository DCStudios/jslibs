var DefineTransition;
var Transition;

( function() {

    "use strict";

    DefineTransition = function( containerID, options ) {

        var container = $("#"+containerID );
        var transition = new Transition( container, options );
        container.data( "transition", transition );

    };

    Transition = function( container, options ) {

        /**
         * Reference to the container
         * @type {jQuery}
         */
        this.container = container;

        /**
         * Timer used for animation timing
         * @type {handle}
         */
        this.timer = null;

        /**
         * The jquery object reprensenting the
         * next page to be injected
         * @type {jQuery}
         */
        this.newContent = null;

        /**
         * Is the @newContent ready to be injected?
         * @type {Boolean}
         */
        this.canLoadNewContent = false;

        /*
            The <options> parameter can contain any of
            the following parameters:

            options = {
                intro: 1000,
                exit: 800,
                class: 'is-exiting',
                introCompleted: function(){},
                exitCompleted: function(){},
                loadNextPage: function(){},
                loadCompleted: function(){}
            }
        */

        /**
         * The time to wait before assuming intro animation
         * has completed
         * @type {Number}
         */
        this.introLength = 0;
        if( typeof options.intro !== "undefined" ) this.introLength = options.intro;

        /**
         * The time to wait before assuming exit animation
         * has completed
         * @type {Number}
         */
        this.exitLength = 0;
        if( typeof options.exit !== "undefined" ) this.exitLength = options.exit;

        /**
         * The class to assign to the container when ready to
         * animate the exit animation
         * @type {Number}
         */
        this.exitClass = "is-exiting";
        if( typeof options.class !== "undefined" ) this.exitClass = options.class;

        /**
         * Called when intro animation completes
         * @return {void}
         */
        this._onIntroCompleted = (
            typeof options.introCompleted === "undefined" ?
            function(){} :
            options.introCompleted
        );

        /**
         * Called when exit animation completes
         * @return {void}
         */
        this._onExitCompleted = (
            typeof options.exitCompleted === "undefined" ?
            function(){} :
            options.exitCompleted
        );

        /**
         * Called when the next page is about to load,
         * which also means the exit animation starts
         * @return {void}
         */
        this._onLoadNextPage = (
            typeof options.loadNextPage === "undefined" ?
            function(){} :
            options.loadNextPage
        );

        /**
         * Called when the newContent was injected,
         * which also means the intro animation starts
         * @return {void}
         */
        this._onLoadNextPageCompleted = (
            typeof options.loadCompleted === "undefined" ?
            function(){} :
            options.loadCompleted
        );

        // Start the intro timer
        this.timer = setTimeout( this._onIntroCompleted, this.introLength );

        // Bind all anchors and forms
        this.bindEverything();

    };

    /**
     * Bind all <a> and <form> inside the container
     * @return {void}
     */
    Transition.prototype.bindEverything = function() {
        this.bindAnchors();
        this.bindForms();
    };

    /**
     * Add a callback for all <a> in the container
     * @return {void}
     */
    Transition.prototype.bindAnchors = function() {
        $( "a", this.container ).each( function( i,a ) {
            $(a).on( "click", this.onAnchorClick.bind( this ) );
        }.bind( this ));
    };

    /**
     * Add a callback for all forms in the container
     * for their submit method
     * @return {[type]} [description]
     */
    Transition.prototype.bindForms = function() {
        $( "form", this.container ).each( function( i,form ){
			$( form ).attr("data-valid","valid");
			$( form ).bind( "submit", this.onFormSubmit.bind( this ) );
        }.bind( this ));
    };

    /**
     * Disable <a>
     * @param  {ClickEvent} ev The click event
     * @return {void}
     */
    Transition.prototype.fakeOnClick = function( ev ) {
        ev.preventDefault();
    };

    /**
     * Disable <a> and use an ajax call instead
     * @param  {ClickEvent} ev The click event
     * @return {void}
     */
    Transition.prototype.onAnchorClick = function( ev ) {
        ev.preventDefault();

        var a = $(ev.delegateTarget);
        a.off( "click" );
        a.on( "click", this.fakeOnClick );
        console.log( "Visiting: "+a.attr("href") );
        $.ajax({
            url: a.attr("href"),
            beforeSend: this.onAnchorBeforeSend.bind( this ),
            complete: this.onAnchorComplete.bind( this )
        });
    };


    Transition.prototype.onFormSubmit = function( ev ) {
        ev.preventDefault();

        var $form = $(ev.delegateTarget);
		if( $form.attr("data-valid") == "valid" ) {
	        $.ajax({
	            url: $form.attr("action"),
	            type: $form.attr("method"),
	            data: $form.serialize(),
	            dataType: 'json',
	            beforeSend: this.onAnchorBeforeSend.bind( this ),
	            complete: this.onAnchorComplete.bind( this )
	        });
		}

        return false;
    };

    /**
     * Init exit animation and start loading newContent
     * @param  {xhqr}   x The jQuery ajax object
     * @param  {object} h The headers of the ajax
     * @return {void}
     */
    Transition.prototype.onAnchorBeforeSend = function( x,h ) {
        this.newContent = null;
        this.canLoadNewContent = false;
        this.container.addClass( this.exitClass );
        this._onLoadNextPage();
        this.timer = setTimeout( this.onAnchorDelayCompleted.bind( this ), this.exitLength );
    };

    /**
     * Init exit animation and check if newContent is loaded,
     * in which case it should be injected
     * @param  {xhqr}   x The jQuery ajax object
     * @param  {string} r The textStatus of the ajax response
     * @return {void}
     */
    Transition.prototype.onAnchorComplete = function( x,r ) {
        this.newContent = this.findIdInArray( $( x.responseText ), this.container.selector );
        if( this.canLoadNewContent ) this.injectNewContent();
    };

    /**
     * Make newContent ready to be injected, and if
     * it is loaded, inject it.
     * @return {void}
     */
    Transition.prototype.onAnchorDelayCompleted = function() {
        this.canLoadNewContent = true;
        this._onExitCompleted();
        if( this.newContent !== null ) this.injectNewContent();
    };

    /**
     * Destroy current content, inject new content and bind anchors and forms
     * from the new content.
     * @return {void}
     */
    Transition.prototype.injectNewContent = function() {
        this.container.removeClass( this.exitClass );
        this.container.html( this.newContent.html() );
        this._onLoadNextPageCompleted();
        this.timer = setTimeout( this._onIntroCompleted.bind( this ), this.introLength );
        this.bindEverything();
		$( ".transition-evalme", this.container ).each( function( i,e ) {
			jQuery.globalEval( $(e).html() );
			$(e).removeClass("transition-evalme");
		});
    };

    /**
     * Find an element with the specified id in the jquery list
     * of elements returned from an ajax response
     * @param  {jQueryElementList}  array   The list of elements to look into
     * @param  {string}             lookup  The id to check against
     * @return {jQuery}                     The jquery element found
     */
    Transition.prototype.findIdInArray = function( array, lookup ) {
        var i=0;
        lookup = lookup.replace( '#', '');
        for( i=0; i<array.length; i++ ) {
            if( $(array[i]).attr("id") == lookup ) return $(array[i]);
        }
    };

})();

function DefineTransition( containerID, options ) {

    var container = $("#"+containerID );
    var transition = new Transition( container, options );
    container.data( "transition", transition );

}

function Transition( container, options ) {

    // Reference to the container
    this.container = container;

    // Timer used for animation timing
    this.timer = null;

    // The html of the next page to display
    this.newContent = null;

    // Can the new content be loaded?
    this.canLoadNewContent = false;

    /*
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

    // introLength: Time to wait before assuming intro animation completed
    if( typeof options.intro === "undefined" ) this.introLength = 0;
    else this.introLength = options.intro;

    // exitLength: time to wait before assuming exit animation completed
    if( typeof options.exit === "undefined" ) this.exitLength = 0;
    else this.exitLength = options.exit;

    // exitClass: class to assign to the container when playing exit animation
    if( typeof options.class === "undefined" ) this.exitClass = "is-exiting";
    else this.exitClass = options.class;

    // Called when IntroAnimation has completed
    this._onIntroCompleted = (
        typeof options.introCompleted === "undefined" ?
        function(){} :
        options.introCompleted
    );

    // Called when ExitAnimation has completed
    this._onExitCompleted = (
        typeof options.exitCompleted === "undefined" ?
        function(){} :
        options.exitCompleted
    );

    // Called when the next page load is about to start
    this._onLoadNextPage = (
        typeof options.loadNextPage === "undefined" ?
        function(){} :
        options.loadNextPage
    );

    // Called when the next page load has completed
    this._onLoadNextPageCompleted = (
        typeof options.loadCompleted === "undefined" ?
        function(){} :
        options.loadCompleted
    );



    // Start the intro timer
    this.timer = setTimeout( this._onIntroCompleted, this.introLength );

    // Bind all links
    var bindAllLinks = function( self ) {
        $("a", this.container ).each( function( i,e ){
            $(e).attr("title", $(e).attr("href") );
            $(e).attr("href", "javascript:void(0);");
            var clickHandler = function( ev ){
                e.removeEventListener( "click", clickHandler );
                stopEvent( e );
                $.ajax( $(e).attr("title"), {
                    "beforeSend": function( x,r ){
                        self.container.addClass( self.exitClass );
                        self.newContent = null;
                        self.canLoadNewContent = false;
                        self._onLoadNextPage();
                        self.timer = setTimeout( function() {
                            self.canLoadNewContent = true;
                            self._onExitCompleted();
                            if( self.newContent !== null ) {
                                self.container.removeClass(self.exitClass);
                                self.container.html( self.newContent.html() );
                                self._onLoadNextPageCompleted();
                                self.timer = setTimeout( self._onIntroCompleted, self.introLength );
                                bindAllLinks( self );
                            }
                        }, self.exitLength );
                    },
                    "complete": function( x,r ) {
                        self.newContent = findIdInArray( $(x.responseText), self.container.selector);
                        if( self.canLoadNewContent ) {
                            self.container.removeClass(self.exitClass);
                            self.container.html( self.newContent.html() );
                            self._onLoadNextPageCompleted();
                            self.timer = setTimeout( self._onIntroCompleted, self.introLength );
                            bindAllLinks( self );
                        }
                    }
                });
            };
            e.addEventListener("click", clickHandler );
        });
    };
    bindAllLinks( this );
}

function stopEvent( event ) {
    if( !event ) event = window.event;
    if( event.stopPropagation ) event.stopPropagation();
    else event.cancelBubble = true;
}

function findIdInArray( array, lookup ) {
    var i=0;
    lookup = lookup.replace( '#', '');
    for( i=0; i<array.length; i++ ) {
        if( $(array[i]).attr("id") == lookup ) return $(array[i]);
    }
}

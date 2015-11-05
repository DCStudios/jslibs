/// <reference path="../../typings/jquery/jquery.d.ts"/>

namespace Controls {
	export class Accordeon {
		protected container:JQuery;
		protected childs:JQuery;

		constructor( containerID:JQuery ) {
			this.container = containerID;
			this.childs = null;
			if( this.isValid() ) {
				this.initialize();
				console.log( "Creating accordeon with "+this.childs.length+" childs." );
				console.log( this.container );
			}
		}

		protected isValid():boolean {
			if( typeof this.container.attr("data-control") === "undefined" ) {
				console.error( "!! Trying to create an accordeon out of an invalid structur!!" );
				return false;
			}
			return true;
		}

		protected initialize():void {
			this.childs = $( this.container.attr("data-control") );
			this.container.on( "click", this.onClick.bind( this ) );
		}

		protected onClick():void {
			this.childs.toggleClass("open");
		}
	}
}

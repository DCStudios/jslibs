/// <reference path="../../typings/jquery/jquery.d.ts"/>

namespace Controls {
	export class Combobox {

		protected container:JQuery;
		protected text:JQuery;
		protected list:JQuery;
		protected openSize:number;

		public get value():string { return this.text.html(); }
		public set value(val:string) {
			if( this.value != val ) {
				this.text.html( val );
				this.container.triggerHandler("changed",[this.value]);
			}
		}

		constructor( jQueryElement:JQuery ) {
			this.container = jQueryElement;
			this.validate();
		}

		protected validate():void {
			if( !this.container.has("span") || !this.container.has("ul") ) {
				throw new Error("!! Cannot create Combobox: The structure is invalid." );
			}
			else if( this.container.data("c-combobox") ) {
				console.warn(">> Element is already a combobox control, skipping..." );
				console.warn(">> To access the element, use ELEMENT.data('c-combobox')");
			}
			else this.initialize();
		}

		protected initialize():void {
			this.container.data("c-combobox",this);
			this.container.addClass("c-combobox");
			this.text = this.container.find("span").first().addClass("c-combobox-text");
			this.list = this.container.find("ul").first().addClass("c-combobox-list");
			this.list.find("li").addClass("c-combobox-item");

			this.openSize = this.list.height()+16;
			this.list.height( "0" );

			this.applyEvents();
		}

		protected applyEvents():void {
			$(document).on("click", this.onOutsideClicked.bind(this) );
			this.text.on( "click", this.onComboboxClicked.bind(this) );
			this.list.find("li").on("click", this.onItemClicked.bind(this) );
		}

		protected onOutsideClicked( e:JQueryEventObject ):void {
			var $target = $(e.target);
			if( !$target.is($(".c-combobox-text",this.container)) ) this.Close();
		}

		protected onComboboxClicked( e:JQueryEventObject ):void {
			if( this.container.hasClass("open") ) {
				this.list.animate({height:0},250);
			}
			else {
				this.list.animate({height:this.openSize},250);
			}
			this.container.toggleClass("open");
		}

		protected onItemClicked( e:JQueryEventObject ):void {
			this.value = $(e.delegateTarget).html();
		}

		public Open():void {
			this.container.addClass("open");
			this.list.animate({height:this.openSize},250);
		}

		public Close():void {
			this.container.removeClass("open");
			this.list.animate({height:0},250);
		}

	}
}

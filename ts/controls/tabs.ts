/// <reference path="../../typings/jquery/jquery.d.ts" />

namespace Controls {
    export class Tab {

        protected elem: JQuery;
		protected tabs: JQuery;
		protected containers: JQuery;

		protected _tabX: number;
		protected _active: JQuery;

        constructor(elem: JQuery) {
            this.elem = elem;
            this.elem.data("tab", this);

			this.tabs;
			this.containers;

            this.build();
        }

        protected build(): void {
			this.buildContainer();
			this.buildTabContainers();
			this.buildTabs();
		}

        protected destroy(): void {
            this.elem.data("tab", undefined);
        }

		protected buildContainer():void {
			if (!this.elem.hasClass("tab-container")) {
				this.elem.addClass("tab-container");
			}
		}

		protected buildTabContainers(): void {
			if (typeof this.containers === "undefined") {
				this.containers = $("<div></div>").addClass("tab-container-zone");
				this.containers.appendTo(this.elem);
			}
			$("div:not(.tab-container-zone)", this.elem).each((i: number, e: HTMLElement) => {
				if (!$(e).hasClass("tab-content-container")) {
					$(e).addClass("tab-content-container");
					this.setupTabContainer(i, $(e));
				}
			});
		}

		protected setupTabContainer(index:number, content:JQuery): void {
			content.data("id", index);
			content.css({ left: 0, top: 0 , display: "none" });
			content.appendTo(this.containers);
		}

		protected buildTabs(): void {
			this._tabX = 0;
			if (typeof this.tabs === "undefined") {
				this.tabs = $("<div></div>").addClass("tab-zone");
				this.tabs.prependTo(this.elem);
			}
			$("span", this.elem).each((i: number, e: HTMLElement) => {
				if (!$(e).hasClass("tab")) {
					$(e).addClass("tab");
					this.setupTab(i, $(e));
				}

				// Position tab
				$(e).css({ left: this._tabX + "px", top: 0 });
				this._tabX += $(e).outerWidth() + 1;
			});
		}

		protected setupTab(index:number, tab: JQuery): void {
			tab.data("id", index);

			// Encapsulate text in a 'p'
			var para:JQuery;
			if ($("p", tab).length == 0) para = $("<p></p>").html(tab.html());
			else para = $("p", tab);

			// Create close button
			var closeButton = $("<div></div>").addClass("tab-close-button").html("&Cross;");

			// Add both p and close button
			tab.empty();
			para.appendTo(tab);
			closeButton.appendTo(tab);

			// Make the tab selectable
			tab.on("click", this.onTabClicked.bind(this));

			// Finally, add the tab to the tab-zone
			tab.appendTo(this.tabs);
		}

		protected onTabClicked( e:JQueryEventObject ) {
			if ($(e.target).hasClass("tab-close-button")) {
				this.closeTab($(e.currentTarget));
			}
			else {
				this.selectTab($(e.currentTarget));
			}
		}

		protected selectTab(tab: JQuery): void {
			$(".tab", this.tabs).removeClass("tab-active");
			tab.addClass("tab-active");
		}

		protected closeTab(tab: JQuery): void {
			tab.empty();
			tab.remove();
			this.buildTabs();
		}

    }
}

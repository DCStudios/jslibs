var Controls;
(function (Controls) {
    var Tab = (function () {
        function Tab(elem) {
            this.elem = elem;
            this.elem.data("tab", this);
            this.tabs;
            this.containers;
            this.build();
        }
        Tab.prototype.build = function () {
            this.buildContainer();
            this.buildTabContainers();
            this.buildTabs();
        };
        Tab.prototype.destroy = function () {
            this.elem.data("tab", undefined);
        };
        Tab.prototype.buildContainer = function () {
            if (!this.elem.hasClass("tab-container")) {
                this.elem.addClass("tab-container");
            }
        };
        Tab.prototype.buildTabContainers = function () {
            var _this = this;
            if (typeof this.containers === "undefined") {
                this.containers = $("<div></div>").addClass("tab-container-zone");
                this.containers.appendTo(this.elem);
            }
            $("div:not(.tab-container-zone)", this.elem).each(function (i, e) {
                if (!$(e).hasClass("tab-content-container")) {
                    $(e).addClass("tab-content-container");
                    _this.setupTabContainer(i, $(e));
                }
            });
        };
        Tab.prototype.setupTabContainer = function (index, content) {
            content.data("id", index);
            content.css({ left: 0, top: 0, display: "none" });
            content.appendTo(this.containers);
        };
        Tab.prototype.buildTabs = function () {
            var _this = this;
            this._tabX = 0;
            if (typeof this.tabs === "undefined") {
                this.tabs = $("<div></div>").addClass("tab-zone");
                this.tabs.prependTo(this.elem);
            }
            $("span", this.elem).each(function (i, e) {
                if (!$(e).hasClass("tab")) {
                    $(e).addClass("tab");
                    _this.setupTab(i, $(e));
                }
                $(e).css({ left: _this._tabX + "px", top: 0 });
                _this._tabX += $(e).outerWidth() + 1;
            });
        };
        Tab.prototype.setupTab = function (index, tab) {
            tab.data("id", index);
            var para;
            if ($("p", tab).length == 0)
                para = $("<p></p>").html(tab.html());
            else
                para = $("p", tab);
            var closeButton = $("<div></div>").addClass("tab-close-button").html("&Cross;");
            tab.empty();
            para.appendTo(tab);
            closeButton.appendTo(tab);
            tab.on("click", this.onTabClicked.bind(this));
            tab.appendTo(this.tabs);
        };
        Tab.prototype.onTabClicked = function (e) {
            if ($(e.target).hasClass("tab-close-button")) {
                this.closeTab($(e.currentTarget));
            }
            else {
                this.selectTab($(e.currentTarget));
            }
        };
        Tab.prototype.selectTab = function (tab) {
            $(".tab", this.tabs).removeClass("tab-active");
            tab.addClass("tab-active");
        };
        Tab.prototype.closeTab = function (tab) {
            tab.empty();
            tab.remove();
            this.buildTabs();
        };
        return Tab;
    }());
    Controls.Tab = Tab;
})(Controls || (Controls = {}));
//# sourceMappingURL=tabs.js.map

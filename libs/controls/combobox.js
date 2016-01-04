var Controls;
(function (Controls) {
    var Combobox = (function () {
        function Combobox(jQueryElement) {
            this.container = jQueryElement;
            this.validate();
        }
        Object.defineProperty(Combobox.prototype, "value", {
            get: function () { return this.text.html(); },
            set: function (val) {
                if (this.value != val) {
                    this.text.html(val);
                    this.container.triggerHandler("changed", [this.value]);
                }
            },
            enumerable: true,
            configurable: true
        });
        Combobox.prototype.validate = function () {
            if (!this.container.has("span") || !this.container.has("ul")) {
                throw new Error("!! Cannot create Combobox: The structure is invalid.");
            }
            else if (this.container.data("c-combobox")) {
                console.warn(">> Element is already a combobox control, skipping...");
                console.warn(">> To access the element, use ELEMENT.data('c-combobox')");
            }
            else
                this.initialize();
        };
        Combobox.prototype.initialize = function () {
            this.container.data("c-combobox", this);
            this.container.addClass("c-combobox");
            this.text = this.container.find("span").first().addClass("c-combobox-text");
            this.list = this.container.find("ul").first().addClass("c-combobox-list");
            this.list.find("li").addClass("c-combobox-item");
            this.openSize = this.list.height() + 16;
            this.list.height("0");
            this.applyEvents();
        };
        Combobox.prototype.applyEvents = function () {
            $(document).on("click", this.onOutsideClicked.bind(this));
            this.text.on("click", this.onComboboxClicked.bind(this));
            this.list.find("li").on("click", this.onItemClicked.bind(this));
        };
        Combobox.prototype.onOutsideClicked = function (e) {
            var $target = $(e.target);
            if (!$target.is($(".c-combobox-text", this.container)))
                this.Close();
        };
        Combobox.prototype.onComboboxClicked = function (e) {
            if (this.container.hasClass("open")) {
                this.list.animate({ height: 0 }, 250);
            }
            else {
                this.list.animate({ height: this.openSize }, 250);
            }
            this.container.toggleClass("open");
        };
        Combobox.prototype.onItemClicked = function (e) {
            this.value = $(e.delegateTarget).html();
        };
        Combobox.prototype.Open = function () {
            this.container.addClass("open");
            this.list.animate({ height: this.openSize }, 250);
        };
        Combobox.prototype.Close = function () {
            this.container.removeClass("open");
            this.list.animate({ height: 0 }, 250);
        };
        return Combobox;
    }());
    Controls.Combobox = Combobox;
})(Controls || (Controls = {}));
//# sourceMappingURL=combobox.js.map

var Controls;
(function (Controls) {
    var Accordeon = (function () {
        function Accordeon(containerID) {
            this.container = containerID;
            this.childs = null;
            if (this.isValid()) {
                this.initialize();
                console.log("Creating accordeon with " + this.childs.length + " childs.");
                console.log(this.container);
            }
        }
        Accordeon.prototype.isValid = function () {
            if (typeof this.container.attr("data-control") === "undefined") {
                console.error("!! Trying to create an accordeon out of an invalid structur!!");
                return false;
            }
            return true;
        };
        Accordeon.prototype.initialize = function () {
            this.childs = $(this.container.attr("data-control"));
            this.container.on("click", this.onClick.bind(this));
        };
        Accordeon.prototype.onClick = function () {
            this.childs.toggleClass("open");
        };
        return Accordeon;
    }());
    Controls.Accordeon = Accordeon;
})(Controls || (Controls = {}));
//# sourceMappingURL=accordeon.js.map

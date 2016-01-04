var Transition = (function () {
    function Transition(containerID, option) {
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
    Transition.prototype.Goto = function (url) {
        $.ajax({
            url: url,
            beforeSend: this.onBindedBeforeSend.bind(this),
            complete: this.onBindedComplete.bind(this),
        });
    };
    Transition.prototype.initialize = function () {
        this.timer = setTimeout(this._onIntroCompleted, this.introLength);
        this.bindEverything();
        $(".transition-evalme", this.container).each(this.evaluateRequestedScripts);
    };
    Transition.prototype.makeTransitionPublic = function () {
        this.container.data("transition", this);
    };
    Transition.prototype.fakeClick = function (evt) {
        evt.preventDefault();
    };
    Transition.prototype.bindEverything = function () {
        this.bindAnchors();
        this.bindForms();
    };
    Transition.prototype.bindAnchors = function () {
        $("a", this.container).each(this.doBindAnchor.bind(this));
    };
    Transition.prototype.doBindAnchor = function (index, a) {
        if ($(a).parents("." + this.excludeClass).length == 0)
            $(a).on("click", this.onAnchorClick.bind(this));
    };
    Transition.prototype.bindForms = function () {
        $("form", this.container).each(this.doBindForm.bind(this));
    };
    Transition.prototype.doBindForm = function (index, form) {
        var $form = $(form);
        if ($form.parents("." + this.excludeClass).length == 0) {
            $form.attr("data-valid", "valid");
            $form.on("submit", this.onFormSubmit.bind(this));
        }
    };
    Transition.prototype.onAnchorClick = function (evt) {
        evt.preventDefault();
        var $a = $(evt.delegateTarget);
        $a.off("click");
        $a.on("click", this.fakeClick);
        $.ajax({
            url: $a.attr("href"),
            beforeSend: this.onBindedBeforeSend.bind(this),
            complete: this.onBindedComplete.bind(this),
        });
    };
    Transition.prototype.onFormSubmit = function (evt) {
        evt.preventDefault();
        var $form = $(evt.delegateTarget);
        if ($form.attr("data-valid") == "valid") {
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
    };
    Transition.prototype.onBindedBeforeSend = function () {
        this.newContent = null;
        this.canLoadNewContent = false;
        this.container.addClass(this.exitClass);
        this.timer = setTimeout(this.onBindedDelayComplete.bind(this), this.exitLenth);
    };
    Transition.prototype.onBindedComplete = function (x) {
        this.newContent = this.findIdInArray($(x.responseText), this.container.selector);
        if (this.canLoadNewContent)
            this.injectNewContent();
    };
    Transition.prototype.onBindedDelayComplete = function () {
        this.canLoadNewContent = true;
        this._onExitCompleted();
        if (this.newContent !== null)
            this.injectNewContent();
    };
    Transition.prototype.injectNewContent = function () {
        if (this.newContent === undefined) {
            console.warn("TransitionJS: Tried to follow an invalid link!");
            this.timer = setTimeout(this._onIntroCompleted, this.introLength);
            this.bindEverything();
            this.container.removeClass(this.exitClass);
            this._onLoadNextPageCompleted();
        }
        else if (this.newContent.attr("reload") != "full") {
            this.container.empty();
            this.container.html(this.newContent.html());
            this.timer = setTimeout(this._onIntroCompleted.bind(this), this.introLength);
            this.bindEverything();
            $(".transition-evalme", this.container).each(this.evaluateRequestedScripts);
            this.container.removeClass(this.exitClass);
            this._onLoadNextPageCompleted();
        }
        else
            location.reload();
    };
    Transition.prototype.evaluateRequestedScripts = function (index, script) {
        console.log(script);
        $.globalEval($(script).html());
        $(script).removeClass("transition-evalme");
    };
    Transition.prototype.findIdInArray = function (array, lookup) {
        var i;
        lookup = lookup.replace("#", "");
        for (i = 0; i < array.length; i++) {
            if ($(array[i]).attr("id") == lookup)
                return $(array[i]);
        }
    };
    return Transition;
}());
var TransitionOptions = (function () {
    function TransitionOptions() {
        this.intro = 0;
        this.exit = 0;
        this.exitClass = "is-exiting";
        this.excludeClass = "transition-exclude";
        this.introCompleted = this.emptyFunction;
        this.exitCompleted = this.emptyFunction;
        this.loadNextPage = this.emptyFunction;
        this.loadCompleted = this.emptyFunction;
    }
    TransitionOptions.prototype.emptyFunction = function () { };
    return TransitionOptions;
}());
function DefineTransition(containerID, options) {
    var container = $("#" + containerID);
    var realOptions = new TransitionOptions();
    if (typeof options.intro !== "undefined")
        realOptions.intro = options.intro;
    if (typeof options.exit !== "undefined")
        realOptions.exit = options.exit;
    if (typeof options.exitClass !== "undefined")
        realOptions.exitClass = options.exitClass;
    if (typeof options.excludeClass !== "undefined")
        realOptions.excludeClass = options.excludeClass;
    if (typeof options.introCompleted !== "undefined")
        realOptions.introCompleted = options.introCompleted;
    if (typeof options.exitCompleted !== "undefined")
        realOptions.exitCompleted = options.exitCompleted;
    if (typeof options.loadNextPage !== "undefined")
        realOptions.loadNextPage = options.loadNextPage;
    if (typeof options.loadCompleted !== "undefined")
        realOptions.loadCompleted = options.loadCompleted;
    var transition = new Transition(container, realOptions);
    container.data("transition", transition);
}
//# sourceMappingURL=transitions.js.map

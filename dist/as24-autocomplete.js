/**
 * Selects an element using the this element.
 * @param {string} selector Specifies the selector for lookup
 * @param {Element} this Specified within which element to perform the lookup
 * @return {Element}
 */
var $ = function (selector, root) { return root.querySelector(selector); };


var $$ = function (selector, root) { return root.querySelectorAll(selector); };


/**
 * Checks whether elem has tag as a parent
 * @param {HTMLElement} tag
 * @returns {function}
 */
var closestByTag = function (tag) { return function (elem) { return elem.tagName === 'HTML'
            ? null
            : elem === tag
                ? tag
                : closestByTag(tag)(elem.parentNode); }; };



/**
 * Binds an event listener on the element
 * @param {string} event
 * @param {Function} cb
 * @param {Element|Window|Document} el
 * @param {boolean} capturing
 */
var on = function (event, cb, el, capturing) {
        if ( capturing === void 0 ) capturing = false;

        return el.addEventListener(event, cb, capturing);
};



/**
 *
 * @param {string} eventName
 * @param {HTMLInputElement} el
 */
var triggerEvent = function (eventName, el) {
    var evt = document.createEvent('Event');
    evt.initEvent(eventName, true, true);
    el.dispatchEvent(evt);
};



/**
 * Appends a child element to a target element
 * @param {HTMLElement|DocumentFragment} target
 * @returns {function}
 */
var appendTo = function (target) { return function (child) {
        target.appendChild(child);
        return target;
    }; };



/**
 * Finds a closest element by class name
 * @param {string} className
 * @returns {function}
 */
var closestByClassName = function (className) { return function (elem) { return elem.tagName === 'HTML'
            ? null
            : elem.classList.contains(className)
                ? elem
                : closestByClassName(className)(elem.parentNode); }; };

/**
 * @class
 * @typedef SeparatedItemsDataSource
 */
var AutocompleteInput = (function (HTMLElement) {
    function AutocompleteInput () {
        HTMLElement.apply(this, arguments);
    }

    if ( HTMLElement ) AutocompleteInput.__proto__ = HTMLElement;
    AutocompleteInput.prototype = Object.create( HTMLElement && HTMLElement.prototype );
    AutocompleteInput.prototype.constructor = AutocompleteInput;

    AutocompleteInput.prototype.setValue = function setValue (str) {
        this.input.value = str;
    };

    AutocompleteInput.prototype.getValue = function getValue () {
        return this.input.value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    };

    AutocompleteInput.prototype.setDisabled = function setDisabled (flag) {
        if (flag) {
            this.input.setAttribute('disabled', 'disabled');
        } else {
            this.input.removeAttribute('disabled');
        }
    };

    AutocompleteInput.prototype.isDisabled = function isDisabled () {
        return this.input.hasAttribute('disabled');
    };

    AutocompleteInput.prototype.setError = function setError (flag) {
        this.input.classList[flag ? 'add' : 'remove']('error');
    };

    AutocompleteInput.prototype.renderInput = function renderInput () {
        return function inputRenderer(suggestions) {
            this.setError(suggestions.length === 0);
            return suggestions;
        }.bind(this);
    };

    AutocompleteInput.prototype.onKeyDown = function onKeyDown (e) {
        if (e.which === 9) {
            triggerEvent('as24-autocomplete:input:focus-lost', this.input);
        }
        if (e.which === 40) {
            triggerEvent('as24-autocomplete:input:go-down', this.input);
            e.preventDefault();
        }
        if (e.which === 38) {
            triggerEvent('as24-autocomplete:input:go-up', this.input);
            e.preventDefault();
        }
    };

    AutocompleteInput.prototype.onKeyUp = function onKeyUp (e) {
        if (this.isVisible && (e.which === 13 || e.which === 9)) {
            e.stopPropagation();
            e.preventDefault();
            this.selectItem();
            return false;
        }
        if (e.which === 13) {
            triggerEvent('as24-autocomplete:input:enter', this.input);
        }
        if (e.which === 27) {
            this.onCrossClick();
        }
        if (e.which !== 40 && e.which !== 38 && e.which !== 13 && e.which !== 27) {
            triggerEvent('as24-autocomplete:input:query', this.input);
        }
        return null;
    };

    AutocompleteInput.prototype.onInputClick = function onInputClick () {
        this.isOpened = true;
        triggerEvent('as24-autocomplete:input:trigger-suggestions', this.input);
    };

    AutocompleteInput.prototype.onDropDownClick = function onDropDownClick () {
        if(this.input.disabled) { return; }
        this.input.focus();
        if (this.isOpened) {
            this.isOpened = false;
            triggerEvent('as24-autocomplete:input:close', this.input);
        } else {
            this.isOpened = true;
            triggerEvent('as24-autocomplete:input:trigger-suggestions', this.input);
        }
    };

    AutocompleteInput.prototype.onCrossClick = function onCrossClick () {
        if(this.input.disabled) { return; }
        this.input.focus();
        if (this.input.value === '') {
            this.isOpened = false;
            triggerEvent('as24-autocomplete:input:close', this.input);
        } else {
            this.input.value = '';
            triggerEvent('as24-autocomplete:input:cleanup', this.input);
            if (this.isOpened) {
                triggerEvent('as24-autocomplete:input:trigger-suggestions', this.input);
            }
        }
    };

    AutocompleteInput.prototype.attachedCallback = function attachedCallback () {
        this.isOpened = false;
        this.isDirty = false;
        this.dropDown = $('.as24-autocomplete__icon-wrapper', this);
        this.cross = $('.as24-autocomplete__icon-cross', this);
        this.input = $('input', this);
        on('click', this.onInputClick.bind(this), this.input);
        on('click', this.onDropDownClick.bind(this), this.dropDown);
        on('click', this.onCrossClick.bind(this), this.cross);
        on('keyup', this.onKeyUp.bind(this), this.input, true);
        on('keydown', this.onKeyDown.bind(this), this.input, true);
    };

    return AutocompleteInput;
}(HTMLElement));

function registerDS() {
    try {
        return document.registerElement('as24-autocomplete-input', AutocompleteInput);
    } catch (e) {
        return null;
    }
}

/**
 * @class
 * @typedef Suggestion
 */
var Suggestion = function Suggestion(key, value) {
    this.key = key;
    this.value = value;
};

Suggestion.prototype.toString = function toString () {
    return ("Suggestion(" + (this.key) + ": " + (this.value) + ")");
};

/**
 * Test the string against item's value\
 * @param {RegExp} regexp
 * @returns {function}
 */
var valuePredicate = function (regexp) { return function (item) { return item.value.match(regexp) !== null; }; };


/**
 * @class
 * @typedef DataSource
 */
var PlainDataSource = (function (HTMLElement) {
    function PlainDataSource () {
        HTMLElement.apply(this, arguments);
    }

    if ( HTMLElement ) PlainDataSource.__proto__ = HTMLElement;
    PlainDataSource.prototype = Object.create( HTMLElement && HTMLElement.prototype );
    PlainDataSource.prototype.constructor = PlainDataSource;

    PlainDataSource.prototype.fetchItems = function fetchItems (queryString) {
        var this$1 = this;

        return new Promise(function (res) {
            var keyVals = this$1.extractKeyValues();
            var startingWith = keyVals
                .filter(valuePredicate(new RegExp(("^" + queryString), 'ig')));
            var theRestContaining = keyVals
                .filter(function (x) { return startingWith.indexOf(x) === -1; })
                .filter(valuePredicate(new RegExp(("" + queryString), 'ig')));
            return res(startingWith.concat(theRestContaining));
        });
    };

    /**
     * @param {string} keyValue
     * @return {Promise.<Suggestion>}
     */
    PlainDataSource.prototype.getSuggestionByKey = function getSuggestionByKey (keyValue) {
        var this$1 = this;

        return new Promise(function (res, rej) {
            var items = this$1.extractKeyValues();
            if (keyValue && items) {
                return res(items.filter(function (item) { return item.key === keyValue; })[0]);
            }
            return rej(null);
        });
    };

    /**
     * Extracts a list of objects like { key:string, value:string }
     * @returns {Array<{key:string, value:string}>}
     */
    PlainDataSource.prototype.extractKeyValues = function extractKeyValues () {
        return Array.prototype.slice.call(this.querySelectorAll('item')).map(function (tag) { return new Suggestion(tag.getAttribute('key'), tag.getAttribute('value')); }
        );
    };

    return PlainDataSource;
}(HTMLElement));

function registerDS$1() {
    try {
        return document.registerElement('as24-plain-data-source', PlainDataSource);
    } catch (e) {
        return null;
    }
}

/**
 * @class
 * @typedef Suggestion
 */
var Suggestion$1 = function Suggestion$1(key, value) {
    this.key = key;
    this.value = value;
};

Suggestion$1.prototype.toString = function toString () {
    return ("Suggestion(" + (this.key) + ": " + (this.value) + ")");
};

var SuggestionsGroup = function SuggestionsGroup(label, items) {
    this.label = label;
    this.items = items;
};

SuggestionsGroup.prototype.toString = function toString () {
    return ("SuggestionsGroup(" + (this.label) + ", " + (this.items.length) + " items)");
};

/**
 * Test the string against item's value\
 * @param {RegExp} regexp
 * @param {string|undefined} key
 * @returns {function}
 */
var valuePredicate$1 = function (regexp, key) { return function (sugg) { return regexp !== null
            ? sugg.value.match(regexp) !== null
            : typeof key !== 'undefined'
                ? sugg.key === key
                : true; }; };


/**
 * @class
 * @typedef GroupedItemsDataSource
 */
var GroupedItemsDataSource = (function (HTMLElement) {
    function GroupedItemsDataSource () {
        HTMLElement.apply(this, arguments);
    }

    if ( HTMLElement ) GroupedItemsDataSource.__proto__ = HTMLElement;
    GroupedItemsDataSource.prototype = Object.create( HTMLElement && HTMLElement.prototype );
    GroupedItemsDataSource.prototype.constructor = GroupedItemsDataSource;

    GroupedItemsDataSource.prototype.fetchItems = function fetchItems (queryString) {
        var this$1 = this;

        return new Promise(function (res) { return res(this$1.buildGroups(queryString)); });
    };

    /**
     * @param {string} theKey
     * @return {Promise.<Suggestion>}
     */
    GroupedItemsDataSource.prototype.getSuggestionByKey = function getSuggestionByKey (theKey) {
        var this$1 = this;

        return new Promise(function (res, rej) {
            var item = Array.prototype.slice.call(this$1.querySelectorAll('item'))
                .map(function (i) { return new Suggestion$1(i.getAttribute('key'), i.getAttribute('value')); })
                .filter(valuePredicate$1(null, theKey));
            if (item.length) {
                return res(item[0]);
            }
            return rej(null);
        });
    };

    /**
     * Extracts a list of objects like { key:string, value:string }
     * @param {HTMLElement} group
     * @param {string} queryString The query from the user
     * @param {string|undefined} theKey The key to look for
     * @returns {Array<{key:string, value:string}>}
     */
    GroupedItemsDataSource.prototype.buildItems = function buildItems (group, queryString, theKey) {
        var kvs = Array.prototype.slice.call(group.querySelectorAll('item')).map(function (tag) { return new Suggestion$1(tag.getAttribute('key'), tag.getAttribute('value')); }
        );

        var startingWith = kvs
            .filter(valuePredicate$1(new RegExp(("^" + queryString), 'ig'), theKey));

        var theRestContaining = kvs
            .filter(function (x) { return startingWith.indexOf(x) === -1; })
            .filter(valuePredicate$1(new RegExp(("" + queryString), 'ig'), theKey));

        return startingWith.concat(theRestContaining);
    };

    GroupedItemsDataSource.prototype.buildGroups = function buildGroups (queryString, theKey) {
        var this$1 = this;

        return Array.prototype.slice.call(this.querySelectorAll('group'))
            .reduce(function (res, group) {
                var items = this$1.buildItems(group, queryString, theKey);
                return items.length
                    ? res.concat(new SuggestionsGroup(group.getAttribute('label'), items))
                    : res;
            }, []);
    };

    return GroupedItemsDataSource;
}(HTMLElement));

function registerDS$2() {
    try {
        return document.registerElement('as24-grouped-items-data-source', GroupedItemsDataSource);
    } catch (e) {
        return null;
    }
}

/**
 * @class
 * @typedef PlainSuggestionsList
 */
var PlainSuggestionsList = (function (HTMLElement) {
    function PlainSuggestionsList () {
        HTMLElement.apply(this, arguments);
    }

    if ( HTMLElement ) PlainSuggestionsList.__proto__ = HTMLElement;
    PlainSuggestionsList.prototype = Object.create( HTMLElement && HTMLElement.prototype );
    PlainSuggestionsList.prototype.constructor = PlainSuggestionsList;

    PlainSuggestionsList.prototype.show = function show () {
        this.classList.add('as24-autocomplete__list--visible');
        triggerEvent('as24-autocomplete:suggestions-list:show', this);
    };

    PlainSuggestionsList.prototype.hide = function hide () {
        this.classList.remove('as24-autocomplete__list--visible');
        triggerEvent('as24-autocomplete:suggestions-list:hide', this);
    };

    PlainSuggestionsList.prototype.isEmpty = function isEmpty () {
      return $('.as24-autocomplete__list-item--empty', this);
    };

    PlainSuggestionsList.prototype.isVisible = function isVisible () {
        return this.classList.contains('as24-autocomplete__list--visible');
    };

    PlainSuggestionsList.prototype.getSelectedSuggestionItem = function getSelectedSuggestionItem () {
        return $('.as24-autocomplete__list-item--selected', this);
    };

    PlainSuggestionsList.prototype.scrollToSelectedItem = function scrollToSelectedItem (selected) {
        var listHeight = this.getBoundingClientRect().height;
        var selectedTop = selected.offsetTop;
        var selectedHeight = selected.offsetHeight;
        this.scrollTop = -1 * (listHeight - (selectedTop + selectedHeight));
    };

    PlainSuggestionsList.prototype.moveSelection = function moveSelection (dir) {
        var next = dir === 1 ? 'nextSibling' : 'previousSibling';
        var currActiveItem = this.getSelectedSuggestionItem(this);
        var nextActiveItem =
            currActiveItem === null
                ? $('.as24-autocomplete__list-item', this)
                : currActiveItem[next] !== null
                    ? currActiveItem[next]
                    : currActiveItem;
        if (currActiveItem) {
            currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
        }
        nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
        this.scrollToSelectedItem(nextActiveItem);
    };

    PlainSuggestionsList.prototype.onItemMouseOver = function onItemMouseOver (e) {
        e.stopPropagation();
        var preselected = $('.as24-autocomplete__list-item--preselected', this);
        if (e.target.tagName === 'LI') {
            if (preselected) {
                preselected.classList.remove('as24-autocomplete__list-item--preselected');
            }
            e.target.classList.add('as24-autocomplete__list-item--preselected');
        }
    };

    PlainSuggestionsList.prototype.selectItem = function selectItem () {
        var li = this.getSelectedSuggestionItem();
        if (li && li.dataset.type && li.dataset.type === 'selectable') {
            triggerEvent('as24-autocomplete:suggestion:selected', li);
            this.hide();
        }
    };

    PlainSuggestionsList.prototype.onClick = function onClick (e) {
        var li = closestByClassName('as24-autocomplete__list-item')(e.target);
        if (li && li.dataset.type && li.dataset.type === 'selectable') {
            this.hide();
            triggerEvent('as24-autocomplete:suggestion:selected', li);
        }
    };

    PlainSuggestionsList.prototype.renderItem = function renderItem (searchStr) {
        return function liRenderer(item) {
            var li = document.createElement('li');
            li.classList.add('as24-autocomplete__list-item');
            li.dataset.key = item.key;
            li.dataset.type = 'selectable';
            li.dataset.label = item.value;
            li.innerHTML = item.value.replace(new RegExp(("(" + searchStr + ")"), 'ig'), '<strong>$1</strong>');
            return li;
        };
    };

    PlainSuggestionsList.prototype.renderEmptyListItem = function renderEmptyListItem (emptyMessage) {
        var li = document.createElement('li');
        ['as24-autocomplete__list-item', 'as24-autocomplete__list-item--empty'].forEach(li.classList.add.bind(li.classList));
        li.dataset.type = 'unselectable';
        li.dataset.key = '';
        li.innerText = emptyMessage;
        return li;
    };

    PlainSuggestionsList.prototype.renderItems = function renderItems (userQuery, emptyMessage) {
        return function suggestionsRenderer(suggestions) {
            this.innerHTML = '';
            var df = document.createDocumentFragment();

            (suggestions.length
                ? suggestions.map(this.renderItem(userQuery))
                : [this.renderEmptyListItem(emptyMessage)]
            ).forEach(appendTo(df));

            appendTo(this)(df);
            this.show();
        }.bind(this);
    };

    PlainSuggestionsList.prototype.attachedCallback = function attachedCallback () {
        on('mouseover', this.onItemMouseOver.bind(this), this);
        on('click', this.onClick.bind(this), this);
    };

    return PlainSuggestionsList;
}(HTMLElement));

function registerDS$3() {
    try {
        return document.registerElement('as24-plain-suggestions-list', PlainSuggestionsList);
    } catch (e) {
        return null;
    }
}

/**
 * @class
 * @typedef GroupedSuggestionsList
 */
var GroupedSuggestionsList = (function (HTMLElement) {
    function GroupedSuggestionsList () {
        HTMLElement.apply(this, arguments);
    }

    if ( HTMLElement ) GroupedSuggestionsList.__proto__ = HTMLElement;
    GroupedSuggestionsList.prototype = Object.create( HTMLElement && HTMLElement.prototype );
    GroupedSuggestionsList.prototype.constructor = GroupedSuggestionsList;

    GroupedSuggestionsList.prototype.show = function show () {
        this.classList.add('as24-autocomplete__list--visible');
        triggerEvent('as24-autocomplete:suggestions-list:show', this);
    };

    GroupedSuggestionsList.prototype.hide = function hide () {
        this.classList.remove('as24-autocomplete__list--visible');
        triggerEvent('as24-autocomplete:suggestions-list:hide', this);
    };

    GroupedSuggestionsList.prototype.isEmpty = function isEmpty () {
      return $('.as24-autocomplete__list-item--empty', this);
    };

    GroupedSuggestionsList.prototype.isVisible = function isVisible () {
        return this.classList.contains('as24-autocomplete__list--visible');
    };

    GroupedSuggestionsList.prototype.getSelectedSuggestionItem = function getSelectedSuggestionItem () {
        return $('.as24-autocomplete__list-item--selected', this);
    };

    GroupedSuggestionsList.prototype.scrollToSelectedItem = function scrollToSelectedItem (selected) {
        var listHeight = this.getBoundingClientRect().height;
        var selectedTop = selected.offsetTop;
        var selectedHeight = selected.offsetHeight;
        this.scrollTop = -1 * (listHeight - (selectedTop + selectedHeight));
    };

    GroupedSuggestionsList.prototype.moveSelection = function moveSelection (dir) {
        var currActiveItem = this.getSelectedSuggestionItem(this);
        var allItems = Array.prototype.slice.call($$('.as24-autocomplete__list-item', this))
            .filter(function (i) { return i.dataset.type === 'selectable'; });
        var currPos = currActiveItem === null ? -1 : allItems.indexOf(currActiveItem);
        var nextPos = currPos + dir > allItems.length - 1
            ? allItems.length - 1
            : currPos + dir < 0
                ? 0
                : currPos + dir;
        var nextActiveItem = allItems[nextPos];
        if (currActiveItem) {
            currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
        }
        if (nextActiveItem) {
            nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
            this.scrollToSelectedItem(nextActiveItem);
        }
    };

    GroupedSuggestionsList.prototype.onItemMouseOver = function onItemMouseOver (e) {
        e.stopPropagation();
        var preselected = $('.as24-autocomplete__list-item--preselected', this);
        if (e.target.tagName === 'LI') {
            if (preselected) {
                preselected.classList.remove('as24-autocomplete__list-item--preselected');
            }
            e.target.classList.add('as24-autocomplete__list-item--preselected');
        }
    };

    GroupedSuggestionsList.prototype.selectItem = function selectItem () {
        var li = this.getSelectedSuggestionItem();
        if (li && li.dataset.type && li.dataset.type === 'selectable') {
            triggerEvent('as24-autocomplete:suggestion:selected', li);
            this.hide();
        }
    };

    GroupedSuggestionsList.prototype.onClick = function onClick (e) {
        var li = closestByClassName('as24-autocomplete__list-item')(e.target);
        if (li && li.dataset.type && li.dataset.type === 'selectable') {
            this.hide();
            triggerEvent('as24-autocomplete:suggestion:selected', li);
        }
    };

    GroupedSuggestionsList.prototype.renderItem = function renderItem (userQuery) {
        return function liRenderer(item) {
            var li = document.createElement('li');
            li.classList.add('as24-autocomplete__list-item');
            li.dataset.key = item.key;
            li.dataset.type = 'selectable';
            li.dataset.label = item.value;
            li.innerHTML = item.value.replace(new RegExp(("(" + userQuery + ")"), 'ig'), '<strong>$1</strong>');
            return li;
        };
    };

    GroupedSuggestionsList.prototype.renderSeparator = function renderSeparator (group) {
        var div = document.createElement('div');
        div.classList.add('as24-autocomplete__list-item');
        div.classList.add('as24-autocomplete__separator');
        div.dataset.type = 'unselectable';
        div.innerHTML = group.label;
        return div;
    };

    GroupedSuggestionsList.prototype.renderGroup = function renderGroup (userQuery) {
        return function groupRenderer(group) {
            var df = document.createDocumentFragment();
            if (userQuery.length === 0) {
              df.appendChild(this.renderSeparator(group));
            }
            group.items
                .map(this.renderItem(userQuery))
                .forEach(appendTo(df));
            return df;
        };
    };

    GroupedSuggestionsList.prototype.renderEmptyListItem = function renderEmptyListItem (emptyMessage) {
        var li = document.createElement('li');
        ['as24-autocomplete__list-item', 'as24-autocomplete__list-item--empty'].forEach(li.classList.add.bind(li.classList));
        li.dataset.type = 'unselectable';
        li.innerText = emptyMessage;
        return li;
    };

    GroupedSuggestionsList.prototype.renderItems = function renderItems (userQuery, emptyMessage) {
        return function suggestionsRenderer(suggestions) {
            this.innerHTML = '';
            var df = document.createDocumentFragment();

            (suggestions.length
                ? suggestions.map(this.renderGroup(userQuery).bind(this))
                : [this.renderEmptyListItem(emptyMessage)]
            ).forEach(appendTo(df));

            appendTo(this)(df);
            this.show();
        }.bind(this);
    };

    GroupedSuggestionsList.prototype.attachedCallback = function attachedCallback () {
        on('mouseover', this.onItemMouseOver.bind(this), this);
        on('click', this.onClick.bind(this), this);
    };

    return GroupedSuggestionsList;
}(HTMLElement));

function registerDS$4() {
    try {
        return document.registerElement('as24-grouped-suggestions-list', GroupedSuggestionsList);
    } catch (e) {
        return null;
    }
}

var AutocompleteInput$1 = (function (HTMLElement) {
    function AutocompleteInput () {
        HTMLElement.apply(this, arguments);
    }

    if ( HTMLElement ) AutocompleteInput.__proto__ = HTMLElement;
    AutocompleteInput.prototype = Object.create( HTMLElement && HTMLElement.prototype );
    AutocompleteInput.prototype.constructor = AutocompleteInput;

    AutocompleteInput.prototype.selectedValue = function selectedValue () {
        return this.valueInput.value;
    };

    AutocompleteInput.prototype.userQuery = function userQuery () {
        return this.userFacingInput.getValue();
    };

    AutocompleteInput.prototype.dataSourceElement = function dataSourceElement () {
        return this.dataSource;
    };

    AutocompleteInput.prototype.reset = function reset () {
        this.userFacingInput.setValue('');
        this.valueInput.value = '';
        this.list.hide();
        this.isDirty = false;
        this.classList.remove('as24-autocomplete--active');
        this.classList.remove('as24-autocomplete--user-input');
    };

    AutocompleteInput.prototype.fetchList = function fetchList (userQuery) {
        return this.dataSource.fetchItems(userQuery)
            .then(this.userFacingInput.renderInput())
            .then(this.list.renderItems(userQuery, this.emptyListMessage));
    };

    AutocompleteInput.prototype.getInitialValueByKey = function getInitialValueByKey () {
        return this.dataSource.getSuggestionByKey(this.valueInput.value);
    };

    AutocompleteInput.prototype.attachedCallback = function attachedCallback () {
        var this$1 = this;

        this.emptyListMessage = this.getAttribute('empty-list-message') || '---';

        this.userFacingInput = $('as24-autocomplete-input', this);

        this.valueInput = $('input[data-role="value"]', this);

        this.list = $('[data-role="list"]', this);

        this.dataSource = this.querySelector('[role=data-source]');

        if (!this.dataSource) {
            throw new Error('The DataSource has not been found');
        }

        this.isDirty = false;

        //setTimeout(() => {
            if (this.valueInput.value) {
                this.getInitialValueByKey()
                    .then(function (suggestion) {
                        if (suggestion) {
                            this$1.userFacingInput.setValue(suggestion.value);
                            this$1.classList.add('as24-autocomplete--user-input');
                            this$1.isDirty = true;
                        }
                        return true;
                    });
            }
        //});

        on('as24-autocomplete:suggestion:selected', function (e) {
            e.stopPropagation();
            this$1.valueInput.value = e.target.dataset.key;
            this$1.userFacingInput.setValue(e.target.dataset.label);
            this$1.userFacingInput.isOpened = false;
            this$1.list.hide();
            this$1.classList.remove('as24-autocomplete--active');
            this$1.classList.add('as24-autocomplete--user-input');
            triggerEvent('change', this$1);
        }, this);

        on('as24-autocomplete:input:trigger-suggestions', function (e) {
            e.stopPropagation();
            if (!this$1.list.isVisible()) {
                this$1.list.show();
            }
            this$1.classList.add('as24-autocomplete--active');
            this$1.fetchList(this$1.userFacingInput.getValue()).then(function () { return this$1.list.moveSelection(1); });
        }, this);

        on('as24-autocomplete:input:focus-lost', function (e) {
            e.stopPropagation();
            if (this$1.userFacingInput.getValue() !== '' && !this$1.list.isEmpty()) {
              this$1.list.selectItem();
            } else  {
              this$1.list.hide();
              this$1.classList.remove('as24-autocomplete--active');
            }
        }, this);

        on('as24-autocomplete:input:enter', function (e) {
            e.stopPropagation();
            if (this$1.list.isVisible()) {
                this$1.list.selectItem();
                this$1.list.hide();
                this$1.classList.remove('as24-autocomplete--active');
            } else {
                this$1.fetchList(this$1.userFacingInput.getValue())
                    .then(function () { return this$1.list.moveSelection(1); });
                this$1.classList.add('as24-autocomplete--active');
            }
        }, this);

        on('as24-autocomplete:input:query', function (e) {
            e.stopPropagation();
            if (this$1.userFacingInput.getValue() !== '') {
                this$1.classList.add('as24-autocomplete--user-input');
                this$1.classList.add('as24-autocomplete--active');
            } else {
                this$1.classList.remove('as24-autocomplete--user-input');
            }
            this$1.fetchList(this$1.userFacingInput.getValue()).then(function () {
              this$1.list.moveSelection(1);
              if (this$1.valueInput.value.length > 0 && (this$1.userFacingInput.getValue() === '' || this$1.list.isEmpty())) {
                  this$1.valueInput.value = '';
                  triggerEvent('change', this$1);
              }
            });
        }, this);

        on('as24-autocomplete:input:cleanup', function (e) {
            e.stopPropagation();
            this$1.classList.remove('as24-autocomplete--user-input');
            this$1.classList.add('as24-autocomplete--active');
            this$1.valueInput.value = '';
            this$1.fetchList('').then(function () { return this$1.list.moveSelection(1); });
            triggerEvent('change', this$1);
        }, this);

        on('as24-autocomplete:input:close', function (e) {
            e.stopPropagation();
            this$1.classList.remove('as24-autocomplete--user-input');
            this$1.classList.remove('as24-autocomplete--active');
            this$1.list.hide();
        }, this);

        on('as24-autocomplete:input:go-down', function (e) {
            e.stopPropagation();
            if (this$1.userFacingInput.getValue() !== '') {
                this$1.classList.add('as24-autocomplete--active');
            }
            if (this$1.list.isVisible()) {
                this$1.list.moveSelection(1);
            } else {
                this$1.fetchList(this$1.userFacingInput.getValue())
                    .then(function () { return this$1.list.moveSelection(1); });
            }
        }, this);

        on('as24-autocomplete:input:go-up', function (e) {
            e.stopPropagation();
            if (this$1.list.isVisible()) {
                this$1.list.moveSelection(-1);
            }
        }, this);

        on('click', function (e) {
            if (closestByTag(this$1)(e.target) === this$1) {
                return;
            }
            if (this$1.list.isVisible()) {
                if (this$1.userFacingInput.getValue() !== '' && !this$1.list.isEmpty()) {
                  this$1.list.selectItem();
                }
                this$1.list.hide();
                this$1.userFacingInput.isOpened = false;
                this$1.classList.remove('as24-autocomplete--active');
            }
        }, document);
    };

    AutocompleteInput.prototype.onAttributeChanged = function onAttributeChanged (attrName, oldVal, newVal) {
        if (attrName === 'disabled') {
            this.userFacingInput.setDisabled((oldVal !== newVal) && (newVal === 'true' || newVal === 'disabled'));
            this.classList[
                this.userFacingInput.isDisabled() ? 'add' : 'remove'
            ]('as24-autocomplete--disabled');
            this.list.hide();
        }
    };

    return AutocompleteInput;
}(HTMLElement));



function register() {
    try {
        return document.registerElement('as24-autocomplete', AutocompleteInput$1);
    } catch (e) {
        return null;
    }
}

registerDS();
registerDS$1();
registerDS$2();
registerDS$3();
registerDS$4();
register();

//# sourceMappingURL=as24-autocomplete.js.map

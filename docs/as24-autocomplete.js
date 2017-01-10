/**
 * @class DOMEvent
 * @property {HTMLElement} target
 * @property {number} which
 * @property {function} stopPropagation
 * @property {function} preventDefault
 */



/**
 * @callback fetchItemsFn
 * @param {string} userInput
 * @return {Promise}
 */



/**
 * Finds a closest element by class name
 * @param {string} className
 * @returns {function}
 */
var closestByClassName = function (className) { return function (elem) {
        // Fix for IE.
        if (elem.tagName === 'HTML') {
            return null;
        } else {
            return elem.classList.contains(className)
                ? elem
                : closestByClassName(className)(elem.parentNode);
        }
    }; };



/**
 * Checks whether elem has tag as a parent
 * @param {HTMLElement} tag
 * @returns {function}
 */
var closestByTag = function (tag) { return function (elem) { return elem === null
            ? null
            : (elem === tag)
                ? tag
                : closestByTag(tag)(elem.parentNode); }; };



/**
 * Selects an element using the root element.
 * @param {string} selector Specifies the selector for lookup
 * @param {Element} root Specified within which element to perform the lookup
 * @return {Element}
 */
var $ = function (selector, root) { return root.querySelector(selector); };



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
 * Appends a child element to a target element
 * @param {HTMLElement|DocumentFragment} target
 * @returns {function}
 */
var appendTo = function (target) { return function (child) {
        target.appendChild(child);
        return target;
    }; };



/**
* Finds the currently selected suggestion item
* @param {HTMLUListElement} list
* @returns {HTMLLIElement}
*/
var getSelectedSuggestionItem = function (list) { return $('.as24-autocomplete__list-item--selected', list); };



/**
*
* @param {HTMLElement} list
* @param {HTMLElement} selected
*/
var followSelectedItem = function (list, selected) {
    var listHeight = list.getBoundingClientRect().height;
    var selectedTop = selected.offsetTop;
    var selectedHeight = selected.offsetHeight;
    list.scrollTop = -1 * (listHeight - (selectedTop + selectedHeight));
};



/**
 * Selected next/prev suggestion item
 * @param {number} dir
 * @param {HTMLUListElement} list
 * @return {boolean}
 */
var moveSelection = function (dir, list) {
    var next = dir === 1 ? 'nextSibling' : 'previousSibling';
    var currActiveItem = getSelectedSuggestionItem(list);
    var nextActiveItem = currActiveItem === null
        ? $('.as24-autocomplete__list-item', list)
        : currActiveItem[next] !== null
            ? currActiveItem[next]
            : currActiveItem;
    if (currActiveItem) {
        currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
    }
    nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
    followSelectedItem(list, nextActiveItem);
    return false;
};



/**
 * Shows the suggestions list
 * @param {HTMLUListElement} list
 * @return {boolean}
 */
var showList = function (list) {
    list.classList.add('as24-autocomplete__list--visible');
    moveSelection(1, list);
    return false;
};



/**
 * Hides the list and deactivates the root element
 * @param {HTMLUListElement} list
 * @param {Element} rootElement
 */
var hideList = function (list, rootElement) { return function () {
    rootElement.classList.remove('as24-autocomplete--active');
    list.classList.remove('as24-autocomplete__list--visible');
    return false;
}; };



/**
 * Checks whether the list is visisible
 * @param {Element} list
 */
var isListVisible = function (list) { return list.classList.contains('as24-autocomplete__list--visible'); };



/**
 * When user clicks cross icon, all the input must be removed
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} userFacingInput
 * @param {HTMLElement} rootElement
 * @return {*}
 */
var cleanup = function (valueInput, userFacingInput, rootElement) {
    valueInput.value = '';
    userFacingInput.value = '';
    rootElement.isDirty = false;
    rootElement.classList.remove('as24-autocomplete--user-input');
    removeInputError(rootElement);
};



/**
 * When user types something in we mark the component as dirty
 * @param {Element} rootElement
 * @return {*}
 */
var dirtifyInput = function (rootElement) {
    rootElement.isDirty = true;
    rootElement.classList.add('as24-autocomplete--user-input');
};



/**
 * Renders a li item for the suggestions list
 * @param {string} searchStr
 * @returns {function}
 */
var renderLI = function (searchStr) { return function (item) {
        var li = document.createElement('li');
        var escapedSearchStr = searchStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        li.classList.add('as24-autocomplete__list-item');
        li.dataset.key = item.key;
        li.innerHTML = item.value.replace(new RegExp(("(" + escapedSearchStr + ")"), 'ig'), '<strong>$1</strong>');
        return li;
    }; };

/**
 * Highlight an error when there is nothing to suggest
 * @param {HTMLElement} rootElement
 * @return {*}
 */
var setInputError = function (rootElement) {
    var input = $('.as24-autocomplete__input', rootElement);
    input.classList.add('error');
};

/**
 * Remove error highlighting when there is something to suggest
 * @param {HTMLElement} rootElement
 * @return {*}
 */
var removeInputError = function (rootElement) {
    var input = $('.as24-autocomplete__input', rootElement);
    input.classList.remove('error');
};

/**
 * What to render when there is nothing to suggest
 * @param {String} emptyMessage
 * @param {HTMLElement} rootElement
 * @returns {HTMLLIElement}
 */
var renderEmptyListItem = function (emptyMessage, rootElement) {
    setInputError(rootElement);
    /**
     * @type {HTMLLIElement}
     */
    var li = document.createElement('li');
    li.dataset.unselectable = true;
    ['as24-autocomplete__list-item', 'as24-autocomplete__list-item--empty'].forEach(li.classList.add.bind(li.classList));
    li.dataset.key = '';
    li.innerText = emptyMessage;
    return li;
};



/**
 * Renders a collection of raw suggestions to the list
 * @param {string} emptyMessage
 * @param {HTMLUListElement} list
 * @param {HTMLInputElement} userFacingInput
 * @param {HTMLElement} rootElement
 * @returns {Function}
 */
var renderList = function (emptyMessage, list, userFacingInput, rootElement) { return function (suggestions) {
        list.innerHTML = '';
        var df = document.createDocumentFragment();

        (suggestions.length
            ? suggestions.map(renderLI(userFacingInput.value))
            : [renderEmptyListItem(emptyMessage, rootElement)]
        ).forEach(appendTo(df));

        appendTo(list)(df);
        showList(list);
    }; };



/**
 * Fetch data according to user input and renders the list
 * @param {DataSource} dataSource
 * @param {HTMLInputElement} userFacingInput
 * @param {HTMLUListElement} list
 * @param {String} emptyMessage
 * @param {Element} rootElement
 * @returns {function}
 */
var fetchList = function (dataSource, userFacingInput, list, emptyMessage, rootElement) { return function (e) {
        e.stopPropagation();
        rootElement.classList.add('as24-autocomplete--active');
        removeInputError(rootElement);
        dataSource.fetchItems(userFacingInput.value).then(renderList(emptyMessage, list, userFacingInput, rootElement));
    }; };


/**
 *
 * @param {string} eventName
 * @param {HTMLInputElement} el
 */
var triggerChangeEvent = function (eventName, el) {
    var evt = document.createEvent('Event');
    evt.initEvent(eventName, true, true);
    el.dispatchEvent(evt);
};


/**
 * This is what happens after the user selected an item
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} userFacingInput
 * @param {HTMLLIElement} li
 * @param {Element} rootElement
 * @param {HTMLLIElement} list
 */
var selectItem = function (valueInput, userFacingInput, li, rootElement, list) {
    if(!li){
        li = getSelectedSuggestionItem(list);
        if(li.classList.contains('as24-autocomplete__list-item--empty')){
            return;
        }
        hideList(list, rootElement)();
    }

    valueInput.value = li.dataset.key;
    userFacingInput.value = li.innerText;
    triggerChangeEvent('change', valueInput);
    dirtifyInput(rootElement);
};



/**
 * When mouse goes over the suggestion item
 * @param {HTMLUListElement} list
 * @return {function} a function that accepts an event
 */
var onItemMouseOver = function (list) { return function (e) {
        e.stopPropagation();
        var preselected = $('.as24-autocomplete__list-item--preselected', list);
        if (e.target.tagName === 'LI') {
            if (preselected) {
                preselected.classList.remove('as24-autocomplete__list-item--preselected');
            }
            e.target.classList.add('as24-autocomplete__list-item--preselected');
        }
    }; };



/**
 * Handles key down event from the label input
 * @param {DataSource} dataSource
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} userFacingInput
 * @param {HTMLUListElement} list
 * @param {string} emptyListMessage
 * @param {Element} rootElement
 * @return {function}
 */
var onKeyDown = function (dataSource, valueInput, userFacingInput, list, emptyListMessage, rootElement) { return function (e) {
        if (e.target === userFacingInput) {
            if ([38, 40, 27].indexOf(e.which) >= 0) {
                e.stopPropagation();
                e.preventDefault();
            }
            if (e.which === 9) {
                if (isListVisible(list)) {
                    selectItem(valueInput, userFacingInput,
                        getSelectedSuggestionItem(list),
                        rootElement
                    );
                    hideList(list, rootElement)(e);
                }
            }
            if (e.which === 38) {
                return moveSelection(-1, list);
            }
            if (e.which === 40) {
                return isListVisible(list)
                    ? moveSelection(1, list)
                    : fetchList(dataSource, userFacingInput, list,
                        emptyListMessage, rootElement)(e);
            }
            if (e.which === 27) {
                cleanup(valueInput, userFacingInput, rootElement);
                return hideList(list, rootElement)();
            }
        }
        return null;
    }; };



/**
 * Handles key up event from the label input
 * @param {DataSource} dataSource
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} userFacingInput
 * @param {HTMLUListElement} list
 * @param {string} emptyListMessage
 * @param {Element} rootElement
 * @return {function}
 */
var onKeyUp = function (dataSource, valueInput, userFacingInput, list, emptyListMessage, rootElement) { return function (e) {
        if (userFacingInput.value) {
            dirtifyInput(rootElement);
        } else {
            cleanup(valueInput, userFacingInput, rootElement);
        }
        if (isListVisible(list) && (e.which === 13 || e.which === 9)) {
            e.stopPropagation();
            e.preventDefault();
            selectItem(valueInput, userFacingInput, null , rootElement, list);
            return false;
        }
        if ([38, 40, 27].indexOf(e.which) === -1) {
            e.stopPropagation();
            return fetchList(dataSource, userFacingInput, list, emptyListMessage, rootElement)(e);
        }
        return null;
    }; };



/**
 * Reset the state of the component
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} userFacingInput
 * @param {HTMLElement} root
 */
var reset = function (valueInput, userFacingInput, root) {
    cleanup(valueInput, userFacingInput, root);
    triggerChangeEvent('change', valueInput);
    return true;
};



/**
 * Returns promised Suggestion by key
 * @param  {DataSource} dataSource
 * @param  {string} keyValue
 * @return {Promise.<Suggestion>}
 */
var getInitialValueByKey = function (dataSource, keyValue) { return dataSource.getSuggestionByKey(keyValue); };


/**
 * Handles click on the component
 * @param {function} fetchListFn
 * @param {HTMLInputElement} userFacingInput
 * @param {HTMLInputElement} valueInput
 * @param {HTMLUListElement} list
 * @param {HTMLElement} rootElement
 */
var componentClicked = function (fetchListFn, userFacingInput, valueInput, list, rootElement) { return function (e) {
    var isInput = closestByClassName('as24-autocomplete__input')(e.target);
    var isIcon = closestByClassName('as24-autocomplete__icon-wrapper')(e.target);
    var isList = closestByClassName('as24-autocomplete__list')(e.target);
    if (closestByTag(rootElement)(e.target) === rootElement) {
        if (isInput) {
            fetchListFn(e);
        }
        else if (isIcon) {
            if (!userFacingInput.disabled) {
                if (rootElement.isDirty) {
                    reset(valueInput, userFacingInput, rootElement);
                    if (isListVisible(list)) {
                        fetchListFn(e);
                        userFacingInput.focus();
                    }
                    return;
                }
                if (isListVisible(list)) {
                    hideList(list, rootElement)(e);
                } else {
                    userFacingInput.focus();
                    fetchListFn(e);
                }
            }
        }
        else if (isList) {
            var theItem = closestByClassName('as24-autocomplete__list-item')(e.target);
            if (theItem.dataset.unselectable) {
                e.stopPropagation();
                return;
            }
            selectItem(valueInput, userFacingInput, theItem, rootElement);
            rootElement.classList.add('as24-autocomplete--user-input');
            hideList(list, rootElement)(e);
        }
    } else {
        hideList(list, rootElement)(e);
    }
}; };



/**
 * When the custom tag has been attached to DOM
 * @this HTMLElement
 */
function elementAttached() {
    /**
     * The as24-autocomplete DOM element
     * @type {HTMLElement}
     */
    var root = this;

    /**
     * The message about no items has been found
     * @type {string}
     */
    var emptyListMessage = root.getAttribute('empty-list-message') || '---';

    /**
     * The input with which the user can interact
     * @type {HTMLInputElement}
     */
    var userFacingInput = $('[type=text]', root);

    /**
     * Hidden input in which we actually set the value
     * @type {HTMLInputElement}
     */
    var valueInput = $('[type=hidden]', root);

    /**
     * The UL-element that represents the suggestion list
     * @type {HTMLUListElement}
     */
    var list = $('.as24-autocomplete__list', root);

    /**
     * DataSource element
     * @type {DataSource}
     */
    var dataSource = this.querySelector('[role=data-source]');

    if (!dataSource) {
        throw new Error('The DataSource has not been found');
    }

    /**
     * The function that takes an Event and does call to DataSource
     * @type {Function}
     */
    var fetchListFn = fetchList(dataSource, userFacingInput, list, emptyListMessage, root);

    root.isDirty = false;

    setTimeout(function () {
        if (valueInput.value) {
            getInitialValueByKey(dataSource, valueInput.value)
                .then(function (suggestion) {
                    if (suggestion) {
                        userFacingInput.value = suggestion.value;
                        dirtifyInput(root);
                    }
                    return true;
                });
        }
    });

    on('click', componentClicked(fetchListFn, userFacingInput, valueInput, list, root), document);
    on('keyup', onKeyUp(dataSource, valueInput, userFacingInput, list, emptyListMessage, root), userFacingInput, true);
    on('keydown', onKeyDown(dataSource, valueInput, userFacingInput, list, emptyListMessage, root), window, true);
    on('mouseover', onItemMouseOver(list), list, true);
}



function elementDetached() { }

/**
 * @this {HTMLElement}
 * @param {string} attrName
 * @param {string} oldVal
 * @param {string} newVal
 */
function onAttributeChanged(attrName, oldVal, newVal) {
    /** @type {HTMLInputElement} */
    var userFacingInput = $('[type=text]', this);

    /** @type {HTMLUListElement} */
    var list = $('.as24-autocomplete__list', this);

    if (attrName === 'disabled') {
        userFacingInput.disabled = newVal === 'true' || newVal === 'disabled';
        this.classList[userFacingInput.disabled ? 'add' : 'remove']('as24-autocomplete--disabled');
        hideList(list, this)();
    }
}

function registerInput() {
    try {
        return document.registerElement('as24-autocomplete', {
            prototype: Object.assign(
                Object.create(HTMLElement.prototype, {
                    attachedCallback: { value: elementAttached },
                    detachedCallback: { value: elementDetached },
                    attributeChangedCallback: { value: onAttributeChanged }
                }),
                /**
                 * Public API
                 */
                {
                    /**
                     * Returns the selected value
                     * @this {HTMLElement}
                     */
                    selectedValue: function selectedValue() {
                        return $('[type=hidden]', this).value;
                    },
                    /**
                     * Returns what user has written
                     * @this {HTMLElement}
                     */
                    userQuery: function userQuery() {
                        return $('[type=text]', this).value;
                    },
                    /**
                     * returns the bounded data source element
                     * @this {HTMLElement}
                     */
                    dataSourceElement: function dataSourceElement() {
                        return this.querySelector('[role=data-source]');
                    },
                    /**
                     * Resets the component
                     * @this {HTMLElement}
                     */
                    reset: function reset$1() {
                        /** @type {HTMLInputElement} */
                        var userFacingInput = $('[type=text]', this);

                        /** @type {HTMLInputElement} */
                        var valueInput = $('[type=hidden]', this);

                        return reset(valueInput, userFacingInput, this);
                    }
                }
            )
        });
    } catch (e) {
        if (window && window.console) {
            window.console.warn('Failed to register CustomElement "as24-autocomplete".', e);
            return null;
        }
    }
    return true;
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
var DataSource = (function (HTMLElement) {
    function DataSource () {
        HTMLElement.apply(this, arguments);
    }

    if ( HTMLElement ) DataSource.__proto__ = HTMLElement;
    DataSource.prototype = Object.create( HTMLElement && HTMLElement.prototype );
    DataSource.prototype.constructor = DataSource;

    DataSource.prototype.fetchItems = function fetchItems (queryString) {
        var this$1 = this;

        return new Promise(function (res) {
            var keyVals = this$1.extractKeyValues();
            var escapedQueryString = queryString.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            var startingWith = keyVals
                .filter(valuePredicate(new RegExp(("^" + escapedQueryString), 'ig')));
            var theRestContaining = keyVals
                .filter(function (x) { return startingWith.indexOf(x) === -1; })
                .filter(valuePredicate(new RegExp(("" + escapedQueryString), 'ig')));
            return res(startingWith.concat(theRestContaining));
        });
    };

    /**
     * @param {string} keyValue
     * @return {Promise.<Suggestion>}
     */
    DataSource.prototype.getSuggestionByKey = function getSuggestionByKey (keyValue) {
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
    DataSource.prototype.extractKeyValues = function extractKeyValues () {
        return Array.prototype.slice.call(this.querySelectorAll('item')).map(function (tag) { return new Suggestion(tag.getAttribute('key'), tag.getAttribute('value')); }
        );
    };

    return DataSource;
}(HTMLElement));

function registerDS() {
    try {
        return document.registerElement('as24-tags-data-source', DataSource);
    } catch (e) {
        return null;
    }
}

registerInput();
registerDS();

//# sourceMappingURL=as24-autocomplete.js.map

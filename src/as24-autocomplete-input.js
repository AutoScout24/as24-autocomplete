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
const closestByClassName = className =>
    /**
     * @param {HTMLElement} elem
     * @return {HTMLElement|null}
     */
    elem => {
        // Fix for IE.
        if (elem.tagName === 'HTML') {
            return null;
        } else {
            return elem.classList.contains(className)
                ? elem
                : closestByClassName(className)(elem.parentNode);
        }
    };



/**
 * Checks whether elem has tag as a parent
 * @param {HTMLElement} tag
 * @returns {function}
 */
const closestByTag = tag =>
    /**
     * @param {HTMLElement} elem
     * @return {HTMLElement|null}
     */
    elem =>
        elem === null
            ? null
            : (elem === tag)
                ? tag
                : closestByTag(tag)(elem.parentNode);



/**
 * Selects an element using the root element.
 * @param {string} selector Specifies the selector for lookup
 * @param {Element} root Specified within which element to perform the lookup
 * @return {Element}
 */
const $ = (selector, root) =>
    root.querySelector(selector);



/**
 * Binds an event listener on the element
 * @param {string} event
 * @param {Function} cb
 * @param {Element|Window|Document} el
 * @param {boolean} capturing
 */
const on = (event, cb, el, capturing = false) =>
    el.addEventListener(event, cb, capturing);



/**
 * Appends a child element to a target element
 * @param {HTMLElement|DocumentFragment} target
 * @returns {function}
 */
const appendTo = target =>
    /**
     * @param {HTMLElement} child
     * @return {HTMLElement}
     */
    child => {
        target.appendChild(child);
        return target;
    };



/**
* Finds the currently selected suggestion item
* @param {HTMLUListElement} list
* @returns {HTMLLIElement}
*/
const getSelectedSuggestionItem = list =>
    $('.as24-autocomplete__list-item--selected', list);



/**
*
* @param {HTMLElement} list
* @param {HTMLElement} selected
*/
const followSelectedItem = (list, selected) => {
    const listHeight = list.getBoundingClientRect().height;
    const selectedTop = selected.offsetTop;
    const selectedHeight = selected.offsetHeight;
    list.scrollTop = -1 * (listHeight - (selectedTop + selectedHeight));
};



/**
 * Selected next/prev suggestion item
 * @param {number} dir
 * @param {HTMLUListElement} list
 * @return {boolean}
 */
const moveSelection = (dir, list) => {
    const next = dir === 1 ? 'nextSibling' : 'previousSibling';
    const currActiveItem = getSelectedSuggestionItem(list);
    const nextActiveItem = currActiveItem === null
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
const showList = list => {
    list.classList.add('as24-autocomplete__list--visible');
    moveSelection(1, list);
    return false;
};



/**
 * Hides the list and deactivates the root element
 * @param {HTMLUListElement} list
 * @param {Element} rootElement
 */
const hideList = (list, rootElement) => () => {
    rootElement.classList.remove('as24-autocomplete--active');
    list.classList.remove('as24-autocomplete__list--visible');
    return false;
};



/**
 * Checks whether the list is visisible
 * @param {Element} list
 */
const isListVisible = list =>
    list.classList.contains('as24-autocomplete__list--visible');



/**
 * When user clicks cross icon, all the input must be removed
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} userFacingInput
 * @param {HTMLElement} rootElement
 * @return {*}
 */
const cleanup = (valueInput, userFacingInput, rootElement) => {
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
const dirtifyInput = (rootElement) => {
    rootElement.isDirty = true;
    rootElement.classList.add('as24-autocomplete--user-input');
};



/**
 * Renders a li item for the suggestions list
 * @param {string} searchStr
 * @returns {function}
 */
const renderLI = searchStr =>
    /**
     * @param {Suggestion} item
     * @returns {HTMLLIElement}
     */
    item => {
        const li = document.createElement('li');
        const escapedSearchStr = searchStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        li.classList.add('as24-autocomplete__list-item');
        li.dataset.key = item.key;
        li.innerHTML = item.value.replace(new RegExp(`(${escapedSearchStr})`, 'ig'), '<strong>$1</strong>');
        return li;
    };

/**
 * Highlight an error when there is nothing to suggest
 * @param {HTMLElement} rootElement
 * @return {*}
 */
const setInputError = rootElement =>{
    const input = $('.as24-autocomplete__input', rootElement)
    input.classList.add('error');
}

/**
 * Remove error highlighting when there is something to suggest
 * @param {HTMLElement} rootElement
 * @return {*}
 */
const removeInputError = rootElement =>{
    const input = $('.as24-autocomplete__input', rootElement)
    input.classList.remove('error');
}

/**
 * What to render when there is nothing to suggest
 * @param {String} emptyMessage
 * @param {HTMLElement} rootElement
 * @returns {HTMLLIElement}
 */
const renderEmptyListItem = (emptyMessage, rootElement) => {
    setInputError(rootElement);
    /**
     * @type {HTMLLIElement}
     */
    const li = document.createElement('li');
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
const renderList = (emptyMessage, list, userFacingInput, rootElement) =>
    /**
     * @param {Array<Suggestion>} suggestions
     */
    suggestions => {
        list.innerHTML = '';
        const df = document.createDocumentFragment();

        (suggestions.length
            ? suggestions.map(renderLI(userFacingInput.value))
            : [renderEmptyListItem(emptyMessage, rootElement)]
        ).forEach(appendTo(df));

        appendTo(list)(df);
        showList(list);
    };



/**
 * Fetch data according to user input and renders the list
 * @param {DataSource} dataSource
 * @param {HTMLInputElement} userFacingInput
 * @param {HTMLUListElement} list
 * @param {String} emptyMessage
 * @param {Element} rootElement
 * @returns {function}
 */
const fetchList = (dataSource, userFacingInput, list, emptyMessage, rootElement) =>
    /**
     * @function
     * @param {DOMEvent} e
     * @return {undefined}
     */
    e => {
        e.stopPropagation();
        rootElement.classList.add('as24-autocomplete--active');
        removeInputError(rootElement);
        dataSource.fetchItems(userFacingInput.value).then(renderList(emptyMessage, list, userFacingInput, rootElement));
    };


/**
 *
 * @param {string} eventName
 * @param {HTMLInputElement} el
 */
const triggerChangeEvent = (eventName, el) => {
    const evt = document.createEvent('Event');
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
const selectItem = (valueInput, userFacingInput, li, rootElement, list) => {
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
const onItemMouseOver = list =>
    /**
     * @function
     * @param {DOMEvent} e
     * @return {undefined}
     */
    e => {
        e.stopPropagation();
        const preselected = $('.as24-autocomplete__list-item--preselected', list);
        if (e.target.tagName === 'LI') {
            if (preselected) {
                preselected.classList.remove('as24-autocomplete__list-item--preselected');
            }
            e.target.classList.add('as24-autocomplete__list-item--preselected');
        }
    };



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
const onKeyDown = (dataSource, valueInput, userFacingInput, list, emptyListMessage, rootElement) =>
    /**
     * @function
     * @param {DOMEvent} e
     * @return {undefined}
     */
    e => {
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
    };



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
const onKeyUp = (dataSource, valueInput, userFacingInput, list, emptyListMessage, rootElement) =>
    /**
     * @function
     * @param {DOMEvent} e
     * @return {*}
     */
    e => {
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
    };



/**
 * Reset the state of the component
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} userFacingInput
 * @param {HTMLElement} root
 */
const reset = (valueInput, userFacingInput, root) => {
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
const getInitialValueByKey = (dataSource, keyValue) =>
    dataSource.getSuggestionByKey(keyValue);


/**
 * Handles click on the component
 * @param {function} fetchListFn
 * @param {HTMLInputElement} userFacingInput
 * @param {HTMLInputElement} valueInput
 * @param {HTMLUListElement} list
 * @param {HTMLElement} rootElement
 */
const componentClicked = (fetchListFn, userFacingInput, valueInput, list, rootElement) => (e) => {
    const isInput = closestByClassName('as24-autocomplete__input')(e.target);
    const isIcon = closestByClassName('as24-autocomplete__icon-wrapper')(e.target);
    const isList = closestByClassName('as24-autocomplete__list')(e.target);
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
            const theItem = closestByClassName('as24-autocomplete__list-item')(e.target);
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
};



/**
 * When the custom tag has been attached to DOM
 * @this HTMLElement
 */
function elementAttached() {
    /**
     * The as24-autocomplete DOM element
     * @type {HTMLElement}
     */
    const root = this;

    /**
     * The message about no items has been found
     * @type {string}
     */
    const emptyListMessage = root.getAttribute('empty-list-message') || '---';

    /**
     * The input with which the user can interact
     * @type {HTMLInputElement}
     */
    const userFacingInput = $('[type=text]', root);

    /**
     * Hidden input in which we actually set the value
     * @type {HTMLInputElement}
     */
    const valueInput = $('[type=hidden]', root);

    /**
     * The UL-element that represents the suggestion list
     * @type {HTMLUListElement}
     */
    const list = $('.as24-autocomplete__list', root);

    /**
     * DataSource element
     * @type {DataSource}
     */
    const dataSource = this.querySelector('[role=data-source]');

    if (!dataSource) {
        throw new Error('The DataSource has not been found');
    }

    /**
     * The function that takes an Event and does call to DataSource
     * @type {Function}
     */
    const fetchListFn = fetchList(dataSource, userFacingInput, list, emptyListMessage, root);

    root.isDirty = false;

    setTimeout(() => {
        if (valueInput.value) {
            getInitialValueByKey(dataSource, valueInput.value)
                .then(suggestion => {
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
    const userFacingInput = $('[type=text]', this);

    /** @type {HTMLUListElement} */
    const list = $('.as24-autocomplete__list', this);

    if (attrName === 'disabled') {
        userFacingInput.disabled = newVal === 'true' || newVal === 'disabled';
        this.classList[userFacingInput.disabled ? 'add' : 'remove']('as24-autocomplete--disabled');
        hideList(list, this)();
    }
}

export default function registerInput() {
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
                    selectedValue() {
                        return $('[type=hidden]', this).value;
                    },
                    /**
                     * Returns what user has written
                     * @this {HTMLElement}
                     */
                    userQuery() {
                        return $('[type=text]', this).value;
                    },
                    /**
                     * returns the bounded data source element
                     * @this {HTMLElement}
                     */
                    dataSourceElement() {
                        return this.querySelector('[role=data-source]');
                    },
                    /**
                     * Resets the component
                     * @this {HTMLElement}
                     */
                    reset() {
                        /** @type {HTMLInputElement} */
                        const userFacingInput = $('[type=text]', this);

                        /** @type {HTMLInputElement} */
                        const valueInput = $('[type=hidden]', this);

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

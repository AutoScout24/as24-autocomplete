/**
 * Selects an element using the this element.
 * @param {string} selector Specifies the selector for lookup
 * @param {Element} this Specified within which element to perform the lookup
 * @return {Element}
 */
export const $ = (selector, root) =>
    root.querySelector(selector);


export const $$ = (selector, root) =>
    root.querySelectorAll(selector);


/**
 * Checks whether elem has tag as a parent
 * @param {HTMLElement} tag
 * @returns {function}
 */
export const closestByTag = tag =>
    /**
     * @param {HTMLElement} elem
     * @return {HTMLElement|null}
     */
    elem =>
        ! elem
            ? null
            : elem.tagName === 'HTML'
            ? null
            : elem === tag
                ? tag
                : closestByTag(tag)(elem.parentNode);



/**
 * Binds an event listener on the element
 * @param {string} event
 * @param {Function} cb
 * @param {Element|Window|Document} el
 * @param {boolean} capturing
 */
export const on = (event, cb, el, capturing = false) =>
    el.addEventListener(event, cb, capturing);



/**
 *
 * @param {string} eventName
 * @param {HTMLInputElement} el
 */
export const triggerEvent = (eventName, el) => {
    const evt = document.createEvent('Event');
    evt.initEvent(eventName, true, true);
    el.dispatchEvent(evt);
};



/**
 * Appends a child element to a target element
 * @param {HTMLElement|DocumentFragment} target
 * @returns {function}
 */
export const appendTo = target =>
    /**
     * @param {HTMLElement} child
     * @return {HTMLElement}
     */
    child => {
        target.appendChild(child);
        return target;
    };



/**
 * Finds a closest element by class name
 * @param {string} className
 * @returns {function}
 */
export const closestByClassName = className =>
    /**
     * @param {HTMLElement} elem
     * @return {HTMLElement|null}
     */
    elem =>
        elem.tagName === 'HTML'
            ? null
            : elem.classList.contains(className)
                ? elem
                : closestByClassName(className)(elem.parentNode);

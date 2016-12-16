/**
 * @class
 * @typedef Suggestion
 */
class Suggestion {
    /**
     * @property {string} key
     * @property {string} value
     */
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }

    toString() {
        return `Suggestion(${this.key}: ${this.value})`
    }
}

/**
 * Test the string against item's value
 * @param {string} queryString
 * @returns {function}
 */
const valuePredicate = queryString =>
    /**
     * @param {Suggestion} item
     */
    item =>
        item.value.match(new RegExp('^' + queryString, 'ig')) !== null;


/**
 * @class
 * @typedef DataSource
 */
class DataSource extends HTMLElement {
    constructor() {
        super();
    }

    /**
     * @param {string} queryString
     * @return {Promise.<Array<Suggestion>>}
     */
    fetchItems(queryString) {
        return new Promise(res => res(
            this.extractKeyValues().filter(valuePredicate(queryString))
        ));
    }

    /**
     * Extracts a list of objects like { key:string, value:string }
     * @returns {Array<{key:string, value:string}>}
     */
    extractKeyValues() {
        return Array.prototype.slice.call(this.querySelectorAll('item')).map(tag =>
            new Suggestion(tag.getAttribute('key'), tag.getAttribute('value'))
        );
    }
}



export default function() {
    try {
        return document.registerElement('as24-tags-data-source', DataSource);
    } catch(e) {
        return null;
    }
}

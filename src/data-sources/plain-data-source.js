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
        return `Suggestion(${this.key}: ${this.value})`;
    }
}

const trimString = (str) => str.split(String.fromCharCode(92)).join('') // remove all backslashes
        .split('&nbsp').join('')
        .trim();

/**
 * Test the string against item's value\
 * @param {RegExp} regexp
 * @returns {function}
 */
const matchValuePredicate = (regexp) =>
    /**
     * @param {Suggestion} item
     */
    item => trimString(item.value).match(regexp) !== null;

/**
 * @class
 * @typedef DataSource
 */
class PlainDataSource extends HTMLElement {
    /**
     * @param {string} queryString
     * @return {Promise.<Array<Suggestion>>}
     */
    fetchItems(queryString) {
        return new Promise(res => {
            const trimmedQueryString = trimString(queryString);
            const keyVals = this.extractKeyValues();

            const startPredicate = matchValuePredicate(new RegExp(`^${trimmedQueryString}`, 'ig'));
            const restPredicate = matchValuePredicate(new RegExp(`${trimmedQueryString}`, 'ig'));

            const startingWith = keyVals
                .filter(x => startPredicate(x));

            const theRestContaining = keyVals
                    .filter(x => startingWith.indexOf(x) === -1)
                    .filter(x => restPredicate(x));

            return res(startingWith.concat(theRestContaining));
        });
    }

    /**
     * @param {string} keyValue
     * @return {Promise.<Suggestion>}
     */
    getSuggestionByKey(keyValue) {
        return new Promise((res, rej) => {
            const items = this.extractKeyValues();
            if (keyValue && items) {
                return res(items.filter(item => item.key === keyValue)[0]);
            }
            return rej(null);
        });
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

export default function registerDS() {
    try {
        return document.registerElement('as24-plain-data-source', PlainDataSource);
    } catch (e) {
        return null;
    }
}

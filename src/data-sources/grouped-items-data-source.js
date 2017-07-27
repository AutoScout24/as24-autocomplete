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

class SuggestionsGroup {
    /**
     * @property {string} label
     * @property {string} items
     */
    constructor(label, items) {
        this.label = label;
        this.items = items;
    }

    toString() {
        return `SuggestionsGroup(${this.label}, ${this.items.length} items)`;
    }
}

/**
 * Test the string against item's value\
 * @param {RegExp} regexp
 * @param {string|undefined} key
 * @returns {function}
 */
const valuePredicate = (regexp, key) =>
    /**
     * @param {Suggestion} itemElem
     */
    sugg =>
        regexp !== null
            ? sugg.value.match(regexp) !== null
            : typeof key !== 'undefined'
                ? sugg.key === key
                : true;


/**
 * @class
 * @typedef GroupedItemsDataSource
 */
class GroupedItemsDataSource extends HTMLElement {
    /**
     * @param {string} queryString
     * @return {Promise.<Array<Suggestion>>}
     */
    fetchItems(queryString) {
        return new Promise(res => res(this.buildGroups(queryString)));
    }

    /**
     * @param {string} theKey
     * @return {Promise.<Suggestion>}
     */
    getSuggestionByKey(theKey) {
        return new Promise((res, rej) => {
            const item = Array.prototype.slice.call(this.querySelectorAll('item'))
                .map(i => new Suggestion(i.getAttribute('key'), i.getAttribute('value')))
                .filter(valuePredicate(null, theKey));
            if (item.length) {
                return res(item[0]);
            }
            return rej(null);
        });
    }

    /**
     * Extracts a list of objects like { key:string, value:string }
     * @param {HTMLElement} group
     * @param {string} queryString The query from the user
     * @param {string|undefined} theKey The key to look for
     * @returns {Array<{key:string, value:string}>}
     */
    buildItems(group, queryString, theKey) {
        const kvs = Array.prototype.slice.call(group.querySelectorAll('item')).map(tag =>
            new Suggestion(tag.getAttribute('key'), tag.getAttribute('value'))
        );

        const startingWith = kvs
            .filter(valuePredicate(new RegExp(`^${queryString}`, 'ig'), theKey));

        const theRestContaining = kvs
            .filter(x => startingWith.indexOf(x) === -1)
            .filter(valuePredicate(new RegExp(`${queryString}`, 'ig'), theKey));

        return startingWith.concat(theRestContaining);
    }

    buildGroups(queryString, theKey) {
        return Array.prototype.slice.call(this.querySelectorAll('group'))
            .reduce((res, group) => {
                const items = this.buildItems(group, queryString, theKey);
                return items.length
                    ? res.concat(new SuggestionsGroup(group.getAttribute('label'), items))
                    : res;
            }, []);
    }

    /**
     * Extracts a list of objects like { key:string, value:string }
     * @returns {Array<{key:string, value:string}>}
     */
    extractKeyValues() {
        return Array.prototype.slice.call(this.querySelectorAll('item')).map(tag =>
            new Suggestion(tag.getAttribute('key'), tag.getAttribute('value')));
    }
}

export default function registerDS() {
    try {
        return document.registerElement('as24-grouped-items-data-source', GroupedItemsDataSource);
    } catch (e) {
        return null;
    }
}

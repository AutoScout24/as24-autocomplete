import { $, on, triggerEvent, appendTo, closestByClassName } from '../helper';



/**
 * @class
 * @typedef PlainSuggestionsList
 */
class PlainSuggestionsList extends HTMLElement {

    show() {
        this.classList.add('as24-autocomplete__list--visible');
        triggerEvent('as24-autocomplete:suggestions-list:show', this);
    }

    hide() {
        this.classList.remove('as24-autocomplete__list--visible');
        triggerEvent('as24-autocomplete:suggestions-list:hide', this);
    }

    isEmpty() {
      return $('.as24-autocomplete__list-item--empty', this);
    }

    isVisible() {
        return this.classList.contains('as24-autocomplete__list--visible');
    }

    getSelectedSuggestionItem() {
        return $('.as24-autocomplete__list-item--selected', this);
    }

    scrollToSelectedItem(selected) {
        const listHeight = this.getBoundingClientRect().height;
        const selectedTop = selected.offsetTop;
        const selectedHeight = selected.offsetHeight;
        this.scrollTop = -1 * (listHeight - (selectedTop + selectedHeight));
    }

    moveSelection(dir) {
        const next = dir === 1 ? 'nextSibling' : 'previousSibling';
        const currActiveItem = this.getSelectedSuggestionItem(this);
        const nextActiveItem =
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
    }

    moveSelectionMultiple(dir, times) {
        Array(times).fill(1).forEach(_ => this.moveSelection(1));
    }

    onItemMouseOver(e) {
        e.stopPropagation();
        const preselected = $('.as24-autocomplete__list-item--preselected', this);
        if (e.target.tagName === 'LI') {
            if (preselected) {
                preselected.classList.remove('as24-autocomplete__list-item--preselected');
            }
            e.target.classList.add('as24-autocomplete__list-item--preselected');
        }
    }

    selectItem() {
        const li = this.getSelectedSuggestionItem();
        if (li && li.dataset.type && li.dataset.type === 'selectable') {
            triggerEvent('as24-autocomplete:suggestion:selected', li);
            this.hide();
        }
    }

    onClick(e) {
        const li = closestByClassName('as24-autocomplete__list-item')(e.target);
        if (li && li.dataset.type && li.dataset.type === 'selectable') {
            this.hide();
            triggerEvent('as24-autocomplete:suggestion:selected', li);
        }
    }

    renderItem(searchStr) {
        return function liRenderer(item) {
            const li = document.createElement('li');
            li.classList.add('as24-autocomplete__list-item');
            li.dataset.key = item.key;
            li.dataset.type = 'selectable';
            li.dataset.label = item.value;
            li.innerHTML = item.value.replace(new RegExp(`(${searchStr})`, 'ig'), '<strong>$1</strong>');
            return li;
        };
    }

    renderEmptyListItem(emptyMessage) {
        const li = document.createElement('li');
        ['as24-autocomplete__list-item', 'as24-autocomplete__list-item--empty'].forEach(li.classList.add.bind(li.classList));
        li.dataset.type = 'unselectable';
        li.dataset.key = '';
        li.innerText = emptyMessage;
        return li;
    }

    renderItems(userQuery, emptyMessage) {
        return function suggestionsRenderer(suggestions) {
            this.innerHTML = '';
            const df = document.createDocumentFragment();

            (suggestions.length
                ? suggestions.map(this.renderItem(userQuery))
                : [this.renderEmptyListItem(emptyMessage)]
            ).forEach(appendTo(df));

            appendTo(this)(df);
            this.show();
        }.bind(this);
    }

    attachedCallback() {
        on('mouseover', this.onItemMouseOver.bind(this), this);
        on('click', this.onClick.bind(this), this);
    }



}

export default function registerDS() {
    try {
        return document.registerElement('as24-plain-suggestions-list', PlainSuggestionsList);
    } catch (e) {
        return null;
    }
}

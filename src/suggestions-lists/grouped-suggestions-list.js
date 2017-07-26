import { $, $$, on, triggerEvent, appendTo, closestByClassName } from '../helper';



/**
 * @class
 * @typedef GroupedSuggestionsList
 */
class GroupedSuggestionsList extends HTMLElement {

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
        const currActiveItem = this.getSelectedSuggestionItem(this);
        const allItems = Array.prototype.slice.call($$('.as24-autocomplete__list-item', this))
            .filter(i => i.dataset.type === 'selectable');
        const currPos = currActiveItem === null ? -1 : allItems.indexOf(currActiveItem);
        const nextPos = currPos + dir > allItems.length - 1
            ? allItems.length - 1
            : currPos + dir < 0
                ? 0
                : currPos + dir;
        const nextActiveItem = allItems[nextPos];
        if (currActiveItem) {
            currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
        }
        if (nextActiveItem) {
            nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
            this.scrollToSelectedItem(nextActiveItem);
        }
    }

    onItemMouseOver(e) {
        e.stopPropagation();
        const selected = $('.as24-autocomplete__list-item--selected', this);
        if (e.target.tagName === 'LI') {
            if (selected) {
                selected.classList.remove('as24-autocomplete__list-item--selected');
            }
            e.target.classList.add('as24-autocomplete__list-item--selected');
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

    renderItem(userQuery) {
        return function liRenderer(item) {
            const li = document.createElement('li');
            li.classList.add('as24-autocomplete__list-item');
            li.dataset.key = item.key;
            li.dataset.type = 'selectable';
            li.dataset.label = item.value;
            li.innerHTML = item.value.replace(new RegExp(`(${userQuery})`, 'ig'), '<strong>$1</strong>');
            return li;
        };
    }

    renderSeparator(group) {
        const div = document.createElement('div');
        div.classList.add('as24-autocomplete__list-item');
        div.classList.add('as24-autocomplete__separator');
        div.dataset.type = 'unselectable';
        div.innerHTML = group.label;
        return div;
    }

    renderGroup(userQuery) {
        return function groupRenderer(group) {
            const df = document.createDocumentFragment();
            if (userQuery.length === 0) {
              df.appendChild(this.renderSeparator(group));
            }
            group.items
                .map(this.renderItem(userQuery))
                .forEach(appendTo(df));
            return df;
        };
    }

    renderEmptyListItem(emptyMessage) {
        const li = document.createElement('li');
        ['as24-autocomplete__list-item', 'as24-autocomplete__list-item--empty'].forEach(li.classList.add.bind(li.classList));
        li.dataset.type = 'unselectable';
        li.innerText = emptyMessage;
        return li;
    }

    renderItems(userQuery, emptyMessage) {
        return function suggestionsRenderer(suggestions) {
            this.innerHTML = '';
            const df = document.createDocumentFragment();

            (suggestions.length
                ? suggestions.map(this.renderGroup(userQuery).bind(this))
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
        return document.registerElement('as24-grouped-suggestions-list', GroupedSuggestionsList);
    } catch (e) {
        return null;
    }
}

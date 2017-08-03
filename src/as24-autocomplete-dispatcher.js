import { $, closestByTag, on, triggerEvent } from './helper';


class AutocompleteInput extends HTMLElement {

    selectedValue() {
        return this.valueInput.value;
    }

    userQuery() {
        return this.userFacingInput.getValue();
    }

    userFacingInputElement() {
        return this.userFacingInput;
    }

    dataSourceElement() {
        return this.dataSource;
    }

    valueInputElement() {
        return this.valueInput;
    }

    userQueryElement() {
        return this.userQueryEl;
    }

    reset() {
        this.userFacingInput.setValue('');
        this.valueInput.value = '';
        this.list.hide();
        this.isDirty = false;
        this.classList.remove('as24-autocomplete--active');
        this.classList.remove('as24-autocomplete--user-input');
    }

    fetchList(userQuery) {
        return this.dataSource.fetchItems(userQuery)
            .then(this.userFacingInput.renderInput())
            .then(this.list.renderItems(userQuery, this.emptyListMessage));
    }

    getInitialValueByKey() {
        return this.dataSource.getSuggestionByKey(this.valueInput.value);
    }

    setValue(value) {
        this.setKeyLabelPair(value, value);
    }

    setKeyLabelPair(key, label) {
        this.valueInput.value = key;
        this.userFacingInput.setValue(label);
        this.userFacingInput.isOpened = false;
        this.list.hide();
        this.classList.remove('as24-autocomplete--active');
        this.classList.add('as24-autocomplete--user-input');
        triggerEvent('change', this);
    }

    showList() {
        this.userQueryEl.placeholder = ""; // remove placeholder to avoid flickering
        this.list.show();
    }

    restorePlaceholder() {
        console.log('restorePlaceholder');
        this.userQueryEl.placeholder = this.placeholder; // restore placeholder
    }

    attachedCallback() {
        this.emptyListMessage = this.getAttribute('empty-list-message') || '---';

        this.userFacingInput = $('as24-autocomplete-input', this);

        this.userQueryEl = $('[data-role="user-query"]', this);

        this.valueInput = $('input[data-role="value"]', this);

        this.list = $('[data-role="list"]', this);

        this.dataSource = this.querySelector('[role=data-source]');

        this.placeholder = this.userQueryEl.placeholder;

        if (! this.dataSource) {
            throw new Error('The DataSource has not been found');
        }

        this.isDirty = false;

        if ('autocomplete' in this.userQueryEl) {
            this.userQueryEl.autocomplete = 'off'; // make sure dropdown is not hidden by browsers autocompletion feature, unfortunately not in every browser
        }

        setTimeout(() => {
            if (this.valueInput.value) {
                this.getInitialValueByKey()
                    .then(suggestion => {
                        if (suggestion) {
                            this.userFacingInput.setValue(suggestion.value);
                            this.classList.add('as24-autocomplete--user-input');
                            this.isDirty = true;
                        }
                        return true;
                    });
            }
        });

        on('mouseleave', () => {
            console.log('mouseleave');
            if (this.list.isVisible()) {
                console.log('list.isVisible');
                this.restorePlaceholder();
            }
        }, this);

        on('as24-autocomplete:suggestion:selected', (e) => {
            console.log('as24-autocomplete:suggestion:selected');
            e.stopPropagation();
            this.setKeyLabelPair(e.target.dataset.key, e.target.dataset.label)
        }, this);

        on('as24-autocomplete:input:restore-placeholder', (e) => {
            console.log('as24-autocomplete:input:restore-placeholder');
            e.stopPropagation();
            this.restorePlaceholder()
        }, this);

        on('as24-autocomplete:input:trigger-suggestions', (e) => {
            console.log('as24-autocomplete:input:trigger-suggestions');
            e.stopPropagation();

            if (! this.list.isVisible()) {
                this.showList();
            }

            const selectedValue = this.selectedValue();
            this.classList.add('as24-autocomplete--active');

            this.fetchList(selectedValue ? '' : this.userFacingInput.getValue())
                .then(() => selectedValue ? this.dataSourceElement().extractKeyValues().findIndex(i => i.key === selectedValue) + 1 : 0)
                .then(indexToSelect => this.list.moveSelectionMultiple(1, indexToSelect));
        }, this);

        on('as24-autocomplete:input:focus-lost', (e) => {
            console.log('as24-autocomplete:input:focus-lost');
            e.stopPropagation();
            if (this.userFacingInput.getValue() !== '' && ! this.list.isEmpty()) {
                this.list.selectItem();
            } else {
                this.list.hide();
                this.classList.remove('as24-autocomplete--active');
            }
        }, this);

        on('as24-autocomplete:input:close-list', (e) => {
            console.log('as24-autocomplete:input:close-list');
            e.stopPropagation();
            this.list.hide();
            this.userFacingInput.isOpened = false;
            this.classList.remove('as24-autocomplete--active');
        }, this);

        on('as24-autocomplete:input:enter', (e) => {
            console.log('as24-autocomplete:input:enter');
            e.stopPropagation();
            if (this.list.isVisible()) {
                this.list.selectItem();
                this.list.hide();
                this.classList.remove('as24-autocomplete--active');
            } else {
                this.fetchList(this.userFacingInput.getValue())
                    .then(() => this.list.moveSelection(1));
                this.classList.add('as24-autocomplete--active');
            }
        }, this);

        on('as24-autocomplete:input:query', (e) => {
            console.log('as24-autocomplete:input:query');
            e.stopPropagation();
            if (this.userFacingInput.getValue() !== '') {
                this.classList.add('as24-autocomplete--user-input');
                this.classList.add('as24-autocomplete--active');
            } else {
                this.classList.remove('as24-autocomplete--user-input');
            }
            this.fetchList(this.userFacingInput.getValue()).then(() => {
                this.list.moveSelection(1);
                if (this.valueInput.value.length > 0 && (this.userFacingInput.getValue() === '' || this.list.isEmpty())) {
                    this.valueInput.value = '';
                    triggerEvent('change', this);
                }
            });
        }, this);

        on('as24-autocomplete:input:cleanup', (e) => {
            console.log('as24-autocomplete:input:cleanup');
            e.stopPropagation();
            this.classList.remove('as24-autocomplete--user-input');
            this.classList.add('as24-autocomplete--active');
            this.valueInput.value = '';
            this.fetchList('').then(() => this.list.moveSelection(1));
            triggerEvent('change', this);
        }, this);

        on('as24-autocomplete:input:close', (e) => {
            console.log('as24-autocomplete:input:close');
            e.stopPropagation();
            this.classList.remove('as24-autocomplete--user-input');
            this.classList.remove('as24-autocomplete--active');
            this.list.hide();
        }, this);

        on('as24-autocomplete:input:go-down', (e) => {
            console.log('as24-autocomplete:input:go-down');
            e.stopPropagation();
            if (this.userFacingInput.getValue() !== '') {
                this.classList.add('as24-autocomplete--active');
            }
            if (this.list.isVisible()) {
                this.list.moveSelection(1);
            } else {
                this.fetchList(this.userFacingInput.getValue())
                    .then(() => this.list.moveSelection(1));
            }
        }, this);

        on('as24-autocomplete:input:go-up', (e) => {
            console.log('as24-autocomplete:input:go-up');
            e.stopPropagation();
            if (this.list.isVisible()) {
                this.list.moveSelection(- 1);
            }
        }, this);

        on('click', (e) => {
            if (! document.querySelector('.as24-autocomplete--active') || closestByTag(this)(e.target) === this) {
                return;
            }
            if (this.list.isVisible()) {
                console.log('click');
                if (this.userFacingInput.getValue() !== '' && ! this.list.isEmpty()) {
                    this.list.selectItem();
                }
                this.list.hide();
                this.userFacingInput.isOpened = false;
                this.classList.remove('as24-autocomplete--active');
            }
        }, document);
    }

    onAttributeChanged(attrName, oldVal, newVal) {
        if (attrName === 'disabled') {
            this.userFacingInput.setDisabled((oldVal !== newVal) && (newVal === 'true' || newVal === 'disabled'));
            this.classList[
                this.userFacingInput.isDisabled() ? 'add' : 'remove'
                ]('as24-autocomplete--disabled');
            this.list.hide();
        }
    }
}


export default function register() {
    try {
        return document.registerElement('as24-autocomplete', AutocompleteInput);
    } catch (e) {
        return null;
    }
}

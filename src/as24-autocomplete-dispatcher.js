import { $, on, closestByTag, triggerEvent } from './helper';



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

    attachedCallback() {
        this.emptyListMessage = this.getAttribute('empty-list-message') || '---';

        this.userFacingInput = $('as24-autocomplete-input', this);

        this.valueInput = $('input[data-role="value"]', this);

        this.list = $('[data-role="list"]', this);

        this.dataSource = this.querySelector('[role=data-source]');

        if (!this.dataSource) {
            throw new Error('The DataSource has not been found');
        }

        this.isDirty = false;

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

        on('as24-autocomplete:suggestion:selected', (e) => {
            e.stopPropagation();
            this.setKeyLabelPair(e.target.dataset.key, e.target.dataset.label)
        }, this);

        on('as24-autocomplete:input:trigger-suggestions', (e) => {
            e.stopPropagation();
            if (!this.list.isVisible()) {
                this.list.show();
            }
            this.classList.add('as24-autocomplete--active');
            this.fetchList(this.userFacingInput.getValue()).then(() => this.list.moveSelection(1));
        }, this);

        on('as24-autocomplete:input:focus-lost', (e) => {
            e.stopPropagation();
            if (this.userFacingInput.getValue() !== '' && !this.list.isEmpty()) {
              this.list.selectItem();
            } else  {
              this.list.hide();
              this.classList.remove('as24-autocomplete--active');
            }
        }, this);

        on('as24-autocomplete:input:enter', (e) => {
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
            e.stopPropagation();
            this.classList.remove('as24-autocomplete--user-input');
            this.classList.add('as24-autocomplete--active');
            this.valueInput.value = '';
            this.fetchList('').then(() => this.list.moveSelection(1));
            triggerEvent('change', this);
        }, this);

        on('as24-autocomplete:input:close', (e) => {
            e.stopPropagation();
            this.classList.remove('as24-autocomplete--user-input');
            this.classList.remove('as24-autocomplete--active');
            this.list.hide();
        }, this);

        on('as24-autocomplete:input:go-down', (e) => {
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
            e.stopPropagation();
            if (this.list.isVisible()) {
                this.list.moveSelection(-1);
            }
        }, this);

        on('click', (e) => {
            if(!document.querySelector('.as24-autocomplete--active') || closestByTag(this)(e.target) === this){
                return;
            }
            if (this.list.isVisible()) {
                if (this.userFacingInput.getValue() !== '' && !this.list.isEmpty()) {
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

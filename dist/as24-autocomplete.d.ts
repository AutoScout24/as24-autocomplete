export module Autocomplete {
    export class AutocompleteInput extends HTMLElement {
        setValue(value: string): void;

        setKeyLabelPair(key: string, value: string): void;
    }
}

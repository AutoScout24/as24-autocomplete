export module Autocomplete {
    export class AutocompleteInput extends HTMLElement {
        selectedValue(): string;

        userQuery(): string;

        userFacingInputElement(): Element;

        dataSourceElement(): Element;

        valueInputElement(): Element;

        reset(): void;

        getInitialValueByKey(): string;

        setValue(value: string): void;

        setKeyLabelPair(key: string, value: string): void;
    }
}

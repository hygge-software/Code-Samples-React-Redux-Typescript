# Component Information

Autocomplete component is a wrapper for the ChipInput component which provides
ability to select options from the provided list. It has the same props as the
`Input` component and it's own props.

> Don't use more than 500 option items in this component. It slows it down
> considerably.

## Autocomplete props

- placeholder? : string;
- options?: ItemsObject[];
- allowNew?: boolean; (Allow to create new items)
- name?: string;
- value?: ItemsObject[];
- onChange?: (items: ItemsObject[]) => void;
- charLimit?: number; (Start search after the spesific value.)
- optionLimit?: number; (Limit options to this value.)
- handleChipChange?: (value: string) => void; (Called when ChipInput value
  changes.)
- hasAddItem?: boolean; (Enables the 'Add' dropdown item.)
- hasExtraItem?: boolean; (Enables the 'Nothing found' dropdown item.)

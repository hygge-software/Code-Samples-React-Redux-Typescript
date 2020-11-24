import classNames from 'classnames';
import React, {forwardRef, useCallback, KeyboardEvent, MouseEvent, useState, useMemo, useEffect, useRef} from 'react';

import ChipInput, {ItemsObject} from '../ChipInput';
import {HasLabelWrapper} from '../LabelWrapper';
import {IconChildren} from '../Icon';
import {InputProps} from '../Input';

type AutocompleteInputProps = Omit<InputProps, 'value' | 'onChange'>;

export interface AutocompleteProps extends AutocompleteInputProps, HasLabelWrapper {
  /**
   * Items
   * @default []
   */
  options?: ItemsObject[];
  /**
   * Allow to create new items.
   * @default false
   */
  allowNew?: boolean;
  /**
   * Input value to be saved into the items array.
   */
  value?: ItemsObject[];
  /**
   * Called when input value changes.
   */
  onChange?: (items: ItemsObject[]) => void;
  /**
   * Start search after the specific value.
   */
  charLimit?: number;
  /**
   * Limit options to this value.
   */
  optionLimit?: number;
  /**
   * Called when ChipInput value changes.
   */
  handleChipChange?: (value: string) => void;
  /**
   * Enables the 'Add' dropdown item.
   */
  hasAddItem?: boolean;
  /**
   * Enables the 'Nothing found' dropdown item.
   */
  hasExtraItem?: boolean;
}

export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      placeholder = '',
      options = [],
      allowNew = false,
      name,
      value,
      onChange,
      charLimit,
      optionLimit,
      handleChipChange,
      hasExtraItem,
      hasAddItem,
      ...otherProps
    },
    ref,
  ) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const [items, setItems] = useState<ItemsObject[]>([]);
    const [inputValue, setInputValue] = useState<string>('');
    const [addItem, setAddItem] = useState<boolean>(true);
    const [isDisplayDropdown, setDisplayDropdown] = useState<boolean>(false);
    const [dropdownIcon, setDropdownIcon] = useState<IconChildren>('arrow_drop_down');

    const [arrowUp, arrowDown] = [38, 40];
    const listHeight = (dropdownRef.current && dropdownRef.current.clientHeight) || 250;
    const _itemHeight = Number(btnRef.current && btnRef.current.clientHeight); // item height

    const [selectedListItem, setSelectedListItem] = useState<{
      links: ItemsObject[] | null;
      itemIndex: number;
      previousSelectedIndex: number;
    }>({
      links: null,
      itemIndex: -1,
      previousSelectedIndex: -1,
    });
    const divRef = useRef<HTMLDivElement>(null);

    const isControlled = onChange !== undefined && value !== undefined;
    const chips = isControlled ? value || [] : items;
    const currentListItem = selectedListItem.itemIndex;

    //Creates the dropdown list
    const dropdownList = useMemo(() => {
      if (!charLimit || inputValue.length > charLimit) {
        return options
          .filter((item) => item.label.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1)
          .filter((item) => !chips.find((_item) => _item.label === item.label));
      }
      return null;
    }, [options, inputValue, chips, charLimit]);

    //Checks if the input has mulitple input values. This happens if you copy info in. For example email@domain.com,email1@domain.com
    const handleMultipleInputValues = useCallback((values: Array<string>, newItems: ItemsObject[]) => {
      values.forEach((value) => {
        return newItems.push({label: value.trim(), value: value.trim()});
      });
    }, []);

    //Handles multiple inputs seperated by a comma or space
    const handlesMultipleInputValues = useCallback(
      (inputText: string) => {
        let multipleInputValues: Array<string> = [];
        const newItemsArray: ItemsObject[] = [];

        if (inputText.indexOf(',') != -1) {
          multipleInputValues = inputText.split(',');
          handleMultipleInputValues(multipleInputValues, newItemsArray);
        } else if (inputText.indexOf(' ') != -1) {
          multipleInputValues = inputText.split(' ');
          handleMultipleInputValues(multipleInputValues, newItemsArray);
        }

        return newItemsArray;
      },
      [handleMultipleInputValues],
    );

    //Adds item to the chips array
    const addElement = useCallback(
      (newItem: ItemsObject) => {
        const newItemsArray: ItemsObject[] = handlesMultipleInputValues(newItem.label);
        let newItems: ItemsObject[] = [];

        if (chips.find((chip) => chip.value === newItem.value)) return;

        if (newItemsArray.length > 0) {
          newItems = [...chips, ...newItemsArray];
        } else {
          newItems = [...chips, newItem];
        }

        if (isControlled) {
          onChange?.(newItems);
        } else {
          setItems(newItems);
        }
        setInputValue('');
      },
      [chips, isControlled, onChange, handlesMultipleInputValues],
    );

    //Handles the Add 'value'
    const handleAddClick = useCallback(
      (value: string | undefined) => (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (selectedListItem.links === [] && selectedListItem.previousSelectedIndex !== -1) {
          addElement(selectedListItem.links[selectedListItem.previousSelectedIndex]);
          setSelectedListItem({
            links: dropdownList,
            itemIndex: -1,
            previousSelectedIndex: -1,
          });
        } else if (value && allowNew) {
          addElement({label: value, value: value});
        }
      },
      [addElement, allowNew, dropdownList, selectedListItem],
    );

    //Finds duplicates to enable the Add ''
    const findDuplicateItem = (list: ItemsObject[]) => {
      return list?.find((item) => item.label.toLowerCase() === inputValue.toLowerCase());
    };

    useEffect(() => {
      setSelectedListItem((previousValues) => ({
        links: dropdownList,
        itemIndex: -1,
        previousSelectedIndex: previousValues.previousSelectedIndex,
      }));

      const dropdownItem = dropdownList && findDuplicateItem(dropdownList);
      const chipItem = chips && findDuplicateItem(chips);

      setAddItem(!(dropdownItem || chipItem));

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dropdownList, isDisplayDropdown, inputValue, chips]);

    useEffect(() => {
      const onKeyDown = (event: {key: string}) => {
        if (event.key === 'ArrowUp') {
          setSelectedListItem(({links, itemIndex}) => {
            const newIndex = itemIndex > 0 ? itemIndex - 1 : itemIndex;
            return {links, itemIndex: newIndex, previousSelectedIndex: newIndex};
          });
        }
        if (event.key === 'ArrowDown') {
          setSelectedListItem(({links, itemIndex}) => {
            const length = links ? links.length : 0;
            const newIndex = itemIndex < length - 1 ? itemIndex + 1 : itemIndex;
            return {links, itemIndex: newIndex, previousSelectedIndex: newIndex};
          });
        }
      };
      divRef.current?.addEventListener('keydown', onKeyDown);
      return function () {
        divRef?.current?.removeEventListener('keydown', onKeyDown);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //Handles keydown
    const chipKeyDown = useCallback(
      (event) => {
        const itemsPerPage = Math.trunc(listHeight / _itemHeight);

        if (event.keyCode === arrowUp) {
          dropdownRef.current &&
            dropdownRef.current.scrollTo({
              left: 0,
              top: (currentListItem - 1) * _itemHeight,
              behavior: 'smooth',
            });
        }

        if (
          event.keyCode === arrowDown &&
          currentListItem * _itemHeight + _itemHeight > listHeight &&
          currentListItem % itemsPerPage === 0
        ) {
          dropdownRef.current &&
            dropdownRef.current.scrollTo({
              left: 0,
              top: currentListItem * _itemHeight,
              behavior: 'smooth',
            });
        }

        if (!['Enter', 'Tab', ',', ' '].includes(event.key)) return;
        event.preventDefault();

        let newItem;
        let newItemsArray: ItemsObject[] = [];
        let newItems: ItemsObject[] = [];

        if (dropdownList && selectedListItem.itemIndex !== -1) {
          newItem = dropdownList[selectedListItem.itemIndex];
          newItems = [...chips, newItem];
        } else {
          const inputText: string = inputValue.trim();

          newItemsArray = handlesMultipleInputValues(inputText);

          if (!allowNew || !inputText) return;

          //Checks if the chip already exists
          if (chips.find((chip) => chip.value === inputText)) {
            setInputValue('');
            return;
          }

          //Pushes the new inputValue or values as chips
          if (newItemsArray.length > 0) {
            newItems = [...chips, ...newItemsArray];
          } else {
            newItem = {label: inputText, value: inputText};
            newItems = [...chips, newItem];
          }
        }

        if (isControlled) {
          onChange?.(newItems);
        } else {
          setItems(newItems);
        }
        setInputValue('');
      },
      [
        listHeight,
        _itemHeight,
        arrowUp,
        arrowDown,
        currentListItem,
        dropdownList,
        selectedListItem.itemIndex,
        isControlled,
        chips,
        inputValue,
        handlesMultipleInputValues,
        allowNew,
        onChange,
      ],
    );

    const handleMouseMove = useCallback((index: number) => {
      setSelectedListItem(({links, itemIndex}) => {
        const length = links ? links.length : 0;
        const newIndex = itemIndex < length - 1 ? itemIndex + 1 : itemIndex;
        return {links, itemIndex: index, previousSelectedIndex: newIndex};
      });
    }, []);

    //Handles deleting a chip
    const chipDelete = useCallback(
      (label) => {
        if (isControlled) {
          const newItems = chips.filter(({value}) => value != label);
          onChange?.(newItems);
        } else {
          setItems((prevItems) => prevItems.filter(({value}) => value != label));
        }
      },
      [chips, isControlled, onChange],
    );

    //Hanles chip change
    const chipChange = useCallback(
      (event) => {
        handleChipChange?.(event.target.value);
        setInputValue(event.target.value);
        setDisplayDropdown(true);
      },
      [handleChipChange],
    );

    //Handles chip focus
    const chipFocus = useCallback(() => {
      setDisplayDropdown(true);
      setDropdownIcon('arrow_drop_up');
    }, []);

    //Handles chip blur
    const chipBlur = useCallback(() => {
      setInputValue('');
      setDisplayDropdown(false);
      setDropdownIcon('arrow_drop_down');
    }, []);

    //Handles drop down button
    const handleDropDownButton = () => {
      if (!isDisplayDropdown) {
        setDisplayDropdown(true);
        setDropdownIcon('arrow_drop_up');
      } else {
        setDisplayDropdown(false);
        setDropdownIcon('arrow_drop_down');
      }
    };

    //Handles item click
    const handleClick = useCallback(
      (newItem: ItemsObject) => (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        newItem && addElement(newItem);
      },
      [addElement],
    );

    const handleItemKeyDown = useCallback(
      (newItem: ItemsObject) => (event: KeyboardEvent<HTMLButtonElement>) => {
        if (['Enter', 'Tab', ',', ' '].includes(event.key)) {
          addElement(newItem);
          event.preventDefault();
        }
      },
      [addElement],
    );

    const handleClearButtonClick = useCallback(
      (itemValue: string | undefined) => (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (itemValue) {
          setInputValue('');
        }
      },
      [setInputValue],
    );

    const dropdownListItems = dropdownList ? (optionLimit ? dropdownList.slice(0, optionLimit) : dropdownList) : null;

    //Renders dropdownlist
    const renderedList = useMemo(() => {
      return isDisplayDropdown ? (
        <div ref={dropdownRef} className={classNames('ui__autocomplete__listbox')}>
          {dropdownListItems && (
            <>
              {dropdownListItems.map((item, index) => (
                <button
                  ref={btnRef}
                  tabIndex={index}
                  key={item.label}
                  onClick={handleClick(item)}
                  onMouseDown={(event: MouseEvent<HTMLButtonElement>) => event.preventDefault()}
                  onMouseMove={() => handleMouseMove(index)}
                  onKeyDown={handleItemKeyDown(item)}
                  data-selected={index === currentListItem}
                >
                  {item.value}
                </button>
              ))}

              {hasAddItem && addItem && inputValue.length > 0 && (
                <button
                  onClick={handleAddClick(inputValue)}
                  onMouseDown={(event: MouseEvent<HTMLButtonElement>) => event.preventDefault()}
                >
                  Add &quot;{inputValue}&quot;
                </button>
              )}

              {hasExtraItem && dropdownListItems.length === 0 && (
                <div className="ui__comboBox__listbox__text">Nothing found</div>
              )}
            </>
          )}
        </div>
      ) : null;
    }, [
      isDisplayDropdown,
      dropdownListItems,
      hasAddItem,
      addItem,
      inputValue,
      handleAddClick,
      hasExtraItem,
      handleClick,
      handleItemKeyDown,
      currentListItem,
      handleMouseMove,
    ]);

    return (
      <div ref={divRef} className={classNames('ui__autocomplete')}>
        <ChipInput
          ref={ref}
          name={name}
          placeholder={placeholder}
          items={chips}
          value={inputValue}
          onKeyDown={chipKeyDown}
          onDelete={chipDelete}
          onChange={chipChange}
          onBlur={chipBlur}
          onFocus={chipFocus}
          onClearClick={handleClearButtonClick}
          onDropdownClick={handleDropDownButton}
          dropdownIcon={dropdownIcon}
          afterInput={renderedList}
          onAddClick={handleAddClick}
          {...otherProps}
        />
      </div>
    );
  },
);

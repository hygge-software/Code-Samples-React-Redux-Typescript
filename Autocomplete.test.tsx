import {shallow, mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import Autocomplete from '../Autocomplete';
import ChipInput, {ItemsObject} from '../ChipInput';

const options = [
  {
    label: 'option1',
    value: 'option1',
  },
  {
    label: 'option2',
    value: 'option2',
  },
];

describe('Autocomplete component', () => {
  it('renders its contents', () => {
    const autocomplete = shallow(<Autocomplete options={options} />);
    expect(autocomplete.find('.ui__autocomplete').length).toEqual(1);
  });

  it('renders options', () => {
    const autocomplete = mount(<Autocomplete options={options} />);
    expect(autocomplete.props().options).toEqual(options);
  });

  it('check if it contains ChipInput', () => {
    const autocomplete = shallow(<Autocomplete options={options} />);
    expect(autocomplete.find(ChipInput).length).toEqual(1);
  });

  it('passes selected props straight into ChipInput', () => {
    const config = {
      options,
      name: 'autocomplete_name',
      placeholder: 'placeholder text',
    };
    const autocomplete = mount(<Autocomplete {...config} />);
    const chipinput = autocomplete.find(ChipInput);
    expect(chipinput.props().name).toEqual(config.name);
    expect(chipinput.props().placeholder).toEqual(config.placeholder);
  });

  it('sets the initial value correctly', () => {
    const onChange = jest.fn();
    const items: ItemsObject[] = [
      {label: 'chiptext1', value: 'chiptext1'},
      {label: 'chiptext2', value: 'chiptext2'},
    ];

    const autocomplete = mount(<Autocomplete value={items} options={options} onChange={onChange} />);
    const chipinput = autocomplete.find(ChipInput);
    expect(chipinput.props().items).toEqual(items);
  });

  it.each([
    ['allow adding of items', true],
    ['disallow adding of items', false],
  ])('handle addItem functionality if we %s', (testName, allowAddItem) => {
    const autocomplete = mount(<Autocomplete allowNew={allowAddItem} options={options} />);

    const items: ItemsObject[] = [
      {label: 'chiptext1', value: 'chiptext1'},
      {label: 'chiptext2', value: 'chiptext2'},
    ];

    // Try to enter in these items.
    const input = autocomplete.find('.ui__input__field');
    input.simulate('focus');
    items.forEach((item) => {
      input.simulate('change', {target: {value: item.label}});
      input.simulate('keydown', {key: 'Enter'});
    });

    // Depending on value of allowNew prop, the items should either get added or not.
    const chipinput = autocomplete.find(ChipInput);
    if (allowAddItem) {
      expect(chipinput.props().items).toEqual(items);
    } else {
      expect(chipinput.props().items?.length).toEqual(0);
    }
  });

  it('calls onChange after adding items', () => {
    const onChange = jest.fn();
    const autocomplete = mount(
      <Autocomplete
        value={[{label: 'value1', value: 'value1'}]}
        onChange={onChange}
        options={options}
        allowNew={true}
        hasAddItem={true}
      />,
    );

    // Enter in a value.
    const input = autocomplete.find('.ui__input__field');
    input.simulate('focus');
    input.simulate('change', {target: {value: 'helloworld'}});
    input.simulate('keydown', {key: 'Enter'});

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('adds item after user clicks Add New button', () => {
    const autocomplete = mount(<Autocomplete hasAddItem={true} allowNew={true} options={options} />);
    const input = autocomplete.find('.ui__input__field');
    input.simulate('focus');
    input.simulate('change', {target: {value: 'newitem'}});

    const button = autocomplete.find('.ui__autocomplete__listbox button');
    button.simulate('click');

    const chipinput = autocomplete.find(ChipInput);
    expect(chipinput.props().items).toEqual([{value: 'newitem', label: 'newitem'}]);
  });

  it.each([
    ['comma', ','],
    ['space', ' '],
  ])('adds multiple values if user inputs a %s-delimited string', (delimiterName, delimiterCharacter) => {
    const autocomplete = mount(<Autocomplete options={options} hasAddItem={true} allowNew={true} />);

    // Create one long string of values delimited by a certain character.
    const multipleValues = ['option1', 'option3', 'option5'].join(delimiterCharacter);
    const input = autocomplete.find('.ui__input__field');
    input.simulate('focus');
    input.simulate('change', {target: {value: multipleValues}});
    input.simulate('keydown', {key: 'Enter'});
    const chipinput = autocomplete.find(ChipInput);

    // That string should be broken up into 3 separate items.
    expect(chipinput.props().items?.length).toEqual(3);
  });

  it.each(['keydown', 'click'])(
    'adds item by doing a %s on one of the chips inside the dropdown list',
    (interactionType) => {
      const autocomplete = mount(<Autocomplete options={options} />);
      const input = autocomplete.find('.ui__input__field');
      input.simulate('focus');
      input.simulate('change', {target: {value: 'option'}});

      // For each of the options in the dropdown, focus on it and then press Enter.
      const chips = autocomplete.find('.ui__autocomplete__listbox button');
      chips.forEach((chip) => {
        chip.simulate('focus');

        if (interactionType === 'keydown') {
          chip.simulate('keydown', {key: 'Enter'});
        } else {
          chip.simulate('click');
        }
      });

      // We expect the options to get added to the ChipInput's list of items.
      const chipinput = autocomplete.find(ChipInput);
      expect(chipinput.props().items?.length).toEqual(2);
    },
  );

  it('does not allow duplicate items to be added', () => {
    const autocomplete = mount(<Autocomplete options={options} allowNew={true} />);
    const input = autocomplete.find('.ui__input__field');
    input.simulate('focus');

    // Try to add a bunch of chip items including duplicate entries.
    ['chip1', 'chip2', 'chip2', 'chip3', 'chip3', 'chip3'].forEach((chipText) => {
      input.simulate('change', {target: {value: chipText}});
      input.simulate('keydown', {key: 'Enter'});
    });
    const chipinput = autocomplete.find(ChipInput);
    expect(chipinput.props().items?.length).toEqual(3);
  });

  it('begins search after charLimit number of characters', () => {
    const options = [
      {label: 'abcd', value: 'abcd'},
      {label: 'abcde', value: 'abcde'},
      {label: 'abcdef', value: 'abcdef'},
    ];
    const autocomplete = mount(<Autocomplete options={options} charLimit={3} />);
    const input = autocomplete.find('.ui__input__field');

    // Dropdown should not have any options yet, as we haven't gone over charLimit yet
    input.simulate('focus');
    input.simulate('change', {target: {value: 'abc'}});
    expect(autocomplete.find('.ui__autocomplete__listbox button').length).toBe(0);

    // Dropdown should now be opened; we have exceeded charLimit
    input.simulate('focus');
    input.simulate('change', {target: {value: 'abcd'}});
    expect(autocomplete.find('.ui__autocomplete__listbox button').length).toBeGreaterThanOrEqual(1);
  });

  it('only shows optionLimit number of options in the dropdown', async () => {
    const options = [
      {label: 'abcd', value: 'abcd'},
      {label: 'abcde', value: 'abcde'},
      {label: 'abcdef', value: 'abcdef'},
      {label: 'abcdefg', value: 'abcdefg'},
      {label: 'abcdefgh', value: 'abcdefgh'},
    ];
    const autocomplete = mount(<Autocomplete options={options} optionLimit={3} />);

    const input = autocomplete.find('.ui__input__field');
    input.simulate('focus');
    input.simulate('change', {target: {value: 'abcdef'}});

    expect(autocomplete.find('.ui__autocomplete__listbox button').length).toEqual(3);
  });

  it('calls handleChipChange() when chipinput value changes', () => {
    const handleChipChange = jest.fn();
    const autocomplete = mount(<Autocomplete handleChipChange={handleChipChange} options={options} />);
    const input = autocomplete.find('.ui__input__field');
    input.simulate('focus');
    input.simulate('change', {target: {value: 'option'}});

    // Should have gotten called as soon as you enter something new into the input field.
    expect(handleChipChange).toHaveBeenCalled();
  });

  it('shows the "nothing found" dropdown item', () => {
    const autocomplete = mount(<Autocomplete options={options} hasExtraItem={true} />);
    const input = autocomplete.find('.ui__input__field');
    input.simulate('focus');

    // This item does not exist in the list of options.
    input.simulate('change', {target: {value: 'abc'}});

    // Should show the "nothing found" item in the dropdown list.
    const nothingFoundItem = autocomplete.find('.ui__comboBox__listbox__text');
    expect(nothingFoundItem.length).toEqual(1);
  });

  it('removes options from dropdown list after adding those options to the autocomplete list', () => {
    // Get an array of 5 options
    const options = Array.from([1, 2, 3, 4, 5], (index) => ({label: `option${index}`, value: `option${index}`}));
    const autocomplete = mount(<Autocomplete allowNew={true} options={options} />);

    // Look up the options from the dropdown menu and add them to our list of items.
    const input = autocomplete.find('.ui__input__field');
    input.simulate('focus');
    input.simulate('change', {target: {value: 'option1'}});
    input.simulate('keydown', {key: 'Enter'});
    input.simulate('change', {target: {value: 'option2'}});
    input.simulate('keydown', {key: 'Enter'});

    // Check remaining options in the dropdown menu.
    const dropdownOptions = autocomplete.find('.ui__autocomplete__listbox button');

    // We entered 2 options from the dropdown list so there should be 2 fewer remaining options to pick from.
    expect(dropdownOptions.length).toEqual(options.length - 2);
  });

  it('clears out the input if clear button is pressed', () => {
    const autocomplete = mount(<Autocomplete options={options} />);
    const inputString = 'dummyvalue';

    // Add dummy string into the input field.
    const input = autocomplete.find('.ui__input__field');
    input.simulate('focus');
    input.simulate('change', {target: {value: inputString}});
    const chipinput = autocomplete.find(ChipInput);

    // Click the clear button.
    //@ts-ignore (can't create MouseEvent object)
    act(() => chipinput.invoke('onClearClick')?.(inputString)(new Event('click', {})));

    // Input field should now be blank.
    expect(input.html().includes(inputString)).toBe(false);
  });
});

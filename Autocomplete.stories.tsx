import {action} from '@storybook/addon-actions';
import {boolean, number, text} from '@storybook/addon-knobs';
import {storiesOf} from '@storybook/react';
import React from 'react';

import {commonIconsKnob, intentKnob} from '../../storybook-helpers/knobs';
import PaddingTopDecorator from '../../storybook-helpers/PaddingTopDecorator';

import Autocomplete from '../Autocomplete';

import docs from './README.md';

const stories = storiesOf('Controls | Autocomplete', module);

stories.addParameters({
  info: {text: docs},
  backgrounds: [{name: 'white', value: '#fff', default: true}],
  notes: docs,
});

stories.addDecorator(PaddingTopDecorator());

stories.add('Autocomplete Input', () => (
  <Autocomplete
    allowNew={boolean('allowNew', true)}
    disabled={boolean('disabled', false)}
    helpText={text('helpText', '')}
    icon={commonIconsKnob()}
    iconOnClick={boolean('has iconOnClick', false) ? () => action('iconOnClick') : undefined}
    id={'unique_input_id'}
    intent={intentKnob('intent')}
    label={text('label', 'Label')}
    loading={boolean('loading', false)}
    mandatory={boolean('mandatory', false)}
    optionalText={text('optionalText', '')}
    placeholder={text('placeholder', 'Start typing...')}
    tooltipTitle={text('tooltipTitle', '')}
    hasHover={boolean('hasHover', false)}
    hasExtraItem={boolean('hasExtraItem', true)}
    options={Array.from({
      length: number('number of chip items', 10, {
        range: true,
        min: 1,
        max: 50,
        step: 1,
      }),
    }).map((_, index) => ({label: `Chip${index + 1}`, value: `Chip${index + 1}`}))}
  />
));

stories.add('Autocomplete Input add extra value', () => (
  <Autocomplete
    allowNew={boolean('allowNew', true)}
    disabled={boolean('disabled', false)}
    helpText={text('helpText', '')}
    icon={commonIconsKnob()}
    iconOnClick={boolean('has iconOnClick', false) ? () => action('iconOnClick') : undefined}
    id={'unique_input_id'}
    intent={intentKnob('intent')}
    label={text('label', 'Label')}
    loading={boolean('loading', false)}
    mandatory={boolean('mandatory', false)}
    optionalText={text('optionalText', '')}
    placeholder={text('placeholder', 'Start typing...')}
    tooltipTitle={text('tooltipTitle', '')}
    hasHover={boolean('hasHover', false)}
    hasAddItem={boolean('hasAddItem', true)}
    options={Array.from({
      length: number('number of chip items', 10, {
        range: true,
        min: 1,
        max: 50,
        step: 1,
      }),
    }).map((_, index) => ({label: `Chip${index + 1}`, value: `Chip${index + 1}`}))}
  />
));

stories.add('Autocomplete Input with limit', () => (
  <Autocomplete
    allowNew={boolean('allowNew', true)}
    disabled={boolean('disabled', false)}
    helpText={text('helpText', '')}
    icon={commonIconsKnob()}
    iconOnClick={boolean('has iconOnClick', false) ? () => action('iconOnClick') : undefined}
    id={'unique_input_id'}
    intent={intentKnob('intent')}
    label={text('label', 'Label')}
    loading={boolean('loading', false)}
    mandatory={boolean('mandatory', false)}
    optionalText={text('optionalText', '')}
    placeholder={text('placeholder', 'Start typing the alphabet')}
    tooltipTitle={text('tooltipTitle', '')}
    hasHover={boolean('hasHover', false)}
    charLimit={number('charLimit', 3)}
    optionLimit={number('optionLimit', 10)}
    hasExtraItem={boolean('hasExtraItem', true)}
    options={[
      {label: 'abcd', value: 'abcd'},
      {label: 'abcde', value: 'abcde'},
      {label: 'abcdef', value: 'abcdef'},
      {label: 'abcdefg', value: 'abcdefg'},
      {label: 'abcdefgh', value: 'abcdefgh'},
      {label: 'abcdefghi', value: 'abcdefghi'},
      {label: 'abcdefghij', value: 'abcdefghij'},
      {label: 'abcdefghijk', value: 'abcdefghijk'},
      {label: 'abcdefghijkl', value: 'abcdefghijkl'},
      {label: 'abcdefghijklm', value: 'abcdefghijklm'},
      {label: 'abcdefghijklmn', value: 'abcdefghijklmn'},
    ]}
  />
));

import React from 'react';
import { Group, Radio } from '@mantine/core';

type customRadioOptions = {
  [value: string]: React.JSX.Element
};

export default function DXECustomRadioButtons(props: {
  options: customRadioOptions,
  selectedValue: string,
  className?: string,
  onValueChanged: (value: string) => void})
{
  return (
    <Radio.Group
      value={props.selectedValue}
      onChange={props.onValueChanged}
      className={props.className + " customRadioButtons"}>
      <Group mt="xs" gap="sm" grow={false}>
        {Object.entries(props.options).map(([value, contents]) => (
          <Radio.Card value={value} key={value} withBorder={true} w='auto'
            data-checked={props.selectedValue === value}>
            <Group wrap="nowrap" p="xs">
              {contents}
            </Group>
          </Radio.Card>
        ))}
      </Group>
    </Radio.Group>
  )
}
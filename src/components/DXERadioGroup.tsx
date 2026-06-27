import { Text, Group, Radio } from '@mantine/core';

type radioOptions = {
  [value: string]: number,
};

export default function DXERadioGroup(props: {
  title: string,
  options: radioOptions,
  selectedValue: number|null,
  onValueChanged: (value: number) => void})
{
  return (
    <Group className='radioGroup'>
      <Text style={{minWidth: '8rem'}}>{props.title}</Text>
      {Object.entries(props.options).map(([name, value]) => (
          <Radio
            value={value}
            label={name}
            checked={props.selectedValue === value}
            onChange={(e) => props.onValueChanged(Number(e.target.value))} />
      ))} 
    </Group>
  )
};

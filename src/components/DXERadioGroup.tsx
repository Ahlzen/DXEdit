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
    <Group className='radioGroup' wrap='nowrap' align='flex-start'>
      <Text className='col1'>{props.title}</Text>
      <Group wrap='wrap'>
      {Object.entries(props.options).map(([name, value]) => (
        <Radio
          value={value}
          key={value}
          label={name}
          checked={props.selectedValue === value}
          onChange={(e) => props.onValueChanged(Number(e.target.value))} />
      ))} 
      </Group>
    </Group>
  )
};

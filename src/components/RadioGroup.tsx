import { Text, Group, Radio } from '@mantine/core';

export default function RadioGroup(props: {
  title: string,
  options: {}, // value: name
  selectedValue: number|null,
  onValueChanged: (value: number) => void})
{
  return (
    <div className="radioGroup">
      <Group>
        <Text style={{minWidth: '8rem'}}>{props.title}</Text>
        {Object.entries(props.options).map(([value, name]) => (
            <Radio
              value={value}
              label={name}
              checked={props.selectedValue === Number(value)}
              onChange={(e) => props.onValueChanged(Number(e.target.value))} />
        ))} 
      </Group>
    </div>
  )
};

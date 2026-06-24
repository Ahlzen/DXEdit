import { Text, Group, Checkbox } from '@mantine/core';

export default function CheckBoxGroup(props: {
  title: string,
  options: {}, // value: name. Values must be "flags" (1,2,4,8,16...)
  selectedValue: number, // combined value of all checked flags
  onValueChanged: (value: number) => void})
{
  const handleOnChange = function(checked: boolean, value: number) {
    let newValue = props.selectedValue;
    if (checked) {
      newValue |= value; // set bit(s) of new value
    }
    else {
      value &= props.selectedValue;
      newValue -= value; // subtract new value (if set)
    }
    console.log(`CheckBoxGroup.handleOnChange(): old ${props.selectedValue} new ${newValue}`)
    props.onValueChanged(newValue);
  }

  return (
    <div className="checkboxGroup">
      <Group>
        <Text style={{minWidth: '8rem'}}>{props.title}</Text>
        {Object.entries(props.options).map(([value, name]) => (
          <Checkbox
            value={value}
            label={name}
            checked={(props.selectedValue & value) > 0}
            onChange={(e) => handleOnChange(e.target.checked, Number(e.target.value))} />
        ))}
      </Group>
    </div>
  )
}

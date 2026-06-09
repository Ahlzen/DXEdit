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
      <label>{props.title}
        {Object.entries(props.options).map(([value, name]) => (
          <label key={value}>
            <input
              type="checkbox"
              value={value}
              name={props.title}
              checked={(props.selectedValue & value) > 0}
              onChange={(e) => handleOnChange(e.target.checked, Number(e.target.value))} />
              {name}
          </label>
        ))}
      </label>
    </div>
  )
}
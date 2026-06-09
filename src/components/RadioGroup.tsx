export default function RadioGroup(props: {
  title: string,
  options: {}, // value: name
  selectedValue: number|null,
  onValueChanged: (value: number) => void})
{
  return (
    <div className="radioGroup">
      <label>{props.title}
      {Object.entries(props.options).map(([value, name]) => (
        <label key={value}>
          <input
            type="radio"
            value={value}
            name={props.title}
            defaultChecked={props.selectedValue === Number(value)}
            onChange={(e) => props.onValueChanged(Number(e.target.value))} />
          {name}
        </label>
      ))} 
      </label>
    </div>
  )

};
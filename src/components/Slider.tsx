export default function Slider(props: {
  title: string,
  selectedValue: number,
  maxValue: number,
  onValueChanged: (value: number) => void })
{
  return (
    <div className="slider">
      <label>{props.title}
        <input
          type="range"
          value={props.selectedValue}
          name={props.title}
          max={props.maxValue}
          onChange={(e) => props.onValueChanged(Number(e.target.value))} />
        <span className="value">{props.selectedValue}</span>
      </label>
    </div>
  )
};
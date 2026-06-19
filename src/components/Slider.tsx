type formatter = (value: number) => string;

const defaultFormatter = function(val: number) {
   return String(val);
}

export default function Slider(props: {
  title: string,
  selectedValue: number,
  maxValue: number,
  onValueChanged: (value: number) => void,
  valueFormatter?: formatter
}){
  const formatter = props.valueFormatter || defaultFormatter;

  return (
    <div className="slider">
      <label>{props.title}
        <input
          type="range"
          value={props.selectedValue}
          name={props.title}
          max={props.maxValue}
          onChange={(e) => props.onValueChanged(Number(e.target.value))} />
        <span className="value">{formatter(props.selectedValue)}</span>
      </label>
    </div>
  )
};
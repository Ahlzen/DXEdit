type formatter = (value: number) => string;

const defaultFormatter = function(val: number) {
   return String(val);
}

export default function Slider(props: {
  title: string,
  selectedValue: number,
  maxValue: number,
  onValueChanged: (value: number) => void,
  valueFormatter?: formatter,
  onHoverChanged?: (hover: boolean) => void
}){
  const formatter = props.valueFormatter || defaultFormatter;

  let handleMouseEnter = () => {
    if (props.onHoverChanged)
      props.onHoverChanged(true);
  }
  let handleMouseLeave = () => {
    if (props.onHoverChanged)
      props.onHoverChanged(false);
  }

  return (
    <div className="slider"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
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
import { Slider, Text, Group } from '@mantine/core';

type formatter = (value: number) => string;

const defaultFormatter = function(val: number) {
   return String(val);
}

export default function DXESlider(props: {
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
      <Group>
        <Text style={{minWidth: '8rem'}}>{props.title}</Text>
        <Slider
          title={props.title}
          value={props.selectedValue}
          min={0}
          max={props.maxValue}
          w='10rem'
          label={formatter}
          onChange={(e) => props.onValueChanged(Number(e))} />
        <Text size='sm'><b>{formatter(props.selectedValue)}</b></Text>
    </Group>
  </div>
  )
};

import Slider from './Slider.tsx';
import CheckBoxGroup from './CheckBoxGroup.tsx';

export default function PerformanceControlEditor(props: {
  title: string,
  rangeValue: number,
  onRangeChanged: (value: number) => void,
  assignValue: number,
  onAssignChanged: (value: number) => void})
{
  return (
    <div className='performanceControlEditor'>
      <h3>{props.title}</h3>
      <Slider
        title="Range:"
        selectedValue={props.rangeValue}
        maxValue={99}
        onValueChanged={props.onRangeChanged} />
      <CheckBoxGroup
        title="Assign:"
        options={{1: 'Pitch', 2: 'Amp', 4: 'EG Bias'}}
        selectedValue={props.assignValue}
        onValueChanged={props.onAssignChanged} />
    </div>
  );
}
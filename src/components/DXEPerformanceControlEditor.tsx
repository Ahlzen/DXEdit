import { Stack, Title } from '@mantine/core';

import DXESlider from './DXESlider.tsx';
import DXECheckBoxGroup from './DXECheckBoxGroup.tsx';

export default function DXEPerformanceControlEditor(props: {
  title: string,
  rangeValue: number,
  onRangeChanged: (value: number) => void,
  assignValue: number,
  onAssignChanged: (value: number) => void})
{
  return (
    <Stack className='performanceControlEditor'>
      {/* <h3>{props.title}</h3> */}
      <Title order={3}>{props.title}</Title>
      <DXESlider
        title="Range:"
        selectedValue={props.rangeValue}
        maxValue={99}
        onValueChanged={props.onRangeChanged} />
      <DXECheckBoxGroup
        title="Assign:"
        options={{1: 'Pitch', 2: 'Amp', 4: 'EG Bias'}}
        selectedValue={props.assignValue}
        onValueChanged={props.onAssignChanged} />
    </Stack>
  );
}
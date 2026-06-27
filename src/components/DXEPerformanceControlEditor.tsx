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
      <Title order={3}>{props.title}</Title>
      <DXESlider
        title="Range:"
        selectedValue={props.rangeValue}
        maxValue={99}
        onValueChanged={props.onRangeChanged} />
      <DXECheckBoxGroup
        title="Assign:"
        options={{'Pitch': 1, 'Amp': 2, 'EG Bias': 4}}
        selectedValue={props.assignValue}
        onValueChanged={props.onAssignChanged} />
    </Stack>
  );
}
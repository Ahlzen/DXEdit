import { Stack, Group, Title } from '@mantine/core';
import DXESlider from './DXESlider.tsx';
import DXERadioGroup from './DXERadioGroup.tsx';
import DXEPerformanceControlEditor from './DXEPerformanceControlEditor.tsx';

import { WebMidi } from '../midi/WebMidi.ts'
import { type performanceParam, type performanceValues,
  performanceParamSpecs } from '../midi/PerformanceParamData.ts';
import { formatSemitones, buildParameterChangeSysex } from '../midi/DX7.ts';

export function DEXPerformanceEditor(props: {
  midi: WebMidi,
  midiChannel: number,
  perfParams: performanceValues,
  onPerfParamsChanged: (newPerfParams: performanceValues) => void,
})
{
  ///// UI

  return (
    <Group justify='flex-start' align='top' gap='xl' grow={true}>
      <Stack>
        <Title order={2}>Performance Parameters</Title>

        <DXERadioGroup
          title="Voice mode"
          options={{ "Poly": 0, "Mono": 1 }}
          selectedValue={props.perfParams.monoMode}
          onValueChanged={(v) => handlePerformanceParamChanged('monoMode', v)} />
        
        <Title order={3}>Pitch Bend</Title>
        <DXESlider
          title="Range"
          selectedValue={props.perfParams.pitchBendRange}
          maxValue={12}
          onValueChanged={(v) => handlePerformanceParamChanged('pitchBendRange', v)}
          valueFormatter={formatSemitones} />
        <DXESlider
          title="Step"
          selectedValue={props.perfParams.pitchBendStep}
          maxValue={12}
          onValueChanged={(v) => handlePerformanceParamChanged('pitchBendStep', v)} />

        <Title order={3}>Portamento</Title>
        <DXESlider
          title="Time"
          selectedValue={props.perfParams.portamentoTime}
          maxValue={99}
          onValueChanged={(v) => handlePerformanceParamChanged('portamentoTime', v)} />
        <DXERadioGroup
          title='Mode'
          options={{'Retain': 0, 'Follow': 1}}
          selectedValue={props.perfParams.portamentoMode}
          onValueChanged={(v) => handlePerformanceParamChanged('portamentoMode', v)} />
        <DXERadioGroup
          title='Glissando'
          options={{'Off': 0, 'On': 1}}
          selectedValue={props.perfParams.glissando}
          onValueChanged={(v) => handlePerformanceParamChanged('glissando', v)} />
      </Stack>

      <Stack>
        <DXEPerformanceControlEditor
          title="Mod Wheel"
          rangeValue={props.perfParams.modWheelRange}
          onRangeChanged={(v) => handlePerformanceParamChanged('modWheelRange', v)}
          assignValue={props.perfParams.modWheelAssign}
          onAssignChanged={(v) => handlePerformanceParamChanged('modWheelAssign', v)} />
        <DXEPerformanceControlEditor
          title="Aftertouch"
          rangeValue={props.perfParams.aftertouchRange}
          onRangeChanged={(v) => handlePerformanceParamChanged('aftertouchRange', v)}
          assignValue={props.perfParams.aftertouchAssign}
          onAssignChanged={(v) => handlePerformanceParamChanged('aftertouchAssign', v)} />
        <DXEPerformanceControlEditor
          title="Foot Control"
          rangeValue={props.perfParams.footControlRange}
          onRangeChanged={(v) => handlePerformanceParamChanged('footControlRange', v)}
          assignValue={props.perfParams.footControlAssign}
          onAssignChanged={(v) => handlePerformanceParamChanged('footControlAssign', v)} />
        <DXEPerformanceControlEditor
          title="Breath Control"
          rangeValue={props.perfParams.breathControlRange}
          onRangeChanged={(v) => handlePerformanceParamChanged('breathControlRange', v)}
          assignValue={props.perfParams.breathControlAssign}
          onAssignChanged={(v) => handlePerformanceParamChanged('breathControlAssign', v)} />
      </Stack>
    </Group>
  );


  ///// Event handlers

  function handlePerformanceParamChanged(
    parameter: performanceParam,
    value: number)
  {
    console.log(`DXEPerformanceEditor: handlePerformanceParamChanged(): ${parameter} ${value}`);
    let paramNumber = performanceParamSpecs[parameter].paramNumber;
    const sysexData = buildParameterChangeSysex(
      'function', paramNumber, value, props.midiChannel);
    props.midi.sendMessage(sysexData);

    let newParams = {...props.perfParams};
    newParams[parameter] = value;
    props.onPerfParamsChanged(newParams);
  }
}
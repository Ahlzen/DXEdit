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
          onValueChanged={(v) => handlePerformanceParamChanged('monoMode', v, true)} />
        
        <Title order={3}>Pitch Bend</Title>
        <DXESlider
          title="Range"
          selectedValue={props.perfParams.pitchBendRange}
          maxValue={12}
          onValueChanged={(v,ce) => handlePerformanceParamChanged('pitchBendRange', v, ce)}
          valueFormatter={formatSemitones} />
        <DXESlider
          title="Step"
          selectedValue={props.perfParams.pitchBendStep}
          maxValue={12}
          onValueChanged={(v,ce) => handlePerformanceParamChanged('pitchBendStep', v, ce)} />

        <Title order={3}>Portamento</Title>
        <DXESlider
          title="Time"
          selectedValue={props.perfParams.portamentoTime}
          maxValue={99}
          onValueChanged={(v,ce) => handlePerformanceParamChanged('portamentoTime', v, ce)} />
        <DXERadioGroup
          title='Mode'
          options={{'Retain': 0, 'Follow': 1}}
          selectedValue={props.perfParams.portamentoMode}
          onValueChanged={(v) => handlePerformanceParamChanged('portamentoMode', v, true)} />
        <DXERadioGroup
          title='Glissando'
          options={{'Off': 0, 'On': 1}}
          selectedValue={props.perfParams.glissando}
          onValueChanged={(v) => handlePerformanceParamChanged('glissando', v, true)} />
      </Stack>

      <Stack>
        <DXEPerformanceControlEditor
          title="Mod Wheel"
          rangeValue={props.perfParams.modWheelRange}
          onRangeChanged={(v,ce) => handlePerformanceParamChanged('modWheelRange', v, ce)}
          assignValue={props.perfParams.modWheelAssign}
          onAssignChanged={(v) => handlePerformanceParamChanged('modWheelAssign', v, true)} />
        <DXEPerformanceControlEditor
          title="Aftertouch"
          rangeValue={props.perfParams.aftertouchRange}
          onRangeChanged={(v,ce) => handlePerformanceParamChanged('aftertouchRange', v, ce)}
          assignValue={props.perfParams.aftertouchAssign}
          onAssignChanged={(v) => handlePerformanceParamChanged('aftertouchAssign', v, true)} />
        <DXEPerformanceControlEditor
          title="Foot Control"
          rangeValue={props.perfParams.footControlRange}
          onRangeChanged={(v,ce) => handlePerformanceParamChanged('footControlRange', v, ce)}
          assignValue={props.perfParams.footControlAssign}
          onAssignChanged={(v) => handlePerformanceParamChanged('footControlAssign', v, true)} />
        <DXEPerformanceControlEditor
          title="Breath Control"
          rangeValue={props.perfParams.breathControlRange}
          onRangeChanged={(v,ce) => handlePerformanceParamChanged('breathControlRange', v, ce)}
          assignValue={props.perfParams.breathControlAssign}
          onAssignChanged={(v) => handlePerformanceParamChanged('breathControlAssign', v, true)} />
      </Stack>
    </Group>
  );


  ///// Event handlers

  function handlePerformanceParamChanged(
    parameter: performanceParam,
    value: number,
    isChangeEnd: boolean)
  {
    console.log(`DXEPerformanceEditor: handlePerformanceParamChanged(): ${parameter} ${value}`);
    let paramNumber = performanceParamSpecs[parameter].paramNumber;

    // Update state / UI
    let newParams = {...props.perfParams};
    newParams[parameter] = value;
    props.onPerfParamsChanged(newParams);

    // Only send sysex on "change end", since too frequent parameter
    // changes lead to annoying interruptions and dropouts on the DX7.
    if (isChangeEnd) {
      const sysexData = buildParameterChangeSysex(
        'function', paramNumber, value, props.midiChannel);
      props.midi.sendMessage(sysexData);
    }
  }
}
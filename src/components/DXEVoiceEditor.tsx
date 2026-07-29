import { useState } from 'react';

import { Button, Stack, Group, TextInput, Title, Space, Text, Modal, Checkbox } from '@mantine/core';
import DXESlider from './DXESlider.tsx';
import DXEEnvelopeEditor from './DXEEnvelopeEditor.tsx';
import DXEOpEditor from './DXEOpEditor.tsx';
import DXERadioGroup from './DXERadioGroup.tsx';
import DXEAlgorithmDiagram from './DXEAlgorithmDiagram.tsx';
import DXEAlgorithmPicker from './DXEAlgorithmPicker.tsx';
import DXECustomRadioButtons from './DXECustomRadioButtons.tsx';

import { WebMidi } from '../midi/WebMidi.ts'
import { formatTranspose, formatAlgorithm, isOpEnabled } from '../midi/DX7.ts';
import type { voiceParam, opNumber } from '../midi/VoiceParamData.ts';
import { VoiceParamData, voiceParamSpecs } from '../midi/VoiceParamData.ts';
import { buildOneVoiceBulkSysex, buildParameterChangeSysex, buildVoiceNameChangeSysex } from '../midi/DX7.ts';

// LFO waveform images
import wf_tri from '../assets/wf-tri.svg';
import wf_saw_dn from '../assets/wf-saw-dn.svg';
import wf_saw_up from '../assets/wf-saw-up.svg';
import wf_square from '../assets/wf-square.svg';
import wf_sine from '../assets/wf-sine.svg';
import wf_sandh from '../assets/wf-sandh.svg';

export function DXEVoiceEditor(props: {
  midi: WebMidi,
  midiChannel: number,
  voiceParams: VoiceParamData,
  isTimeEgMode: boolean,
  onVoiceParamsChanged: (newVoiceParams: VoiceParamData) => void,
})
{
  ///// State

  const [currentOp, setCurrentOp] = useState<opNumber>('op1');
  const [enabledOps, setEnabledOps] = useState<number>(0b111111); // same format as in DX7 Sysex param 155
  const [algorithmPickerOpen, setAlgorithmPickerOpen] = useState<boolean>(false);


  ///// UI

  return (
    <>
    <Group gap='md' mt='md'>
      <Button onClick={handleInitVoice}>Init Voice (reset to default)</Button>
      <Button onClick={handleSendAll}>Send All to Device (synchronize)</Button>
    </Group>

    <Group justify='flex-start' align='top' gap='xl' grow={true}>

      <Stack className='commonEditor'>
        <Title order={2}>Common</Title>
        
        <Group>
          <Text className='col1'>Patch name</Text>
          <TextInput
            value={props.voiceParams.getVoiceName()}
            placeholder="max 10 chars"
            maxLength={10}
            style={{width:'10rem'}}
            onChange={(e) => {handleUpdateVoiceName(e.currentTarget.value)}} />
        </Group>
        
        <Space h='md'/>

        <DXEAlgorithmDiagram
          algNumber={props.voiceParams.getValue('Algorithm')+1}
          isFixedWidth={true}
          currentOp={currentOp}
          enabledOps={enabledOps}
          hasLabels={true} />
        <Group>
          <DXESlider
            title="Algorithm"
            selectedValue={props.voiceParams.getValue('Algorithm')}
            maxValue={31}
            onValueChanged={(v,ce) => handleVoiceParamChanged('Algorithm', v, ce)}
            valueFormatter={formatAlgorithm} />
          <Button onClick={() => setAlgorithmPickerOpen(true)} size="xs">...</Button>
        </Group>
        

        <DXESlider
          title="Feedback"
          selectedValue={props.voiceParams.getValue('Feedback')}
          maxValue={7}
          onValueChanged={(v,ce) => handleVoiceParamChanged('Feedback', v, ce)} />
        <DXERadioGroup
          title="Osc Sync"
          options={{ "Off": 0, "On": 1 }}
          selectedValue={props.voiceParams.getValue('Oscillator Sync')}
          onValueChanged={(v) => handleVoiceParamChanged('Oscillator Sync', v, true)} />

        <Title order={3}>LFO</Title>

        <DXECustomRadioButtons
          className='waveformSelector'
          options={{
            "0": <img src={wf_tri} alt='Tri' />,
            "1": <img src={wf_saw_dn} alt='SawDn' />,
            "2": <img src={wf_saw_up} alt='SawUp' />,
            "3": <img src={wf_square} alt='Squ' />,
            "4": <img src={wf_sine} alt='Sin' />,
            "5": <img src={wf_sandh} alt='S&H' />}}
          selectedValue={String(props.voiceParams.getValue('LFO Waveform')).toString()}
          onValueChanged={(v) => handleVoiceParamChanged('LFO Waveform', Number(v), true)} />
        <DXESlider
          title="Speed"
          selectedValue={props.voiceParams.getValue('LFO Speed')}
          maxValue={99}
          onValueChanged={(v,ce) => handleVoiceParamChanged('LFO Speed', v, ce)} />
        <DXESlider
          title="Delay"
          selectedValue={props.voiceParams.getValue('LFO Delay')}
          maxValue={99}
          onValueChanged={(v,ce) => handleVoiceParamChanged('LFO Delay', v, ce)} />
        <DXESlider
          title="Pitch mod"
          selectedValue={props.voiceParams.getValue('LFO Pitch Mod Depth')}
          maxValue={99}
          onValueChanged={(v,ce) => handleVoiceParamChanged('LFO Pitch Mod Depth', v, ce)} />
        <DXESlider
          title="Amp mod"
          selectedValue={props.voiceParams.getValue('LFO Amp Mod Depth')}
          maxValue={99}
          onValueChanged={(v,ce) => handleVoiceParamChanged('LFO Amp Mod Depth', v, ce)} />
        <DXERadioGroup
          title="Sync"
          options={{ "Off": 0, "On": 1 }}
          selectedValue={props.voiceParams.getValue('LFO Sync')}
          onValueChanged={(v) => handleVoiceParamChanged('LFO Sync', v, true)} />
        
        <br/>
        <DXESlider
          title="Pitch mod sens"
          selectedValue={props.voiceParams.getValue('Pitch Mod Sensitivity')}
          maxValue={7}
          onValueChanged={(v,ce) => handleVoiceParamChanged('Pitch Mod Sensitivity', v, ce)} />
        <DXESlider
          title="Transpose"
          selectedValue={props.voiceParams.getValue('Transpose')}
          maxValue={48}
          onValueChanged={(v,ce) => handleVoiceParamChanged('Transpose', v, ce)}
          valueFormatter={formatTranspose} />

        <DXEEnvelopeEditor title="Pitch Envelope"
          data={props.voiceParams}
          eg='pitch'
          isTimeMode={props.isTimeEgMode}
          onValueChanged={handleVoiceParamChanged} />
      </Stack>

      <Stack className='opsEditor'>
        <Title order={2}>Operators</Title>
        
        {/* TODO: Refactor this into something more elegant... */}
        <Group mt="xs" gap="sm" grow={false}>
          <Text className='col1-sm'>Enable</Text>
          <Checkbox.Card checked={isOpEnabled(enabledOps, 1)}
            className="customCheckBox" w='auto'
            onChange={(v) => handleEnabledOpsChanged(1, v)}>
            <Group wrap="nowrap" p="xs">
              <Text>OP1</Text>
            </Group>
          </Checkbox.Card>
          <Checkbox.Card checked={isOpEnabled(enabledOps, 2)}
            className="customCheckBox" w='auto'
            onChange={(v) => handleEnabledOpsChanged(2, v)}>
            <Group wrap="nowrap" p="xs">
              <Text>OP2</Text>
            </Group>
          </Checkbox.Card>
          <Checkbox.Card checked={isOpEnabled(enabledOps, 3)}
            className="customCheckBox" w='auto'
            onChange={(v) => handleEnabledOpsChanged(3, v)}>
            <Group wrap="nowrap" p="xs">
              <Text>OP3</Text>
            </Group>
          </Checkbox.Card>
          <Checkbox.Card checked={isOpEnabled(enabledOps, 4)}
            className="customCheckBox" w='auto'
            onChange={(v) => handleEnabledOpsChanged(4, v)}>
            <Group wrap="nowrap" p="xs">
              <Text>OP4</Text>
            </Group>
          </Checkbox.Card>
          <Checkbox.Card checked={isOpEnabled(enabledOps, 5)}
            className="customCheckBox" w='auto'
            onChange={(v) => handleEnabledOpsChanged(5, v)}>
            <Group wrap="nowrap" p="xs">
              <Text>OP5</Text>
            </Group>
          </Checkbox.Card>
          <Checkbox.Card checked={isOpEnabled(enabledOps, 6)}
            className="customCheckBox" w='auto'
            onChange={(v) => handleEnabledOpsChanged(6, v)}>
            <Group wrap="nowrap" p="xs">
              <Text>OP6</Text>
            </Group>
          </Checkbox.Card>
        </Group>

        <Group gap="sm">
          <Text className='col1-sm'>Select</Text>
          <DXECustomRadioButtons
            className='opSelector'
            options={{
              'op1': <Text>OP1</Text>,
              'op2': <Text>OP2</Text>,
              'op3': <Text>OP3</Text>,
              'op4': <Text>OP4</Text>,
              'op5': <Text>OP5</Text>,
              'op6': <Text>OP6</Text>,
            }}
            selectedValue={currentOp}
            onValueChanged={(o) => setCurrentOp(o as opNumber)}/>
        </Group>
        
        <DXEOpEditor
          op={currentOp}
          data={props.voiceParams}
          isTimeEgMode={props.isTimeEgMode}
          onValueChanged={handleVoiceParamChanged} />
      </Stack>

    </Group>

    {/* Pop-ups (dialogs) */}

    <Modal withCloseButton
      onClose={() => setAlgorithmPickerOpen(false)}
      opened={algorithmPickerOpen}
      size="auto"
      >
      <DXEAlgorithmPicker currentAlgorithm={props.voiceParams.getValue('Algorithm')}
        columnCount={8}
        onAlgorithmSelected={(n: number) => {
          handleVoiceParamChanged('Algorithm', n, true)
          setAlgorithmPickerOpen(false);
        }}
        onCancel={() => setAlgorithmPickerOpen(false)}
        />
    </Modal>
    </>
  );


  ///// Event handlers

  function handleInitVoice() {
    props.onVoiceParamsChanged(new VoiceParamData()); // defaults to init voice
  }

  function handleSendAll() {
    const sysexData = buildOneVoiceBulkSysex(props.voiceParams, props.midiChannel);
    props.midi.sendMessage(sysexData);
  }

  function handleUpdateVoiceName(voiceName: string) {
    console.log("App: handleUpdatePatchName(): " + voiceName);
    const newVoiceParams = props.voiceParams.setVoiceName(voiceName);
    props.onVoiceParamsChanged(newVoiceParams);
    const sysexData = buildVoiceNameChangeSysex(newVoiceParams, props.midiChannel);
    props.midi.sendMessage(sysexData);
  }

  function handleVoiceParamChanged(
    parameter: voiceParam | number,
    value: number,
    isChangeEnd: boolean)
  {
    console.log(`DXEVoiceEditor: handleVoiceParamChanged(): ${parameter} ${value}`);
    const offset: number = typeof parameter === 'number' ?
      parameter : voiceParamSpecs[parameter].offset;
    
    // Update state / UI
    const newVoiceParams = props.voiceParams.setValueByOffset(offset, value);
    props.onVoiceParamsChanged(newVoiceParams);

    // Only send sysex on "change end", since too frequent parameter
    // changes lead to annoying interruptions and dropouts on the DX7.
    if (isChangeEnd) {
      const sysexData = buildParameterChangeSysex(
        'voice', offset, value, props.midiChannel);
      props.midi.sendMessage(sysexData);
    }
  }

  function handleEnabledOpsChanged(
    opNumber: number, // 1-6
    checked: boolean)
  {
    let value = enabledOps;
    const bitMask = 0b1000000 >>> opNumber;
    if (checked) {
      value |= bitMask;
    } else {
      value &= (~bitMask);
    }
    setEnabledOps(value);

    // Send sysex
    const sysexData = buildParameterChangeSysex(
      'voice', 155, value, props.midiChannel);
    props.midi.sendMessage(sysexData);
  }
}

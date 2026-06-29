import { useState } from 'react';

import { Button, Stack, Group, TextInput, Title, Radio, Space, Text } from '@mantine/core';
import DXESlider from './DXESlider.tsx';
import DXEEnvelopeEditor from './DXEEnvelopeEditor.tsx';
import DXEOpEditor from './DXEOpEditor.tsx';
import DXERadioGroup from './DXERadioGroup.tsx';

import { WebMidi } from '../midi/WebMidi.ts'
import { formatTranspose, formatAlgorithm } from '../midi/DX7.ts';
import type { voiceParam, opNumber } from '../midi/VoiceParamData.ts';
import { VoiceParamData, voiceParamSpecs } from '../midi/VoiceParamData.ts';
import { buildOneVoiceBulkSysex, buildParameterChangeSysex, buildVoiceNameChangeSysex } from '../midi/DX7.ts';

export function DXEVoiceEditor(props: {
  midi: WebMidi,
  midiChannel: number,
  voiceParams: VoiceParamData,
  onVoiceParamsChanged: (newVoiceParams: VoiceParamData) => void,
})
{
  ///// State

  const [currentOp, setCurrentOp] = useState<opNumber>('op1');


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
          <Text style={{minWidth: '8rem'}}>Patch name</Text>
          <TextInput
            value={props.voiceParams.getVoiceName()}
            placeholder="max 10 chars"
            maxLength={10}
            style={{width:'10rem'}}
            onChange={(e) => {handleUpdateVoiceName(e.currentTarget.value)}} />
        </Group>
        
        <Space h='md'/>

        <DXESlider
          title="Algorithm"
          selectedValue={props.voiceParams.getValue('Algorithm')}
          maxValue={31}
          onValueChanged={(v) => handleVoiceParamChanged('Algorithm', v)}
          valueFormatter={formatAlgorithm} />
        <DXESlider
          title="Feedback"
          selectedValue={props.voiceParams.getValue('Feedback')}
          maxValue={7}
          onValueChanged={(v) => handleVoiceParamChanged('Feedback', v)} />
        <DXERadioGroup
          title="Osc Sync"
          options={{ "Off": 0, "On": 1 }}
          selectedValue={props.voiceParams.getValue('Oscillator Sync')}
          onValueChanged={(v) => handleVoiceParamChanged('Oscillator Sync', v)} />

        <Title order={3}>LFO</Title>
        <DXESlider
          title="Speed"
          selectedValue={props.voiceParams.getValue('LFO Speed')}
          maxValue={99}
          onValueChanged={(v) => handleVoiceParamChanged('LFO Speed', v)} />
        <DXESlider
          title="Delay"
          selectedValue={props.voiceParams.getValue('LFO Delay')}
          maxValue={99}
          onValueChanged={(v) => handleVoiceParamChanged('LFO Delay', v)} />
        <DXESlider
          title="Pitch mod"
          selectedValue={props.voiceParams.getValue('LFO Pitch Mod Depth')}
          maxValue={99}
          onValueChanged={(v) => handleVoiceParamChanged('LFO Pitch Mod Depth', v)} />
        <DXESlider
          title="Amp mod"
          selectedValue={props.voiceParams.getValue('LFO Amp Mod Depth')}
          maxValue={99}
          onValueChanged={(v) => handleVoiceParamChanged('LFO Amp Mod Depth', v)} />
        <DXERadioGroup
          title="Sync"
          options={{ "Off": 0, "On": 1 }}
          selectedValue={props.voiceParams.getValue('LFO Sync')}
          onValueChanged={(v) => handleVoiceParamChanged('LFO Sync', v)} />
        <DXERadioGroup
          title="Wave"
          options={{ "Tri": 0, "Saw Dn": 1, "Saw Up": 2, "Square": 3, "Sine": 4, "S&H": 5 }}
          selectedValue={props.voiceParams.getValue('LFO Waveform')}
          onValueChanged={(v) => handleVoiceParamChanged('LFO Waveform', v)} />
        
        <br/>
        <DXESlider
          title="Pitch mod sens"
          selectedValue={props.voiceParams.getValue('Pitch Mod Sensitivity')}
          maxValue={7}
          onValueChanged={(v) => handleVoiceParamChanged('Pitch Mod Sensitivity', v)} />
        <DXESlider
          title="Transpose"
          selectedValue={props.voiceParams.getValue('Transpose')}
          maxValue={48}
          onValueChanged={(v) => handleVoiceParamChanged('Transpose', v)}
          valueFormatter={formatTranspose} />

        <DXEEnvelopeEditor title="Pitch Envelope"
          data={props.voiceParams}
          eg='pitch'
          onValueChanged={handleVoiceParamChanged} />
      </Stack>

      <Stack className='opsEditor'>
        <Title order={2}>Operators</Title>
        <Group className="opSelectors" mt='md' mb='md'>
        {['op1','op2','op3','op4','op5','op6'].map(function (o,i) {
          return (
            <Radio
              value={o}
              key={o}
              label={'OP'+(i+1)}
              checked={currentOp === o} 
              onChange={() => setCurrentOp(o as opNumber)} />
          );
        })}
        </Group>
        
        <DXEOpEditor op={currentOp} data={props.voiceParams}
          onValueChanged={handleVoiceParamChanged} />
      </Stack>

    </Group>
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
    let newVoiceParams = props.voiceParams.setVoiceName(voiceName);
    props.onVoiceParamsChanged(newVoiceParams);
    const sysexData = buildVoiceNameChangeSysex(newVoiceParams, props.midiChannel);
    props.midi.sendMessage(sysexData);
  }

  function handleVoiceParamChanged(
    parameter: voiceParam | number,
    value: number)
  {
    console.log(`App: handleVoiceParamChanged(): ${parameter} ${value}`);
    let offset: number = typeof parameter === 'number' ?
      parameter : voiceParamSpecs[parameter].offset;
    
    const sysexData = buildParameterChangeSysex(
      'voice', offset, value, props.midiChannel);
    props.midi.sendMessage(sysexData);

    const newVoiceParams = props.voiceParams.setValueByOffset(offset, value);
    props.onVoiceParamsChanged(newVoiceParams);
  }
}
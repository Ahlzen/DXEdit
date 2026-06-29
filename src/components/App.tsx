import '@mantine/core/styles.css';
import { createTheme, MantineProvider, Button, Stack, Group, TextInput, Tabs, Title, Radio, Space, Text } from '@mantine/core';
import { GearIcon, FadersHorizontalIcon, PianoKeysIcon } from '@phosphor-icons/react';

import { useState, useRef, useEffect } from 'react';
import { Preferences } from '../preferences';
import './App.css';

// MIDI / DX7 sysex
import { WebMidi, START_OF_SYSEX, END_OF_SYSEX } from '../midi/WebMidi.ts'
import { formatSemitones, formatTranspose, formatAlgorithm } from '../midi/DX7.ts';
import { type performanceParam, type performanceValues,
  performanceParamSpecs, getInitPerformanceParams } from '../midi/PerformanceParamData.ts';
import { type voiceParam, type opNumber,
  VoiceParamData, voiceParamSpecs } from '../midi/VoiceParamData.ts';

// Components
import DXEMidiPortSelector from './DXEMidiPortSelector.tsx';
import DXERadioGroup from './DXERadioGroup.tsx';
import DXESlider from './DXESlider.tsx';
import DXEPerformanceControlEditor from './DXEPerformanceControlEditor.tsx';
import DXEOpEditor from './DXEOpEditor.tsx';
import DXEEnvelopeEditor from './DXEEnvelopeEditor.tsx';

import { version } from '../../package.json';
import { formatAllNotesOff, formatOneVoiceBulkSysex, formatParameterChangeSysex, formatVoiceNameChangeSysex } from '../midi/DX7.ts';


export default function App()
{
  const midi = useRef<WebMidi>(new WebMidi());
  const prefs = useRef<Preferences>(new Preferences('dxEdit'));

  // MIDI configuration state
  const [midiInPortNames, setMidiInPortNames] = useState<string[]>([]);
  const [midiOutPortNames, setMidiOutPortNames] = useState<string[]>([]);

  const [midiIn, setMidiIn] = useState<string|null>(null);
  const [midiOut, setMidiOut] = useState<string|null>(null);
  const [controllerIn, setControllerIn] = useState<string|null>(null);

  const [midiChannel, setMidiChannel] = useState<number>(0);

  // Editor state
  const [perfParams, setPerfParams] = useState<performanceValues>(
    getInitPerformanceParams());
  const [voiceParams, setVoiceParams] =
    useState<VoiceParamData>(new VoiceParamData());
  const [currentOp, setCurrentOp] = useState<opNumber>('op1');

  useEffect(() => {
    if (!midi.current.isInitialized) {
      midi.current.initialize(true,
        () => {
          midi.current.listPortsToConsole();
          midi.current.onMidiIn = handleMidiIn;
          midi.current.onControllerIn = handleControllerIn;
          updateMidiPorts();
          if (prefs.current.getPrefs('midiIn')) {
            handleMidiInChanged(prefs.current.getPrefs('midiIn'));
          }
          if (prefs.current.getPrefs('midiOut')) {
            handleMidiOutChanged(prefs.current.getPrefs('midiOut'));
          }
          if (prefs.current.getPrefs('controllerIn')) {
            handleControllerInChanged(prefs.current.getPrefs('controllerIn'));
          }
        },
        (errorMessage) => {
          console.error("Failed to initialize MIDI: " + errorMessage);
        }
      );
    }
  });

  // Formatters
  function formatMidiChannel(ch: number) : string { return String(ch+1); }
  
  // Mantine theme
  const theme = createTheme({
    focusRing: 'always',
    scale: 1.0,
    fontSmoothing: true,
    defaultRadius: 'sm',
    cursorType: 'pointer',
    spacing: {
      // reduce spacing a bit compared to default
      xs: '0.2rem',
      sm: '0.5rem',
      md: '0.7rem',
      lg: '1.5rem',
      xl: '2.5rem'
    },
    components: {
      Stack: Stack.extend( {
        defaultProps: {
          gap: 'xs'
        }
      }),
      Title: Title.extend({
        defaultProps: {
          mt: 'lg'
        }
      }),
    },
  });

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme='dark'
      classNamesPrefix='mantine'>

    <Tabs defaultValue="configuration">

      <Tabs.List>
        <Tabs.Tab value="configuration" leftSection={<GearIcon size={16} />}>
          Configuration
        </Tabs.Tab>
        <Tabs.Tab value="performance" leftSection={<PianoKeysIcon size={16} />}>
          Performance Parameters
        </Tabs.Tab>
        <Tabs.Tab value="edit" leftSection={<FadersHorizontalIcon size={16} />}>
          Voice Editor
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="configuration">
        <Group justify='flex-start' align='top' gap='xl' grow={false}>

          <Stack align='stretch' gap='lg' mt='lg'>
            <Title order={2}>MIDI Configuration</Title>
            <DXEMidiPortSelector
              title="MIDI Input"
              description='From MIDI Out of DX/TX.'
              portNames={midiInPortNames}
              selectedPortName={midiIn}
              onPortChanged={handleMidiInChanged} />
            <DXEMidiPortSelector 
              title="MIDI Output"
              description='To MIDI In of DX/TX.'
              portNames={midiOutPortNames}
              selectedPortName={midiOut}
              onPortChanged={handleMidiOutChanged} />
            <DXEMidiPortSelector
              title="Controller Input"
              description='Optional. Input from this port is sent to MIDI Output.'
              portNames={midiInPortNames}
              selectedPortName={controllerIn}
              onPortChanged={handleControllerInChanged} />
            <DXESlider
              title="MIDI Channel"
              selectedValue={midiChannel}
              maxValue={15}
              onValueChanged={setMidiChannel}
              valueFormatter={formatMidiChannel} />

            <Space h='lg' />

            <Text size='sm'>DX Edit {version}</Text>
          </Stack>

          <Stack gap='lg' mt='lg'>
            <Title order={2}>MIDI Test</Title>
            <Button onClick={handleSendNoteOnOff}>
              Send Note On / Note Off
            </Button>
            

            <Title order={2}>Utility</Title>
            <Button onClick={handleAllNotesOff}>
              All Notes Off
            </Button>
            
            
          </Stack>

        </Group>
      </Tabs.Panel>

      <Tabs.Panel value="performance">
        <Group justify='flex-start' align='top' gap='xl' grow={true}>
          <Stack>
            <Title order={2}>Performance Parameters</Title>

            <DXERadioGroup
              title="Voice mode"
              options={{ "Poly": 0, "Mono": 1 }}
              selectedValue={perfParams.monoMode}
              onValueChanged={(v) => handlePerformanceParamChanged('monoMode', v)} />
            
            {/* <h3>Pitch Bend</h3> */}
            <Title order={3}>Pitch Bend</Title>
            <DXESlider
              title="Range"
              selectedValue={perfParams.pitchBendRange}
              maxValue={12}
              onValueChanged={(v) => handlePerformanceParamChanged('pitchBendRange', v)}
              valueFormatter={formatSemitones} />
            <DXESlider
              title="Step"
              selectedValue={perfParams.pitchBendStep}
              maxValue={12}
              onValueChanged={(v) => handlePerformanceParamChanged('pitchBendStep', v)} />

            {/* <h3>Portamento</h3> */}
            <Title order={3}>Portamento</Title>
            <DXESlider
              title="Time"
              selectedValue={perfParams.portamentoTime}
              maxValue={99}
              onValueChanged={(v) => handlePerformanceParamChanged('portamentoTime', v)} />
            <DXERadioGroup
              title='Mode'
              options={{'Retain': 0, 'Follow': 1}}
              selectedValue={perfParams.portamentoMode}
              onValueChanged={(v) => handlePerformanceParamChanged('portamentoMode', v)} />
            <DXERadioGroup
              title='Glissando'
              options={{'Off': 0, 'On': 1}}
              selectedValue={perfParams.glissando}
              onValueChanged={(v) => handlePerformanceParamChanged('glissando', v)} />
          </Stack>

          <Stack>
            <DXEPerformanceControlEditor
              title="Mod Wheel"
              rangeValue={perfParams.modWheelRange}
              onRangeChanged={(v) => handlePerformanceParamChanged('modWheelRange', v)}
              assignValue={perfParams.modWheelAssign}
              onAssignChanged={(v) => handlePerformanceParamChanged('modWheelAssign', v)} />
            <DXEPerformanceControlEditor
              title="Aftertouch"
              rangeValue={perfParams.aftertouchRange}
              onRangeChanged={(v) => handlePerformanceParamChanged('aftertouchRange', v)}
              assignValue={perfParams.aftertouchAssign}
              onAssignChanged={(v) => handlePerformanceParamChanged('aftertouchAssign', v)} />
            <DXEPerformanceControlEditor
              title="Foot Control"
              rangeValue={perfParams.footControlRange}
              onRangeChanged={(v) => handlePerformanceParamChanged('footControlRange', v)}
              assignValue={perfParams.footControlAssign}
              onAssignChanged={(v) => handlePerformanceParamChanged('footControlAssign', v)} />
            <DXEPerformanceControlEditor
              title="Breath Control"
              rangeValue={perfParams.breathControlRange}
              onRangeChanged={(v) => handlePerformanceParamChanged('breathControlRange', v)}
              assignValue={perfParams.breathControlAssign}
              onAssignChanged={(v) => handlePerformanceParamChanged('breathControlAssign', v)} />
          </Stack>
        </Group>
      </Tabs.Panel>

      <Tabs.Panel value="edit">

        
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
                value={voiceParams.getVoiceName()}
                placeholder="max 10 chars"
                maxLength={10}
                style={{width:'10rem'}}
                onChange={(e) => {handleUpdateVoiceName(e.currentTarget.value)}} />
            </Group>
            
            <Space h='md'/>

            <DXESlider
              title="Algorithm"
              selectedValue={voiceParams.getValue('Algorithm')}
              maxValue={31}
              onValueChanged={(v) => handleVoiceParamChanged('Algorithm', v)}
              valueFormatter={formatAlgorithm} />
            <DXESlider
              title="Feedback"
              selectedValue={voiceParams.getValue('Feedback')}
              maxValue={7}
              onValueChanged={(v) => handleVoiceParamChanged('Feedback', v)} />
            <DXERadioGroup
              title="Osc Sync"
              options={{ "Off": 0, "On": 1 }}
              selectedValue={voiceParams.getValue('Oscillator Sync')}
              onValueChanged={(v) => handleVoiceParamChanged('Oscillator Sync', v)} />

            <Title order={3}>LFO</Title>
            <DXESlider
              title="Speed"
              selectedValue={voiceParams.getValue('LFO Speed')}
              maxValue={99}
              onValueChanged={(v) => handleVoiceParamChanged('LFO Speed', v)} />
            <DXESlider
              title="Delay"
              selectedValue={voiceParams.getValue('LFO Delay')}
              maxValue={99}
              onValueChanged={(v) => handleVoiceParamChanged('LFO Delay', v)} />
            <DXESlider
              title="Pitch mod"
              selectedValue={voiceParams.getValue('LFO Pitch Mod Depth')}
              maxValue={99}
              onValueChanged={(v) => handleVoiceParamChanged('LFO Pitch Mod Depth', v)} />
            <DXESlider
              title="Amp mod"
              selectedValue={voiceParams.getValue('LFO Amp Mod Depth')}
              maxValue={99}
              onValueChanged={(v) => handleVoiceParamChanged('LFO Amp Mod Depth', v)} />
            <DXERadioGroup
              title="Sync"
              options={{ "Off": 0, "On": 1 }}
              selectedValue={voiceParams.getValue('LFO Sync')}
              onValueChanged={(v) => handleVoiceParamChanged('LFO Sync', v)} />
            <DXERadioGroup
              title="Wave"
              options={{ "Tri": 0, "Saw Dn": 1, "Saw Up": 2, "Square": 3, "Sine": 4, "S&H": 5 }}
              selectedValue={voiceParams.getValue('LFO Waveform')}
              onValueChanged={(v) => handleVoiceParamChanged('LFO Waveform', v)} />
            
            <br/>
            <DXESlider
              title="Pitch mod sens"
              selectedValue={voiceParams.getValue('Pitch Mod Sensitivity')}
              maxValue={7}
              onValueChanged={(v) => handleVoiceParamChanged('Pitch Mod Sensitivity', v)} />
            <DXESlider
              title="Transpose"
              selectedValue={voiceParams.getValue('Transpose')}
              maxValue={48}
              onValueChanged={(v) => handleVoiceParamChanged('Transpose', v)}
              valueFormatter={formatTranspose} />

            <DXEEnvelopeEditor title="Pitch Envelope"
              data={voiceParams}
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
                  label={'OP'+(i+1)}
                  checked={currentOp === o} 
                  onChange={() => setCurrentOp(o as opNumber)} />
              );
            })}
            </Group>
            
            <DXEOpEditor op={currentOp} data={voiceParams}
              onValueChanged={handleVoiceParamChanged} />
          </Stack>

        </Group>
      </Tabs.Panel>

    </Tabs>

    </MantineProvider>
  );


  ///// UI Event handlers

  async function handleMidiInChanged(portName: string|null) {
    console.log("App: handleMidiInChanged(): " + portName);
    midi.current.useMidiIn(portName);
    setMidiIn(portName);
    prefs.current.setPrefs('midiIn', portName);
  }

  async function handleMidiOutChanged(portName: string|null) {
    console.log("App: handleMidiOutChanged(): " + portName);
    midi.current.useMidiOut(portName);
    setMidiOut(portName);
    prefs.current.setPrefs('midiOut', portName);
  }

  async function handleControllerInChanged(portName: string|null) {
    console.log("App: handleControllerInChanged(): " + portName);
    midi.current.useControllerIn(portName);
    setControllerIn(portName);
    prefs.current.setPrefs('controllerIn', portName);
  }

  function handleInitVoice() {
    setVoiceParams(new VoiceParamData()); // defaults to init voice
  }

  function handleSendAll() {
    const sysexData = formatOneVoiceBulkSysex(voiceParams, midiChannel);
    midi.current.sendMessage(sysexData);
  }

  // For testing

  function handleSendNoteOnOff() {
    console.log("App: handleSendNoteOnOff()");
    if (midi.current) {
      console.log("Sending Note On...");
      midi.current.sendMessage([0x90 + midiChannel, 60, 70]);
      setTimeout(() => {
        console.log("Sending Note Off...");
        midi.current.sendMessage([0x80 + midiChannel, 60, 0]);
      }, 1000); // Send Note Off after 1 second
    }
  }

  function handleAllNotesOff() {
    if (midi.current) {
      console.log("Sending All Notes Off...");
      midi.current.sendMessage(formatAllNotesOff(midiChannel)); 
    }
  }

  function handleUpdateVoiceName(voiceName: string) {
    console.log("App: handleUpdatePatchName(): " + voiceName);
    let newVoiceParams = voiceParams.setVoiceName(voiceName);
    setVoiceParams(newVoiceParams);
    const sysexData = formatVoiceNameChangeSysex(newVoiceParams, midiChannel);
    midi.current.sendMessage(sysexData);
  }

  function handlePerformanceParamChanged(
    parameter: performanceParam,
    value: number)
  {
    console.log(`App: handlePerformanceParamChanged(): ${parameter} ${value}`);
    let paramNumber = performanceParamSpecs[parameter].paramNumber;
    sendParameterChangeSysex('function', paramNumber, value);
    let newParams = {...perfParams};
    newParams[parameter] = value;
    setPerfParams(newParams)
  }

  function handleVoiceParamChanged(
    parameter: voiceParam | number,
    value: number)
  {
    console.log(`App: handleVoiceParamChanged(): ${parameter} ${value}`);
    let offset: number = typeof parameter === 'number' ?
      parameter : voiceParamSpecs[parameter].offset;
    sendParameterChangeSysex('voice', offset, value)
    setVoiceParams(voiceParams.setValueByOffset(offset, value));
  }


  function sendParameterChangeSysex(
    type: 'voice' | 'function',
    parameterNumber: number,
    parameterValue: number)
  {
    const sysexData = formatParameterChangeSysex(
      type, parameterNumber, parameterValue, midiChannel);
    midi.current.sendMessage(sysexData);
  }


  ///// MIDI event handlers

  function handleMidiIn(data: Uint8Array)
  {
    //console.log("Received: [" + toHexString(data) + "]");
    if (data.length === 0) return;

    if (data[0] === START_OF_SYSEX &&
      data.at(-1) === END_OF_SYSEX)
    {
      console.log(`Received sysex: ${data.length} bytes.`);
    }
  }

  //function handleControllerIn(data: Uint8Array)
  function handleControllerIn(_data: Uint8Array)
  {
    //console.log("Controller in: [" + toHexString(data) + "]");
  }


  ///// Helpers

  function updateMidiPorts()
  {
    console.log("App: updateMidiPorts()");
    setMidiInPortNames(midi.current.getInNames());
    setMidiOutPortNames(midi.current.getOutNames());
  }
}



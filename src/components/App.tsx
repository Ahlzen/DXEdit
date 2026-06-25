import '@mantine/core/styles.css';
import { createTheme, MantineProvider, Button, Stack, Group, TextInput, Tabs, Title } from '@mantine/core';
import { GearIcon, SlidersIcon, FadersHorizontalIcon, PianoKeysIcon, ImageIcon } from '@phosphor-icons/react';

import { useState, useRef, useEffect } from 'react';
import { Preferences } from '../preferences';
import './App.css';

// MIDI / DX7 sysex
import { WebMidi } from '../midi/webmidi'
import { type performanceParam, type performanceValues,
  performanceParamSpecs, getInitPerformanceParams } from '../midi/performanceParams.ts';
import { type voiceParam, type egType, type opNumber,
  voiceParamData, voiceParamSpecs, egTypeOffsets, 
  type voiceParamSpec} from '../midi/voiceParams';

// Components
import DXEMidiPortSelector from './DXEMidiPortSelector.tsx';
import DXERadioGroup from './DXERadioGroup.tsx';
import DXESlider from './DXESlider.tsx';
import DXEPerformanceControlEditor from './DXEPerformanceControlEditor.tsx';
import DXEOpEditor from './DXEOpEditor.tsx';
import DXEEnvelopeEditor from './DXEEnvelopeEditor.tsx';


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
    useState<voiceParamData>(new voiceParamData());
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
  function formatSemitones(n: number) : string { return `±${n} semi`; }
  function formatTranspose(n: number) : string {
    // DX7 shows as "MIDDLE C = C 3" (0=C1, 24=C3, 48=C5)
    const oct = Math.floor(n / 12) + 1;
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const note = notes[n%12];
    return `Mid C = ${note} ${oct}`;
  }
  function formatAlgorithm(n: number): string { return String(n+1); }

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
          </Stack>

          <Stack gap='lg' mt='lg'>
            <Title order={2}>MIDI Test</Title>
            <Button onClick={handleSendNoteOnOff}>
              Send Note On / Note Off
            </Button>
            <TextInput
              label="Patch Name"
              description="Max 10 characters supported on DX."
              placeholder="max 10 chars"
              onChange={(e) => {handleUpdatePatchName(e.currentTarget.value)}} />
          </Stack>

        </Group>
      </Tabs.Panel>

      <Tabs.Panel value="performance">
        <Group justify='flex-start' align='top' gap='xl' grow={true}>
          <Stack>
            <h2>Performance Parameters</h2>

            <DXERadioGroup
              title="Voice mode:"
              options={{ 0: "Poly", 1: "Mono" }}
              selectedValue={perfParams.monoMode}
              onValueChanged={(v) => handlePerformanceParamChanged('monoMode', v)} />
            
            {/* <h3>Pitch Bend</h3> */}
            <Title order={3}>Pitch Bend</Title>
            <DXESlider
              title="Range:"
              selectedValue={perfParams.pitchBendRange}
              maxValue={12}
              onValueChanged={(v) => handlePerformanceParamChanged('pitchBendRange', v)}
              valueFormatter={formatSemitones} />
            <DXESlider
              title="Step:"
              selectedValue={perfParams.pitchBendStep}
              maxValue={12}
              onValueChanged={(v) => handlePerformanceParamChanged('pitchBendStep', v)} />

            {/* <h3>Portamento</h3> */}
            <Title order={3}>Portamento</Title>
            <DXESlider
              title="Time:"
              selectedValue={perfParams.portamentoTime}
              maxValue={99}
              onValueChanged={(v) => handlePerformanceParamChanged('portamentoTime', v)} />
            <DXERadioGroup
              title='Mode:'
              options={{0: 'Retain', 1: 'Follow'}}
              selectedValue={perfParams.portamentoMode}
              onValueChanged={(v) => handlePerformanceParamChanged('portamentoMode', v)} />
            <DXERadioGroup
              title='Glissando:'
              options={{0: 'Off', 1: 'On'}}
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
        <h2>Voice Editor</h2>

        <div className="voiceEditor">

        <div className='commonEditor'>
          <h3>Common</h3>
          <DXESlider
            title="Algorithm:"
            selectedValue={voiceParams.getValue('Algorithm')}
            maxValue={31}
            onValueChanged={(v) => handleVoiceParamChanged('Algorithm', v)}
            valueFormatter={formatAlgorithm} />
          <DXESlider
            title="Feedback:"
            selectedValue={voiceParams.getValue('Feedback')}
            maxValue={7}
            onValueChanged={(v) => handleVoiceParamChanged('Feedback', v)} />
          <DXERadioGroup
            title="Osc Sync:"
            options={{ 0: "Off", 1: "On" }}
            selectedValue={voiceParams.getValue('Oscillator Sync')}
            onValueChanged={(v) => handleVoiceParamChanged('Oscillator Sync', v)} />

          <h3>LFO</h3>
          <DXESlider
            title="Speed:"
            selectedValue={voiceParams.getValue('LFO Speed')}
            maxValue={99}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Speed', v)} />
          <DXESlider
            title="Delay:"
            selectedValue={voiceParams.getValue('LFO Delay')}
            maxValue={99}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Delay', v)} />
          <DXESlider
            title="Pitch Mod:"
            selectedValue={voiceParams.getValue('LFO Pitch Mod Depth')}
            maxValue={99}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Pitch Mod Depth', v)} />
          <DXESlider
            title="Amp Mod:"
            selectedValue={voiceParams.getValue('LFO Amp Mod Depth')}
            maxValue={99}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Amp Mod Depth', v)} />
          <DXERadioGroup
            title="Sync:"
            options={{ 0: "Off", 1: "On" }}
            selectedValue={voiceParams.getValue('LFO Sync')}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Sync', v)} />
          <DXERadioGroup
            title="Wave:"
            options={{ 0: "Tri", 1: "Saw Dn", 2: "Saw Up", 3: "Square", 4: "Sine", 5: "S&H" }}
            selectedValue={voiceParams.getValue('LFO Waveform')}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Waveform', v)} />
          
          <br/>
          <DXESlider
            title="Pitch Mod Sens:"
            selectedValue={voiceParams.getValue('Pitch Mod Sensitivity')}
            maxValue={7}
            onValueChanged={(v) => handleVoiceParamChanged('Pitch Mod Sensitivity', v)} />
          <DXESlider
            title="Transpose:"
            selectedValue={voiceParams.getValue('Transpose')}
            maxValue={48}
            onValueChanged={(v) => handleVoiceParamChanged('Transpose', v)}
            valueFormatter={formatTranspose} />

          <DXEEnvelopeEditor title="Pitch Envelope"
            data={voiceParams}
            eg='pitch'
            onValueChanged={handleVoiceParamChanged} />
        </div>

        <div className='opsEditor'>

          <div className="opSelectors">
            {['op1','op2','op3','op4','op5','op6'].map(function (o,i) {
              return (
                <div style={{display:'inline-block', marginBottom:'0.6em'}}>
                  <label key={o}>
                  <input type="radio" value={o} name="op"
                    defaultChecked={currentOp === o} 
                    onChange={() => setCurrentOp(o as opNumber)}/>
                  OP{i+1}
                  </label>
                </div>
              );
            })}
            </div>
            
            <DXEOpEditor op={currentOp} data={voiceParams}
              onValueChanged={handleVoiceParamChanged} />
          </div>

        </div>
      </Tabs.Panel>



    
{/* 
    <fieldset className="panel">
      <legend>Performance Parameters</legend>
      <RadioGroup
        title="Voice mode:"
        options={{ 0: "Poly", 1: "Mono" }}
        selectedValue={perfParams.monoMode}
        onValueChanged={(v) => handlePerformanceParamChanged('monoMode', v)} />
      
      <h3>Pitch Bend</h3>
      <DXESlider
        title="Range:"
        selectedValue={perfParams.pitchBendRange}
        maxValue={12}
        onValueChanged={(v) => handlePerformanceParamChanged('pitchBendRange', v)}
        valueFormatter={formatSemitones} />
      <DXESlider
        title="Step:"
        selectedValue={perfParams.pitchBendStep}
        maxValue={12}
        onValueChanged={(v) => handlePerformanceParamChanged('pitchBendStep', v)} />

      <h3>Portamento</h3>
      <DXESlider
        title="Time:"
        selectedValue={perfParams.portamentoTime}
        maxValue={99}
        onValueChanged={(v) => handlePerformanceParamChanged('portamentoTime', v)} />
      <RadioGroup
        title='Mode:'
        options={{0: 'Retain', 1: 'Follow'}}
        selectedValue={perfParams.portamentoMode}
        onValueChanged={(v) => handlePerformanceParamChanged('portamentoMode', v)} />
      <RadioGroup
        title='Glissando:'
        options={{0: 'Off', 1: 'On'}}
        selectedValue={perfParams.glissando}
        onValueChanged={(v) => handlePerformanceParamChanged('glissando', v)} />

      <PerformanceControlEditor
        title="Mod Wheel"
        rangeValue={perfParams.modWheelRange}
        onRangeChanged={(v) => handlePerformanceParamChanged('modWheelRange', v)}
        assignValue={perfParams.modWheelAssign}
        onAssignChanged={(v) => handlePerformanceParamChanged('modWheelAssign', v)} />
      <PerformanceControlEditor
        title="Aftertouch"
        rangeValue={perfParams.aftertouchRange}
        onRangeChanged={(v) => handlePerformanceParamChanged('aftertouchRange', v)}
        assignValue={perfParams.aftertouchAssign}
        onAssignChanged={(v) => handlePerformanceParamChanged('aftertouchAssign', v)} />
      <PerformanceControlEditor
        title="Foot Control"
        rangeValue={perfParams.footControlRange}
        onRangeChanged={(v) => handlePerformanceParamChanged('footControlRange', v)}
        assignValue={perfParams.footControlAssign}
        onAssignChanged={(v) => handlePerformanceParamChanged('footControlAssign', v)} />
      <PerformanceControlEditor
        title="Breath Control"
        rangeValue={perfParams.breathControlRange}
        onRangeChanged={(v) => handlePerformanceParamChanged('breathControlRange', v)}
        assignValue={perfParams.breathControlAssign}
        onAssignChanged={(v) => handlePerformanceParamChanged('breathControlAssign', v)} />
    </fieldset> */}
{/* 
    <fieldset className='panel'>
      <legend>Voice Parameters</legend>

      <div className="voiceEditor">

        <div className='commonEditor'>
          <h3>Common</h3>
          <DXESlider
            title="Algorithm:"
            selectedValue={voiceParams.getValue('Algorithm')}
            maxValue={31}
            onValueChanged={(v) => handleVoiceParamChanged('Algorithm', v)}
            valueFormatter={formatAlgorithm} />
          <DXESlider
            title="Feedback:"
            selectedValue={voiceParams.getValue('Feedback')}
            maxValue={7}
            onValueChanged={(v) => handleVoiceParamChanged('Feedback', v)} />
          <RadioGroup
            title="Osc Sync:"
            options={{ 0: "Off", 1: "On" }}
            selectedValue={voiceParams.getValue('Oscillator Sync')}
            onValueChanged={(v) => handleVoiceParamChanged('Oscillator Sync', v)} />

          <h3>LFO</h3>
          <DXESlider
            title="Speed:"
            selectedValue={voiceParams.getValue('LFO Speed')}
            maxValue={99}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Speed', v)} />
          <DXESlider
            title="Delay:"
            selectedValue={voiceParams.getValue('LFO Delay')}
            maxValue={99}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Delay', v)} />
          <DXESlider
            title="Pitch Mod:"
            selectedValue={voiceParams.getValue('LFO Pitch Mod Depth')}
            maxValue={99}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Pitch Mod Depth', v)} />
          <DXESlider
            title="Amp Mod:"
            selectedValue={voiceParams.getValue('LFO Amp Mod Depth')}
            maxValue={99}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Amp Mod Depth', v)} />
          <RadioGroup
            title="Sync:"
            options={{ 0: "Off", 1: "On" }}
            selectedValue={voiceParams.getValue('LFO Sync')}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Sync', v)} />
          <RadioGroup
            title="Wave:"
            options={{ 0: "Tri", 1: "Saw Dn", 2: "Saw Up", 3: "Square", 4: "Sine", 5: "S&H" }}
            selectedValue={voiceParams.getValue('LFO Waveform')}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Waveform', v)} />
          
          <br/>
          <DXESlider
            title="Pitch Mod Sens:"
            selectedValue={voiceParams.getValue('Pitch Mod Sensitivity')}
            maxValue={7}
            onValueChanged={(v) => handleVoiceParamChanged('Pitch Mod Sensitivity', v)} />
          <DXESlider
            title="Transpose:"
            selectedValue={voiceParams.getValue('Transpose')}
            maxValue={48}
            onValueChanged={(v) => handleVoiceParamChanged('Transpose', v)}
            valueFormatter={formatTranspose} />

          <EnvelopeEditor title="Pitch Envelope"
            data={voiceParams}
            eg='pitch'
            onValueChanged={handleVoiceParamChanged} />
        </div>

        <div className='opsEditor'>

        <div className="opSelectors">
          {['op1','op2','op3','op4','op5','op6'].map(function (o,i) {
            return (
              <div style={{display:'inline-block', marginBottom:'0.6em'}}>
                <label key={o}>
                <input type="radio" value={o} name="op"
                  defaultChecked={currentOp === o} 
                  onChange={() => setCurrentOp(o as opNumber)}/>
                OP{i+1}
                </label>
              </div>
            );
          })}
          </div>
          
          <OpEditor op={currentOp} data={voiceParams}
            onValueChanged={handleVoiceParamChanged} />
        </div>

      </div>
    </fieldset> */}


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

  function handleUpdatePatchName(patchName: string) {
    console.log("App: handleUpdatePatchName()");
    patchName = patchName.toUpperCase(); // TODO: Verify valid chars for DX7
    const patchNameBytes = Array
      .from(patchName)
      .map(char => char.charCodeAt(0));
    for (let i = 0; i < 10; i++) {
      let ascii = patchNameBytes[i] || 32;
      // DX7 Parameter Change sysex
      // Parameter # 145-154 are Voice Name Char 1-10
      const sysexMessage = [
        midi.current.START_OF_SYSEX, 
        midi.current.YAMAHA_MANUFACTURER_ID,
        midi.current.SUB_STATUS_PARAMETER + midiChannel,
        midi.current.PARAMETER_GROUP_VOICE + 0x01, // parameter bit 8
        17+i, // parameter bit 7..1: 145-128=17
        ascii, // ASCII char
        midi.current.END_OF_SYSEX];
      midi.current.sendMessage(sysexMessage);
    }      
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
    const sysexData = [
      midi.current.START_OF_SYSEX, 
      midi.current.YAMAHA_MANUFACTURER_ID,
      midi.current.SUB_STATUS_PARAMETER + midiChannel,
      // Parameter group# + high bit of parameter number
      (type === 'voice' ? 
        midi.current.PARAMETER_GROUP_VOICE :
        midi.current.PARAMETER_GROUP_FUNCTION) +
        (parameterNumber > 127 ? 1 : 0),
      // parameter number (remaining bits)
      parameterNumber & 127,
      parameterValue,
      midi.current.END_OF_SYSEX];
    midi.current.sendMessage(sysexData);
  }


  ///// MIDI event handlers

  function handleMidiIn(data: Uint8Array)
  {
    //console.log("Received: [" + toHexString(data) + "]");
    if (data.length === 0) return;

    if (data[0] === midi.current.START_OF_SYSEX &&
      data.at(-1) === midi.current.END_OF_SYSEX)
    {
      console.log(`Received sysex: ${data.length} bytes.`);
    }
  }

  function handleControllerIn(data: Uint8Array)
  {
    //console.log("Received (c): [" + toHexString(data) + "]");
  }


  ///// Helpers

  function updateMidiPorts()
  {
    console.log("App: updateMidiPorts()");
    setMidiInPortNames(midi.current.getInNames());
    setMidiOutPortNames(midi.current.getOutNames());
  }
}



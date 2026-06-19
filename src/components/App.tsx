import { useState, useRef, useEffect } from 'react';
import { Preferences } from '../preferences';
import './App.css';

// MIDI / DX7 sysex
import { WebMidi } from '../midi/webmidi'
import type { performanceParam, performanceValues } from '../midi/performanceParams.ts'
import { performanceParamSpecs } from '../midi/performanceParams.ts';
import type { voiceParam, voiceParamSpec, egType, opNumber } from '../midi/voiceParams';
import { voiceParamData, voiceParamSpecs, egTypeOffsets, opOffsets } from '../midi/voiceParams';

// components
import MidiPortSelector from './MidiPortSelector.tsx';
import RadioGroup from './RadioGroup.tsx';
import Slider from './Slider.tsx';
import PerformanceControlEditor from './PerformanceControlEditor.tsx';
import EnvelopeEditor from './EnvelopeEditor.tsx';
import OpEditor from './OpEditor.tsx';


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
  const [perfParams, setPerfParams] = useState<performanceValues>({
    'monoMode': 0,
    'pitchBendRange': 2,
    'pitchBendStep': 0,
    'portamentoTime': 0,
    'portamentoMode': 0,
    'glissando': 0,
    'modWheelRange': 0,
    'modWheelAssign': 0,
    'aftertouchRange': 0,
    'aftertouchAssign': 0,
    'footControlRange': 0,
    'footControlAssign': 0,
    'breathControlRange': 0,
    'breathControlAssign': 0,
  });
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

  return (
    <>
    <h1>DX/TX Editor</h1>
    <fieldset className="panel">
      <legend>Config</legend>
      <MidiPortSelector
        title="DX7 MIDI Input:"
        portNames={midiInPortNames}
        selectedPortName={midiIn}
        onPortChanged={handleMidiInChanged} />
      <MidiPortSelector 
        title="DX7 MIDI Output:"
        portNames={midiOutPortNames}
        selectedPortName={midiOut}
        onPortChanged={handleMidiOutChanged} />
      <MidiPortSelector
        title="Controller Input (optional):"
        portNames={midiInPortNames}
        selectedPortName={controllerIn}
        onPortChanged={handleControllerInChanged} />
    </fieldset>

    <fieldset className="panel">
      <legend>MIDI Test</legend>
      <button onClick={handleSendNoteOnOff}>
        Send Note On / Note Off
      </button>
      <br/> 
      <label>Patch name:
        <input type="text"
          maxLength={10}
          placeholder="max 10 chars"
          onChange={(e) => {handleUpdatePatchName(e.target.value)}} />
      </label>
    </fieldset>

    <fieldset className="panel">
      <legend>Performance Parameters</legend>
      <RadioGroup
        title="Voice mode:"
        options={{ 0: "Poly", 1: "Mono" }}
        selectedValue={perfParams.monoMode}
        onValueChanged={(v) => handlePerformanceParamChanged('monoMode', v)} />
      
      <h3>Pitch Bend</h3>
      <Slider
        title="Range:"
        selectedValue={perfParams.pitchBendRange}
        maxValue={12}
        onValueChanged={(v) => handlePerformanceParamChanged('pitchBendRange', v)} />
      <Slider
        title="Step:"
        selectedValue={perfParams.pitchBendStep}
        maxValue={12}
        onValueChanged={(v) => handlePerformanceParamChanged('pitchBendStep', v)} />

      <h3>Portamento</h3>
      <Slider
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
    </fieldset>

    <fieldset className='panel'>
      <legend>Voice Parameters</legend>

      <div className="opSelectors">
      {['op1','op2','op3','op4','op5','op6'].map(function (o,i) {
        return (
          <label key={o}>
          <input type="radio" value={o} name="op"
            defaultChecked={currentOp === o} 
            onChange={() => setCurrentOp(o as opNumber)}/>
          OP{i+1}
        </label>
        );
      })}
      </div>

      <div className="voiceEditor">

        <div className='opsEditor'>
          
          <OpEditor op={currentOp} data={voiceParams}
            onValueChanged={handleOpParamChanged} />
        </div>

        <div className='commonEditor'>
          <h3>Common</h3>
          <Slider
            title="Algorithm:"
            selectedValue={voiceParams.getValue('Algorithm')}
            maxValue={31}
            onValueChanged={(v) => handleVoiceParamChanged('Algorithm', v)} />
          <Slider
            title="Feedback:"
            selectedValue={voiceParams.getValue('Feedback')}
            maxValue={7}
            onValueChanged={(v) => handleVoiceParamChanged('Feedback', v)} />
          <RadioGroup
            title="Osc Sync:"
            options={{ 0: "Off", 1: "On" }}
            selectedValue={voiceParams.getValue('Oscillator Sync')}
            onValueChanged={(v) => handleVoiceParamChanged('Oscillator Sync', v)} />
          <Slider
            title="LFO Speed:"
            selectedValue={voiceParams.getValue('LFO Speed')}
            maxValue={99}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Speed', v)} />
          <Slider
            title="LFO Delay:"
            selectedValue={voiceParams.getValue('LFO Delay')}
            maxValue={99}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Delay', v)} />
          <Slider
            title="LFO Pitch Mod:"
            selectedValue={voiceParams.getValue('LFO Pitch Mod Depth')}
            maxValue={99}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Pitch Mod Depth', v)} />
          <Slider
            title="LFO Amp Mod:"
            selectedValue={voiceParams.getValue('LFO Amp Mod Depth')}
            maxValue={99}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Amp Mod Depth', v)} />
          <RadioGroup
            title="LFO Sync:"
            options={{ 0: "Off", 1: "On" }}
            selectedValue={voiceParams.getValue('LFO Sync')}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Sync', v)} />
          <RadioGroup
            title="LFO Wave:"
            options={{ 0: "Tri", 1: "Saw Dn", 2: "Saw Up", 3: "Square", 4: "Sine", 5: "S&H" }}
            selectedValue={voiceParams.getValue('LFO Waveform')}
            onValueChanged={(v) => handleVoiceParamChanged('LFO Waveform', v)} />
          <Slider
            title="Pitch Mod Sens:"
            selectedValue={voiceParams.getValue('Pitch Mod Sensitivity')}
            maxValue={7}
            onValueChanged={(v) => handleVoiceParamChanged('Pitch Mod Sensitivity', v)} />
          <Slider
            title="Transpose:"
            selectedValue={voiceParams.getValue('Transpose')}
            maxValue={99}
            onValueChanged={(v) => handleVoiceParamChanged('Transpose', v)} />
        </div>

      </div>
    </fieldset>
    </>
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
    parameter: voiceParam,
    value: number)
  {
    console.log(`App: handleVoiceParamChanged(): ${parameter} ${value}`);
    let offset = voiceParamSpecs[parameter].offset;
    sendParameterChangeSysex('voice', offset, value)
    setVoiceParams(voiceParams.setValue(parameter, value));
  }

  function handleEgParamChanged(
    envelope: egType,
    offset: number,
    value: number)
  {
    // send sysex
    let egOffset = egTypeOffsets[envelope];
    let parameterNumber = egOffset + offset;
    sendParameterChangeSysex('voice', parameterNumber, value);

    // update state
    let egData = voiceParams.getEgData(envelope);
    egData[offset] = value;
    let newVoiceParams = voiceParams.setEgData(envelope, egData);
    setVoiceParams(newVoiceParams);
  }

  function handleOpParamChanged(offset: number, value: number) {
    sendParameterChangeSysex('voice', offset, value);
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



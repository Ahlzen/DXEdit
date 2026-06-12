import { useState, useRef, useEffect } from 'react';
import './App.css';

// MIDI
//import midi from '../midi/midi.js';
import { WebMidi } from '../midi/webmidi'
import { setPrefs, getPrefs } from '../util.js';

import type { performanceParam, performanceValues } from '../midi/DX7performanceParams.ts'
import { performanceParamSpecs } from '../midi/DX7performanceParams.ts';

// components
import MidiPortSelector from './MidiPortSelector.tsx';
import RadioGroup from './RadioGroup.tsx';
import Slider from './Slider.tsx';
import PerformanceControlEditor from './PerformanceControlEditor.tsx';


export default function App()
{
  //const midiRef = useRef<typeof midi | null>(null);
  const midi = useRef<WebMidi>(new WebMidi());

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

  useEffect(() => {
    console.log("App: useEffect()");
    if (!midi.current.isInitialized) {
      midi.current.initialize(true,
        () => {
          midi.current.listPortsToConsole();
          updateMidiPorts();
          if (getPrefs('midiIn')) {
            handleMidiInChanged(getPrefs('midiIn'));
          }
          if (getPrefs('midiOut')) {
            handleMidiOutChanged(getPrefs('midiOut'));
          }
          if (getPrefs('controllerIn')) {
            handleControllerInChanged(getPrefs('controllerIn'));
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
        minValue={0}
        maxValue={12}
        onValueChanged={(v) => handlePerformanceParamChanged('pitchBendRange', v)} />
      <Slider
        title="Step:"
        selectedValue={perfParams.pitchBendStep}
        minValue={0}
        maxValue={12}
        onValueChanged={(v) => handlePerformanceParamChanged('pitchBendStep', v)} />

      <h3>Portamento</h3>
      <Slider
        title="Time:"
        selectedValue={perfParams.portamentoTime}
        minValue={0}
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
    </>
  );


  // Event handlers

  async function handleMidiInChanged(portName: string|null) {
    console.log("App: handleMidiInChanged(): " + portName);
    midi.current.useMidiIn(portName);
    setMidiIn(portName);
    setPrefs('midiIn', portName);
  }

  async function handleMidiOutChanged(portName: string|null) {
    console.log("App: handleMidiOutChanged(): " + portName);
    midi.current.useMidiOut(portName);
    setMidiOut(portName);
    setPrefs('midiOut', portName);
  }

  async function handleControllerInChanged(portName: string|null) {
    console.log("App: handleControllerInChanged(): " + portName);
    midi.current.useControllerIn(portName);
    setControllerIn(portName);
    setPrefs('controllerIn', portName);
  }

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
    let paramSpec = performanceParamSpecs[parameter];
    sendFunctionParameterChangeSysex(
      paramSpec.paramNumber, value,
      paramSpec.minValue, paramSpec.maxValue);   
    let newParams = {...perfParams};
    newParams[parameter] = value;
    setPerfParams(newParams)
  }


  function sendFunctionParameterChangeSysex(
    parameterNumber: number,
    parameterValue: number,
    minAllowedValue: number,
    maxAllowedValue: number)
  {
    if (parameterNumber < 64 || parameterNumber > 77) {
      console.log("Invalid parameter number: " + parameterNumber);
      return;
    }
    if (parameterValue < minAllowedValue || parameterValue > maxAllowedValue) {
      console.log(`Invalid parameter value: {parameterValue} (allowed: {minAllowedValue} {maxAllowedValue})`);
      return;
    }
    const sysexData = [
      midi.current.START_OF_SYSEX, 
      midi.current.YAMAHA_MANUFACTURER_ID,
      midi.current.SUB_STATUS_PARAMETER + midiChannel,
      midi.current.PARAMETER_GROUP_FUNCTION,
      parameterNumber,
      parameterValue,
      midi.current.END_OF_SYSEX];
    midi.current.sendMessage(sysexData);
  }


  // Helpers

  function updateMidiPorts()
  {
    console.log("App: updateMidiPorts()");
    setMidiInPortNames(midi.current.getInNames());
    setMidiOutPortNames(midi.current.getOutNames());
  }
}



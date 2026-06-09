import { useState, useRef, useEffect } from 'react';
import './App.css';

// MIDI
import midi from '../midi/midi.js';
import type { DX7performanceParams } from '../midi/DX7performanceParams.ts';

// components
import MidiPortSelector from './MidiPortSelector.tsx';
import RadioGroup from './RadioGroup.tsx';
import Slider from './Slider.tsx';
import CheckBoxGroup from './CheckBoxGroup.tsx';

type performanceControl = 'modWheel' | 'footControl' | 'breathControl' | 'aftertouch';

export default function App()
{
  const midiRef = useRef<typeof midi | null>(null);

  // MIDI configuration state
  const [midiInPortNames, setMidiInPortNames] = useState<string[]>([]);
  const [midiOutPortNames, setMidiOutPortNames] = useState<string[]>([]);

  const [midiIn, setMidiIn] = useState<string|null>(null);
  const [midiOut, setMidiOut] = useState<string|null>(null);
  const [controllerIn, setControllerIn] = useState<string|null>(null);

  const [midiChannel, setMidiChannel] = useState<number>(0);

  // Editor state
  const [perfParams, setPerfParams] = useState<DX7performanceParams>({
    monoMode: 0,
    pitchBendRange: 2,
    pitchBendStep: 0,
    portamentoTime: 0,
    portamentoMode: 0,
    glissando: 0,
    modWheelRange: 0,
    modWheelAssign: 0,
    aftertouchRange: 0,
    aftertouchAssign: 0,
    footControlRange: 0,
    footControlAssign: 0,
    breathControlRange: 0,
    breathControlAssign: 0,
  });

  
  useEffect(() => {
    console.log("App: useEffect()");
    if (midiRef.current === null)
    {
      // need to initialize WebMIDI
      console.log("App: useEffect(): Initializing MIDI...");
      midi.initialize(() => {
        midiRef.current = midi;
        midi.listPorts();
        updateMidiPorts();
      }, (error: any) => {
        console.error("Failed to initialize MIDI: " + error);
      });
    }
    // no need for cleanup
  });


  return (
    <>
    <div className="App">
      <h1>DX Editor</h1>
    </div>
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
        onValueChanged={handleVoiceModeChanged} />
      
      <h3>Pitch Bend</h3>
      <Slider
        title="Range:"
        selectedValue={perfParams.pitchBendRange}
        minValue={0}
        maxValue={12}
        onValueChanged={handlePitchBendRangeChanged}/>
      <Slider
        title="Step:"
        selectedValue={perfParams.pitchBendStep}
        minValue={0}
        maxValue={12}
        onValueChanged={handlePitchBendStepChanged}/>

      <h3>Portamento</h3>
      <Slider
        title="Time:"
        selectedValue={perfParams.portamentoTime}
        minValue={0}
        maxValue={99}
        onValueChanged={handlePortamentoTimeChanged}/>
      <RadioGroup
        title='Mode:'
        options={{0: 'Retain', 1: 'Follow'}}
        selectedValue={perfParams.portamentoTime}
        onValueChanged={handlePortamentoModeChanged} />
      <RadioGroup
        title='Glissando:'
        options={{0: 'Off', 1: 'On'}}
        selectedValue={perfParams.glissando}
        onValueChanged={handleGlissandoChanged} />


      <h3>Mod wheel</h3>
      <Slider
        title="Range:"
        selectedValue={perfParams.modWheelRange}
        minValue={0}
        maxValue={99}
        onValueChanged={(v) => handlePerformanceControlRangeChanged('modWheel', v)} />
      <CheckBoxGroup
        title="Assign:"
        options={{1: 'Pitch', 2: 'Amp', 4: 'EG Bias'}}
        selectedValue={perfParams.modWheelAssign}
        onValueChanged={(v) => handlePerformanceControlAssignChanged('modWheel', v)} />

      
    </fieldset>
    </>
  );


  // Event handlers

  async function handleMidiInChanged(portName: string|null) {
    console.log("App: handleMidiInChanged(): " + portName);
    midiRef.current?.useMidiIn(portName);
    setMidiIn(portName);   
  }

  async function handleMidiOutChanged(portName: string|null) {
    console.log("App: handleMidiOutChanged(): " + portName);
    midiRef.current?.useMidiOut(portName);
    setMidiOut(portName);
  }

  async function handleControllerInChanged(portName: string|null) {
    console.log("App: handleControllerInChanged(): " + portName);
    midiRef.current?.useControllerIn(portName);
    setControllerIn(portName);
  }

  function handleSendNoteOnOff() {
    console.log("App: handleSendNoteOnOff()");
    if (midiRef.current) {
      console.log("Sending Note On...");
      midiRef.current?.sendMessage([0x90, 60, 70]);
      setTimeout(() => {
        console.log("Sending Note Off...");
        midiRef.current?.sendMessage([0x80, 60, 0]);
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
        midi.START_OF_SYSEX, 
        midi.YAMAHA_MANUFACTURER_ID,
        midi.SUB_STATUS_PARAMETER + midiChannel,
        midi.PARAMETER_GROUP_VOICE + 0x01, // parameter bit 8
        17+i, // parameter bit 7..1: 145-128=17
        ascii, // ASCII char
        midi.END_OF_SYSEX];
      midiRef.current?.sendMessage(sysexMessage);
    }      
  }


  // Function (performance) parameters

  function handleVoiceModeChanged(value: number) {
    console.log("App: handleVoiceModeChanged(): " + value);
    sendFunctionParameterChangeSysex(64, value, 0, 1);
    setPerfParams({...perfParams, monoMode: value});
  }

  function handlePitchBendRangeChanged(value: number) {
    console.log("App: handlePitchBendRangeChanged(): " + value);
    sendFunctionParameterChangeSysex(65, value, 0, 12);
    setPerfParams({...perfParams, pitchBendRange: value});
  }
  function handlePitchBendStepChanged(value: number) {
    console.log("App: handlePitchBendStepChanged(): " + value);
    sendFunctionParameterChangeSysex(66, value, 0, 12);
    setPerfParams({...perfParams, pitchBendStep: value});
  }

  function handlePortamentoTimeChanged(value: number) {
    console.log("App: handlePortamentoTimeChanged(): " + value);
    sendFunctionParameterChangeSysex(69, value, 0, 99);
    setPerfParams({...perfParams, portamentoTime: value});
  }
  function handlePortamentoModeChanged(value: number) {
    console.log("App: handlePortamentoModeChanged(): " + value);
    sendFunctionParameterChangeSysex(67, value, 0, 1);
    setPerfParams({...perfParams, portamentoMode: value});
  }
  function handleGlissandoChanged(value: number) {
    console.log("App: handleGlissandoChanged(): " + value);
    sendFunctionParameterChangeSysex(68, value, 0, 1);
    setPerfParams({...perfParams, glissando: value});
  }

  function handlePerformanceControlRangeChanged(
    controlType: performanceControl, value: number) {
    console.log(`App: handlePerformanceControlRangeChanged(): ${controlType} ${value}`);
    sendFunctionParameterChangeSysex(
      getPerformanceControlParameterNumber(controlType),
      value, 0, 99);   
    switch (controlType) {
      case 'modWheel': setPerfParams({...perfParams, modWheelRange: value}); break;
      case 'footControl': setPerfParams({...perfParams, footControlRange: value}); break;
      case 'breathControl': setPerfParams({...perfParams, breathControlRange: value}); break;
      case 'aftertouch': setPerfParams({...perfParams, aftertouchRange: value}); break;
    }
  }
  function handlePerformanceControlAssignChanged(
    controlType: performanceControl, value: number)
  {
    console.log(`App: handlePerformanceControlAssignChanged(): ${controlType} ${value}`);
    sendFunctionParameterChangeSysex(
      getPerformanceControlParameterNumber(controlType)+1,
      value, 0, 7);
    switch (controlType) {
      case 'modWheel': setPerfParams({...perfParams, modWheelAssign: value}); break;
      case 'footControl': setPerfParams({...perfParams, footControlAssign: value}); break;
      case 'breathControl': setPerfParams({...perfParams, breathControlAssign: value}); break;
      case 'aftertouch': setPerfParams({...perfParams, aftertouchAssign: value}); break;
    }
  }
  function getPerformanceControlParameterNumber(
    controlType: performanceControl) : number
  {
    switch (controlType) {
      case 'modWheel': return 70;
      case 'footControl': return 72;
      case 'breathControl': return 74;
      case 'aftertouch': return 76;
    }
  }

  // based on: https://stackoverflow.com/questions/74526023/setting-object-property-by-string-name
  function setProperty<T extends object, K extends keyof T>(
    obj: T, key: K, val: T[K])
  {
    obj[key] = val;
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
      midi.START_OF_SYSEX, 
      midi.YAMAHA_MANUFACTURER_ID,
      midi.SUB_STATUS_PARAMETER + midiChannel,
      midi.PARAMETER_GROUP_FUNCTION,
      parameterNumber,
      parameterValue,
      midi.END_OF_SYSEX];
    midiRef.current?.sendMessage(sysexData);
  }


  // Helpers

  function updateMidiPorts()
  {
    console.log("App: updateMidiPorts()");
    setMidiInPortNames(midi.getInNames());
    setMidiOutPortNames(midi.getOutNames());
  }
}



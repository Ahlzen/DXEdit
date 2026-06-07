import { useState, useRef, useEffect } from 'react';
import './App.css';

import midi from '../midi/midi.js';
import MidiPortSelector from './MidiPortSelector.tsx';
import RadioGroup from './RadioGroup.tsx';

export default function App()
{
  // App state
  const [midiInPortNames, setMidiInPortNames] = useState<string[]>([]);
  const [midiOutPortNames, setMidiOutPortNames] = useState<string[]>([]);

  const [midiIn, setMidiIn] = useState<string|null>(null);
  const [midiOut, setMidiOut] = useState<string|null>(null);
  const [controllerIn, setControllerIn] = useState<string|null>(null);

  const [midiChannel, setMidiChannel] = useState<number>(0);

  const midiRef = useRef<typeof midi | null>(null);


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
          onChange={(e) => {
            const patchName = e.target.value;
            handleUpdatePatchName(patchName);
          }} />
      </label>
      {/* <button onClick={handleUpdatePatchName}>
        Update patch name
      </button> */}
    </fieldset>

    <fieldset className="panel">
      <legend>Performance Parameters</legend>
      <RadioGroup
        title="Voice mode:"
        options={{ 0: "Poly", 1: "Mono" }}
        selectedValue={1}
        onValueChanged={(value) => {handleVoiceModeChanged(value)}} />
      <br/>


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
    if (value !== 0 && value !== 1) return;
    const sysexMessage = [
      midi.START_OF_SYSEX, 
      midi.YAMAHA_MANUFACTURER_ID,
      midi.SUB_STATUS_PARAMETER + midiChannel,
      midi.PARAMETER_GROUP_FUNCTION,
      value,
      midi.END_OF_SYSEX];
    midiRef.current?.sendMessage(sysexMessage);
  }




  // Helpers

  function updateMidiPorts()
  {
    console.log("App: updateMidiPorts()");
    setMidiInPortNames(midi.getInNames());
    setMidiOutPortNames(midi.getOutNames());
  }
}



import { useState, useRef, useEffect } from 'react';
import './App.css';

import midi from '../midi/midi.js';
import MidiPortSelector from './MidiPortSelector.tsx';

export default function App()
{
  // App state
  const [midiInPortNames, setMidiInPortNames] = useState<string[]>([]);
  const [midiOutPortNames, setMidiOutPortNames] = useState<string[]>([]);

  const [midiIn, setMidiIn] = useState<string|null>(null);
  const [midiOut, setMidiOut] = useState<string|null>(null);
  const [controllerIn, setControllerIn] = useState<string|null>(null);

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
    if (midiRef.current) {
      patchName = patchName.toUpperCase(); // TODO: Verify valid chars for DX7
      const patchNameBytes = Array
        .from(patchName)
        .map(char => char.charCodeAt(0));
      for (let i = 0; i < 10; i++) {
        let ascii = patchNameBytes[i] || 32;
        // DX7 Parameter Change sysex
        // Parameter # 145-154 are Voice Name Char 1-10
        const sysexMessage = [0xF0, 
          0x43, // Yamaha ID
          0x10, // Sub-status 1, Channel 1
          0x01, // Parameter group 0 = voice, 1 = parameter bit 8
          17+i, // parameter low 7 bits: 145-128=17
          ascii, // ASCII char
          0xF7];
        midiRef.current?.sendMessage(sysexMessage);
      }      
    }
  }


  // Helpers

  function updateMidiPorts()
  {
    console.log("App: updateMidiPorts()");
    setMidiInPortNames(midi.getInNames());
    setMidiOutPortNames(midi.getOutNames());
  }
}



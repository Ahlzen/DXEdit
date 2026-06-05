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
    <div>
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
    </div>
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


  // Helpers

  function updateMidiPorts()
  {
    console.log("App: updateMidiPorts()");
    setMidiInPortNames(midi.getInNames());
    setMidiOutPortNames(midi.getOutNames());
  }
}



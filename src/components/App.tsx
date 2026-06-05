import { useState, useRef, useEffect } from 'react';
import './App.css';

import midi from '../midi/midi.js';
import MidiPortSelector from './MidiPortSelector.tsx';

export default function App()
{
  // App state
  const [midiInPortNames, setMidiInPortNames] = useState<string[]>([]);
  // const [midiOutPortNames, setMidiOutPortNames] = useState<string[]>([]);

  const [midiIn, setMidiIn] = useState<string|null>(null);
  // const [midiOut, setMidiOut] = useState<string|null>(null);
  // const [controllerIn, setControllerIn] = useState<string|null>(null);

  const midiRef = useRef<typeof midi | null>(null);


  useEffect(() => {
    console.log("App: useEffect()");

    if (midiRef.current === null)
    {
      console.log("App: useEffect(): Initializing MIDI...");
      midi.initialize(() => {
        midiRef.current = midi;
        midi.listPorts();
        updateMidiPorts();
      }, (error: any) => {
        console.error("Failed to initialize MIDI: " + error);
      });
    }

    // return () => {
    //   console.log("App: useEffect(): cleanup.");
    //   midi.shutdown();
    //   midiRef.current = null;
    // }
  });



  console.log("App called.");

  // midi.initialize(() => {    
  //   midi.listPorts();
  //   //updateMidiPorts();
  // });

  // Initialize MIDI

  // midi.initialize(() => {
  //   console.log("MIDI initialized successfully.");
  //   console.log("Available MIDI ports:");
  //   midi.listPorts();
  //   updateMidiPorts();
  // }, (error: any) => {
  //   console.error("Failed to initialize MIDI: " + error);
  // });


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
      {/* <MidiPortSelector 
        title="DX7 MIDI Output:"
        portNames={midiOutPortNames}
        selectedPortName={midiOut}
        onPortChanged={handleMidiOutChanged} />
      <MidiPortSelector 
        title="Controller Input (optional):"
        portNames={midiInPortNames}
        selectedPortName={controllerIn}
        onPortChanged={handleControllerInChanged} /> */}
    </div>
    </>
  );


  // Event handlers

  async function handleMidiInChanged(portName: string|null) {
    console.log("Setting MIDI in: " + portName);
    setMidiIn(portName);
    if (midiRef.current !== null) {
      midiRef.current.useMidiIn(portName);
    }
    
  }

  // async function handleMidiOutChanged() {
  //   //console.log("Setting MIDI out: " + midiOut);
  //   // setMidiOut(midiOut);
  //   // midi.useMidiIn(midiOut);
  // }

  // async function handleControllerInChanged() {
  //   //console.log("Setting MIDI controller in: " + controllerIn);
  //   // setControllerIn(controllerIn);
  //   // midi.useControllerIn(controllerIn);
  // }


  // helpers

  function updateMidiPorts()
  {
    console.log("App: updateMidiPorts()");
    setMidiInPortNames(midi.getInNames());
    //setMidiOutPortNames(midi.getOutNames());
  }
}



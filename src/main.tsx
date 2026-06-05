import { StrictMode } from 'react'
import { useState } from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import midi from './midi/midi.js';
import App from './components/App.tsx'


//const [midiInPortNames, setMidiInPortNames] = useState<string[]>([]);
// const [midiOutPortNames, setMidiOutPortNames] = useState<string[]>([]);

//Initialize MIDI

// midi.initialize(() => {
//   console.log("main: MIDI initialized.");
//   midi.listPorts();
//   updateMidiPorts();
// }, (error: any) => {
//   console.error("Failed to initialize MIDI: " + error);
// });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// handlers

// function updateMidiPorts()
// {
//   // console.log("Updating MIDI port lists...");
//   setMidiInPortNames(midi.getInNames());
//   // setMidiOutPortNames(midi.getOutNames());
// }
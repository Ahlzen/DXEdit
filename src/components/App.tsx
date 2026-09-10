import '@mantine/core/styles.css';
import { MantineProvider, Tabs } from '@mantine/core';
import { GearIcon, FadersHorizontalIcon, PianoKeysIcon } from '@phosphor-icons/react';
import { theme } from '../theme.tsx';

import { useState, useRef, useEffect } from 'react';
import { Preferences } from '../preferences';

import './App.css';

// MIDI / DX7 sysex
import { WebMidi } from '../midi/WebMidi.ts'
import { isSysexMessage } from '../midi/DX7.ts';
import { type performanceValues, getInitPerformanceParams } from '../midi/performanceParamData.ts';
import { VoiceData } from '../midi/VoiceData.ts';
import { VoiceEditor } from '../midi/VoiceEditor.ts';

// Components
import { DXEConfigEditor } from './DXEConfigEditor.tsx';
import { DEXPerformanceEditor } from './DXEPerformanceEditor.tsx';
import { DXEVoiceEditor } from './DXEVoiceEditor.tsx';

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

  // Other configuration state
  const [isTimeEgMode, setIsTimeEgMode] = useState<boolean>(
    prefs.current.getPrefs('isTimeEgMode') || false);

  // Editor state
  const [perfParams, setPerfParams] = useState<performanceValues>(
    getInitPerformanceParams());
  const [currentVoiceData, setCurrentVoiceData] = useState<VoiceData>(
    new VoiceData());

  const voiceEditor = useRef<VoiceEditor>(new VoiceEditor(
    0, undefined, handleSendMidi, handleNewVoiceData));

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


  ///// UI event handlers

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

  function handleEgModeChanged(isTimeEgMode: boolean) {
    setIsTimeEgMode(isTimeEgMode);
    prefs.current.setPrefs('isTimeEgMode', isTimeEgMode);
  }

  function handleMidiChannelChanged(channel: number) {
    setMidiChannel(channel);
    prefs.current.setPrefs('midiChannel', channel);
    voiceEditor.current.setMidiChannel(channel);
  }


  ///// Editor event handlers

  function handleNewVoiceData(rawData: Uint8Array) {
    console.log("App: handleNewVoiceData()");
    setCurrentVoiceData(new VoiceData(rawData));
  }


  ///// MIDI event handlers

  function handleSendMidi(data: Uint8Array) {
    midi.current.sendMessage(data);
  }

  function handleReceiveMidi(data: Uint8Array) {
    if (data.length === 0) return;
    if (isSysexMessage(data)) {
      console.log(`Received sysex: ${data.length} bytes.`);
    }
  }

  function handleMidiIn(data: Uint8Array) {
    handleReceiveMidi(data);
  }

  function handleControllerIn(data: Uint8Array) {
    handleReceiveMidi(data);
    midi.current.sendMessage(data);
  }


  ///// Helpers

  function updateMidiPorts() {
    console.log("App: updateMidiPorts()");
    setMidiInPortNames(midi.current.getInNames());
    setMidiOutPortNames(midi.current.getOutNames());
  }


  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme='dark'
      classNamesPrefix='mantine'>

    <title>DX Edit</title>

    <Tabs defaultValue="settings">

      <Tabs.List>
        <Tabs.Tab value="settings" leftSection={<GearIcon size={16} />}>
          Settings
        </Tabs.Tab>
        <Tabs.Tab value="performance" leftSection={<PianoKeysIcon size={16} />}>
          Performance Parameters
        </Tabs.Tab>
        <Tabs.Tab value="edit" leftSection={<FadersHorizontalIcon size={16} />}>
          Voice Editor
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="settings">
        <DXEConfigEditor
          midi={midi.current}
          prefs={prefs.current}
          midiInPortNames={midiInPortNames}
          midiOutPortNames={midiOutPortNames}
          midiIn={midiIn}
          midiOut={midiOut}
          controllerIn={controllerIn}
          midiChannel={midiChannel}
          isTimeEgMode={isTimeEgMode}
          onMidiInChanged={handleMidiInChanged}
          onMidiOutChanged={handleMidiOutChanged}
          onControllerInChanged={handleControllerInChanged}
          onMidiChannelChanged={handleMidiChannelChanged}
          onEgModeChanged={handleEgModeChanged}
          />
      </Tabs.Panel>

      <Tabs.Panel value="performance">
        <DEXPerformanceEditor
          midi={midi.current}
          midiChannel={midiChannel}
          perfParams={perfParams}
          onPerfParamsChanged={setPerfParams} />
      </Tabs.Panel>

      <Tabs.Panel value="edit">
        <DXEVoiceEditor
          isTimeEgMode={isTimeEgMode}
          data={currentVoiceData}
          editor={voiceEditor.current} />
      </Tabs.Panel>

    </Tabs>

    </MantineProvider>
  );
}



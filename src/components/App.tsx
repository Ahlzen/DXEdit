import '@mantine/core/styles.css';
import { MantineProvider, Tabs } from '@mantine/core';
import { GearIcon, FadersHorizontalIcon, PianoKeysIcon, FilesIcon } from '@phosphor-icons/react';
import { theme } from '../theme.tsx';

import { useState, useRef, useEffect } from 'react';
import { Preferences } from '../preferences';

import './App.css';

// MIDI / DX7 sysex
import { WebMidi } from '../midi/WebMidi.ts'
import { is32VoiceSysexMessage, isSingleVoiceSysexMessage, isSysexMessage } from '../midi/DX7.ts';
import { type performanceValues, getInitPerformanceParams } from '../midi/performanceParamData.ts';
import { VoiceData } from '../midi/VoiceData.ts';
import { VoiceEditor } from '../midi/VoiceEditor.ts';

// Components
import { DXEConfigEditor } from './DXEConfigEditor.tsx';
import { DEXPerformanceEditor } from './DXEPerformanceEditor.tsx';
import { DXEVoiceEditor } from './DXEVoiceEditor.tsx';
import { DXELibrarian } from './DXELibrarian.tsx';
import { VoiceBank } from '../midi/VoiceBank.ts';
import { addBankItem, addVoiceItem} from '../midi/database.ts';

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
  const [isTimeEgMode, setIsTimeEgMode] = useState<boolean>(
    prefs.current.getPrefs('isTimeEgMode') || false);
  const [perfParams, setPerfParams] = useState<performanceValues>(
    getInitPerformanceParams());
  const [currentVoiceData, setCurrentVoiceData] = useState<VoiceData>(
    new VoiceData());
  const voiceEditor = useRef<VoiceEditor>(new VoiceEditor(
    0, undefined, handleSendMidi, handleNewVoiceData));

  const [activeTab, setActiveTab] = useState<string|null>('settings');

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

  async function handleDroppedFiles(files: FileList) {
    console.log("handleDroppedFiles()");
    for (const file of Array.from(files)) {
      try {
        const rawData = new Uint8Array(await file.arrayBuffer());
        handleFileDropped(file.name || undefined, rawData);
      } catch (error) {
        console.error(`Could not read ${file.name}:`, error);
      }
    }
  }

  function handleFileDropped(filename: string | undefined, rawData: Uint8Array) {
    console.log(`Dropped file "${filename}", ${rawData.length} bytes.`);

    // remove any .syx or .sysex extension from filename
    if (filename) {
      filename = filename.replace(/\.syx|\.sysex$/i, '');
    }

    if (isSingleVoiceSysexMessage(rawData)) {
      console.log("single voice sysex dump");
      const voiceData = VoiceData.fromSysexData(rawData);
      addVoiceItem(voiceData);
    }
    else if (is32VoiceSysexMessage(rawData)) {
      console.log("32 voice sysex dump");
      const voiceBank = VoiceBank.fromSysexData(rawData, filename);
      addBankItem(voiceBank);
    }
  }


  ///// Editor event handlers

  function handleNewVoiceData(rawData: Uint8Array) {
    console.log("App: handleNewVoiceData()");
    setCurrentVoiceData(new VoiceData(rawData));
  }

  function handleVoiceEdit(voiceData: VoiceData) {
    console.log("App: handleVoiceEdit()");
    setCurrentVoiceData(voiceData);
    setActiveTab('edit');
  }

  function handleVoiceDownload(voiceData: VoiceData) {
    const sysexData: number[] = voiceData.toSysexData(midiChannel);
    const blob = new Blob([new Uint8Array(sysexData)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${voiceData.getVoiceName() || 'voice'}.syx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleBankSend(bankData: VoiceBank) {
    const sysexData: number[] = bankData.toSysexData(midiChannel);
    handleSendMidi(new Uint8Array(sysexData));
  }

  function handleBankDownload(bankData: VoiceBank) {
    const sysexData: number[] = bankData.toSysexData(midiChannel);
    const blob = new Blob([new Uint8Array(sysexData)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bankData.name || 'bank'}.syx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

    {/* Wrapper for file drop */}
    <div
      style={{minHeight: 'calc(100vh-2rem)'}}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes('Files')) {
          event.preventDefault();
        }
      }}
      onDrop={(event) => {
        if (event.dataTransfer.files.length === 0) return;
        event.preventDefault();
        void handleDroppedFiles(event.dataTransfer.files);
      }} >

    <Tabs value={activeTab} onChange={setActiveTab}>

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
        <Tabs.Tab value="librarian" leftSection={<FilesIcon size={16} />}>
          Librarian
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

      <Tabs.Panel value="librarian">
        <DXELibrarian
          midiChannel={midiChannel}
          sendMidiFunc={handleSendMidi}
          onVoiceEdit={handleVoiceEdit}
          onVoiceDownload={handleVoiceDownload}
          onBankSend={handleBankSend}
          onBankDownload={handleBankDownload} 
         />
      </Tabs.Panel>

    </Tabs>

    </div>

    </MantineProvider>
  );
}



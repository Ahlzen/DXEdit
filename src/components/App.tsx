import '@mantine/core/styles.css';
import { createTheme, MantineProvider, Stack, Tabs, Title } from '@mantine/core';
import { GearIcon, FadersHorizontalIcon, PianoKeysIcon } from '@phosphor-icons/react';

import { useState, useRef, useEffect } from 'react';
import { Preferences } from '../preferences';
import './App.css';

// MIDI / DX7 sysex
import { WebMidi, START_OF_SYSEX, END_OF_SYSEX } from '../midi/WebMidi.ts'
import { type performanceValues, getInitPerformanceParams } from '../midi/PerformanceParamData.ts';
import { VoiceParamData } from '../midi/VoiceParamData.ts';

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

  // Editor state
  const [perfParams, setPerfParams] = useState<performanceValues>(
    getInitPerformanceParams());
  const [voiceParams, setVoiceParams] =
    useState<VoiceParamData>(new VoiceParamData());

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

  // Mantine theme
  const theme = createTheme({
    focusRing: 'always',
    scale: 1.0,
    fontSmoothing: true,
    defaultRadius: 'sm',
    cursorType: 'pointer',
    spacing: {
      // reduce spacing a bit compared to default
      xs: '0.2rem',
      sm: '0.5rem',
      md: '0.7rem',
      lg: '1.5rem',
      xl: '2.5rem'
    },
    components: {
      Stack: Stack.extend( {
        defaultProps: {
          gap: 'xs'
        }
      }),
      Title: Title.extend({
        defaultProps: {
          mt: 'lg'
        }
      }),
    },
  });

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme='dark'
      classNamesPrefix='mantine'>

    <Tabs defaultValue="configuration">

      <Tabs.List>
        <Tabs.Tab value="configuration" leftSection={<GearIcon size={16} />}>
          Configuration
        </Tabs.Tab>
        <Tabs.Tab value="performance" leftSection={<PianoKeysIcon size={16} />}>
          Performance Parameters
        </Tabs.Tab>
        <Tabs.Tab value="edit" leftSection={<FadersHorizontalIcon size={16} />}>
          Voice Editor
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="configuration">
        <DXEConfigEditor
          midi={midi.current}
          prefs={prefs.current}
          midiInPortNames={midiInPortNames}
          midiOutPortNames={midiOutPortNames}
          midiIn={midiIn}
          midiOut={midiOut}
          controllerIn={controllerIn}
          midiChannel={midiChannel}
          onMidiInChanged={handleMidiInChanged}
          onMidiOutChanged={handleMidiOutChanged}
          onControllerInChanged={handleControllerInChanged}
          onMidiChannelChanged={setMidiChannel} />
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
          midi={midi.current}
          midiChannel={midiChannel}
          voiceParams={voiceParams}
          onVoiceParamsChanged={setVoiceParams} />
      </Tabs.Panel>

    </Tabs>

    </MantineProvider>
  );


  // ///// UI Event handlers

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


  ///// MIDI event handlers

  function handleMidiIn(data: Uint8Array)
  {
    //console.log("Received: [" + toHexString(data) + "]");
    if (data.length === 0) return;

    if (data[0] === START_OF_SYSEX &&
      data.at(-1) === END_OF_SYSEX)
    {
      console.log(`Received sysex: ${data.length} bytes.`);
    }
  }

  function handleControllerIn(_data: Uint8Array)
  {
    //console.log("Controller in: [" + toHexString(data) + "]");
  }


  ///// Helpers

  function updateMidiPorts()
  {
    console.log("App: updateMidiPorts()");
    setMidiInPortNames(midi.current.getInNames());
    setMidiOutPortNames(midi.current.getOutNames());
  }
}



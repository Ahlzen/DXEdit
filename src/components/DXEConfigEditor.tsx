import { Button, Stack, Group, Title, Space, Text } from '@mantine/core';
import DXEMidiPortSelector from './DXEMidiPortSelector.tsx';
import DXESlider from './DXESlider';
import { version } from '../../package.json';
import { WebMidi } from '../midi/WebMidi.ts'
import type { Preferences } from '../preferences';
import { buildAllNotesOffMessage } from '../midi/DX7.ts';

export function DXEConfigEditor(props: {
  midi: WebMidi,
  prefs: Preferences,
  midiInPortNames: string[],
  midiOutPortNames: string[],
  midiIn: string|null,
  midiOut: string|null,
  controllerIn: string|null,
  midiChannel: number,
  onMidiInChanged: (portName: string | null) => void,
  onMidiOutChanged: (portName: string | null) => void,
  onControllerInChanged: (portName: string | null) => void,
  onMidiChannelChanged: (midiChannel: number) => void,
})
{
  ///// UI

  return (
  <Group justify='flex-start' align='top' gap='xl' grow={false}>

    <Stack align='stretch' gap='lg' mt='lg'>
      <Title order={2}>MIDI Configuration</Title>
      <DXEMidiPortSelector
        title="MIDI Input"
        description='From MIDI Out of DX/TX.'
        portNames={props.midiInPortNames}
        selectedPortName={props.midiIn}
        onPortChanged={props.onMidiInChanged} />
      <DXEMidiPortSelector 
        title="MIDI Output"
        description='To MIDI In of DX/TX.'
        portNames={props.midiOutPortNames}
        selectedPortName={props.midiOut}
        onPortChanged={props.onMidiOutChanged} />
      <DXEMidiPortSelector
        title="Controller Input"
        description='Optional. Input from this port is sent to MIDI Output.'
        portNames={props.midiInPortNames}
        selectedPortName={props.controllerIn}
        onPortChanged={props.onControllerInChanged} />
      <DXESlider
        title="MIDI Channel"
        selectedValue={props.midiChannel}
        maxValue={15}
        onValueChanged={props.onMidiChannelChanged}
        valueFormatter={formatMidiChannel} />

      <Space h='lg' />
      <Text size='sm'>DX Edit {version}</Text>

    </Stack>

    <Stack gap='lg' mt='lg'>

      <Title order={2}>MIDI Test</Title>
      <Button onClick={handleSendNoteOnOff}>
        Send Note On / Note Off
      </Button>

      <Title order={2}>Utility</Title>
      <Button onClick={handleAllNotesOff}>
        All Notes Off
      </Button>

    </Stack>
  </Group>
  );


  ///// Formatters

  function formatMidiChannel(ch: number) : string { return String(ch+1); }


  ///// UI Event handlers

  function handleSendNoteOnOff() {
    console.log("App: handleSendNoteOnOff()");
    if (props.midi) {
      console.log("Sending Note On...");
      props.midi.sendMessage([0x90 + props.midiChannel, 60, 70]);
      setTimeout(() => {
        console.log("Sending Note Off...");
        props.midi.sendMessage([0x80 + props.midiChannel, 60, 0]);
      }, 1000); // Send Note Off after 1 second
    }
  }

  function handleAllNotesOff() {
    if (props.midi) {
      console.log("Sending All Notes Off...");
      props.midi.sendMessage(buildAllNotesOffMessage(props.midiChannel)); 
    }
  }

}
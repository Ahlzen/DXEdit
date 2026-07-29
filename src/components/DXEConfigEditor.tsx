import { Button, Stack, Group, Title, Space, Text, Switch } from '@mantine/core';
import DXEMidiPortSelector from './DXEMidiPortSelector';
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
  isTimeEgMode: boolean,
  onMidiInChanged: (portName: string | null) => void,
  onMidiOutChanged: (portName: string | null) => void,
  onControllerInChanged: (portName: string | null) => void,
  onMidiChannelChanged: (midiChannel: number) => void,
  onEgModeChanged: (isTimeEgMode: boolean) => void,
})
{
  ///// UI

  return (
  <Group justify='flex-start' align='top' gap='xl' grow={false}>

    <Stack align='stretch' gap='lg' mt='lg'>
      <Title order={2}>MIDI Settings</Title>
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

      <Group>
      <Text className='col1'>MIDI Test</Text>
      <Button onClick={handleSendNoteOnOff}>
        Play Note
      </Button>
      </Group>

      <Group>
      <Text className='col1'>Utility</Text>
      <Button onClick={handleAllNotesOff}>
        All Notes Off
      </Button>
      </Group>

      <Space h='lg' />
      <Text size='sm'>DX Edit {version}</Text>

    </Stack>

    <Stack gap='lg' mt='lg'>

      <Title order={2}>Editor Settings</Title>

      <Group>
        <Text className='col1'>Envelopes</Text>
        <Switch
          label="Use Time instead of Rate"
          checked={props.isTimeEgMode}
          onChange={(v) => props.onEgModeChanged(v.currentTarget.checked)} />
      </Group>

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
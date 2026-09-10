import { useState } from 'react';

import { ArrowArcLeftIcon, ArrowArcRightIcon } from '@phosphor-icons/react';

import { Button, Stack, Group, TextInput, Title, Space, Text, Modal, Checkbox } from '@mantine/core';
import DXESlider from './DXESlider.tsx';
import DXEEnvelopeEditor from './DXEEnvelopeEditor.tsx';
import DXEOpEditor from './DXEOpEditor.tsx';
import DXERadioGroup from './DXERadioGroup.tsx';
import DXEAlgorithmDiagram from './DXEAlgorithmDiagram.tsx';
import DXEAlgorithmPicker from './DXEAlgorithmPicker.tsx';
import DXECustomRadioButtons from './DXECustomRadioButtons.tsx';

import { formatTranspose, formatAlgorithm, isOpEnabled } from '../midi/DX7.ts';
import { VoiceData } from '../midi/VoiceData.ts';
import { VoiceEditor } from '../midi/VoiceEditor.ts';
import type { opNumber, commonVoiceParam } from '../midi/VoiceData.ts'; 

// LFO waveform images
import wf_tri from '../assets/wf-tri.svg';
import wf_saw_dn from '../assets/wf-saw-dn.svg';
import wf_saw_up from '../assets/wf-saw-up.svg';
import wf_square from '../assets/wf-square.svg';
import wf_sine from '../assets/wf-sine.svg';
import wf_sandh from '../assets/wf-sandh.svg';


export function DXEVoiceEditor(props: {
  data: VoiceData,
  editor: VoiceEditor,
  isTimeEgMode: boolean,
})
{
  ///// State

  const [currentOp, setCurrentOp] = useState<opNumber>('OP1');
  const [enabledOps, setEnabledOps] = useState<number>(0b111111); // same format as in DX7 Sysex param 155
  const [algorithmPickerOpen, setAlgorithmPickerOpen] = useState<boolean>(false);


  ///// UI

  const undoLabel = props.editor.undoLabel();
  const redoLabel = props.editor.redoLabel();


  ///// Event handlers

  function handleInitVoice() {

    props.editor.initializeVoice();
    enableAllOps();
  }

  function handleSendAll() {
    console.log("DXEVoiceEditor: handleSendAll()");
    props.editor.sendCurrentData();
  }

  function handleUpdateVoiceName(voiceName: string, isChangeEnd: boolean) {
    console.log("DXEVoiceEditor: handleUpdatePatchName(): " + voiceName);
    props.editor.setVoiceName(voiceName, isChangeEnd);
  }

  function handleCommonVoiceParamChanged(
    parameter: commonVoiceParam,
    value: number,
    isChangeEnd: boolean)
  {
    console.log(`DXEVoiceEditor: handleCommonVoiceParamChanged(): ${parameter} ${value}`);
    props.editor.setCommonValue(parameter, value, isChangeEnd);
  }

  function handleEnabledOpsChanged(
    opNumber: number, // 1-6
    checked: boolean)
  {
    let value = enabledOps;
    const bitMask = 0b1000000 >>> opNumber;
    if (checked) {
      value |= bitMask;
    } else {
      value &= (~bitMask);
    }
    setEnabledOps(value);
    props.editor.sendEnabledOpsData(value);
  }

  function enableAllOps() {
    setEnabledOps(0b111111);
    props.editor.sendEnabledOpsData(0b111111);
  }


  return (
    <>
    <Group gap='md' mt='md'>
      <Button onClick={handleInitVoice}>Init Voice (reset to default)</Button>
      <Button onClick={handleSendAll}>Send All to Device (synchronize)</Button>
      <Space w='md'/>
      <Button onClick={() => props.editor.undo()} disabled={undoLabel === null}
        leftSection={<ArrowArcLeftIcon />}>
        Undo {undoLabel}
      </Button>
      <Button onClick={() => props.editor.redo()} disabled={redoLabel === null}
        leftSection={<ArrowArcRightIcon />}>
         Redo {redoLabel}
      </Button>
    </Group>

    <Group justify='flex-start' align='top' gap='xl' grow={true}>

      <Stack className='commonEditor'>
        <Title order={2}>Common</Title>
        
        <Group>
          <Text className='col1'>Patch name</Text>
          <TextInput
            value={props.data.getVoiceName()}
            placeholder="max 10 chars"
            maxLength={10}
            style={{width:'10rem'}}
            // TODO: only set isChangeEnd on enter or lost focus?
            onChange={(e) => {handleUpdateVoiceName(e.currentTarget.value, true)}} />
        </Group>
        
        <Space h='md'/>

        <DXEAlgorithmDiagram
          algNumber={props.data.getCommonValue('Algorithm')+1}
          isFixedWidth={true}
          currentOp={currentOp}
          enabledOps={enabledOps}
          hasLabels={true} />
        <Group>
          <DXESlider
            title="Algorithm"
            selectedValue={props.data.getCommonValue('Algorithm')}
            maxValue={31}
            onValueChanged={(v,ce) => handleCommonVoiceParamChanged('Algorithm', v, ce)}
            valueFormatter={formatAlgorithm} />
          <Button onClick={() => setAlgorithmPickerOpen(true)} size="xs">...</Button>
        </Group>
        

        <DXESlider
          title="Feedback"
          selectedValue={props.data.getCommonValue('Feedback')}
          maxValue={7}
          onValueChanged={(v,ce) => handleCommonVoiceParamChanged('Feedback', v, ce)} />
        <DXERadioGroup
          title="Osc Sync"
          options={{ "Off": 0, "On": 1 }}
          selectedValue={props.data.getCommonValue('Oscillator Sync')}
          onValueChanged={(v) => handleCommonVoiceParamChanged('Oscillator Sync', v, true)} />

        <Title order={3}>LFO</Title>

        <DXECustomRadioButtons
          className='waveformSelector'
          options={{
            "0": <img src={wf_tri} alt='Tri' />,
            "1": <img src={wf_saw_dn} alt='SawDn' />,
            "2": <img src={wf_saw_up} alt='SawUp' />,
            "3": <img src={wf_square} alt='Squ' />,
            "4": <img src={wf_sine} alt='Sin' />,
            "5": <img src={wf_sandh} alt='S&H' />}}
          selectedValue={String(props.data.getCommonValue('LFO Waveform')).toString()}
          onValueChanged={(v) => handleCommonVoiceParamChanged('LFO Waveform', Number(v), true)} />
        <DXESlider
          title="Speed"
          selectedValue={props.data.getCommonValue('LFO Speed')}
          maxValue={99}
          onValueChanged={(v,ce) => handleCommonVoiceParamChanged('LFO Speed', v, ce)} />
        <DXESlider
          title="Delay"
          selectedValue={props.data.getCommonValue('LFO Delay')}
          maxValue={99}
          onValueChanged={(v,ce) => handleCommonVoiceParamChanged('LFO Delay', v, ce)} />
        <DXESlider
          title="Pitch mod"
          selectedValue={props.data.getCommonValue('LFO Pitch Mod Depth')}
          maxValue={99}
          onValueChanged={(v,ce) => handleCommonVoiceParamChanged('LFO Pitch Mod Depth', v, ce)} />
        <DXESlider
          title="Amp mod"
          selectedValue={props.data.getCommonValue('LFO Amp Mod Depth')}
          maxValue={99}
          onValueChanged={(v,ce) => handleCommonVoiceParamChanged('LFO Amp Mod Depth', v, ce)} />
        <DXERadioGroup
          title="Sync"
          options={{ "Off": 0, "On": 1 }}
          selectedValue={props.data.getCommonValue('LFO Sync')}
          onValueChanged={(v) => handleCommonVoiceParamChanged('LFO Sync', v, true)} />
        
        <br/>
        <DXESlider
          title="Pitch mod sens"
          selectedValue={props.data.getCommonValue('Pitch Mod Sensitivity')}
          maxValue={7}
          onValueChanged={(v,ce) => handleCommonVoiceParamChanged('Pitch Mod Sensitivity', v, ce)} />
        <DXESlider
          title="Transpose"
          selectedValue={props.data.getCommonValue('Transpose')}
          maxValue={48}
          onValueChanged={(v,ce) => handleCommonVoiceParamChanged('Transpose', v, ce)}
          valueFormatter={formatTranspose} />

        <DXEEnvelopeEditor title="Pitch Envelope"
          data={props.data}
          editor={props.editor}
          eg='Pitch'
          isTimeMode={props.isTimeEgMode} />
      </Stack>

      <Stack className='opsEditor'>
        <Title order={2}>Operators</Title>
        
        {/* TODO: Refactor this into something more elegant... */}
        <Group mt="xs" gap="sm" grow={false}>
          <Text className='col1-sm'>Enable</Text>
          <Checkbox.Card checked={isOpEnabled(enabledOps, 1)}
            className="customCheckBox" w='auto'
            onChange={(v) => handleEnabledOpsChanged(1, v)}>
            <Group wrap="nowrap" p="xs">
              <Text>OP1</Text>
            </Group>
          </Checkbox.Card>
          <Checkbox.Card checked={isOpEnabled(enabledOps, 2)}
            className="customCheckBox" w='auto'
            onChange={(v) => handleEnabledOpsChanged(2, v)}>
            <Group wrap="nowrap" p="xs">
              <Text>OP2</Text>
            </Group>
          </Checkbox.Card>
          <Checkbox.Card checked={isOpEnabled(enabledOps, 3)}
            className="customCheckBox" w='auto'
            onChange={(v) => handleEnabledOpsChanged(3, v)}>
            <Group wrap="nowrap" p="xs">
              <Text>OP3</Text>
            </Group>
          </Checkbox.Card>
          <Checkbox.Card checked={isOpEnabled(enabledOps, 4)}
            className="customCheckBox" w='auto'
            onChange={(v) => handleEnabledOpsChanged(4, v)}>
            <Group wrap="nowrap" p="xs">
              <Text>OP4</Text>
            </Group>
          </Checkbox.Card>
          <Checkbox.Card checked={isOpEnabled(enabledOps, 5)}
            className="customCheckBox" w='auto'
            onChange={(v) => handleEnabledOpsChanged(5, v)}>
            <Group wrap="nowrap" p="xs">
              <Text>OP5</Text>
            </Group>
          </Checkbox.Card>
          <Checkbox.Card checked={isOpEnabled(enabledOps, 6)}
            className="customCheckBox" w='auto'
            onChange={(v) => handleEnabledOpsChanged(6, v)}>
            <Group wrap="nowrap" p="xs">
              <Text>OP6</Text>
            </Group>
          </Checkbox.Card>
        </Group>

        <Group gap="sm">
          <Text className='col1-sm'>Select</Text>
          <DXECustomRadioButtons
            className='opSelector'
            options={{
              'OP1': <Text>OP1</Text>,
              'OP2': <Text>OP2</Text>,
              'OP3': <Text>OP3</Text>,
              'OP4': <Text>OP4</Text>,
              'OP5': <Text>OP5</Text>,
              'OP6': <Text>OP6</Text>,
            }}
            selectedValue={currentOp}
            onValueChanged={(o) => setCurrentOp(o as opNumber)}/>
        </Group>
        
        <DXEOpEditor
          op={currentOp}
          data={props.data}
          editor={props.editor}
          isTimeEgMode={props.isTimeEgMode} />
      </Stack>

    </Group>

    {/* Pop-ups (dialogs) */}

    <Modal withCloseButton
      onClose={() => setAlgorithmPickerOpen(false)}
      opened={algorithmPickerOpen}
      size="auto"
      >
      <DXEAlgorithmPicker currentAlgorithm={props.data.getCommonValue('Algorithm')}
        columnCount={8}
        onAlgorithmSelected={(n: number) => {
          handleCommonVoiceParamChanged('Algorithm', n, true)
          setAlgorithmPickerOpen(false);
        }}
        onCancel={() => setAlgorithmPickerOpen(false)}
        />
    </Modal>
    </>
  );
}

import { Title, Stack, Group, Text } from '@mantine/core';
import { useState } from "react";
import { VoiceEditor, VoiceData, isRateParam } from '../midi/VoiceEditorData.ts';
import type { egParam, egType } from '../midi/VoiceEditorData.ts'; 

import DXEEnvelopeGraph from "./DXEEnvelopeGraph";
import DXEKnob from './DXEKnob';

export default function DXEEnvelopeEditor(props: {
  title: string,
  data: VoiceData,
  editor: VoiceEditor,
  eg: egType,
  isTimeMode: boolean
  })
{
  // Highlighted envelope parameter (0-7)
  const [highlight, setHighlight] = useState<number|undefined>(undefined);

  const getVal = (param: egParam) => {
    const rawValue =
      props.data.getEgValue(props.eg, param);

    if (props.isTimeMode) {
      return isRateParam(param) ? 99-rawValue : rawValue;
    } else {
      return rawValue
    }
  }
    
  const setVal = (param: egParam, val: number, isChangeEnd: boolean) => {
    if (props.isTimeMode) {
      props.editor.setEgValue(props.eg, param, isRateParam(param) ? 99-val : val, isChangeEnd);
    }
    else {
      props.editor.setEgValue(props.eg, param, val, isChangeEnd);
    }
  }

  const handleHoverChanged =
    function(hover: boolean, offset: number) {
      setHighlight(hover ? offset : undefined);
  }


  return (
    <Stack className="envelopeEditor">

      <Title order={3}>{props.title}</Title>

      <Group gap="sm">
        <Text className="envParamLabel col1-sm">{props.isTimeMode ? "Time" : "Rate"}</Text>
        <DXEKnob value={getVal('R1')} min={0} max={99}
          onValueChanged={(val, ice) => setVal('R1', val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 0); } } />
        <DXEKnob value={getVal('R2')} min={0} max={99}
          onValueChanged={(val, ice) => setVal('R2', val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 1); } } />
        <DXEKnob value={getVal('R3')} min={0} max={99}
          onValueChanged={(val, ice) => setVal('R3', val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 2); } } />
        <DXEKnob value={getVal('R4')} min={0} max={99}
          onValueChanged={(val, ice) => setVal('R4', val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 3); } } />
      </Group>

      <Group gap="sm">
        <Text className="envParamLabel col1-sm">Level</Text>
        <DXEKnob value={getVal('L1')} min={0} max={99}
          onValueChanged={(val, ice) => setVal('L1', val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 4); } } />
        <DXEKnob value={getVal('L2')} min={0} max={99}
          onValueChanged={(val, ice) => setVal('L2', val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 5); } } />
        <DXEKnob value={getVal('L3')} min={0} max={99}
          onValueChanged={(val, ice) => setVal('L3', val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 6); } } />
        <DXEKnob value={getVal('L4')} min={0} max={99}
          onValueChanged={(val, ice) => setVal('L4', val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 7); } } />
      </Group>

      <DXEEnvelopeGraph
        width={300}
        height={100}
        data={props.data}
        eg={props.eg}
        highlightSegment={highlight} />
    </Stack>
  )
}
import { Title, Stack, Group, Text } from '@mantine/core';
import { useState } from "react";
import { egTypeOffsets, type egType, type VoiceParamData } from "../midi/VoiceParamData";
import DXEEnvelopeGraph from "./DXEEnvelopeGraph";
import DXEKnob from './DXEKnob';

export default function DXEEnvelopeEditor(props: {
  title: string,
  data: VoiceParamData,
  eg: egType,
  isTimeMode: boolean,
  onValueChanged: (offset: number, value: number, isChangeEnd: boolean) => void })
{
  // Highlighted envelope parameter (0-7)
  const [highlight, setHighlight] = useState<number|undefined>(undefined);

  const getVal = (offset: number) => {
    const rawValue = props.data.getValueByOffset(
      egTypeOffsets[props.eg] + offset);
    if (props.isTimeMode) {
      return offset < 4 ? 99-rawValue : rawValue;
    } else {
      return rawValue
    }
  }
    
  const setVal = (offset: number, val: number, isChangeEnd: boolean) => {
    const fullOffset = egTypeOffsets[props.eg]+offset;
    if (props.isTimeMode) {
      props.onValueChanged(fullOffset, offset < 4 ? 99-val : val, isChangeEnd);
    } else {
      props.onValueChanged(fullOffset, val, isChangeEnd);
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
        <Text className="envParamLabel">{props.isTimeMode ? "Time" : "Rate"}</Text>
        <DXEKnob value={getVal(0)} min={0} max={99}
          onValueChanged={(val, ice) => setVal(0, val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 0); } } />
        <DXEKnob value={getVal(1)} min={0} max={99}
          onValueChanged={(val, ice) => setVal(1, val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 1); } } />
        <DXEKnob value={getVal(2)} min={0} max={99}
          onValueChanged={(val, ice) => setVal(2, val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 2); } } />
        <DXEKnob value={getVal(3)} min={0} max={99}
          onValueChanged={(val, ice) => setVal(3, val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 3); } } />
      </Group>

      <Group gap="sm">
        <Text className="envParamLabel">Level</Text>
        <DXEKnob value={getVal(4)} min={0} max={99}
          onValueChanged={(val, ice) => setVal(4, val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 4); } } />
        <DXEKnob value={getVal(5)} min={0} max={99}
          onValueChanged={(val, ice) => setVal(5, val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 5); } } />
        <DXEKnob value={getVal(6)} min={0} max={99}
          onValueChanged={(val, ice) => setVal(6, val, ice)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 6); } } />
        <DXEKnob value={getVal(7)} min={0} max={99}
          onValueChanged={(val, ice) => setVal(7, val, ice)}
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
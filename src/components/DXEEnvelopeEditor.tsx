import { Title, Stack, Group, Text } from '@mantine/core';
import { useState } from "react";
import { egTypeOffsets, type egType, type VoiceParamData } from "../midi/VoiceParamData";
import DXEEnvelopeGraph from "./DXEEnvelopeGraph";
import DXEKnob from './DXEKnob';

export default function DXEEnvelopeEditor(props: {
  title: string,
  data: VoiceParamData,
  eg: egType,
  onValueChanged: (offset: number, value: number, isChangeEnd: boolean) => void })
{
  // Highlighted envelope parameter (0-7)
  const [highlight, setHighlight] = useState<number|undefined>(undefined);

  const getVal = (o: number) =>
    props.data.getValueByOffset(
      egTypeOffsets[props.eg] + o);
  const setVal = function(o: number) : ((n: number, isChangeEnd: boolean) => void) {
    return function(v: number, isChangeEnd: boolean) {
      props.onValueChanged(egTypeOffsets[props.eg]+o, v, isChangeEnd);
    };
  }

  const handleHoverChanged =
    function(hover: boolean, offset: number) {
      setHighlight(hover ? offset : undefined);
  }

  return (
    <Stack className="envelopeEditor">

      <Title order={3}>{props.title}</Title>

      <Group gap="sm">
        <Text className="envParamLabel">Rate</Text>
        <DXEKnob value={getVal(0)} max={99}
          onValueChanged={(val) => props.onValueChanged(egTypeOffsets[props.eg]+0, val, false)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 0); } } />
        <DXEKnob value={getVal(1)} max={99}
          onValueChanged={(val) => props.onValueChanged(egTypeOffsets[props.eg]+1, val, false)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 1); } } />
        <DXEKnob value={getVal(2)} max={99}
          onValueChanged={(val) => props.onValueChanged(egTypeOffsets[props.eg]+2, val, false)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 2); } } />
        <DXEKnob value={getVal(3)} max={99}
          onValueChanged={(val) => props.onValueChanged(egTypeOffsets[props.eg]+3, val, false)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 3); } } />
      </Group>

      <Group gap="sm">
        <Text className="envParamLabel">Level</Text>
        <DXEKnob value={getVal(4)} max={99}
          onValueChanged={(val) => props.onValueChanged(egTypeOffsets[props.eg]+4, val, false)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 4); } } />
        <DXEKnob value={getVal(5)} max={99}
          onValueChanged={(val) => props.onValueChanged(egTypeOffsets[props.eg]+5, val, false)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 5); } } />
        <DXEKnob value={getVal(6)} max={99}
          onValueChanged={(val) => props.onValueChanged(egTypeOffsets[props.eg]+6, val, false)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 6); } } />
        <DXEKnob value={getVal(7)} max={99}
          onValueChanged={(val) => props.onValueChanged(egTypeOffsets[props.eg]+7, val, false)}
          onHoverChanged={(hover) => { handleHoverChanged(hover, 7); } } />
      </Group>

      <DXEEnvelopeGraph
        width={300}
        height={100}
        data={props.data}
        eg={props.eg}
        highlightSegment={highlight}
        />
    </Stack>
  )
}
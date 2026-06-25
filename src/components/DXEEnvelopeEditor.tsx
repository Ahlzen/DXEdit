import { Title, Stack } from '@mantine/core';
import { useState } from "react";
import { egTypeOffsets, type egType, type voiceParamData } from "../midi/voiceParams";
import DXEEnvelopeGraph from "./DXEEnvelopeGraph";
import DXESlider from "./DXESlider";

export default function DXEEnvelopeEditor(props: {
  title: string,
  data: voiceParamData,
  eg: egType,
  onValueChanged: (offset: number, value: number) => void })
{
  // Highlighted envelope parameter (0-7)
  let [highlight, setHighlight] = useState<number|undefined>(undefined);

  let getVal = (o: number) =>
    props.data.getValueByOffset(
      egTypeOffsets[props.eg] + o);
  let setVal = function(o: number) : ((n: number) => void) {
    return function(v) {
      props.onValueChanged(egTypeOffsets[props.eg]+o, v)
    };
  }

  let handleHoverChanged =
    function(hover: boolean, offset: number) {
      console.log(`handleHoverChanged: ${hover} ${offset}`);
      setHighlight(hover ? offset : undefined);
  }

  return (
    <Stack className="envelopeEditor">

      <Title order={3}>{props.title}</Title>
      <DXESlider
        title="Rate 1:"
        selectedValue={getVal(0)}
        maxValue={99}
        onValueChanged={setVal(0)}
        onHoverChanged={(h) => handleHoverChanged(h, 0)} />
      <DXESlider
        title="Rate 2:"
        selectedValue={getVal(1)}
        maxValue={99}
        onValueChanged={setVal(1)}
        onHoverChanged={(h) => handleHoverChanged(h, 1)} />
      <DXESlider
        title="Rate 3:"
        selectedValue={getVal(2)}
        maxValue={99}
        onValueChanged={setVal(2)}
        onHoverChanged={(h) => handleHoverChanged(h, 2)} />
      <DXESlider
        title="Rate 4:"
        selectedValue={getVal(3)}
        maxValue={99}
        onValueChanged={setVal(3)}
        onHoverChanged={(h) => handleHoverChanged(h, 3)} />

      <DXESlider
        title="Level 1:"
        selectedValue={getVal(4)}
        maxValue={99}
        onValueChanged={setVal(4)}
        onHoverChanged={(h) => handleHoverChanged(h, 4)} />
      <DXESlider
        title="Level 2:"
        selectedValue={getVal(5)}
        maxValue={99}
        onValueChanged={setVal(5)}
        onHoverChanged={(h) => handleHoverChanged(h, 5)} />
      <DXESlider
        title="Level 3:"
        selectedValue={getVal(6)}
        maxValue={99}
        onValueChanged={setVal(6)}
        onHoverChanged={(h) => handleHoverChanged(h, 6)} />
      <DXESlider
        title="Level 4:"
        selectedValue={getVal(7)}
        maxValue={99}
        onValueChanged={setVal(7)}
        onHoverChanged={(h) => handleHoverChanged(h, 7)} />

      <DXEEnvelopeGraph
        width={300}
        height={100}
        data={props.data}
        eg={props.eg}
        highlightSegment={highlight} />
    </Stack>
  )
}
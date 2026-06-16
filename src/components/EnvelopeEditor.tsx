import { egTypeOffsets, type egType, type voiceParamData } from "../midi/voiceParams";
import Slider from "./Slider";

export default function EnvelopeEditor(props: {
  title: string,
  data: voiceParamData,
  eg: egType,
  onValueChanged: (offset: number, value: number) => void })
{
  return (
    <div className="envelopeEditor">      
      <h3>{props.title}</h3>
      <Slider
        title="Rate 1:"
        selectedValue={props.data.getValueByOffset(egTypeOffsets[props.eg]+0)}
        maxValue={99}
        onValueChanged={(v) => props.onValueChanged(egTypeOffsets[props.eg]+0, v)} />
      <Slider
        title="Rate 2:"
        selectedValue={props.data.getValueByOffset(egTypeOffsets[props.eg]+1)}
        maxValue={99}
        onValueChanged={(v) => props.onValueChanged(egTypeOffsets[props.eg]+1, v)} />
      <Slider
        title="Rate 3:"
        selectedValue={props.data.getValueByOffset(egTypeOffsets[props.eg]+2)}
        maxValue={99}
        onValueChanged={(v) => props.onValueChanged(egTypeOffsets[props.eg]+2, v)} />
      <Slider
        title="Rate 4:"
        selectedValue={props.data.getValueByOffset(egTypeOffsets[props.eg]+3)}
        maxValue={99}
        onValueChanged={(v) => props.onValueChanged(egTypeOffsets[props.eg]+3, v)} />

      <Slider
        title="Level 1:"
        selectedValue={props.data.getValueByOffset(egTypeOffsets[props.eg]+4)}
        maxValue={99}
        onValueChanged={(v) => props.onValueChanged(egTypeOffsets[props.eg]+4, v)} />
      <Slider
        title="Level 2:"
        selectedValue={props.data.getValueByOffset(egTypeOffsets[props.eg]+5)}
        maxValue={99}
        onValueChanged={(v) => props.onValueChanged(egTypeOffsets[props.eg]+5, v)} />
      <Slider
        title="Level 3:"
        selectedValue={props.data.getValueByOffset(egTypeOffsets[props.eg]+6)}
        maxValue={99}
        onValueChanged={(v) => props.onValueChanged(egTypeOffsets[props.eg]+6, v)} />
      <Slider
        title="Level 4:"
        selectedValue={props.data.getValueByOffset(egTypeOffsets[props.eg]+7)}
        maxValue={99}
        onValueChanged={(v) => props.onValueChanged(egTypeOffsets[props.eg]+7, v)} />
    </div>
    // TODO: Add envelope shape (canvas)
    // TODO: Show values in actual units (dB, seconds)
  )
}
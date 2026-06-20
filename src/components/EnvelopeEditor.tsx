import { egTypeOffsets, type egType, type voiceParamData } from "../midi/voiceParams";
import EnvelopeGraph from "./EnvelopeGraph";
import Slider from "./Slider";

export default function EnvelopeEditor(props: {
  title: string,
  data: voiceParamData,
  eg: egType,
  onValueChanged: (offset: number, value: number) => void })
{
  let getVal = (o: number) =>
    props.data.getValueByOffset(
      egTypeOffsets[props.eg] + o);
  let setVal = function(o: number) : ((n: number) => void) {
    return function(v) {
      props.onValueChanged(egTypeOffsets[props.eg]+o, v)
    };
  }

  return (
    <div className="envelopeEditor">
      <h3>{props.title}</h3>
      <Slider
        title="Rate 1:"
        selectedValue={getVal(0)}
        maxValue={99}
        onValueChanged={setVal(0)} />
      <Slider
        title="Rate 2:"
        selectedValue={getVal(1)}
        maxValue={99}
        onValueChanged={setVal(1)} />
      <Slider
        title="Rate 3:"
        selectedValue={getVal(2)}
        maxValue={99}
        onValueChanged={setVal(2)} />
      <Slider
        title="Rate 4:"
        selectedValue={getVal(3)}
        maxValue={99}
        onValueChanged={setVal(3)} />

      <Slider
        title="Level 1:"
        selectedValue={getVal(4)}
        maxValue={99}
        onValueChanged={setVal(4)} />
      <Slider
        title="Level 2:"
        selectedValue={getVal(5)}
        maxValue={99}
        onValueChanged={setVal(5)} />
      <Slider
        title="Level 3:"
        selectedValue={getVal(6)}
        maxValue={99}
        onValueChanged={setVal(6)} />
      <Slider
        title="Level 4:"
        selectedValue={getVal(7)}
        maxValue={99}
        onValueChanged={setVal(7)} />
      <EnvelopeGraph
        width={300}
        height={100}
        data={props.data}
        eg={props.eg} />
    </div>

    // TODO: Add envelope shape (canvas)
    // TODO: Show values in actual units (dB, seconds)
  )
}
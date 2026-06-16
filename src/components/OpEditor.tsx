import { type opNumber, type voiceParamData, opOffsets } from "../midi/voiceParams";

import EnvelopeEditor from "./EnvelopeEditor";
import Slider from "./Slider";

export default function OpEditor(props: {
  data: voiceParamData,
  op: opNumber,
  onValueChanged: (offset: number, value: number) => void})
{
  return (
  <div className="opEditor">
    <Slider
      title='Level:'
      selectedValue={props.data.getValueByOffset(opOffsets[props.op]+16)}
      maxValue={99}
      onValueChanged={(v) => props.onValueChanged(opOffsets[props.op]+16, v)} />
    <EnvelopeEditor title="Envelope"
      data={props.data}
      eg={props.op}
      onValueChanged={props.onValueChanged} />
  </div>
  );
}

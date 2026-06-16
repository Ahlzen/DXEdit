import type { opNumber, voiceParamData } from "../midi/voiceParams";

import EnvelopeEditor from "./EnvelopeEditor";
import Slider from "./Slider";

export default function OpEditor(props: {
  title: string,
  op: opNumber,
  data: voiceParamData,
  onValueChanged: (offset: number, value: number) => void})
{
  return (
  <div className="opEditor">
    <h3>{props.title}</h3>
    <Slider title='Level:'
      selectedValue={props.data.getOpParam(props.op, 16)}
      minValue={0} maxValue={99}
      onValueChanged={(v) => props.onValueChanged(16, v)} />
    <EnvelopeEditor title="Envelope"
      data={props.data.getEgData(props.op)}
      onValueChanged={props.onValueChanged} />
  </div>
  );
  // EG is at start of op data, so can use offset verbatim
}

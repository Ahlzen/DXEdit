import { type opNumber, type voiceParamData, opOffsets } from "../midi/voiceParams";

import EnvelopeEditor from "./EnvelopeEditor";
import Slider from "./Slider";
import RadioGroup from "./RadioGroup";

export default function OpEditor(props: {
  data: voiceParamData,
  op: opNumber,
  onValueChanged: (offset: number, value: number) => void})
{
  let getVal = (o: number) =>
      props.data.getValueByOffset(opOffsets[props.op] + o);
  let setVal = function(o: number) : ((n: number) => void) {
    return function(v) {
      props.onValueChanged(opOffsets[props.op]+o, v)
    };
  }

  return (
  <div className="opEditor">
    <Slider
      title='Level:'
      selectedValue={getVal(16)}
      maxValue={99}
      onValueChanged={setVal(16)} />
    <RadioGroup
      title="Osc mode:"
      options={{0: 'Ratio', 1: 'Fixed'}}
      selectedValue={getVal(17)}
      onValueChanged={setVal(17)} />
    <Slider
      title='Coarse:'
      selectedValue={getVal(18)}
      maxValue={33}
      onValueChanged={setVal(18)} />
    <Slider
      title='Fine:'
      selectedValue={getVal(19)}
      maxValue={99}
      onValueChanged={setVal(19)} />
    <Slider
      title='Detune:'
      selectedValue={getVal(20)}
      maxValue={14}
      onValueChanged={setVal(20)} />
    
    <EnvelopeEditor title="Envelope"
      data={props.data}
      eg={props.op}
      onValueChanged={props.onValueChanged} />
    
    <h3>Kbd level scaling</h3>
    <Slider
      title='Break pt:'
      selectedValue={getVal(8)}
      maxValue={99}
      onValueChanged={setVal(8)} />
    <Slider
      title='L Depth:'
      selectedValue={getVal(9)}
      maxValue={99}
      onValueChanged={setVal(9)} />
    <RadioGroup
      title="L Curve:"
      options={{0: '-Lin', 1: '-Exp', 2: '+Exp', 3: '+Lin'}}
      selectedValue={getVal(11)}
      onValueChanged={setVal(11)} />
    <Slider
      title='R Depth:'
      selectedValue={getVal(10)}
      maxValue={99}
      onValueChanged={setVal(10)} />
    <RadioGroup
      title="R Curve:"
      options={{0: '-Lin', 1: '-Exp', 2: '+Exp', 3: '+Lin'}}
      selectedValue={getVal(12)}
      onValueChanged={setVal(12)} />
    <br/>

    <Slider
      title='Kbd rate sc:'
      selectedValue={getVal(13)}
      maxValue={7}
      onValueChanged={setVal(13)} />
    <Slider
      title='Kbd mod sens:'
      selectedValue={getVal(14)}
      maxValue={3}
      onValueChanged={setVal(14)} />
    <Slider
      title='Kbd vel sens:'
      selectedValue={getVal(15)}
      maxValue={7}
      onValueChanged={setVal(15)} />      
  </div>
  );
}

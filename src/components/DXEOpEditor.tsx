import { type opNumber, type voiceParamData, opOffsets } from "../midi/voiceParams";

import DXEEnvelopeEditor from "./DXEEnvelopeEditor";
import DXESlider from "./DXESlider";
import DXERadioGroup from "./DXERadioGroup";

export default function DXEOpEditor(props: {
  data: voiceParamData,
  op: opNumber,
  onValueChanged: (offset: number, value: number) => void})
{
  ///// State update

  let getVal = (o: number) =>
      props.data.getValueByOffset(opOffsets[props.op] + o);
  let setVal = function(o: number) : ((n: number) => void) {
    return function(v) {
      props.onValueChanged(opOffsets[props.op]+o, v)
    };
  }

  ///// Formatters

  function formatBreakpoint(n: number) : string {
    // (0=A-1, 1=A#-1, 2=B-1, 3=C0, ... 39=C3)
    const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    return `${notes[n%12]}${Math.floor((n-3)/12)}`;
  }
  function formatCoarseFreq(n: number) : string {
    const isFixedFreq : boolean = getVal(17) == 1;
    if (isFixedFreq) {
      switch (n % 4) { // low 2 bits determine range:
        case 0: return "1-10 Hz";
        case 1: return "10-100 Hz";
        case 2: return "100-1k Hz";
        case 3:
        default: return "1k-10k Hz";
      }
    }
    else {
      return n === 0 ? "0.5" : String(n) + ".0";
    }
  }
  function formatFineFreq(n: number) : string {
    const isFixedFreq : boolean = getVal(17) == 1;
    if (isFixedFreq) {
      // Freq(n) = coarseFactor * (10^0.01)^n
      let coarseFactor = 0;
      let decimals = 3;
      switch (getVal(18) % 4) {
        case 0: coarseFactor = 1; decimals = 3; break;
        case 1: coarseFactor = 10; decimals = 2; break;
        case 2: coarseFactor = 100; decimals = 1; break;
        case 3: coarseFactor = 1000; decimals = 0; break;
      }
      const base = Math.pow(10, 0.01);
      const fineFactor = Math.pow(base, n);
      const freq = coarseFactor * fineFactor;
      return String(freq.toFixed(decimals)) + " Hz";
    }
    else {
      return `1.${String(n).padStart(2, '0')}`;
    }
  }
  function formatDetune(n: number) : string {
    return String(n-7);
  }

  // ///// Event handlers

  // function handleEnvelopeHoverChanged(offset: number|null)
  // {

  // }

  ///// UI

  return (
  <div className="opEditor">
    <DXESlider
      title='Level:'
      selectedValue={getVal(16)}
      maxValue={99}
      onValueChanged={setVal(16)} />
    <DXERadioGroup
      title="Osc mode:"
      options={{0: 'Ratio', 1: 'Fixed'}}
      selectedValue={getVal(17)}
      onValueChanged={setVal(17)} />
    <DXESlider
      title='Coarse:'
      selectedValue={getVal(18)}
      maxValue={33}
      onValueChanged={setVal(18)}
      valueFormatter={formatCoarseFreq} />
    <DXESlider
      title='Fine:'
      selectedValue={getVal(19)}
      maxValue={99}
      onValueChanged={setVal(19)}
      valueFormatter={formatFineFreq} />
    <DXESlider
      title='Detune:'
      selectedValue={getVal(20)}
      maxValue={14}
      onValueChanged={setVal(20)}
      valueFormatter={formatDetune} />
    
    <DXEEnvelopeEditor title="OP Envelope"
      data={props.data}
      eg={props.op}
      onValueChanged={props.onValueChanged} />
    
    <h3>Kbd level scaling</h3>
    <DXESlider
      title='Break pt:'
      selectedValue={getVal(8)}
      maxValue={99}
      onValueChanged={setVal(8)}
      valueFormatter={formatBreakpoint} />
    <DXESlider
      title='L Depth:'
      selectedValue={getVal(9)}
      maxValue={99}
      onValueChanged={setVal(9)} />
    <DXERadioGroup
      title="L Curve:"
      options={{0: '-Lin', 1: '-Exp', 2: '+Exp', 3: '+Lin'}}
      selectedValue={getVal(11)}
      onValueChanged={setVal(11)} />
    <DXESlider
      title='R Depth:'
      selectedValue={getVal(10)}
      maxValue={99}
      onValueChanged={setVal(10)} />
    <DXERadioGroup
      title="R Curve:"
      options={{0: '-Lin', 1: '-Exp', 2: '+Exp', 3: '+Lin'}}
      selectedValue={getVal(12)}
      onValueChanged={setVal(12)} />
    <br/>

    <DXESlider
      title='Kbd rate sc:'
      selectedValue={getVal(13)}
      maxValue={7}
      onValueChanged={setVal(13)} />
    <DXESlider
      title='Kbd mod sens:'
      selectedValue={getVal(14)}
      maxValue={3}
      onValueChanged={setVal(14)} />
    <DXESlider
      title='Kbd vel sens:'
      selectedValue={getVal(15)}
      maxValue={7}
      onValueChanged={setVal(15)} />      
  </div>
  );
}

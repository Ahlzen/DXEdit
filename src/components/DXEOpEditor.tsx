import type { opNumber, opParam } from '../midi/VoiceData.ts';
import { VoiceData } from '../midi/VoiceData.ts';
import { VoiceEditor } from '../midi/VoiceEditor.ts';

import DXEEnvelopeEditor from "./DXEEnvelopeEditor";
import DXESlider from "./DXESlider";
import DXERadioGroup from "./DXERadioGroup";

export default function DXEOpEditor(props: {
  data: VoiceData,
  editor: VoiceEditor,
  op: opNumber,
  isTimeEgMode: boolean})
{
  ///// State update

  const getVal = (param: opParam) =>
    props.data.getOpValue(props.op, param);
  const setVal = function(o: opParam) : ((n: number, isChangeEnd: boolean) => void) {
    return function(v: number, isChangeEnd: boolean) {
      props.editor.setOpValue(props.op, o, v, isChangeEnd);
    };
  }
  const setValAsChangeEnd = function(o: opParam) : ((n: number) => void) {
    return function(v: number) {
      props.editor.setOpValue(props.op, o, v, true);
    };
  }
  const isFixedFreq = () => getVal('Osc Mode') == 1;

  ///// Formatters

  function formatBreakpoint(n: number) : string {
    // (0=A-1, 1=A#-1, 2=B-1, 3=C0, ... 39=C3)
    const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    return `${notes[n%12]} ${Math.floor((n-3)/12)}`;
  }
  function formatCoarseFreq(n: number) : string {
    if (isFixedFreq()) {
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
    if (isFixedFreq()) {
      let coarseFactor = 0;
      let decimals = 3;
      switch (getVal('Osc Freq Coarse') % 4) {
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


  ///// UI

  return (
  <div className="opEditor">
    <DXESlider
      title='Level'
      selectedValue={getVal('Operator Output Level')}
      maxValue={99}
      onValueChanged={setVal('Operator Output Level')} />
    <DXERadioGroup
      title="Osc mode"
      options={{'Ratio': 0, 'Fixed': 1}}
      selectedValue={getVal('Osc Mode')}
      onValueChanged={setValAsChangeEnd('Osc Mode')} />
    <DXESlider
      title='Coarse'
      selectedValue={getVal('Osc Freq Coarse')}
      maxValue={33}
      onValueChanged={setVal('Osc Freq Coarse')}
      valueFormatter={formatCoarseFreq} />
    <DXESlider
      title='Fine'
      selectedValue={getVal('Osc Freq Fine')}
      maxValue={99}
      onValueChanged={setVal('Osc Freq Fine')}
      valueFormatter={formatFineFreq} />
    <DXESlider
      title='Detune'
      selectedValue={getVal('Osc Detune')}
      maxValue={14}
      onValueChanged={setVal('Osc Detune')}
      valueFormatter={formatDetune} />
    
    <DXEEnvelopeEditor title="OP Envelope"
      data={props.data}
      editor={props.editor}
      eg={props.op}
      isTimeMode={props.isTimeEgMode} />
    
    <h3>Keyboard Level Scaling</h3>
    <DXESlider
      title='L Depth'
      selectedValue={getVal('Kbd Lev Scl L Depth')}
      maxValue={99}
      onValueChanged={setVal('Kbd Lev Scl L Depth')} />
    <DXERadioGroup
      title="L Curve"
      options={{'-Lin': 0, '-Exp': 1, '+Exp': 2, '+Lin': 3}}
      selectedValue={getVal('Kbd Lev Scl L Curve')}
      onValueChanged={setValAsChangeEnd('Kbd Lev Scl L Curve')} />
    <DXESlider
      title='Break pt'
      selectedValue={getVal('Kbd Lev Scl Brk Pt')}
      maxValue={99}
      onValueChanged={setVal('Kbd Lev Scl Brk Pt')}
      valueFormatter={formatBreakpoint} />
    <DXESlider
      title='R Depth'
      selectedValue={getVal('Kbd Lev Scl R Depth')}
      maxValue={99}
      onValueChanged={setVal('Kbd Lev Scl R Depth')} />
    <DXERadioGroup
      title="R Curve"
      options={{'-Lin': 0, '-Exp': 1, '+Exp': 2, '+Lin': 3}}
      selectedValue={getVal('Kbd Lev Scl R Curve')}
      onValueChanged={setValAsChangeEnd('Kbd Lev Scl R Curve')} />
    <br/>

    <DXESlider
      title='Kbd rate sc'
      selectedValue={getVal('Kbd Rate Scaling')}
      maxValue={7}
      onValueChanged={setVal('Kbd Rate Scaling')} />
    <DXESlider
      title='Amp mod sens'
      selectedValue={getVal('Amp Mod Sensitivity')}
      maxValue={3}
      onValueChanged={setVal('Amp Mod Sensitivity')} />
    <DXESlider
      title='Kbd vel sens'
      selectedValue={getVal('Key Vel Sensitivity')}
      maxValue={7}
      onValueChanged={setVal('Key Vel Sensitivity')} />      
  </div>
  );
}

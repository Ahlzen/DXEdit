export type voiceParam = 
  'Algorithm' |
  'Feedback' |
  'Oscillator Sync' |
  'LFO Speed' |
  'LFO Delay' |
  'LFO Pitch Mod Depth' |
  'LFO Amp Mod Depth' |
  'LFO Sync' |
  'LFO Waveform' |
  'Pitch Mod Sensitivity' |
  'Transpose';

export type voiceParamSpec = {
  offset: number, // parameter number or offset from start of sub-structure
  maxValue: number,
}

export let voiceParamSpecs : {[name in voiceParam]: voiceParamSpec} = {
  'Algorithm': {offset: 134, maxValue: 31},
  'Feedback': { offset: 135, maxValue: 7 },
  'Oscillator Sync': { offset: 136, maxValue: 1 },
  'LFO Speed': {offset: 137, maxValue: 99},
  'LFO Delay': {offset: 138, maxValue: 99},
  'LFO Pitch Mod Depth': {offset: 139, maxValue: 99},
  'LFO Amp Mod Depth': {offset: 140, maxValue: 99},
  'LFO Sync': {offset: 141, maxValue: 1},
  'LFO Waveform': {offset: 142, maxValue: 5},
  'Pitch Mod Sensitivity': {offset: 143, maxValue: 7},
  'Transpose': {offset: 144, maxValue: 48},
  // NOTE: The rest are accessed separately
};

export type opNumber = 'op1' | 'op2' | 'op3' | 'op4' | 'op5' | 'op6';
export type egType = opNumber | 'pitch';

export let opOffsets : {[key in opNumber]: number} = {
  'op1': 105,
  'op2': 84,
  'op3': 63,
  'op4': 42,
  'op5': 21,
  'op6': 0,
};

export let egTypeOffsets : {[key in egType]: number} = {
  'op1': 105,
  'op2': 84,
  'op3': 63,
  'op4': 42,
  'op5': 21,
  'op6': 0,
  'pitch': 126,
};

// immutable
export class voiceParamData {
  private data: Uint8Array;

  //constructor();
  constructor(data: Uint8Array | null = null) {
    if (data) {
      this.data = new Uint8Array(data);
    }
    else {
      // TODO: fill with init patch data
      this.data = new Uint8Array(154);
    }
  }

  getValue(param: voiceParam) : number {
    return this.getValueByOffset(voiceParamSpecs[param].offset);
  }
  setValue(param: voiceParam, value: number) : voiceParamData {
    let specs = voiceParamSpecs[param];
    value = this.clamp(value, 0, specs.maxValue);
    return this.setValueByOffset(specs.offset, value);
  }
  
  getValueByOffset(offset: number) : number {
    return this.data[offset];
  }
  setValueByOffset(offset: number, value: number) : voiceParamData {
    let newData = new voiceParamData(this.data);
    newData.data[offset] = value;
    return newData;
  }

  getEgData(type: egType) : Uint8Array {
    return this.data.slice(egTypeOffsets[type], 8);
  }
  setEgData(type: egType, data: Uint8Array) : voiceParamData {
    console.assert(data.length === 8, 'EG data must be 8 bytes');
    let newData = new voiceParamData(this.data);
    newData.data.set(data, egTypeOffsets[type]);
    return newData;
  }

  getOpParam(oo: opNumber, offset: number) : number {
    return this.data[opOffsets[oo]+offset];
  }
  setOpParam(op: opNumber, offset: number, value: number) {
    let newData = new voiceParamData(this.data);
    this.data[opOffsets[op]+offset] = value;
    return newData;
  }

  private clamp(value: number, min: number, max: number) : number {
    if (value < min) value = min;
    if (value > max) value = max;
    return value;
  }

  static getInitPatch(): voiceParamData {
    let initData = new Uint8Array([
      // TODO

    ])
  }
}



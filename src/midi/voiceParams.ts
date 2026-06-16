export type voiceParam = 
  'OP6 EG Rate 1' |
  'OP6 EG Rate 2' |
  'OP6 EG Rate 3' |
  'OP6 EG Rate 4' |
  'OP6 EG Level 1' |
  'OP6 EG Level 2' |
  'OP6 EG Level 3' |
  'OP6 EG Level 4' |
  'Feeback' |
  'Oscillator Sync';

export type voiceParamSpec = {
  offset: number, // parameter number or offset from start of sub-structure
  maxValue: number,
}

export let voiceParamSpecs : {[name in voiceParam]: voiceParamSpec} = {
  'OP6 EG Rate 1': { offset: 0, maxValue: 99 },
  'OP6 EG Rate 2': { offset: 1, maxValue: 99 },
  'OP6 EG Rate 3': { offset: 2, maxValue: 99 },
  'OP6 EG Rate 4': { offset: 3, maxValue: 99 },
  'OP6 EG Level 1': { offset: 4, maxValue: 99 },
  'OP6 EG Level 2': { offset: 5, maxValue: 99 },
  'OP6 EG Level 3': { offset: 6, maxValue: 99 },
  'OP6 EG Level 4': { offset: 7, maxValue: 99 },
  'Feeback': { offset: 135, maxValue: 7 },
  'Oscillator Sync': { offset: 136, maxValue: 1 },
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
}

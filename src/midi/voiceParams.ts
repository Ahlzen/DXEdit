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
    let offset = voiceParamSpecs[param].offset;
    return this.data[offset];
  }

  setValue(param: voiceParam, value: number) : voiceParamData {
    let specs = voiceParamSpecs[param];
    value = this.clamp(value, 0, specs.maxValue);
    let newData = new voiceParamData(this.data);
    newData.data[specs.offset] = value;
    return newData;
  }

  private clamp(value: number, min: number, max: number) : number {
    if (value < min) value = min;
    if (value > max) value = max;
    return value;
  }
}

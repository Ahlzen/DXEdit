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

  constructor(data: Uint8Array | null = null) {
    if (data) {
      this.data = new Uint8Array(data);
    }
    else {
      // Use init patch data
      this.data = voiceParamData.getInitParams();
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

  private static getInitParams(): Uint8Array {
    return new Uint8Array([
      // These are the values set by the
      // "VOICE INIT" feature of the DX7 mk1

      // OP6
      99,99,99,99, // EG Rate 1-4
      99,99,99,0,  // EG Level 1-4
      0, // Kbd level scale break point (0=A-1, 39=C3)
      0, 0, // Kbd level scale L/R depth
      0, 0,// Kbd level scale L/R curve (-LIN)
      0, // Kbd rate scaling
      0, // Amp mod sensitivity
      0, // Key vel sensitivity
      0, // Level
      0, // Osc mode (0=ratio)
      1, 0, // Freq coarse (1=1.00?) / fine (0=1.00?)
      0, // detune

      // OP5
      99,99,99,99, // EG Rate 1-4
      99,99,99,0,  // EG Level 1-4
      0, // Kbd level scale break point (0=A-1, 39=C3)
      0, 0, // Kbd level scale L/R depth
      0, 0,// Kbd level scale L/R curve (-LIN)
      0, // Kbd rate scaling
      0, // Amp mod sensitivity
      0, // Key vel sensitivity
      0, // Level
      0, // Osc mode (0=ratio)
      1, 0, // Freq coarse (1=1.00?) / fine (0=1.00?)
      0, // detune

      // OP4
      99,99,99,99, // EG Rate 1-4
      99,99,99,0,  // EG Level 1-4
      0, // Kbd level scale break point (0=A-1, 39=C3)
      0, 0, // Kbd level scale L/R depth
      0, 0,// Kbd level scale L/R curve (-LIN)
      0, // Kbd rate scaling
      0, // Amp mod sensitivity
      0, // Key vel sensitivity
      0, // Level
      0, // Osc mode (0=ratio)
      1, 0, // Freq coarse (1=1.00?) / fine (0=1.00?)
      0, // detune

      // OP3
      99,99,99,99, // EG Rate 1-4
      99,99,99,0,  // EG Level 1-4
      0, // Kbd level scale break point (0=A-1, 39=C3)
      0, 0, // Kbd level scale L/R depth
      0, 0,// Kbd level scale L/R curve (-LIN)
      0, // Kbd rate scaling
      0, // Amp mod sensitivity
      0, // Key vel sensitivity
      0, // Level
      0, // Osc mode (0=ratio)
      1, 0, // Freq coarse (1=1.00?) / fine (0=1.00?)
      0, // detune

      // OP2
      99,99,99,99, // EG Rate 1-4
      99,99,99,0,  // EG Level 1-4
      0, // Kbd level scale break point (0=A-1, 39=C3)
      0, 0, // Kbd level scale L/R depth
      0, 0,// Kbd level scale L/R curve (-LIN)
      0, // Kbd rate scaling
      0, // Amp mod sensitivity
      0, // Key vel sensitivity
      0, // Level
      0, // Osc mode (0=ratio)
      1, 0, // Freq coarse (1=1.00?) / fine (0=1.00?)
      0, // detune

      // OP1
      99,99,99,99, // EG Rate 1-4
      99,99,99,0,  // EG Level 1-4
      0, // Kbd level scale break point (0=A-1, 39=C3)
      0, 0, // Kbd level scale L/R depth
      0, 0,// Kbd level scale L/R curve (-LIN)
      0, // Kbd rate scaling
      0, // Amp mod sensitivity
      0, // Key vel sensitivity
      99, // Level
      0, // Osc mode (0=ratio)
      1, 0, // Freq coarse (1=1.00?) / fine (0=1.00?)
      0, // detune

      // Pitch EG
      99,99,99,99, // EG Rate 1-4
      50,50,50,50,  // EG Level 1-4
      
      // Common
      0, // Algorithm (#1)
      0, // Feedback
      1, // Oscillator sync
      35, // LFO speed
      0, // LFO delay
      0, // LFO pitch mod depth
      0, // LFO amp mod depth
      1, // LFO sync
      0, // LFO waveform (0=triangle)
      3, // pitch mod sensitivity
      24, // transpose (24=C3)

      // Voice name
      // 10 char ASCII: "INIT      "
      73,78,73,84,32,32,32,32,32,32,
    ]);
  }
}



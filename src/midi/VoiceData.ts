import { getInitVoiceData } from './initVoiceData.ts';
import { packVoiceData, unpackVoiceData } from './packedVoiceData.ts';

///// Voice parameters

// NOTE: For consistency, parameter names and abbreviations
// are used verbatim from "Yamaha DX7 Sysex Format.txt". (see /docs)

export type commonVoiceParam = 
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
export type opParam =
  'Kbd Lev Scl Brk Pt' |
  'Kbd Lev Scl L Depth' |
  'Kbd Lev Scl R Depth' |
  'Kbd Lev Scl L Curve' |
  'Kbd Lev Scl R Curve' |
  'Kbd Rate Scaling' |
  'Amp Mod Sensitivity' |
  'Key Vel Sensitivity' |
  'Operator Output Level' |
  'Osc Mode' |
  'Osc Freq Coarse' |
  'Osc Freq Fine' |
  'Osc Detune';
export type opNumber = 'OP1' | 'OP2' | 'OP3' | 'OP4' | 'OP5' | 'OP6';
export type egType = opNumber | 'Pitch';
export type egParam = 'R1' | 'R2' | 'R3' | 'R4' | 'L1' | 'L2' | 'L3' | 'L4';
export function isRateParam(param: egParam) : boolean {
  return param === 'R1' || param === 'R2' || param === 'R3' || param === 'R4';
}


///// Voice object types 

type commonVoiceValues = {[param in commonVoiceParam]: number};
type egValues = {[param in egParam]: number};
type opValues = {[param in opParam]: number} & {EG: egValues};

export type voiceValues =
  commonVoiceValues &
  { 'Pitch EG': egValues } &
  { 'Voice Name': string; } &
  { [op in opNumber]: opValues };



///// Voice parameter specs

export type paramSpec = {
  offset: number, // parameter number or offset from start of sub-structure
  maxValue: number,
};
export const commonVoiceParamSpecs : {[p in commonVoiceParam]: paramSpec} = {
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
};
export const opParamSpecs : {[p in opParam]: paramSpec} = {
  'Kbd Lev Scl Brk Pt': {offset: 8, maxValue: 99},
  'Kbd Lev Scl L Depth': {offset: 9, maxValue: 99},
  'Kbd Lev Scl R Depth': {offset: 10, maxValue: 99},
  'Kbd Lev Scl L Curve': {offset: 11, maxValue: 3},
  'Kbd Lev Scl R Curve': {offset: 12, maxValue: 3},
  'Kbd Rate Scaling': {offset: 13, maxValue: 7},
  'Amp Mod Sensitivity': {offset: 14, maxValue: 3},
  'Key Vel Sensitivity': {offset: 15, maxValue: 7},
  'Operator Output Level': {offset: 16, maxValue: 99},
  'Osc Mode': {offset: 17, maxValue: 1},
  'Osc Freq Coarse': {offset: 18, maxValue: 31},
  'Osc Freq Fine': {offset: 19, maxValue: 99},
  'Osc Detune': {offset: 20, maxValue: 14},
};
export const egParamSpecs : {[p in egParam]: paramSpec} = {
  'R1': {offset: 0, maxValue: 99},
  'R2': {offset: 1, maxValue: 99},
  'R3': {offset: 2, maxValue: 99},
  'R4': {offset: 3, maxValue: 99},
  'L1': {offset: 4, maxValue: 99},
  'L2': {offset: 5, maxValue: 99},
  'L3': {offset: 6, maxValue: 99},
  'L4': {offset: 7, maxValue: 99},
};

export const opOffsets : {[key in opNumber]: number} = {
  'OP1': 105,
  'OP2': 84,
  'OP3': 63,
  'OP4': 42,
  'OP5': 21,
  'OP6': 0,
};

export const egOffsets : {[key in egType]: number} = {
  'Pitch': 126,
  ...opOffsets, // OP data starts with EG, so we can re-use these here
};


export const voiceNameOffset = 145; // start of voice name data
export const voiceNameLength = 10;
export const voiceParamDataLength = 155;
export const packedVoiceParamDataLength = 128;
export const packed32VoiceDataLength = 32 * packedVoiceParamDataLength;
export const packed32VoiceSysexLength = 6 + packed32VoiceDataLength + 2;


/**
 * Immutable class representing a single DX7 voice.
 * Internally the voice data is stored in the same format as the
 * DX7 single-voice bulk data (155 bytes).
 * 
 * As the class is designed to be immutable, changes to parameter
 * values will return a new VoiceData instance.
 */
export class VoiceData
{
  /**
   * Raw voice data, in the same format as the
   * DX7 single-voice bulk data (155 bytes).
   */
  private rawData: Uint8Array;  


  constructor(data?: Uint8Array)
  {
    this.rawData = data ?
      new Uint8Array(data) :
      getInitVoiceData();
    if (this.rawData.length !== voiceParamDataLength) {
      throw new Error(`VoiceData: Invalid length: ${this.rawData.length}. Expected: ${voiceParamDataLength}.`);
    }
  }
  
  clone() : VoiceData {
    return new VoiceData(this.rawData);
  }

  cloneRawData = () : Uint8Array => {
    return new Uint8Array(this.rawData);
  }


  ///// Formatting

  private egToObject(eg: egType) : egValues {
    const obj: egValues = {} as egValues;
    for (const param in egParamSpecs) {
      obj[param as egParam] = this.getEgValue(eg, param as egParam);
    }
    return obj;
  }

  private opToObject(op: opNumber) : opValues {
    const obj: opValues = {} as opValues;
    for (const param in opParamSpecs) {
      obj[param as opParam] = this.getOpValue(op, param as opParam);
    }
    obj['EG'] = this.egToObject(op);
    return obj;
  }

  toObject(): voiceValues {
    const obj: voiceValues = {} as voiceValues;
    // Common parameters
    for (const param in commonVoiceParamSpecs) {
      obj[param as commonVoiceParam] =
        this.getCommonValue(param as commonVoiceParam);
    }
    obj['Pitch EG'] = this.egToObject('Pitch');
    obj['Voice Name'] = this.getVoiceName();
    // OP1-OP6
    for (const op of Object.keys(opOffsets)) {
       obj[op as opNumber] = this.opToObject(op as opNumber);
    }
    return obj;
  }

  toJSON(): string {
    return JSON.stringify(this.toObject(), null, 2);
  }


  ///// Parsing

  private static verifyValue<T extends object>(obj: T, param: keyof T, type: string | null) : void {
    if (!Object.prototype.hasOwnProperty.call(obj, param)) {
      throw new Error(`Missing parameter: ${String(param)}`);
    }
    if (type && typeof(obj[param]) !== type) {
      throw new Error(`Invalid parameter: ${String(param)}. Must be ${type}.`);
    }
  }

  private static parseEgValues(eg: egType, values: egValues, data: Uint8Array) : void {
    for (const param in egParamSpecs) {
      VoiceData.verifyValue(values, param as egParam, 'number');
      VoiceData.setEgValueInData(eg, param as egParam, values[param as egParam], data);
    }
  }

  private static parseOpValues(op: opNumber, values: opValues, data: Uint8Array) : void {
    for (const param in opParamSpecs) {
      VoiceData.verifyValue(values, param as opParam, 'number');
      VoiceData.setOpValueInData(op, param as opParam, values[param as opParam], data);
    }
    VoiceData.parseEgValues(op, values['EG'], data);
  }

  static fromObject(values: voiceValues) : VoiceData {
    const data = new Uint8Array(voiceParamDataLength);

    for (const param in commonVoiceParamSpecs) {
      VoiceData.verifyValue(values, param as commonVoiceParam, 'number');
      VoiceData.setCommonValueInData(param as commonVoiceParam, values[param as commonVoiceParam], data);
    }
    VoiceData.verifyValue(values, 'Pitch EG', 'object');
    VoiceData.parseEgValues('Pitch', values['Pitch EG'], data);
    VoiceData.verifyValue(values, 'Voice Name', 'string');
    VoiceData.setVoiceNameInData(values['Voice Name'], data);
    // OP1-OP6
    for (const op of Object.keys(opOffsets)) {
      VoiceData.verifyValue(values, op as opNumber, 'object');
      VoiceData.parseOpValues(op as opNumber, values[op as opNumber], data);
    }

    return new VoiceData(data);
  }

  static fromJSON(json: string) : VoiceData {
    const values: voiceValues = JSON.parse(json);
    return VoiceData.fromObject(values);
  }


  ///// Pack/Unpack data (for 32-voice banks)

  static fromPackedData(packedData: Uint8Array) : VoiceData {
    if (packedData.length !== packedVoiceParamDataLength) {
      throw new Error(`VoiceData.fromPackedData: Invalid length: ${packedData.length}. Expected: ${packedVoiceParamDataLength}.`);
    }
    const unpackedData = unpackVoiceData(packedData);
    return new VoiceData(unpackedData);
  }

  toPackedData() : Uint8Array {
    return packVoiceData(this.rawData);
  }
 

  ///// Getting/setting parameter values

  getCommonValue(param: commonVoiceParam) : number {
    const spec = commonVoiceParamSpecs[param];
    return this.getValueByOffset(spec, 0)
  }
  setCommonValue(param: commonVoiceParam, newValue: number) : VoiceData {
    const spec = commonVoiceParamSpecs[param];
    return this.setValueByOffset(spec, 0, newValue);
  }
  private static setCommonValueInData(param: commonVoiceParam, newValue: number, data: Uint8Array) {
    const spec = commonVoiceParamSpecs[param];
    VoiceData.setValueByOffsetInData(spec, 0, newValue, data);
  }

  getEgValue(egType: egType, egParam: egParam) {
    const spec = egParamSpecs[egParam];
    const egOffset = egOffsets[egType];
    return this.getValueByOffset(spec, egOffset);
  }
  setEgValue(egType: egType, egParam: egParam, newValue: number) : VoiceData {
    const spec = egParamSpecs[egParam];
    const egOffset = egOffsets[egType];
    return this.setValueByOffset(spec, egOffset, newValue);
  }
  private static setEgValueInData(egType: egType, egParam: egParam, newValue: number, data: Uint8Array) {
    const spec = egParamSpecs[egParam];
    const egOffset = egOffsets[egType];
    VoiceData.setValueByOffsetInData(spec, egOffset, newValue, data);
  }

  getOpValue(opNumber: opNumber, opParam: opParam) {
    const spec = opParamSpecs[opParam];
    const opOffset = opOffsets[opNumber];
    return this.getValueByOffset(spec, opOffset);
  }
  setOpValue(opNumber: opNumber, opParam: opParam, newValue: number) : VoiceData {
    const spec = opParamSpecs[opParam];
    const opOffset = opOffsets[opNumber];
    return this.setValueByOffset(spec, opOffset, newValue);
  }
  private static setOpValueInData(opNumber: opNumber, opParam: opParam, newValue: number, data: Uint8Array) {
    const spec = opParamSpecs[opParam];
    const opOffset = opOffsets[opNumber];
    VoiceData.setValueByOffsetInData(spec, opOffset, newValue, data);
  }

  getVoiceName() : string {
    return String.fromCharCode(...this.getVoiceNameData()).trimEnd();
  }
  getVoiceNameData() : Uint8Array {
    return this.rawData.subarray(
      voiceNameOffset, voiceNameOffset + voiceNameLength);
  }
  setVoiceName(newName: string) : VoiceData {
    const newData = this.cloneRawData();
    VoiceData.setVoiceNameInData(newName, newData);
    return new VoiceData(newData);
  }
  private static setVoiceNameInData(newName: string, data: Uint8Array) {
    const padded = newName
      .slice(0, voiceNameLength) // max 10 chars
      .padEnd(voiceNameLength, " "); // space-pad if less
    for (let i = 0; i < voiceNameLength; i++) {
      let char = padded.charCodeAt(i);
      // NOTE: The DX7 panel offers a very limited character set
      // (A-Z, 0-9, space, period and dash) but it appears 
      // to accept any ASCII character in the voice name.  
      // To be on the safe side, we keep it within the
      // printable range:
      char = this.clamp(char, 32, 126);
      data[voiceNameOffset + i] = char;
    }
  }

  getValueByOffset(spec: paramSpec, sectionOffset: number) : number {
    const offset = sectionOffset + spec.offset; 
    return this.rawData[offset];
  }
  setValueByOffset(
    spec: paramSpec,
    sectionOffset: number,
    newValue: number) : VoiceData
  {
    const newData = this.cloneRawData();
    VoiceData.setValueByOffsetInData(spec, sectionOffset, newValue, newData);
    return new VoiceData(newData);
  }
  private static setValueByOffsetInData(
    spec: paramSpec,
    sectionOffset: number,
    newValue: number,
    data: Uint8Array)
  {
    const offset = sectionOffset + spec.offset; 
    data[offset] = newValue;
  }

  private static clamp(value: number, min: number, max: number) : number {
    if (value < min) value = min;
    if (value > max) value = max;
    return value;
  }
}

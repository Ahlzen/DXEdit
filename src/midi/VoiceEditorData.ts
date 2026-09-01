import { buildOneVoiceBulkSysex, buildParameterChangeSysex, buildVoiceNameChangeSysex }
  from '../midi/DX7.ts';


// NOTE: For consistency, parameter names and abbreviations
// are used verbatim from "Yamaha DX7 Sysex Format.txt". (see /docs)


///// Voice parameters

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


/**
 * A single step in the edit history.
 */
export type VoiceEditStep = {
  /**
   * Short summary of the edit, e.g. "OP6 EG Rate 2".
   */
  shortSummary: string,

  /**
   * More detailed summary of the edit, e.g.
   * "Changed OP6 EG Rate 2 from 24 to 39".
   */
  longSummary: string,

  /**
   * Voice data after the edit.
   */
  data: VoiceData,
};



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

  getChecksumByte() : number {
    let sum = this.rawData.reduce((x,y) => x+y, 0);
    sum &= 0x7f;
    return (128 - sum) & 0x7f; // low 7 bits of 2s complement
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

  getVoiceName() : string {
    return String.fromCharCode(...this.getVoiceNameData()).trimEnd();
  }
  getVoiceNameData() : Uint8Array {
    return this.rawData.subarray(
      voiceNameOffset, voiceNameOffset + voiceNameLength);
  }
  setVoiceName(newName: string) : VoiceData {
    const padded = newName
      .slice(0, voiceNameLength) // max 10 chars
      .padEnd(voiceNameLength, " "); // space-pad if less
    const newData = this.cloneRawData();
    for (let i = 0; i < voiceNameLength; i++) {
      let char = padded.charCodeAt(i);
      // NOTE: The DX7 panel offers a very limited character set
      // (A-Z, 0-9, space, period and dash) but it appears 
      // to accept any ASCII character in the voice name.  
      // To be on the safe side, we keep it within the
      // printable range:
      char = this.clamp(char, 32, 126);
      newData[voiceNameOffset + i] = char;
    }
    return new VoiceData(newData);
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
    const offset = sectionOffset + spec.offset; 
    newData[offset] = newValue;
    return new VoiceData(newData);
  }


  private clamp(value: number, min: number, max: number) : number {
    if (value < min) value = min;
    if (value > max) value = max;
    return value;
  }
}


export type sendMidiFuncType = (data: Uint8Array) => void;
export type voiceDataChangedHandler = (voiceData: Uint8Array) => void;


/**
 * Class containing logic required by the Voice Editor UI component.
 * Keeps track of the current voice data and the edit history.
 * Manages the sysex MIDI messages required to keep the
 * device synchronized with the edits.
 * As VoiceData is immutable, functions that update the current
 * voice parameters or history return a new VoiceData.
 */
export class VoiceEditor
{
  // Edit history
  private currentStep: number;
  private editHistory: VoiceEditStep[];

  // Callbacks/handlers
  private sendMidiFunc?: sendMidiFuncType;
  private onVoiceDataChanged?: voiceDataChangedHandler;

  private midiChannel: number;

  constructor(
    midiChannel: number,
    initialData?: VoiceData,
    sendMidiFunc?: sendMidiFuncType,
    onVoiceDataChanged?: voiceDataChangedHandler)
  {
    this.sendMidiFunc = sendMidiFunc;
    this.onVoiceDataChanged = onVoiceDataChanged;
    this.midiChannel = midiChannel;
    this.currentStep = 0;
    this.editHistory = [];
    initialData ??= new VoiceData(getInitVoiceData());

    this.editHistory.push({
        shortSummary: "",
        longSummary: "",
        data: initialData});
  }

  getCurrentEditStep() : VoiceEditStep {
    return this.editHistory[this.currentStep];
  }

  getCurrentData() : VoiceData {
    return this.getCurrentEditStep().data;
  }

  setMidiChannel(newChannel: number) {
    this.midiChannel = newChannel;
  }

  private addEditStep(shortSummary: string, longSummary: string, data: VoiceData) {
    // Prune any "redo" steps
    this.editHistory = this.editHistory.slice(0, this.currentStep + 1);

    // Add new step
    this.editHistory.push({
      shortSummary: shortSummary,
      longSummary: longSummary,
      data: data
    });
    this.currentStep++;

    console.log("Edit history: " + this.editHistory.length + " steps, current step: " + this.currentStep);
  }

  /**
   * @returns The label (description) for the current step, which may be undone. Null if no undo available.
   */
  undoLabel() : string | null {
    if (this.currentStep > 0) {
      return this.editHistory[this.currentStep].shortSummary;
    }
    return null;
  }

  /**
   * @returns The label (description) for the next edit step, which may be redone. Null if no redo available.
   */
  redoLabel() : string | null {
    if (this.currentStep < this.editHistory.length - 1) {
      return this.editHistory[this.currentStep + 1].shortSummary;
    }
    return null;
  }

  undo() : void {
    if (this.currentStep > 0) {
      this.currentStep--;
      const newData = this.getCurrentData();
      this.onVoiceDataChanged?.(newData.cloneRawData());
    }
  }

  redo() : void {
    if (this.currentStep < this.editHistory.length - 1) {
      this.currentStep++;
      const newData = this.getCurrentData();
      this.onVoiceDataChanged?.(newData.cloneRawData());
    }
  }


  initializeVoice() : void {
    const newData = new VoiceData(getInitVoiceData());
    this.addEditStep(
      "Init voice", "Initialized voice", newData);

    const sysexData = buildOneVoiceBulkSysex(newData, this.midiChannel);
    this.sendMidiFunc?.(new Uint8Array(sysexData));
  }

  sendCurrentData() : void {
    const sysexData = buildOneVoiceBulkSysex(this.getCurrentData(), this.midiChannel);
    this.sendMidiFunc?.(new Uint8Array(sysexData));
  }

  sendEnabledOpsData(value: number) : void {
        const sysexData = buildParameterChangeSysex(
      'voice', 155, value, this.midiChannel);
    this.sendMidiFunc?.(new Uint8Array(sysexData));
  }


  ///// Setting parameter values

  setCommonValue(param: commonVoiceParam, newValue: number, isChangeEnd: boolean) : VoiceData {
    const oldValue = this.getCurrentData().getCommonValue(param);
    const newData = this.getCurrentData().setCommonValue(param, newValue);
    if (isChangeEnd) {
      this.addEditStep(
        `${param}`,
        `Changed ${param} from ${oldValue} to ${newValue}`,
        newData);
      
      const offset = commonVoiceParamSpecs[param].offset;
      const sysexData = buildParameterChangeSysex('voice', offset, newValue, this.midiChannel);
      this.sendMidiFunc?.(new Uint8Array(sysexData));
    }
    this.onVoiceDataChanged?.(newData.cloneRawData());
    return newData;
  }

  setEgValue(egType: egType, egParam: egParam, newValue: number, isChangeEnd: boolean) : VoiceData {
    const paramName = `${egType} Env ${egParam}`;
    const oldValue = this.getCurrentData().getEgValue(egType, egParam);
    const newData = this.getCurrentData().setEgValue(egType, egParam, newValue);
    if (isChangeEnd) {
      this.addEditStep(
        `${paramName}`,
        `Changed ${paramName} from ${oldValue} to ${newValue}`,
        newData);

      const offset = egParamSpecs[egParam].offset + egOffsets[egType];
      const sysexData = buildParameterChangeSysex('voice', offset, newValue, this.midiChannel);
      this.sendMidiFunc?.(new Uint8Array(sysexData));
    }
    this.onVoiceDataChanged?.(newData.cloneRawData());
    return newData;
  }
  
  setOpValue(opNumber: opNumber, opParam: opParam, newValue: number, isChangeEnd: boolean) : VoiceData {
    const paramName = `${opNumber} ${opParam}`;
    const oldValue = this.getCurrentData().getOpValue(opNumber, opParam);
    const newData = this.getCurrentData().setOpValue(opNumber, opParam, newValue);
    if (isChangeEnd) {
      this.addEditStep(
        `${paramName}`,
        `Changed ${paramName} from ${oldValue} to ${newValue}`,
        newData);

      const offset = opParamSpecs[opParam].offset + opOffsets[opNumber];
      const sysexData = buildParameterChangeSysex('voice', offset, newValue, this.midiChannel);
      this.sendMidiFunc?.(new Uint8Array(sysexData));
    }
    this.onVoiceDataChanged?.(newData.cloneRawData());
    return newData;
  }

  setVoiceName(newName: string, isChangeEnd: boolean) : VoiceData {
    const oldName = this.getCurrentData().getVoiceName();
    const newData = this.getCurrentData().setVoiceName(newName);
    if (isChangeEnd) {
      this.addEditStep(
        `Voice Name`,
        `Changed Voice Name from "${oldName}" to "${newName}"`,
        newData);
      
      const sysexData = buildVoiceNameChangeSysex(newData, this.midiChannel);
      this.sendMidiFunc?.(new Uint8Array(sysexData));
    }
    this.onVoiceDataChanged?.(newData.cloneRawData());
    return newData;
  }
}


///// Init voice data

/**
 * Returns the voice data set by the "VOICE INIT" feature
 * of the DX7 (mk1).
 */
export function getInitVoiceData(): Uint8Array {
  const data = new Uint8Array([
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
    1, 0, // Freq coarse (1=1.00) / fine (0=1.00)
    7, // detune (7=no detune)

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
    1, 0, // Freq coarse (1=1.00) / fine (0=1.00)
    7, // detune (7=no detune)

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
    1, 0, // Freq coarse (1=1.00) / fine (0=1.00)
    7, // detune (7=no detune)

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
    1, 0, // Freq coarse (1=1.00) / fine (0=1.00)
    7, // detune (7=no detune)

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
    1, 0, // Freq coarse (1=1.00) / fine (0=1.00)
    7, // detune (7=no detune)

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
    1, 0, // Freq coarse (1=1.00) / fine (0=1.00)
    7, // detune (7=no detune)

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

    // Voice name (10 char ASCII, space padded)
    73,78,73,84,32,86,79,73,67,69, // "INIT VOICE"
  ]);

  return data;
}
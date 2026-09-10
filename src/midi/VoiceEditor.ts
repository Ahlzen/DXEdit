import type { egParam, egType, opNumber, opParam, commonVoiceParam } from './VoiceData.ts';
import { VoiceData, commonVoiceParamSpecs, egParamSpecs, opParamSpecs, opOffsets, egOffsets } from './VoiceData.ts';
import { getInitVoiceData } from './initVoiceData.ts';
import { buildOneVoiceBulkSysex, buildParameterChangeSysex, buildVoiceNameChangeSysex } from './DX7.ts';


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
      this.sendCurrentData();
    }
  }

  redo() : void {
    if (this.currentStep < this.editHistory.length - 1) {
      this.currentStep++;
      const newData = this.getCurrentData();
      this.onVoiceDataChanged?.(newData.cloneRawData());
      this.sendCurrentData();
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


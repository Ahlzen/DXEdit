import { VoiceData, packed32VoiceDataLength, packed32VoiceSysexLength, packedVoiceParamDataLength } from "./VoiceData";
import { build32VoiceBulkSysex, calculateChecksum } from './DX7.ts';

/**
 * Mutable class representing a 32-voice bank,
 * as stored on RAM/ROM cartridges and trasmitted
 * via Sysex.
 */
export class VoiceBank
{
  name?: string;
  private voices: VoiceData[];

  constructor(voices: VoiceData[], name?: string) {
    this.name = name;
    if (voices.length != 32) {
      throw new Error("Inital data must contain 32 voices.")
    }
    this.voices = [...voices];
  }

  static getInitBank() : VoiceBank {
    let voices: VoiceData[] = [];
    for (let i = 0; i < 32; i++) {
      voices.push(new VoiceData());
    }
    return new VoiceBank(voices);
  }

  getVoice(voiceNumber: number /* 0-31 */) : VoiceData {
    if (voiceNumber < 0 || voiceNumber >= 32) {
      throw new Error("VoiceNumber must be between 0 and 31");
    }
    return this.voices[voiceNumber];
  }
  setVoice(voiceNumber: number /* 0-31 */, voiceData: VoiceData) {
    if (voiceNumber < 0 || voiceNumber >= 32) {
      throw new Error("VoiceNumber must be between 0 and 31");
    }
    this.voices[voiceNumber] = voiceData;
  }

  static fromSysexData(rawSysexData: Uint8Array) {
    if (rawSysexData.length !== packed32VoiceSysexLength) {
      throw new Error(`32-voice dump sysex: incorrect length. Expected ${packed32VoiceSysexLength}, was ${rawSysexData.length}`);
    }
    let allVoiceData = rawSysexData.slice(6, 6+packed32VoiceDataLength);
    let expectedChecksum = calculateChecksum(allVoiceData);
    let actualChecksum = rawSysexData[6+packed32VoiceDataLength];
    if (actualChecksum !== expectedChecksum) {
      throw new Error(`Invalid checksum.`);
    }
    let voices: VoiceData[] = [];
    for (let i = 0; i < 32; i++) {
      let packedVoiceData = allVoiceData.slice(i*packedVoiceParamDataLength, (i+1)*packedVoiceParamDataLength);
      let voice = VoiceData.fromPackedData(packedVoiceData);
      voices.push(voice);
    }
    return new VoiceBank(voices);
  }

  toSysexData(midiChannel: number) : number[] {
    return build32VoiceBulkSysex(this, midiChannel);
  }
}
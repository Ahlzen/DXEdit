// Features specific to the DX7 (and other DX/TX devices)

import { START_OF_SYSEX, END_OF_SYSEX, YAMAHA_MANUFACTURER_ID } from './WebMidi'
import { VoiceParamData, voiceNameLength } from './VoiceParamData.ts';

const SUB_STATUS_BULK = 0x00;
const SUB_STATUS_PARAMETER = 0x10; // 0x01 << 4
const BULK_FORMAT_SINGLE_VOICE = 0x00;
const BULK_FORMAT_32VOICES = 0x09;
const PARAMETER_GROUP_VOICE = 0x00;
const PARAMETER_GROUP_FUNCTION = 0x08; // 0x02 << 2


// Formatters
// (converts raw number to friendly display value)

export function formatSemitones(n: number) : string { return `±${n} semi`; }
export function formatTranspose(n: number) : string {
  // DX7 shows as "MIDDLE C = C 3" (0=C1, 24=C3, 48=C5)
  const oct = Math.floor(n / 12) + 1;
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const note = notes[n%12];
  return `Mid C = ${note} ${oct}`;
}
export function formatAlgorithm(n: number): string { return String(n+1); }


///// SysEx message builders

export function buildOneVoiceBulkSysex(
  voiceParams: VoiceParamData, midiChannel: number) : number[] {
  return [
    START_OF_SYSEX, 
    YAMAHA_MANUFACTURER_ID,
    SUB_STATUS_BULK + midiChannel,
    BULK_FORMAT_SINGLE_VOICE,
    0x01, 0x1b, // byte count MSB, LSB
    ...voiceParams.getRawData(),
    voiceParams.getChecksumByte(),
    END_OF_SYSEX];
}

export function buildVoiceNameChangeSysex(
  voiceParams: VoiceParamData, midiChannel: number) : number[] {
  let data = [];
  const voiceNameBytes = voiceParams.getVoiceNameData();
  for (let i = 0; i < voiceNameLength; i++) {
    // DX7 Parameter Change sysex (one character at a time)
    // Parameter # 145-154 are Voice Name Char 1-10
    let ascii = voiceNameBytes[i] || 32;
    data.push(
      START_OF_SYSEX, 
      YAMAHA_MANUFACTURER_ID,
      SUB_STATUS_PARAMETER + midiChannel,
      PARAMETER_GROUP_VOICE + 0x01, // parameter bit 8
      17+i, // parameter bit 7..1: 145-128=17
      ascii, // ASCII char
      END_OF_SYSEX);
  }
  return data;
}

export function buildParameterChangeSysex(
  type: 'voice' | 'function',
  parameterNumber: number,
  parameterValue: number,
  midiChannel: number)
{
  return [
    START_OF_SYSEX, 
    YAMAHA_MANUFACTURER_ID,
    SUB_STATUS_PARAMETER + midiChannel,
    // Parameter group# + high bit of parameter number
    (type === 'voice' ? 
      PARAMETER_GROUP_VOICE :
      PARAMETER_GROUP_FUNCTION) +
      (parameterNumber > 127 ? 1 : 0),
    // parameter number (remaining bits)
    parameterNumber & 127,
    parameterValue,
    END_OF_SYSEX];
}


///// Misc

export function buildAllNotesOffMessage(midiChannel: number) : number[] {
  // Control Change: all sounds off, poly mode
  return [0xB0 + midiChannel, 127, 0]
}

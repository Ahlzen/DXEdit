import { expect, test} from 'vitest';
import { packedVoiceParamDataLength, VoiceData, voiceParamDataLength, packed32VoiceSysexLength } from '../../src/midi/VoiceData';
import { getInitVoiceData } from '../../src/midi/initVoiceData.ts';

import fs from 'node:fs';
import path from 'node:path';

// NOTE: we need to allow "any" to simulate bad input data for testing.
/* eslint-disable @typescript-eslint/no-explicit-any */


///// Construction

test("VoiceData constructor with no arguments", () => {
  const voiceData = new VoiceData();
  expect(voiceData).toBeInstanceOf(VoiceData);
  expect(voiceData.cloneRawData().length).toBe(voiceParamDataLength);
  expect(Array.from(voiceData.cloneRawData()).some(byte => byte !== 0)).toBe(true);
});

test ("VoiceData constructor with valid data", () => {
  const initData: Uint8Array = getInitVoiceData();
  const voiceData = new VoiceData(initData);
  expect(voiceData).toBeInstanceOf(VoiceData);
  expect(voiceData.cloneRawData()).toEqual(initData);
});

test("VoiceData constructor throws with invalid size data", () => {
  const invalidData = new Uint8Array(voiceParamDataLength - 1);
  expect(() => new VoiceData(invalidData)).toThrow();
});


///// Formatting

test("Format init voice data", () => {
  const initData: Uint8Array = getInitVoiceData();
  const voiceData = new VoiceData(initData);
  
  // Format object
  const obj = voiceData.toObject();
  expect(obj).toBeDefined();
  expect(obj).toHaveProperty('Voice Name');
  expect(obj).toHaveProperty('Pitch EG');
  expect(obj).toHaveProperty('Algorithm');
  expect(obj).toHaveProperty('OP1');

  // Format JSON
  const json = voiceData.toJSON();
  expect(json).toBeDefined();
  console.log(json);
});


///// Parsing

test("Format and parse voice data", () => {
  const initData: Uint8Array = getInitVoiceData();
  const voiceData = new VoiceData(initData);
  
  // Format object
  const json = voiceData.toJSON();

  // Parse data
  const newVoiceDataFromJson = VoiceData.fromJSON(json);

  // Check that the serialized+deserialized data matches the original
  expect(newVoiceDataFromJson.cloneRawData()).toEqual(initData);
});

test("Parse object with missing or invalid data", () => {
  
  let obj = new VoiceData().toObject();
  delete (obj as any)['Algorithm']; // Algorithm is required
  expect(() => VoiceData.fromObject(obj)).toThrow();

  obj = new VoiceData().toObject();
  (obj as any)['Algorithm'] = "invalid"; // Algorithm must be a number
  expect(() => VoiceData.fromObject(obj)).toThrow();

  obj = new VoiceData().toObject();
  delete (obj as any)['Pitch EG']; // Pitch EG is required
  expect(() => VoiceData.fromObject(obj)).toThrow();

  obj = new VoiceData().toObject();
  (obj['Pitch EG'] as any).L1 = "invalid"; // Pitch EG L1 must be a number
  expect(() => VoiceData.fromObject(obj)).toThrow();

  obj = new VoiceData().toObject();
  delete (obj as any)['Voice Name']; // Voice Name is required
  expect(() => VoiceData.fromObject(obj)).toThrow();

  obj = new VoiceData().toObject();
  (obj as any)['Voice Name'] = 123; // Voice Name must be a string
  expect(() => VoiceData.fromObject(obj)).toThrow();
  
  obj = new VoiceData().toObject();
  delete (obj as any)['OP1']; // OP1 is required
  expect(() => VoiceData.fromObject(obj)).toThrow();

  obj = new VoiceData().toObject();
  (obj['OP1'] as any)["Operator Output Level"] = "invalid"; // OP1 Level must be a number
  expect(() => VoiceData.fromObject(obj)).toThrow();
});

test("Parse invalid JSON", () => {
  expect(() => VoiceData.fromJSON("invalid json")).toThrow();
});


///// Packed data

test("Pack and unpack init voice data", () => {
  const initVoice = new VoiceData();
  
  const initVoiceData: Uint8Array = initVoice.cloneRawData();
  expect(initVoiceData.length).toEqual(voiceParamDataLength);

  // pack data
  const packedData: Uint8Array = initVoice.toPackedData();
  expect(packedData.length).toEqual(packedVoiceParamDataLength);

  // unpack data and compare to original
  const unpackedVoice = VoiceData.fromPackedData(packedData);
  const unpackedVoiceData = unpackedVoice.cloneRawData();
  expect(unpackedVoiceData.length).toEqual(voiceParamDataLength);
  expect(unpackedVoiceData).toEqual(initVoiceData);
  expect(unpackedVoice.toJSON()).toEqual(initVoice.toJSON());
});

test ("Parse ROM-1 32-voice bank data", () => {
  const filePath = path.resolve(__dirname, '../data/ROM1A.syx');
  const fileData = fs.readFileSync(filePath);

  // A DX7 32-voice sysex dump should be:
  //  6 byte header
  //  4096 (32x128) bytes packed voice data
  //  1 byte checksum
  //  1 byte end-of-sysex marker
  // Total: 4104 bytes

  expect(fileData).toBeInstanceOf(Buffer);
  expect(fileData.length).toBe(packed32VoiceSysexLength);

  // Unpack and print the name of each voice in the bank
  for (let voice = 0; voice < 32; voice++) {
    const packedVoiceData = fileData.slice(6+voice*128, 6+voice*128+128);
    const voiceData = VoiceData.fromPackedData(packedVoiceData);
    const voiceName = voiceData.getVoiceName();
    console.log((voice+1) + ": " + voiceName);
  }

});
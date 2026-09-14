import { expect, test} from 'vitest';
import { VoiceData, voiceParamDataLength } from '../../src/midi/VoiceData';
import { getInitVoiceData } from '../../src/midi/initVoiceData.ts';


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
  const obj = voiceData.toObject();
  const json = voiceData.toJSON();

  // Parse data
  const newVoiceDataFromObject = new VoiceData();
  newVoiceDataFromObject.parseJSON(json);

  // Check that the serialized+deserialized data matches the original
  expect(newVoiceDataFromObject.cloneRawData()).toEqual(initData);
});

test("Parse object with missing or invalid data", () => {
  
  const newVoiceData = new VoiceData();

  let obj = new VoiceData().toObject();
  delete (obj as any)['Algorithm']; // Algorithm is required
  expect(() => newVoiceData.parseObject(obj)).toThrow();

  obj = new VoiceData().toObject();
  (obj as any)['Algorithm'] = "invalid"; // Algorithm must be a number
  expect(() => newVoiceData.parseObject(obj)).toThrow();

  obj = new VoiceData().toObject();
  delete (obj as any)['Pitch EG']; // Pitch EG is required
  expect(() => newVoiceData.parseObject(obj)).toThrow();

  obj = new VoiceData().toObject();
  (obj['Pitch EG'] as any).L1 = "invalid"; // Pitch EG L1 must be a number
  expect(() => newVoiceData.parseObject(obj)).toThrow();

  obj = new VoiceData().toObject();
  delete (obj as any)['Voice Name']; // Voice Name is required
  expect(() => newVoiceData.parseObject(obj)).toThrow();

  obj = new VoiceData().toObject();
  (obj as any)['Voice Name'] = 123; // Voice Name must be a string
  expect(() => newVoiceData.parseObject(obj)).toThrow();
  
  obj = new VoiceData().toObject();
  delete (obj as any)['OP1']; // OP1 is required
  expect(() => newVoiceData.parseObject(obj)).toThrow();

  obj = new VoiceData().toObject();
  (obj['OP1'] as any)["Operator Output Level"] = "invalid"; // OP1 Level must be a number
  expect(() => newVoiceData.parseObject(obj)).toThrow();
});

test("Parse invalid JSON", () => {
  const newVoiceData = new VoiceData();
  expect(() => newVoiceData.parseJSON("invalid json")).toThrow();
});

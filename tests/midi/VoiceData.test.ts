import { expect, test} from 'vitest';
import { VoiceData, voiceParamDataLength } from '../../src/midi/VoiceData';
import { getInitVoiceData } from '../../src/midi/initVoiceData.ts';

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

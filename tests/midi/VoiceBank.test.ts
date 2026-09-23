import { expect, test} from 'vitest';
import { packed32VoiceSysexLength, VoiceData } from '../../src/midi/VoiceData';
import { VoiceBank } from '../../src/midi/VoiceBank.ts';

import fs from 'node:fs';
import path from 'node:path';


///// Construction

test("VoiceBank constructor with 32 init patches", () => {
  const voiceData = new VoiceData();
  expect(voiceData.getVoiceName()).toBe("INIT VOICE");
  const voices = Array(32).fill(voiceData);
  const voiceBank = new VoiceBank(voices);

  expect(voiceBank.name).toBe(undefined);
  expect(voiceBank.getVoice(0).getVoiceName()).toBe("INIT VOICE");
  expect(voiceBank.getVoice(31).getVoiceName()).toBe("INIT VOICE");
  expect(() => voiceBank.getVoice(32)).toThrow();
});

test("Create VoiceBank from sysex data", () => {
  const filePath = path.resolve(__dirname, '../data/ROM1A.syx');
  const fileData = fs.readFileSync(filePath);
  expect(fileData).toBeInstanceOf(Buffer);
  expect(fileData.length).toBe(packed32VoiceSysexLength);

  const voiceBank = VoiceBank.fromSysexData(fileData);
  expect(voiceBank.name).toBe(undefined);
  expect(voiceBank.getVoice(0).getVoiceName()).toBe("BRASS   1");
  expect(voiceBank.getVoice(25).getVoiceName()).toBe("TUB BELLS");

  const initVoice = new VoiceData();
  voiceBank.setVoice(12, initVoice);
  expect(voiceBank.getVoice(12).getVoiceName()).toBe("INIT VOICE");
});
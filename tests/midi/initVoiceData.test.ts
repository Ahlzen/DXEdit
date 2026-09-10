import { expect, test} from 'vitest';
import { getInitVoiceData } from '../../src/midi/initVoiceData.ts';
import { voiceParamDataLength } from '../../src/midi/VoiceData.ts';

test("InitVoiceData returns plausible data", () => {
  const data = getInitVoiceData();
  // Verify data is right type, right size and not all zeros
  expect(data).toBeInstanceOf(Uint8Array);
  expect(data.length).toBe(voiceParamDataLength);
  expect(Array.from(data).some(byte => byte !== 0)).toBe(true);
});

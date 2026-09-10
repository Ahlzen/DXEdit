import { expect, test} from 'vitest';

import { VoiceEditor } from '../../src/midi/VoiceEditor.ts';

test("VoiceEditor can be instantiated", () => {
  const voiceEditor = new VoiceEditor(
    0, // midiChannel
    undefined, // initial data
    () => {}, // handleSendMidi
    () => {}); // handleNewVoiceData
  expect(voiceEditor).toBeInstanceOf(VoiceEditor);
});

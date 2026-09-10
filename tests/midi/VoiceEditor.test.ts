import { expect, test, vi} from 'vitest';

import { VoiceEditor } from '../../src/midi/VoiceEditor.ts';

test("VoiceEditor can be instantiated", () => {
  const voiceEditor = new VoiceEditor(
    0, // midiChannel
    undefined, // initial data
    () => {}, // handleSendMidi
    () => {}); // handleNewVoiceData
  expect(voiceEditor).toBeInstanceOf(VoiceEditor);
});

test("VoiceEditor history", () => {

  // mock event handlers
  const sendMidiHandler = vi.fn();
  const newVoiceDataHandler = vi.fn();

  const voiceEditor = new VoiceEditor(
    0, // midiChannel
    undefined, // initial data
    sendMidiHandler,
    newVoiceDataHandler);

  expect(voiceEditor.undoLabel()).toBe(null);
  expect(voiceEditor.redoLabel()).toBe(null);
  expect(sendMidiHandler).not.toHaveBeenCalled();
  expect(newVoiceDataHandler).not.toHaveBeenCalled();

  voiceEditor.setCommonValue("Algorithm", 21, true);
  expect(voiceEditor.undoLabel()).not.toBe(null);
  expect(voiceEditor.redoLabel()).toBe(null);
  expect(sendMidiHandler).toHaveBeenCalledTimes(1);
  expect(newVoiceDataHandler).toHaveBeenCalledTimes(1);

  voiceEditor.undo();
  expect(voiceEditor.undoLabel()).toBe(null);
  expect(voiceEditor.redoLabel()).not.toBe(null);
  expect(sendMidiHandler).toHaveBeenCalledTimes(2);
  expect(newVoiceDataHandler).toHaveBeenCalledTimes(2);
});


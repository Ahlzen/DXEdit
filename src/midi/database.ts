import { Dexie, type EntityTable, type PromiseExtended } from "dexie";
import { VoiceData } from "./VoiceData";
import { VoiceBank } from "./VoiceBank";

import {
  rom1aSysex, rom1bSysex,
  rom2aSysex, rom2bSysex,
  rom3aSysex, rom3bSysex,
  rom4aSysex, rom4bSysex
} from './factoryRoms';


///// Dexie interfaces

export interface VoiceEntity {
  id: number,
  bankId?: number,
  name: string,
  data: Uint8Array,
  starred: boolean,
};

export interface BankEntity {
  id: number,
  name?: string,
  starred: boolean,
  //data: Uint8Array, // 155 bytes
};


///// Database

export const db = new Dexie("VoiceLibrary") as Dexie & {
  voices: EntityTable<VoiceEntity, "id">,
  banks: EntityTable<BankEntity, "id">,
};

db.version(1).stores({
  voices: "++id, bankId, name, data",
  banks: "++id, name",
});


///// Librarian helpers

export type LibraryItem = VoiceData | VoiceBank;

export function addVoiceItem(voice: VoiceData) {
  db.voices.add({
    bankId: undefined,
    name: voice.getVoiceName(),
    data: voice.cloneRawData(),
    starred: false,
  })
}

export function addBankItem(bank: VoiceBank) {
  let result: PromiseExtended<number> = db.banks.add(
    { name: bank.name, starred: false });
  // await add, since we need the id
  result.then((bankId: number) => {
    for (let v = 0; v < 32; v++) {
      let voice = bank.getVoice(v);
      db.voices.add({
        bankId: bankId,
        name: voice.getVoiceName(),
        data: voice.cloneRawData(),
        starred: false,
      });
    }
  });
}

export function starVoiceItem(voiceId: number, starred: boolean) {
  db.voices
    .where("id").equals(voiceId)
    .modify({ starred: starred });
}
export function starVoiceBank(bankId: number, starred: boolean) {
  db.banks
    .where("id").equals(bankId)
    .modify({ starred: starred });
}

export function addFactoryBanks() {
  let newItems = [
    VoiceBank.fromSysexData(rom1aSysex, "ROM 1A"),
    VoiceBank.fromSysexData(rom1bSysex, "ROM 1B"),
    VoiceBank.fromSysexData(rom2aSysex, "ROM 2A"),
    VoiceBank.fromSysexData(rom2bSysex, "ROM 2B"),
    VoiceBank.fromSysexData(rom3aSysex, "ROM 3A"),
    VoiceBank.fromSysexData(rom3bSysex, "ROM 3B"),
    VoiceBank.fromSysexData(rom4aSysex, "ROM 4A"),
    VoiceBank.fromSysexData(rom4bSysex, "ROM 4B")];
  for (let item of newItems) {
    addBankItem(item);
  }
}

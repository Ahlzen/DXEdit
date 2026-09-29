import { VoiceData } from './VoiceData';
import { VoiceBank } from './VoiceBank';

import { rom1aSysex, rom1bSysex, rom2aSysex, rom2bSysex,
  rom3aSysex, rom3bSysex, rom4aSysex, rom4bSysex
 } from './factoryRoms';

export type LibraryItem = VoiceData | VoiceBank;

/**
 * Immutable class for a library of voices and voice banks,
 * and associated functions.
 */
export class Librarian
{
  private items: LibraryItem[];

  constructor(items?: LibraryItem[]) {
    this.items = items || [];
  }

  static getWithFactoryBanks(): Librarian {
    let librarian = new Librarian();
    librarian = librarian.addFactoryBanks();
    return librarian;
  }

  length(): number { return this.items.length; }

  getItem(n: number) { return this.items[n]; }

  insertItem(n: number, item: LibraryItem) : Librarian {
    throw new Error("Not yet implemented");
  }

  addItem(item: LibraryItem) : Librarian {
    throw new Error("Not yet implemented");
  }
  
  deleteItem(n: number) : Librarian {
    throw new Error("Not yet implemented");
  }


  addFactoryBanks(): Librarian {
    let newItems = [
      VoiceBank.fromSysexData(rom1aSysex, "ROM 1A"),
      VoiceBank.fromSysexData(rom1bSysex, "ROM 1B"),
      VoiceBank.fromSysexData(rom2aSysex, "ROM 2A"),
      VoiceBank.fromSysexData(rom2bSysex, "ROM 2B"),
      VoiceBank.fromSysexData(rom3aSysex, "ROM 3A"),
      VoiceBank.fromSysexData(rom3bSysex, "ROM 3B"),
      VoiceBank.fromSysexData(rom4aSysex, "ROM 4A"),
      VoiceBank.fromSysexData(rom4bSysex, "ROM 4B"),  
      ...this.items];
    return new Librarian(newItems);
  }

}
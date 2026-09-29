import { Librarian, type LibraryItem } from "../midi/Librarian";
import { VoiceBank } from "../midi/VoiceBank";
import { VoiceData } from "../midi/VoiceData";

export function DXELibrarian(props: {
  librarian: Librarian,
})
{
  ///// UI

  const items = [];
  for (let i = 0; i < props.librarian.length(); i++) {
    let item: LibraryItem = props.librarian.getItem(i);
    if (item instanceof VoiceData) {
      const voice = item as VoiceData;
      items.push(<li key={i}>{voice.getVoiceName()}</li>);
    }
    else if (item instanceof VoiceBank) {
      const bank = item as VoiceBank;
      let subItems = [];
      for (let s = 0; s < 32; s++) {
        const voice = item.getVoice(s);
        subItems.push(<li key={s}>{voice.getVoiceName()}</li>)
      }
      items.push(<li>{bank.name || "Voice Bank"}<ul>{subItems}</ul></li>);
    }
  }

  return (
    <>
      <h2>Librarian</h2>
      <ul>
        {items}
      </ul>
    </>
  );
}
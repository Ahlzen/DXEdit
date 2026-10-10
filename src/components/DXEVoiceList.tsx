import { db } from "../midi/database";
import { useLiveQuery } from "dexie-react-hooks"
import { starVoiceItem } from "../midi/database";

export function DXEVoiceList(props: {
  searchPhrase: string | undefined,
  starredOnly: boolean})
{
  const searchPhrase = props.searchPhrase?.trim().toLowerCase();
  let voices = useLiveQuery(() => db.voices.toArray());

  if (props.starredOnly) {
    voices = voices?.filter((v) => v.starred);
  }
  if (props.searchPhrase !== undefined) {
    voices =voices?.filter((v) => v.name.toLowerCase().includes(searchPhrase as string));
  }

  return (
    <div className="voice-list">
      {voices?.map((voice) => (
        <div key={voice.id} className="voice-item">
          <span className="star" onClick={() => starVoiceItem(voice.id, !voice.starred)}>
            {voice.starred ? "★" : "☆"}
          </span>
          &nbsp;
          <span>{voice.name}</span>
        </div>
      ))}
    </div>
  )
}
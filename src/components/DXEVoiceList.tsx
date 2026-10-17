import { db, type VoiceEntity } from "../midi/database";
import { useLiveQuery } from "dexie-react-hooks"
import { Title } from "@mantine/core";
import { starVoiceItem } from "../midi/database";
import { useState } from "react";

import './DXEVoiceList.css';

export function DXEVoiceList(props: {
  searchPhrase: string | undefined,
  starredOnly: boolean,
  onVoiceSelected: (voiceId: number | null) => void})
{
  ///// State

  const [selectedVoiceId, setSelectedVoiceId] = useState<number | null>(null);


  ///// Event handlers

  const handleVoiceItemSelected = function(voiceId: number) {
    setSelectedVoiceId(voiceId);
    props.onVoiceSelected(voiceId);
  };


  const searchPhrase = props.searchPhrase?.trim().toLowerCase();

  // Get voices
  let voices: VoiceEntity[] | undefined = useLiveQuery(() => db.voices.toArray());
  if (props.starredOnly) {
    voices = voices?.filter((v) => v.starred);
  }
  if (props.searchPhrase !== undefined) {
    voices =voices?.filter((v) => v.name.toLowerCase().includes(searchPhrase as string));
  }

  // Get banks
  const banks = useLiveQuery(() => db.banks.toArray());

  // Index voices by bankId
  const voicesByBank = new Map<number, VoiceEntity[]>();
  const orphanVoices: VoiceEntity[] = []; // voices with no "parent" bank
  for (const voice of voices ?? []) {
    if (voice.bankId == null) {
      orphanVoices.push(voice);
      continue;
    }
    const bankVoices = voicesByBank.get(voice.bankId);
    if (bankVoices) {
      bankVoices.push(voice);
    } else {
      voicesByBank.set(voice.bankId, [voice]);
    }
  }

  // Remove banks with no matching voices
  const filteredBanks = banks?.filter((bank) => voicesByBank.has(bank.id));

  return (
    <div className="voice-list">
      {filteredBanks?.map((bank) => (
        <section key={bank.id} className="bank-group">
          <Title order={3} className="bank-name">
            {bank.name ?? `Bank ${bank.id} (unnamed)`}
          </Title>

          <div className="bank-voices">
          {(voicesByBank.get(bank.id) ?? []).map((voice) => (
            <div key={voice.id}
              className={"voice-item " + (selectedVoiceId === voice.id ? 'selected' : '')}
              onClick={() => handleVoiceItemSelected(voice.id)}>
              <span
                className="starred"
                onClick={() => starVoiceItem(voice.id, !voice.starred)}>
                {voice.starred ? "★" : "☆"}
              </span>
              &nbsp;
              <span>{voice.name}</span>
            </div>
          ))}
          </div>
        </section>
      ))}
    </div>
  );
}
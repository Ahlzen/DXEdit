import { db, type VoiceEntity } from "../midi/database";
import { useLiveQuery } from "dexie-react-hooks"
import { Title } from "@mantine/core";
import { starVoiceItem, starVoiceBank } from "../midi/database";

import './DXEVoiceList.css';

export function DXEVoiceList(props: {
  searchPhrase: string | undefined,
  starredOnly: boolean,
  groupByBank: boolean,
  selectedVoiceId: number | null,
  selectedBankId: number | null,
  onVoiceSelected: (voiceId: number | null) => void,
  onBankSelected: (bankId: number | null) => void
  })
{

  ///// Event handlers

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

  if (props.groupByBank) {
      return (
      <div className="voiceListArea voiceBankList">
        {filteredBanks?.map((bank) => (
          <section key={bank.id} className={"voiceBank " + (props.selectedBankId === bank.id ? 'selected' : '')}>
            <Title order={3} className="bankName"
              onClick={() => props.onBankSelected(bank.id)}>
              <span
                className="starred"
                onClick={() => starVoiceBank(bank.id, !bank.starred)}>
                {bank.starred ? "★" : "☆"}
              </span>
              &nbsp;
              <span>
                {bank.name ?? `Bank ${bank.id} (unnamed)`}
              </span>
            </Title>
            <div className="bankVoiceList">
            {(voicesByBank.get(bank.id) ?? []).map((voice) => (
              <div key={voice.id}
                className={"voiceItem " + (props.selectedVoiceId === voice.id ? 'selected' : '')}
                onClick={() => props.onVoiceSelected(voice.id)}>
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
  else
  {
    return (
      <div className="voiceListArea ungroupedVoiceList">
        {(voices ?? []).map((voice) => (
          <div key={voice.id}
            className={"voiceItem " + (props.selectedVoiceId === voice.id ? 'selected' : '')}
            onClick={() => props.onVoiceSelected(voice.id)}>
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
    )
  }
}
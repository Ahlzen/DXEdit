import { useState } from "react";
import { DXEVoiceList } from "./DXEVoiceList";
import { Title, Text, Stack, TextInput, Group } from "@mantine/core";
import { DXEVoiceDetails } from "./DXEVoiceDetails";
import { DXEBankDetails } from "./DXEBankDetails";
import { VoiceData } from "../midi/VoiceData";
import { buildOneVoiceBulkSysex } from "../midi/DX7";
import { db, getVoiceBankById } from "../midi/database";
import type { VoiceBank } from "../midi/VoiceBank";

export function DXELibrarian(props: {
  midiChannel: number,
  sendMidiFunc?: (data: Uint8Array) => void,
  onVoiceEdit?: (voiceData: VoiceData) => void,
  onVoiceDownload?: (voiceData: VoiceData) => void,
  onBankSend?: (bankData: VoiceBank) => void,
  onBankDownload?: (bankData: VoiceBank) => void
})
{
  const [searchPhrase, setSearchPhrase] = useState<string | undefined>(undefined);
  const [starredOnly, setStarredOnly] = useState<boolean>(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<number|null>(null);
  const [selectedBankId, setSelectedBankId] = useState<number|null>(null);
  const [autoPlaySelected, setAutoPlaySelected] = useState<boolean>(false);
  const [groupByBank, setGroupByBank] = useState<boolean>(true);

  function handleSearchPhraseChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchPhrase(event.target.value);
  }
  function handleStarredOnlyChange(event: React.ChangeEvent<HTMLInputElement>) {
    setStarredOnly(event.target.checked);
  }
  function handleVoiceSelected(voiceId: number | null) {
    setSelectedVoiceId(voiceId);
    setSelectedBankId(null);
    if (autoPlaySelected && voiceId !== null) {
      db.voices.get(voiceId).then((v) => {
        const rawVoiceData = v?.data;
        if (rawVoiceData) {
          const sysexData = buildOneVoiceBulkSysex(
            new VoiceData(rawVoiceData), 
            props.midiChannel,
          );
          console.log(`DXELibrarian: Sending sysex for voice ${voiceId} (${sysexData.length} bytes)`);
          props.sendMidiFunc?.(new Uint8Array(sysexData));
        }
      });
    }
  }
  function handleVoiceEdit(voiceId: number) {
    db.voices.get(voiceId).then((v) => {
      if (v) {
        const voiceData = new VoiceData(v.data);
        props.onVoiceEdit?.(voiceData);
      }
    });
  }
  function handleVoiceDownload(voiceId: number) {
    db.voices.get(voiceId).then((v) => {
      if (v) {
        const voiceData = new VoiceData(v.data);
        props.onVoiceDownload?.(voiceData);
      }
    });
  }
  function handleBankSelected(bankId: number | null) {
    setSelectedBankId(bankId);
    setSelectedVoiceId(null);
  }
  function handleBankSend(bankId: number) {
    getVoiceBankById(bankId).then((bank) => {
      if (bank !== null) {
        props.onBankSend?.(bank);
      }
      else console.log("bank is null");
    });
  }
  function handleBankDownload(bankId: number) {
    getVoiceBankById(bankId).then((bank) => {
      if (bank !== null) {
        props.onBankDownload?.(bank);
      }
      else console.log("bank is null");
    });
  }

  return (
    <div className="librarian">

      {/* TODO: Convert to use Mantine controls */}

      {/* Top controls */}
      <Group align="top" gap="xl" mb="md" className="librarianTopControls">

        {/* View / Settings */}
        <Stack mt="md">
          <Title order={2} mb="md">
            View / Settings
          </Title>
          <Group>
            <Text>Auto-play selected voice:</Text>
            <input type="checkbox" checked={autoPlaySelected} onChange={(e) => setAutoPlaySelected(e.target.checked)} />
          </Group>
          <Group>
            <Text>Group by bank</Text>
            <input type="checkbox" checked={groupByBank} onChange={(e) => setGroupByBank(e.target.checked)} />
          </Group>
        </Stack>
      

        {/* Search/Filter */}
        <Stack mt="md">
          <Title order={2} mb="md">
            Search and Filter
          </Title>
          <Group>
            <Text>Search:</Text>
            <TextInput
              placeholder="Search voices..."
              value={searchPhrase}
              onChange={handleSearchPhraseChange} />
          </Group>
          <Group>
            <Text>Starred only:</Text>
            <input type="checkbox" checked={starredOnly}
              onChange={handleStarredOnlyChange} />
          </Group>
        </Stack>

        {/* Selected voice or bank details */}
        {selectedVoiceId && (
          <DXEVoiceDetails voiceId={selectedVoiceId}
            onVoiceEdit={handleVoiceEdit}
            onVoiceDownload={handleVoiceDownload}/>
        )}
        {selectedBankId && (
          <DXEBankDetails bankId={selectedBankId}
            onBankSend={handleBankSend}
            onBankDownload={handleBankDownload} />
        )}
      </Group>

      <Title mb="md" order={2}>On Device/Browser</Title>
      <DXEVoiceList
        searchPhrase={searchPhrase}
        starredOnly={starredOnly}
        groupByBank={groupByBank}
        selectedVoiceId={selectedVoiceId}
        selectedBankId={selectedBankId}
        onVoiceSelected={handleVoiceSelected}
        onBankSelected={handleBankSelected}
        />
    </div>
  );
}
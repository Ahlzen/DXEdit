import { useState } from "react";
import { DXEVoiceList } from "./DXEVoiceList";
import { Title, Text, Stack, TextInput, Group } from "@mantine/core";
import { DXEVoiceDetails } from "./DXEVoiceDetails";
import { VoiceData } from "../midi/VoiceData";
import { buildOneVoiceBulkSysex } from "../midi/DX7";
import { db } from "../midi/database";

export function DXELibrarian(props: {
  midiChannel: number,
  sendMidiFunc?: (data: Uint8Array) => void,
  onVoiceEdit?: (voiceData: VoiceData) => void,
  onVoiceDownload?: (voiceData: VoiceData) => void,
})
{
  const [searchPhrase, setSearchPhrase] = useState<string | undefined>(undefined);
  const [starredOnly, setStarredOnly] = useState<boolean>(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<number|null>(null);
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


  return (
    <div className="librarian">

      {/* TODO: Convert to use Mantine controls */}

      {/* Top controls */}
      <Group align="top" gap="xl" mb="md">

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

        {/* Voice details */}
        <DXEVoiceDetails voiceId={selectedVoiceId}
          onVoiceEdit={handleVoiceEdit}
          onVoiceDownload={handleVoiceDownload}
          />

      </Group>

      <Title mb="md" order={2}>On Device/Browser</Title>
      <DXEVoiceList
        searchPhrase={searchPhrase}
        starredOnly={starredOnly}
        groupByBank={groupByBank}
        onVoiceSelected={handleVoiceSelected}
        />
    </div>
  );
}
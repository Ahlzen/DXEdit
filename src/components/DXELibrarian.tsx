import { useState } from "react";
import { DXEVoiceList } from "./DXEVoiceList";
import { Title, Stack, TextInput, Group, Checkbox, Space } from "@mantine/core";
import { DXEVoiceDetails } from "./DXEVoiceDetails";
import { DXEBankDetails } from "./DXEBankDetails";
import { VoiceData } from "../midi/VoiceData";
import { buildOneVoiceBulkSysex } from "../midi/DX7";
import { db, getVoiceBankById } from "../midi/database";
import type { VoiceBank } from "../midi/VoiceBank";

export function DXELibrarian(props: {
  midiChannel: number,
  selectedVoiceId: number | null,
  selectedBankId: number | null,
  sendMidiFunc?: (data: Uint8Array) => void,
  onVoiceSelected?: (voiceId: number | null) => void,
  onVoiceEdit?: (voiceData: VoiceData) => void,
  onVoiceDownload?: (voiceData: VoiceData) => void,
  onBankSelected?: (bankId: number | null) => void,
  onBankSend?: (bankData: VoiceBank) => void,
  onBankDownload?: (bankData: VoiceBank) => void,
}) {
  const [searchPhrase, setSearchPhrase] = useState<string | undefined>(undefined);
  const [starredOnly, setStarredOnly] = useState<boolean>(false);
  const [autoPlaySelected, setAutoPlaySelected] = useState<boolean>(false);
  const [groupByBank, setGroupByBank] = useState<boolean>(true);

  function handleVoiceSelected(voiceId: number | null) {
    props.onBankSelected?.(null);
    props.onVoiceSelected?.(voiceId);
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
    props.onVoiceSelected?.(null);
    props.onBankSelected?.(bankId);
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

      {/* Top controls */}
      <Group align="top" gap="xl" mb="md" className="librarianTopControls">

        {/* View / Settings */}
        <Stack mt="md">
          <Title order={2} mb="md">
            View / Settings
          </Title>
          <Group>
            <Checkbox checked={autoPlaySelected}
              label="Auto-play selected voice"
              onChange={(e) => setAutoPlaySelected(e.target.checked)} />
          </Group>
          <Space h="xs"/>
          <Group>
            <Checkbox checked={groupByBank}
              label="Group by bank"
              onChange={(e) => setGroupByBank(e.target.checked)} />
          </Group>
        </Stack>
      
        {/* Search/Filter */}
        <Stack mt="md">
          <Title order={2} mb="md">
            Search and Filter
          </Title>
          <Group>
            <TextInput
              placeholder="search voice"
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)} />
          </Group>
          <Space h="xs"/>
          <Group>
            <Checkbox checked={starredOnly}
              label="Starred only"
              onChange={(e) => setStarredOnly(e.target.checked)} />
          </Group>
        </Stack>

        {/* Selected voice or bank details */}
        {props.selectedVoiceId && (
          <DXEVoiceDetails voiceId={props.selectedVoiceId}
            onVoiceEdit={handleVoiceEdit}
            onVoiceDownload={handleVoiceDownload}/>
        )}
        {props.selectedBankId && (
          <DXEBankDetails bankId={props.selectedBankId}
            onBankSend={handleBankSend}
            onBankDownload={handleBankDownload} />
        )}
      </Group>

      <Title mb="md" order={2}>On Device/Browser</Title>
      <DXEVoiceList
        searchPhrase={searchPhrase}
        starredOnly={starredOnly}
        groupByBank={groupByBank}
        selectedVoiceId={props.selectedVoiceId}
        selectedBankId={props.selectedBankId}
        onVoiceSelected={handleVoiceSelected}
        onBankSelected={handleBankSelected}
        />
    </div>
  );
}
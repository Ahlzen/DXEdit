import { useLiveQuery } from "dexie-react-hooks";
import { FileArrowDownIcon, FadersHorizontalIcon } from '@phosphor-icons/react';
import { Text, Stack, Group, Title, Button } from "@mantine/core";
import { db, starVoiceItem } from "../midi/database";
import './DXEVoiceList.css';

export function DXEVoiceDetails(props: {
    voiceId: number | null,
    onVoiceEdit: (voiceId: number) => void,
    onVoiceDownload: (voiceId: number) => void,
  })
{
  function handleEditButtonClick() {
    if (props.voiceId !== null) {
      props.onVoiceEdit?.(props.voiceId);
    }
  }
  
  function handleDownloadButtonClick() {
    if (props.voiceId !== null) {
      props.onVoiceDownload?.(props.voiceId);
    }
  }

  const voice = useLiveQuery(() =>
    props.voiceId !== null ? db.voices.get(props.voiceId) : undefined,
    [props.voiceId]);
  const bank = useLiveQuery(() =>
    voice?.bankId !== undefined ? db.banks.get(voice.bankId) : undefined,
    [voice?.bankId]);

  return (
    <div className="voiceDetails">
      {voice && (
        <Stack mt="md">
          <Title order={2}>Voice Details</Title>
          <Title order={3} mt="xs">
            <span
                className="starred"
                onClick={() => starVoiceItem(voice.id, !voice.starred)}>
                {voice.starred ? "★" : "☆"}
            </span>
            &nbsp;
            {voice.name}
          </Title>
          <Text size="sm"><span className="inlineTitle">Bank:</span>
           {bank?.name ?? `Bank ${voice.bankId}`}</Text>
          <Group mt="md">
            <Button onClick={handleEditButtonClick} leftSection={<FadersHorizontalIcon />}>
              Edit
            </Button>
            {/* <Space w="xs" /> */}
            <Button onClick={handleDownloadButtonClick} leftSection={<FileArrowDownIcon />}>
              Download
            </Button>
          </Group>
        </Stack>
      )}
    </div>
  );
}
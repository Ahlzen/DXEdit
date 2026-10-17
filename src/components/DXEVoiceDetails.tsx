import { useLiveQuery } from "dexie-react-hooks";
import { Text, Stack, Group, Title, Button, Space } from "@mantine/core";
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
    <div className="voice-details">
      {voice && (
        <Stack mt="md">
          <Title order={2}>Voice details</Title>
          <Title order={3}>
            <span
                className="starred"
                onClick={() => starVoiceItem(voice.id, !voice.starred)}>
                {voice.starred ? "★" : "☆"}
            </span>
            {voice.name}
          </Title>
          <Text size="sm">Bank: {bank?.name ?? `Bank ${voice.bankId}`}</Text>
          <Group>
            <Button onClick={handleEditButtonClick}>Edit</Button>
            <Space w="xs" />
            <Button onClick={handleDownloadButtonClick}>Download</Button>
          </Group>
        </Stack>
      )}
    </div>
  );
}
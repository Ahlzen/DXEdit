import { useLiveQuery } from "dexie-react-hooks";
import { FileArrowDownIcon, ArrowUpRightIcon } from '@phosphor-icons/react';
import { Stack, Group, Title, Button } from "@mantine/core";
import { db, starVoiceBank } from "../midi/database";
import './DXEVoiceList.css';

export function DXEBankDetails(props: {
  bankId: number | null,
  onBankSend: (bankId: number) => void,
  onBankDownload: (bankId: number) => void,
})  
{
  const bank = useLiveQuery(() =>
    props.bankId !== null ? db.banks.get(props.bankId) : undefined,
    [props.bankId]);


  function handleSendButtonClick() {
    if (props.bankId) {
      props.onBankSend?.(props.bankId);
    }
  }
  
  function handleDownloadButtonClick() {
    if (props.bankId !== null) {
      props.onBankDownload?.(props.bankId);
    }
  }

  return (
    <div className="bankDetails">
      {bank && (
        <Stack mt="md">
          <Title order={2}>Bank Details</Title>
          <Title order={3} mt="xs">
            <span
                className="starred"
                onClick={() => starVoiceBank(bank.id, !bank.starred)}>
                {bank.starred ? "★" : "☆"}
            </span>
            &nbsp;
            {bank.name}
          </Title>
          <Group mt="md">
            <Button onClick={handleSendButtonClick} leftSection={<ArrowUpRightIcon />}>
              Send
            </Button>
            {/* <Space w="xs"/> */}
            <Button onClick={handleDownloadButtonClick} leftSection={<FileArrowDownIcon />}>
              Download
            </Button>
          </Group>           
        </Stack>
      )}
    </div>
  )
}
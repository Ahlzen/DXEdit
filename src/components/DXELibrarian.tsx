import { useState } from "react";
import { DXEVoiceList } from "./DXEVoiceList";
import { Title, Text, Stack, TextInput, Group } from "@mantine/core";

export function DXELibrarian(props: {})
{
  let [searchPhrase, setSearchPhrase] = useState<string | undefined>(undefined);
  let [starredOnly, setStarredOnly] = useState<boolean>(false);

  function handleSearchPhraseChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchPhrase(event.target.value);
  }
  function handleStarredOnlyChange(event: React.ChangeEvent<HTMLInputElement>) {
    setStarredOnly(event.target.checked);
  }

  return (
    <div className="librarian">

      <Stack mt="md">
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

      <Title order={2}>On Device/Browser</Title>
      <DXEVoiceList
        searchPhrase={searchPhrase}
        starredOnly={starredOnly} />
    </div>
  );
}
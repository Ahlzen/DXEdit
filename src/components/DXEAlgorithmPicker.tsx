//import { useState } from 'react';
import { Group, Stack, Text } from '@mantine/core';
import './DXEAlgorithmPicker.css';
import DXEAlgorithmDiagram from './DXEAlgorithmDiagram';

export default function DXEAlgorithmPicker(props: {
  currentAlgorithm: number,
  columnCount: number,
  onAlgorithmSelected: (n: number) => void,
  onCancel: () => void,
})
{
  const rows = [];
  let currentRow = [];
  for (let a = 0; a < 32; a++) {
    currentRow.push(
    <div className="algItem" key={"alg" + a}>
      <Stack>
        <DXEAlgorithmDiagram
          className="algIcon"
          algNumber={a+1} isFixedWidth={false} 
          unitWidth={16} unitHeight={14} gap={6}
          hasLabels={false}
          />
        <Text size="sm">{a+1}</Text>
      </Stack>
    </div>
    );
    if (currentRow.length === props.columnCount) {
      rows.push(<Group key={"algRow" + a}>{currentRow}</Group>);
      currentRow = [];
    }
  }
  if (currentRow.length > 0)
    rows.push(currentRow);

  return (
    <Stack>
      {rows}
    </Stack>
  );
}

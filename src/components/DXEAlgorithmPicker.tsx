import { Stack, Text } from '@mantine/core';
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
    <div className="algItem" key={"alg" + a}
      onClick={() => props.onAlgorithmSelected(a)}>
      <Stack className='algItemStack' align='center' justify='flex-end'>
        <DXEAlgorithmDiagram
          className="algIcon"
          algNumber={a+1} isFixedWidth={false} 
          unitWidth={16} unitHeight={14} gap={6}
          hasLabels={false} />
        <Text size="sm">{a+1}</Text>
      </Stack>
    </div>
    );
    if (currentRow.length === props.columnCount) {
      rows.push(currentRow);
      currentRow = [];
    }
  }
  if (currentRow.length > 0)
    rows.push(currentRow);

  return (
    <div className='algPicker'>
      {rows}
    </div>
  );
}

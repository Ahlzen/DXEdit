import { Group, Radio } from '@mantine/core';

type iconRadioOptions = {
  [value: string]: {
    imagePath: string,
    altText: string
}};

export default function DXEIconRadioButtons(props: {
  options: iconRadioOptions,
  selectedValue: string,
  className?: string,
  onValueChanged: (value: string) => void})
{
  return (
    <Radio.Group
      value={props.selectedValue}
      onChange={props.onValueChanged}
      className={props.className}>
      <Group mt="xs" gap="sm" grow={false}>
        {Object.entries(props.options).map(([value, imageData]) => (
          <Radio.Card value={value} key={value} withBorder={true} w='auto'
            data-checked={props.selectedValue === value}>
            <Group wrap="nowrap" p="xs">
              <img src={imageData.imagePath} alt={imageData.altText} />
            </Group>
          </Radio.Card>
        ))}
      </Group>
    </Radio.Group>
  )
}
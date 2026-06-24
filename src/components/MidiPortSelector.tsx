import { Select } from '@mantine/core';

export default function DXEMidiPortSelector(props: {
  title: string,
  description?: string,
  portNames: string[],
  selectedPortName: string|null,
  onPortChanged: (portName: string|null) => void})
{
  const noneValue: string = '(none)';

  function handlePortChanged(optionName: string) {
    props.onPortChanged(optionName === noneValue ? null : optionName);
  }

  const options = [noneValue, ...props.portNames];

  return (
    <Select
      size='sm'
      label={props.title}
      description={props.description}
      onChange={(val, opt) => handlePortChanged(val || noneValue)}
      data={options}
      value={props.selectedPortName ?? noneValue} />
  );
}



// <div className="midi-port-selector" style={{maxWidth: '20rem'}}>
//       <label>{props.title}
//       <Select
//         onChange={(val, opt) => handlePortChanged(val || noneValue)}
//         data={options}
//         value={props.selectedPortName ?? noneValue} />
//       </label>
//     </div>
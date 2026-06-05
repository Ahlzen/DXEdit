export default function MidiPortSelector(props: {
  title: string,
  portNames: string[],
  selectedPortName: string|null,
  onPortChanged: (portName: string|null) => void})
{
  const noneValue: string = '(none)';

  function handlePortChanged(optionName: string) {
    props.onPortChanged(optionName === noneValue ? null : optionName);
  }

  return (
    <div className="midi-port-selector">
      <label>{props.title}
      <select
        onChange={(e) => handlePortChanged(e.target.value)}
        value={props.selectedPortName ?? noneValue}>
          <option key={noneValue} value={noneValue}>{noneValue}</option>
          {props.portNames.map((name) =>
            <option key={name} value={name}>{name}</option>)}
      </select>
      </label>
    </div>
  );
}

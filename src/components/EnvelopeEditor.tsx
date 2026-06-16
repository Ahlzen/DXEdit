import Slider from "./Slider";

export default function EnvelopeEditor(props: {
  title: string,
  data: Uint8Array, // 8 entries: R1-4, L1-4
  onValueChanged: (offset: number, value: number) => void
})
{
  return (
    <div className="envelopeEditor">      
      <h3>{props.title}</h3>
      <Slider
        title="Rate 1:"
        selectedValue={props.data[0]}
        minValue={0} maxValue={99}
        onValueChanged={(v) => props.onValueChanged(0, v)} />
      <Slider
        title="Rate 2:"
        selectedValue={props.data[1]}
        minValue={0} maxValue={99}
        onValueChanged={(v) => props.onValueChanged(1, v)} />
      <Slider
        title="Rate 3:"
        selectedValue={props.data[2]}
        minValue={0} maxValue={99}
        onValueChanged={(v) => props.onValueChanged(2, v)} />
      <Slider
        title="Rate 4:"
        selectedValue={props.data[3]}
        minValue={0} maxValue={99}
        onValueChanged={(v) => props.onValueChanged(3, v)} />

      <Slider
        title="Level 1:"
        selectedValue={props.data[4]}
        minValue={0} maxValue={99}
        onValueChanged={(v) => props.onValueChanged(4, v)} />
      <Slider
        title="Level 2:"
        selectedValue={props.data[5]}
        minValue={0} maxValue={99}
        onValueChanged={(v) => props.onValueChanged(5, v)} />
      <Slider
        title="Level 3:"
        selectedValue={props.data[6]}
        minValue={0} maxValue={99}
        onValueChanged={(v) => props.onValueChanged(6, v)} />
      <Slider
        title="Level 4:"
        selectedValue={props.data[7]}
        minValue={0} maxValue={99}
        onValueChanged={(v) => props.onValueChanged(7, v)} />
    </div>
    // TODO: Add envelope shape (canvas)
    // TODO: Show values in actual units (dB, seconds)
  )
}
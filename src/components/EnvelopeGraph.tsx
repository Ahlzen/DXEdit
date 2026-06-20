import { egTypeOffsets, type egType, type voiceParamData } from "../midi/voiceParams";

export default function EnvelopeGraph(props: {
  width: number,
  height: number,
  data: voiceParamData,
  eg: egType,
})
{
  let getVal = (o: number) =>
      props.data.getValueByOffset(
        egTypeOffsets[props.eg] + o);

  let baseX = props.width / 4;
  let rates = [getVal(0), getVal(1), getVal(2), getVal(3)];
  let levels = [getVal(4), getVal(5), getVal(6), getVal(7)];
  let x1 = baseX * (rates[0]/99);
  let x2 = x1 + baseX * (rates[1]/99)
  let x3 = x2 + baseX * (rates[2]/99)
  let x4 = x3 + baseX * (rates[3]/99)
  let yScale = props.height / 100;
  let yBase = props.height-1;

  let points =
    `0,${yBase-yScale*levels[0]}
     ${x1},${yBase-yScale*levels[1]}
     ${x2},${yBase-yScale*levels[2]}
     ${x3},${yBase-yScale*levels[3]}`
  
  return (
    <svg className="envGraph" width={props.width} height={props.height}>
      <rect x="0" y="0" width={props.width} height={props.height} rx="10" ry="10" fill="black" />
      <polyline points={points}
        style={{fill:'none', stroke:'cyan', strokeWidth:1.5}} />
    </svg>
  );
}
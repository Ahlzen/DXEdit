import { egTypeOffsets, voiceParamData, type egType } from "../midi/voiceParams";

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

  const margin = 8;
  
  let x: number[] = Array<number>(8);
  let y: number[] = Array<number>(8);
  
  // calculate x coordinates
  const leadInOut = 8;
  const eWidth = props.width - 2*margin; // effective width
  let maxSegWidth = (eWidth-2*leadInOut) / 5;
  let rates = [getVal(0), getVal(1), getVal(2), getVal(3)];
  x[0] = margin;
  x[1] = x[0] + leadInOut;
  x[2] = x[1] + maxSegWidth * (1-rates[0]/99); // attack
  x[3] = x[2] + maxSegWidth * (1-rates[1]/99); // decay 1
  x[4] = x[3] + maxSegWidth * (1-rates[2]/99); // decay 2
  x[5] = x[4] + maxSegWidth; // sustain
  x[6] = x[5] + maxSegWidth * (1-rates[3]/99); // release
  x[7] = x[6] + leadInOut;

  // calculate y coordinates
  const eHeight = props.height - 2*margin; // effective height
  let levels = [getVal(4), getVal(5), getVal(6), getVal(7)];
  let yScale = eHeight / 100;
  let yBase = props.height-margin;
  y[0] = yBase - yScale*levels[3]; // L4 during key off
  y[1] = y[0];
  y[2] = yBase - yScale*levels[0]; // L1 (attack level)
  y[3] = yBase - yScale*levels[1]; // L2 (mid decay level)
  y[4] = yBase - yScale*levels[2]; // L2 (sustain level)
  y[5] = y[4];
  y[6] = y[0];
  y[7] = y[0];

  // format SVG coordinates
  let linePoints = x.map((_, i) => x[i] + ',' + y[i]).join(' ');
  let polyPoints = x[0] + ',' + yBase + ' ' +
    linePoints + ' ' + x[7] + ',' + yBase + ' ';
  let vertexPoints = [];
  for (let i = 1; i < x.length-1; i++) {
    vertexPoints.push(<circle cx={x[i]} cy={y[i]} r={2} stroke='#0cf' stroke-width={2} />);
  }
  
  return (
    <svg className="envGraph" width={props.width} height={props.height}>
      <rect x="0" y="0" width={props.width} height={props.height} rx={margin} ry={margin} fill="black" />
      
      {/* Horizontal axis + quarter-level guide lines */}
      <line x1={margin} y1={yBase} x2={margin+eWidth} y2={yBase} 
        style={{fill:'none', stroke:'#444', strokeWidth:1.5}} />
      <line x1={margin} y1={yBase-0.25*eHeight} x2={margin+eWidth} y2={yBase-0.25*eHeight} 
        style={{fill:'none', stroke:'#444', strokeDasharray:'2,2', strokeWidth:1}} />
      <line x1={margin} y1={yBase-0.5*eHeight} x2={margin+eWidth} y2={yBase-0.5*eHeight} 
        style={{fill:'none', stroke:'#444', strokeDasharray:'2,2', strokeWidth:1}} />
      <line x1={margin} y1={yBase-0.75*eHeight} x2={margin+eWidth} y2={yBase-0.75*eHeight} 
        style={{fill:'none', stroke:'#444', strokeDasharray:'2,2', strokeWidth:1}} />
      <line x1={margin} y1={yBase-eHeight} x2={margin+eWidth} y2={yBase-eHeight} 
        style={{fill:'none', stroke:'#444', strokeDasharray:'2,2', strokeWidth:1}} />

      {/* Key down/up (vertical lines) */}
      <line x1={x[1]} y1={yBase} x2={x[1]} y2={margin} 
        style={{fill:'none', stroke:'#046', strokeWidth:1.5}} />
      <line x1={x[5]} y1={yBase} x2={x[5]} y2={margin} 
        style={{fill:'none', stroke:'#046', strokeWidth:1.5}} />
      
      {/* Envelope fill/line + vertices */}
      <polygon points={polyPoints}
        style={{fill:'#0cf2', stroke:'none'}} />
      <polyline points={linePoints}
        style={{fill:'none', stroke:'#0cf', strokeWidth:1.5}} />
      {vertexPoints}

    </svg>
  );
}
import { type algorithm, algorithms, algorithmMaxDimensions } from '../midi/AlgorithmData';
import type { opNumber } from '../midi/VoiceParamData';

/**
 * Component that renders an SVG diagram of the specified DX7 algorithm.
 */
export default function DXEAlgorithmDiagram(props: {
  className?: string,
  algNumber: number,
  isFixedWidth: boolean,
  currentOp?: opNumber,
  unitWidth?: number,
  unitHeight?: number,
  gap?: number,
  fontSize?: number,
  hasLabels?: boolean,
})
{
  const unitX = props.unitWidth || 40;
  const halfX = unitX/2;
  const unitY = props.unitHeight || 20;
  const halfY = unitY/2;
  const gap = props.gap || 10;
  const fontSize = props.fontSize || 14;
  const hasLabels = props.hasLabels;
  
  const a : algorithm = algorithms[props.algNumber];
  if (!a) {
    return (
      <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" className={props.className}>
        <text x="${unitX}" y="${unitY}" font-size="${fontSize}">Algorithm ${props.algNumber} not found</text>
      </svg>
    );
  }

  let xUnits = algorithmMaxDimensions.x;
  let yUnits = algorithmMaxDimensions.y;
  if (!props.isFixedWidth) {
    // Calculate actual width of *this* algorithm
    xUnits = Math.max(...Object.values(a).map(op => op.x)) + 1;
    yUnits = Math.max(...Object.values(a).map(op => op.y)) + 1;
  }

  const width = gap + xUnits * (unitX+gap);
  const height = gap + yUnits * (unitY+gap) + gap;

  let carrierXMin = 100;
  let carrierXMax = 0;

  const fgCurrentOp = '#fff';
  const fgModulator = '#0cf';
  const bgModulator = '#046';
  const fgCarrier = '#f7d';
  const bgCarrier = '#604';
  const lineColor = '#ccc';

  const opsSvg = [];
  for (const [opNumber, op] of Object.entries(a)) {
    const isCarrier = op.y === 0; // hack: carriers are always at the bottom
    const x = gap + op.x * (unitX+gap);
    const y = height - (gap + op.y * (unitY+gap)) - unitY - gap;
    const outlineWidth = opNumber === props.currentOp ? 2 : 1;

    const strokeColor = opNumber === props.currentOp ? fgCurrentOp :
      (isCarrier ? fgCarrier : fgModulator);

    // Box
    opsSvg.push(<rect x={x} y={y} width={unitX} height={unitY} rx={4} ry={4}
      stroke={strokeColor} strokeWidth={outlineWidth}
      fill={isCarrier ? bgCarrier : bgModulator} key={opNumber}/>);

    // Label
    if (hasLabels) {
      opsSvg.push(<text
        x={x+halfX-fontSize/3} y={y+halfY+fontSize/3}
        fill={isCarrier ? fgCarrier : fgModulator}
        fontWeight='bold' fontSize={fontSize}
        key={`text-${opNumber}`}>{getOpDigit(opNumber)}</text>);
    }

    // Connectors from each modulator
    for (const modulator of op.modulatedBy) {
      const modOp = a[modulator];
      if (modOp) {
        const x1 = x+halfX;
        const y1 = y;
        const x2 = gap + modOp.x * (unitX+gap) + halfX;
        const y2 = height - gap - (gap + modOp.y * (unitY+gap));
        const ym = (y1+y2)/2;
        if (x1 === y1) {
          // Straight vertical line
          opsSvg.push(<line x1={x1} y1={y1} x2={x2} y2={y2} stroke={lineColor} key={`line-${opNumber}-${modulator}`}/>);
        }
        else {
          // Broken line (vertical, horizontal, vertical)
          opsSvg.push(<line x1={x1} y1={y1} x2={x1} y2={ym} stroke={lineColor} key={`lineA-${opNumber}-${modulator}`}/>);
          opsSvg.push(<line x1={x1} y1={ym} x2={x2} y2={ym} stroke={lineColor} key={`lineB-${opNumber}-${modulator}`}/>);
          opsSvg.push(<line x1={x2} y1={ym} x2={x2} y2={y2} stroke={lineColor} key={`lineC-${opNumber}-${modulator}`}/>);
        }
      }
    }
    if (isCarrier) {
      // Vertical connector at bottom
      opsSvg.push(<line x1={x+halfX} y1={y+unitY} x2={x+halfX} y2={height-gap} stroke={lineColor} key={`carrier-${opNumber}`}/>);
      carrierXMin = Math.min(carrierXMin, x+halfX);
      carrierXMax = Math.max(carrierXMax, x+halfX);
    }

    // Feedback path
    // TODO: need more spacing in a few cases, as these can clash with other
    // lines, such as in algorithm 15, 20
    if (op.feedbackFrom) {
      const fbOp = a[op.feedbackFrom];
      if (fbOp) {
        const x1 = x+halfX;
        const x2 = x+unitX+gap/2;
        const y1 = y - gap/2;
        const y2 = height - gap - (gap + fbOp.y * (unitY+gap)) + gap/2;
        const y3 = y;
        opsSvg.push(<line x1={x1} y1={y1} x2={x2} y2={y1} stroke={lineColor} key={`fb-lineA-${opNumber}-${op.feedbackFrom}`}/>);
        opsSvg.push(<line x1={x2} y1={y1} x2={x2} y2={y2} stroke={lineColor} key={`fb-lineB-${opNumber}-${op.feedbackFrom}`}/>);
        opsSvg.push(<line x1={x1} y1={y2} x2={x2} y2={y2} stroke={lineColor} key={`fb-lineC-${opNumber}-${op.feedbackFrom}`}/>);
        opsSvg.push(<line x1={x1} y1={y1} x2={x1} y2={y3} stroke={lineColor} key={`fb-lineD-${opNumber}-${op.feedbackFrom}`}/>);
      }
    }
  }
  // Connect carrier lines at bottom
  opsSvg.push(<line x1={carrierXMin} y1={height-gap} x2={carrierXMax} y2={height-gap} stroke={lineColor} key={`carrier-bottom`}/>);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={props.className}>`;
      {opsSvg}
    </svg>
  );

  function getOpDigit(op: string): string {
    return op.substring(2);
  }
}

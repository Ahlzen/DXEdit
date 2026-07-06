import { type algOp, type alg, algorithms } from '../midi/AlgorithmData';

export default function DXEAlgorithmDiagram(props: {algNumber: number})
{
  const unitX = 40;
  const hx = unitX/2;
  const margin = 10;
  const unitY = 20;
  const hy = unitY/2;
  const fontSize = 14;
  
  let a : alg = algorithms[props.algNumber];
  if (!a) {
    return (
      <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <text x="${unitX}" y="${unitY}" font-size="${fontSize}">Algorithm ${props.algNumber} not found</text>
      </svg>
    );
  }

  const xUnits = Math.max(...Object.values(a).map(op => op.x)) + 1;
  const yUnits = Math.max(...Object.values(a).map(op => op.y)) + 1;

  const width = margin + xUnits * (unitX+margin);
  const height = margin + yUnits * (unitY+margin) + margin;

  let carrierXMin = 100;
  let carrierXMax = 0;

  const fgModulator = '#0cf';
  const bgModulator = '#046';
  const fgCarrier = '#f7d';
  const bgCarrier = '#604';
  const lineColor = '#ccc';

  let opsSvg = [];
  for (const [opNumber, op] of Object.entries(a)) {
    const isCarrier = op.y === 0; // hack: carriers are always at the bottom
    const x = margin + op.x * (unitX+margin);
    const y = height - (margin + op.y * (unitY+margin)) - unitY - margin;
    opsSvg.push(<rect x={x} y={y} width={unitX} height={unitY} rx={4} ry={4} stroke={isCarrier ? fgCarrier : fgModulator} fill={isCarrier ? bgCarrier : bgModulator} key={opNumber}/>);
    opsSvg.push(<text x={x+hx-fontSize/3} y={y+hy+fontSize/3} fill={isCarrier ? fgCarrier : fgModulator} fontWeight='bold' fontSize={fontSize} key={`text-${opNumber}`}>{opNumber}</text>);
    for (const modulator of op.modulatedBy) {
      const modOp = a[modulator];
      if (modOp) {
        const x1 = x+hx;
        const y1 = y;
        const x2 = margin + modOp.x * (unitX+margin) + hx;
        const y2 = height - margin - (margin + modOp.y * (unitY+margin));
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
      // draw connector at bottom
      opsSvg.push(<line x1={x+hx} y1={y+unitY} x2={x+hx} y2={height-margin} stroke="#ccc" key={`carrier-${opNumber}`}/>);
      carrierXMin = Math.min(carrierXMin, x+hx);
      carrierXMax = Math.max(carrierXMax, x+hx);
    }

    // Draw feedback path
    // TODO: need more spacing as these can clash with other lines, such
    // as in algorithm 15, 20
    if (op.feedbackFrom) {
      const fbOp = a[op.feedbackFrom];
      if (fbOp) {
        const x1 = x+hx;
        const x2 = x+unitX+margin/2;
        const y1 = y - margin/2;
        const y2 = height - margin - (margin + fbOp.y * (unitY+margin)) + margin/2;
        const y3 = y;
        opsSvg.push(<line x1={x1} y1={y1} x2={x2} y2={y1} stroke="#ccc" key={`fb-lineA-${opNumber}-${op.feedbackFrom}`}/>);
        opsSvg.push(<line x1={x2} y1={y1} x2={x2} y2={y2} stroke="#ccc" key={`fb-lineB-${opNumber}-${op.feedbackFrom}`}/>);
        opsSvg.push(<line x1={x1} y1={y2} x2={x2} y2={y2} stroke="#ccc" key={`fb-lineC-${opNumber}-${op.feedbackFrom}`}/>);
        opsSvg.push(<line x1={x1} y1={y1} x2={x1} y2={y3} stroke="#ccc" key={`fb-lineD-${opNumber}-${op.feedbackFrom}`}/>);
      }
    }
  }
  // Connect carrier lines at bottom
  opsSvg.push(<line x1={carrierXMin} y1={height-margin} x2={carrierXMax} y2={height-margin} stroke="#ccc" key={`carrier-bottom`}/>);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>`;
      <rect x="0" y="0" width={width} height={height} rx={margin} ry={margin} fill="black" />
      {opsSvg}
    </svg>
  );
}

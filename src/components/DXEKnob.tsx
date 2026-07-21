import { useRef, useState } from 'react';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function DXEKnob(props: {
  value: number,
  min?: number,
  max?: number,
  step?: number,
  onValueChanged?: (value: number) => void,
  onValueCommitted?: (value: number) => void,
  onHoverChanged?: (hover: boolean) => void,
}) {
  const max = props.max ?? 100;
  const min = props.min ?? 0;
  const step = props.step ?? 1;

  const [currentValue, setCurrentValue] = useState(() => clamp(props.value, min, max));
  const [dragging, setDragging] = useState(false);

  const valueRef = useRef(currentValue);
  const dragRef = useRef({ active: false, lastY: 0 });

  const applyValue = (next: number) => {
    const clamped = clamp(next, 0, max);
    valueRef.current = clamped;
    setCurrentValue(clamped);
    props.onValueChanged?.(clamped);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragRef.current.active = true;
    dragRef.current.lastY = event.clientY;
    setDragging(true);
    event.currentTarget.requestPointerLock?.();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!dragRef.current.active) return;
    const delta = -1 * (event.movementY ?? (dragRef.current.lastY - event.clientY));
    if (delta === 0) return;
    dragRef.current.lastY = event.clientY;
    applyValue(valueRef.current + Math.round(delta) * step);
  };

  const handleMouseUp = () => {
    dragRef.current.active = false;
    setDragging(false);
    document.exitPointerLock?.();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    props.onValueCommitted?.(valueRef.current);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    applyValue(valueRef.current + direction * step);
    props.onValueCommitted?.(valueRef.current);
  };

  return (
    <div
      className='knob'
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={currentValue}
      style={{cursor: dragging ? 'none' : 'ns-resize'}}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => props.onHoverChanged?.(true)}
      onMouseLeave={() => props.onHoverChanged?.(false)}
      onWheel={handleWheel} >
      <div>{currentValue}</div>
    </div>
  );
}

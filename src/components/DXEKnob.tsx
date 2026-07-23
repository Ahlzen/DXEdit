import { useEffect, useRef, useState } from 'react';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function DXEKnob(props: {
  value: number,
  min: number,
  max: number,
  onValueChanged?: (value: number, isChangeEnd: boolean) => void,
  onHoverChanged?: (hover: boolean) => void,
}) {
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ active: false, lastY: 0 });
  const liveValueRef = useRef(props.value);

  useEffect(() => {
    liveValueRef.current = props.value;
  }, [props.value]);

  const commitValue = (nextValue: number, isChangeEnd: boolean) => {
    const clampedValue = clamp(nextValue, props.min, props.max);
    liveValueRef.current = clampedValue;
    props.onValueChanged?.(clampedValue, isChangeEnd);
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
    const value = clamp(liveValueRef.current + Math.round(delta), props.min, props.max);
    commitValue(value, false);
  };

  const handleMouseUp = () => {
    dragRef.current.active = false;
    setDragging(false);
    document.exitPointerLock?.();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    props.onValueChanged?.(liveValueRef.current, true);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    const value = clamp(liveValueRef.current + direction, props.min, props.max);
    commitValue(value, true);
  };

  return (
    <div
      className='knob'
      role="slider"
      aria-valuemin={props.min}
      aria-valuemax={props.max}
      aria-valuenow={props.value}
      style={{cursor: dragging ? 'none' : 'ns-resize'}}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => props.onHoverChanged?.(true)}
      onMouseLeave={() => props.onHoverChanged?.(false)}
      onWheel={handleWheel} >
      <div>{props.value}</div>
    </div>
  );
}

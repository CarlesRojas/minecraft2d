import joystickArrow from '@asset/texture/gui/touch/joystickArrow.png';
import joystickCircle from '@asset/texture/gui/touch/joystickCircle.png';
import Vector2 from '@game/util/Vector2';
import { styled } from '@style/stitches.config';
import { TouchEvent, useRef, useState } from 'react';

const Area = styled('div', {
  position: 'relative',
  width: '100%',
  height: '100%',
  pointerEvents: 'all',
  opacity: 0.8,
});

const JoystickCircle = styled('img', {
  position: 'absolute',
  transformOrigin: 'center',
  left: 0,
  right: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  imageRendering: 'pixelated',
});

const JoystickArrow = styled('img', {
  position: 'absolute',
  transformOrigin: 'center',
  left: 0,
  right: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  imageRendering: 'pixelated',
});

const Joystick = () => {
  const [arrowVisible, setArrowVisible] = useState(false);
  const [angle, setAngle] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);
  const touchID = useRef(0);

  // #################################################
  //   HANDLERS
  // #################################################

  const handleStart = (event: TouchEvent) => {
    touchID.current = event.changedTouches[0].identifier;
    setArrowVisible(true);
    handleMove(event);
  };

  const handleMove = (event: TouchEvent) => {
    if (!areaRef.current) return;

    const touch = Array.from(event.changedTouches).find((touch) => touch.identifier === touchID.current);
    if (!touch) return handleStop();

    const rect = areaRef.current.getBoundingClientRect();
    const direction = new Vector2(
      touch.clientX - rect.left - rect.width / 2,
      touch.clientY - rect.top - rect.height / 2
    ).normalized;

    var angle = Math.atan2(direction.y, direction.x);
    var degrees = (180 * angle) / Math.PI + 90;

    setAngle(degrees);
  };

  const handleStop = () => {
    setArrowVisible(false);
  };

  // #################################################
  //   RENDER
  // #################################################

  return (
    <Area
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleStop}
      onTouchCancel={handleStop}
      ref={areaRef}
    >
      <JoystickCircle src={joystickCircle} alt="joystick circle" />
      <JoystickArrow
        src={joystickArrow}
        alt="joystick arrow"
        css={{ transform: `rotate(${angle}deg)`, opacity: arrowVisible ? 1 : 0 }}
      />
    </Area>
  );
};

export default Joystick;

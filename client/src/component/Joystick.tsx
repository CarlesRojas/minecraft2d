import joystickArrow from '@asset/texture/gui/touch/joystickArrow.png';
import joystickCircle from '@asset/texture/gui/touch/joystickCircle.png';
import { ButtonAction } from '@component/Button';
import Vector2 from '@game/util/Vector2';
import useInsideArea from '@hook/useInsideArea';
import { styled } from '@style/stitches.config';
import { Event, useEvents } from '@util/Events';
import { TouchEvent, useEffect, useRef, useState } from 'react';

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
  const { emit } = useEvents();
  const [arrowVisible, setArrowVisible] = useState(false);
  const [angle, setAngle] = useState(0);
  const direction = useRef<Vector2 | null>(new Vector2(0, 0));
  const areaRef = useRef<HTMLDivElement>(null);
  const lastMouseCoords = useRef(new Vector2(0, 0));
  const touchID = useRef(0);
  const isInsideCancelButton = useInsideArea(`touchControl_${ButtonAction.CANCEL}`);

  // #################################################
  //   HANDLERS
  // #################################################

  const handleStart = (event: TouchEvent) => {
    touchID.current = event.changedTouches[0].identifier;
    setArrowVisible(true);
    handleMove(event);
    emit(Event.ON_JOYSTICK_DOWN);
  };

  const handleMove = (event: TouchEvent) => {
    if (!areaRef.current) return;

    const touch = Array.from(event.changedTouches).find((touch) => touch.identifier === touchID.current);
    if (!touch) return handleStop();

    const rect = areaRef.current.getBoundingClientRect();
    const newDirection = new Vector2(
      touch.clientX - rect.left - rect.width / 2,
      touch.clientY - rect.top - rect.height / 2
    ).normalized;
    direction.current = newDirection;

    var angle = Math.atan2(newDirection.y, newDirection.x);
    var degrees = (180 * angle) / Math.PI + 90;

    lastMouseCoords.current = new Vector2(touch.clientX, touch.clientY);
    const insideArea = isInsideCancelButton(lastMouseCoords.current);
    emit(Event.ON_JOYSTICK_INSIDE_AREA, insideArea);

    setAngle(degrees);
  };

  const handleStop = () => {
    direction.current = null;
    setArrowVisible(false);

    const insideArea = isInsideCancelButton(lastMouseCoords.current);
    emit(Event.ON_JOYSTICK_UP, { canceled: insideArea });
  };

  // #################################################
  //   SEND INPUT TO GAME
  // #################################################

  useEffect(() => {
    if (!direction.current) return;
    emit(Event.ON_JOYSTICK_MOVE, direction.current);
  }, [angle]);

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

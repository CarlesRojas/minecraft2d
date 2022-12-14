import button from '@asset/texture/gui/touch/button.png';
import buttonArrow from '@asset/texture/gui/touch/buttonArrow.png';
import toggle from '@asset/texture/gui/touch/toggle.png';
import { styled } from '@style/stitches.config';
import { Event, useEvents } from '@util/Events';
import { CODE_A, CODE_D } from 'keycode-js';
import { TouchEvent, useEffect, useRef, useState } from 'react';

export enum ToggleState {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

const Area = styled('div', {
  position: 'relative',
  width: '100%',
  height: '100%',
  pointerEvents: 'all',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0.8,
});

const Container = styled('div', {
  position: 'relative',
  width: '80%',
  aspectRatio: '2',
  pointerEvents: 'none',
});

const ToggleImage = styled('img', {
  position: 'relative',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  imageRendering: 'pixelated',
  pointerEvents: 'none',
});

const ToggleInner = styled('div', {
  transition: 'left 0.2s ease-in-out',
  position: 'absolute',
  left: '0%',
  top: 0,
  height: '100%',
  aspectRatio: '1',
  pointerEvents: 'none',
});

const Image = styled('img', {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  imageRendering: 'pixelated',
});

const ArrowImage = styled('img', {
  position: 'absolute',
  transformOrigin: 'center',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  imageRendering: 'pixelated',
  zIndex: 1,
  rotate: '90deg',
  transition: 'opacity 0.2s ease-in-out, scale 0.3s ease-in-out',

  variants: {
    position: {
      [ToggleState.LEFT]: {
        scale: '1 -1',
      },
      [ToggleState.CENTER]: {
        scale: '1 0',
        opacity: 0,
      },
      [ToggleState.RIGHT]: {
        scale: '1 1',
      },
    },
  },
});

const Toggle = () => {
  const { emit } = useEvents();

  const [state, setState] = useState(ToggleState.CENTER);
  const lastState = useRef(ToggleState.CENTER);
  const areaRef = useRef<HTMLDivElement>(null);
  const touchID = useRef(0);

  // #################################################
  //   HANDLERS
  // #################################################

  const handleStart = (event: TouchEvent) => {
    touchID.current = event.changedTouches[0].identifier;
    handleMove(event);
  };

  const handleMove = (event: TouchEvent) => {
    if (!areaRef.current) return;

    const touch = Array.from(event.changedTouches).find((touch) => touch.identifier === touchID.current);
    if (!touch) return handleStop();

    const rect = areaRef.current.getBoundingClientRect();
    const direction = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width)) - 0.5;

    setState(direction < 0 ? ToggleState.LEFT : ToggleState.RIGHT);
  };

  const handleStop = () => {
    setState(ToggleState.CENTER);
  };

  // #################################################
  //   SEND INPUT TO GAME
  // #################################################

  useEffect(() => {
    emit(Event.ON_KEY_UP, { code: CODE_A });
    emit(Event.ON_KEY_UP, { code: CODE_D });

    if (state === ToggleState.LEFT) emit(Event.ON_KEY_DOWN, { code: CODE_A });
    if (state === ToggleState.RIGHT) emit(Event.ON_KEY_DOWN, { code: CODE_D });
  }, [state]);

  // #################################################
  //   RENDER
  // #################################################

  const left = state === ToggleState.LEFT ? '0%' : state === ToggleState.CENTER ? '25%' : '50%';

  return (
    <Area
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleStop}
      onTouchCancel={handleStop}
      ref={areaRef}
    >
      <Container>
        <ToggleImage src={toggle} alt="toggle" />

        <ToggleInner css={{ left }}>
          <Image src={button} alt="toggle inner button" />
          <ArrowImage position={state} src={buttonArrow} alt="toggle inner arrow" />
        </ToggleInner>
      </Container>
    </Area>
  );
};

export default Toggle;

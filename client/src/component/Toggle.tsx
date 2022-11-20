import button from '@asset/texture/gui/touch/button.png';
import buttonArrow from '@asset/texture/gui/touch/buttonArrow.png';
import toggle from '@asset/texture/gui/touch/toggle.png';
import { styled } from '@style/stitches.config';
import { TouchEvent, useRef, useState } from 'react';

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
  position: 'absolute',
  left: 0,
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
  transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',

  variants: {
    position: {
      [ToggleState.LEFT]: {
        transform: 'rotate(-90deg)',
      },
      [ToggleState.CENTER]: {
        opacity: 0,
      },
      [ToggleState.RIGHT]: {
        transform: 'rotate(90deg)',
      },
    },
  },
});

const Toggle = () => {
  const [state, setState] = useState(ToggleState.CENTER);
  const areaRef = useRef<HTMLDivElement>(null);

  // #################################################
  //   HANDLERS
  // #################################################

  const handleStart = (event: TouchEvent) => {
    handleMove(event);
  };

  const handleMove = (event: TouchEvent) => {
    if (!areaRef.current) return;

    const { clientX: x } = event.touches[0];
    const rect = areaRef.current.getBoundingClientRect();
    const direction = Math.max(0, Math.min(1, (x - rect.left) / rect.width)) - 0.5;

    setState(direction < 0 ? ToggleState.LEFT : ToggleState.RIGHT);
  };

  const handleStop = () => {
    setState(ToggleState.CENTER);
  };

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
      css={{ opacity: state !== ToggleState.CENTER ? 1 : 0.7 }}
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

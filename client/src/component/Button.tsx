import button from '@asset/texture/gui/touch/button.png';
import buttonArrow from '@asset/texture/gui/touch/buttonArrow.png';
import { styled } from '@style/stitches.config';
import { useState } from 'react';

export enum ButtonAction {
  JUMP = 'jump',
  CROUCH = 'crouch',
}

const Area = styled('button', {
  position: 'relative',
  width: '100%',
  height: '100%',
  pointerEvents: 'all',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const Image = styled('img', {
  position: 'relative',
  width: '80%',
  height: '80%',
  pointerEvents: 'none',
  imageRendering: 'pixelated',
});

const ArrowImage = styled('img', {
  position: 'absolute',
  transformOrigin: 'center',
  left: '10%',
  right: '10%',
  width: '80%',
  height: '80%',
  pointerEvents: 'none',
  imageRendering: 'pixelated',
  zIndex: 1,

  variants: {
    action: {
      [ButtonAction.JUMP]: {
        transform: 'rotate(0deg)',
      },
      [ButtonAction.CROUCH]: {
        transform: 'rotate(180deg)',
      },
    },
  },
});

interface ButtonProps {
  action: ButtonAction;
}

const Button = ({ action }: ButtonProps) => {
  const [pressed, setPressed] = useState(false);

  // #################################################
  //   HANDLERS
  // #################################################

  const handleStart = () => {
    setPressed(true);
  };

  const handleStop = () => {
    setPressed(false);
  };

  // #################################################
  //   RENDER
  // #################################################

  return (
    <Area
      onTouchStart={handleStart}
      onTouchEnd={handleStop}
      onTouchCancel={handleStop}
      css={{ opacity: pressed ? 1 : 0.7 }}
    >
      <Image src={button} alt="button" />
      <ArrowImage action={action} src={buttonArrow} alt="button arrow" />
    </Area>
  );
};

export default Button;

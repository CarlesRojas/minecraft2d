import button from '@asset/texture/gui/touch/button.png';
import buttonArrow from '@asset/texture/gui/touch/buttonArrow.png';
import buttonCancel from '@asset/texture/gui/touch/buttonCancel.png';
import buttonShadow from '@asset/texture/gui/touch/buttonShadow.png';
import { styled } from '@style/stitches.config';
import { TouchEvent, useState } from 'react';

export enum ButtonAction {
  JUMP = 'jump',
  CROUCH = 'crouch',
  CANCEL = 'cancel',
}

const Area = styled('button', {
  position: 'relative',
  width: '100%',
  height: '100%',
  pointerEvents: 'all',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0.8,
});

const Image = styled('img', {
  position: 'relative',
  width: '80%',
  height: '80%',
  pointerEvents: 'none',
  imageRendering: 'pixelated',
  translate: '0 0',

  variants: {
    pressed: {
      true: {
        translate: '0 calc(80% / 12)',
      },
    },
  },
});

const ShadowImage = styled('img', {
  position: 'absolute',
  transformOrigin: 'center',
  left: '10%',
  right: '10%',
  width: '80%',
  height: '80%',
  imageRendering: 'pixelated',
  zIndex: 0,
  translate: '0 0',
});

const ButtonTypeImage = styled('img', {
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
      [ButtonAction.CANCEL]: {},
    },
    pressed: {
      true: {
        translate: '0 calc(80% / 12)',
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

  const handleStart = (event: TouchEvent) => {
    setPressed(true);
  };

  const handleStop = (event: TouchEvent) => {
    setPressed(false);
  };

  // #################################################
  //   RENDER
  // #################################################

  return (
    <Area onTouchStart={handleStart} onTouchEnd={handleStop} onTouchCancel={handleStop}>
      <ShadowImage src={buttonShadow} alt="button shadow" />
      <Image pressed={pressed} src={button} alt="button" />
      <ButtonTypeImage
        pressed={pressed}
        action={action}
        src={action === ButtonAction.CANCEL ? buttonCancel : buttonArrow}
        alt="button arrow"
      />
    </Area>
  );
};

export default Button;

import button from '@asset/texture/gui/touch/button.png';
import buttonArrow from '@asset/texture/gui/touch/buttonArrow.png';
import buttonCancel from '@asset/texture/gui/touch/buttonCancel.png';
import buttonShadow from '@asset/texture/gui/touch/buttonShadow.png';
import { styled } from '@style/stitches.config';
import { Event, useEvents } from '@util/Events';
import { CODE_SHIFT_LEFT, CODE_SPACE } from 'keycode-js';
import { useEffect, useState } from 'react';

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

  variants: {
    hidden: {
      true: {
        display: 'none',
      },
    },
  },
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
  pointerEvents: 'none',
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
  const { emit, sub, unsub } = useEvents();

  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(action !== ButtonAction.CANCEL);

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
  //   SEND INPUT TO GAME
  // #################################################

  useEffect(() => {
    if (action === ButtonAction.JUMP) emit(pressed ? Event.ON_KEY_DOWN : Event.ON_KEY_UP, { code: CODE_SPACE });
    if (action === ButtonAction.CROUCH) emit(pressed ? Event.ON_KEY_DOWN : Event.ON_KEY_UP, { code: CODE_SHIFT_LEFT });
  }, [pressed]);

  // #################################################
  //   CANCEL BUTTON
  // #################################################

  const handleJoystickDown = () => {
    if (action === ButtonAction.CANCEL) setVisible(true);
  };

  const handleJoystickUp = () => {
    if (action === ButtonAction.CANCEL) setVisible(false);
  };

  const handleJoystickInsideArea = (insideArea: boolean) => {
    if (action === ButtonAction.CANCEL) setPressed(insideArea);
  };

  useEffect(() => {
    sub(Event.ON_JOYSTICK_DOWN, handleJoystickDown);
    sub(Event.ON_JOYSTICK_UP, handleJoystickUp);
    sub(Event.ON_JOYSTICK_INSIDE_AREA, handleJoystickInsideArea);

    return () => {
      unsub(Event.ON_JOYSTICK_DOWN, handleJoystickDown);
      unsub(Event.ON_JOYSTICK_UP, handleJoystickUp);
      sub(Event.ON_JOYSTICK_INSIDE_AREA, handleJoystickInsideArea);
    };
  }, []);

  // #################################################
  //   RENDER
  // #################################################

  return (
    <Area
      hidden={!visible}
      onTouchStart={handleStart}
      onTouchEnd={handleStop}
      onTouchCancel={handleStop}
      id={`touchControl_${action}`}
    >
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

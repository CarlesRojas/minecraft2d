import { styled } from '@style/stitches.config';
import Button, { ButtonAction } from './Button';
import Joystick from './Joystick';
import Toggle from './Toggle';

const UI = styled('section', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 20,
  display: 'flex',
});

const Grid = styled('div', {
  position: 'absolute',
  padding: '1rem',
  left: 0,
  right: 0,
  bottom: 0,
  display: 'grid',
  gridTemplateColumns:
    'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 6fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
  gridTemplateRows: 'repeat(4, minmax(0, 1fr))',
  gridTemplateAreas: `
    '. . . . . . x'
    '. . . . . . j'
    'm m . . . u u '
    'm m . . c u u '
  `,
});

const MoveArea = styled('div', {
  gridArea: 'm',
  position: 'relative',
  width: '100%',
  height: '100%',
});

const InventoryArea = styled('div', {
  gridArea: 'i',
  position: 'relative',
  width: '100%',
});

const UseArea = styled('div', {
  gridArea: 'u',
  position: 'relative',
  width: '100%',
  aspectRatio: '1',
});

const CrouchArea = styled('div', {
  gridArea: 'c',
  position: 'relative',
  width: '100%',
  aspectRatio: '1',
});

const JumpArea = styled('div', {
  gridArea: 'j',
  position: 'relative',
  width: '100%',
  aspectRatio: '1',
});

const CancelArea = styled('div', {
  gridArea: 'x',
  position: 'relative',
  width: '100%',
  aspectRatio: '1',
});

const TouchUI = () => {
  // #################################################
  //   RENDER
  // #################################################

  return (
    <UI>
      <Grid>
        <MoveArea>
          <Toggle />
        </MoveArea>

        <InventoryArea></InventoryArea>

        <UseArea>
          <Joystick />
        </UseArea>

        {/* <CrouchArea>
          <Button action={ButtonAction.CROUCH} />
        </CrouchArea> */}

        <JumpArea>
          <Button action={ButtonAction.JUMP} />
        </JumpArea>

        <CancelArea>
          <Button action={ButtonAction.CANCEL} />
        </CancelArea>
      </Grid>
    </UI>
  );
};

export default TouchUI;

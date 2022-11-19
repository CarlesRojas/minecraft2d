import { styled } from '@style/stitches.config';
import { Event, useEvents } from '@util/Events';
import Vector2 from '@util/Vector2';
import { useEffect, useState } from 'react';

const DevTools = styled('section', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10,
  display: 'flex',
  justifyContent: 'flex-end',

  p: {
    color: 'greenyellow',
    textShadow: '0 0 0.1rem black, 0 0 0.1rem black, 0 0 0.1rem black',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    padding: '0.2rem 0.5rem',
  },
});

const DevToolsUI = () => {
  const { sub, unsub } = useEvents();

  // #################################################
  //   FRAME RATE
  // #################################################

  const [frameRate, setFrameRate] = useState(0);
  const [mouseCoords, setMouseCoords] = useState(new Vector2(0, 0));

  const handleFrameRateChange = ({ frameRate }: any) => {
    setFrameRate(frameRate);
  };

  const handleMousePositionChange = ({ mouseCoords }: any) => {
    setMouseCoords(mouseCoords);
  };

  useEffect(() => {
    sub(Event.ON_FRAME_RATE_CHANGE, handleFrameRateChange);
    sub(Event.ON_MOUSE_POSITION_CHANGE, handleMousePositionChange);

    return () => {
      unsub(Event.ON_FRAME_RATE_CHANGE, handleFrameRateChange);
      unsub(Event.ON_MOUSE_POSITION_CHANGE, handleMousePositionChange);
    };
  }, []);

  // #################################################
  //   RENDER
  // #################################################

  return (
    <DevTools>
      <p>{`(${mouseCoords.x.toFixed(2)} - ${mouseCoords.y.toFixed(2)})`}</p>
      <p>{frameRate}</p>
    </DevTools>
  );
};

export default DevToolsUI;

import { useEffect, useState } from 'react';
import { useEvents, Event } from '@util/Events';
import s from '@style/component/DevToolsUI.module.scss';
import Vector2 from '@util/Vector2';

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
    <section className={s.devToolsUI}>
      <p>{`(${mouseCoords.x} - ${mouseCoords.y})`}</p>
      <p>{frameRate}</p>
    </section>
  );
};

export default DevToolsUI;

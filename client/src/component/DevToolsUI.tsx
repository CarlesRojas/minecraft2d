import { useEffect, useState } from 'react';
import { useEvents, Event } from '@util/Events';
import s from '@style/component/DevToolsUI.module.scss';

const DevToolsUI = () => {
  const { sub, unsub } = useEvents();

  // #################################################
  //   FRAME RATE
  // #################################################

  const [frameRate, setFrameRate] = useState(0);

  const handleFrameRateChange = ({ frameRate }: any) => {
    setFrameRate(frameRate);
  };

  useEffect(() => {
    sub(Event.ON_FRAME_RATE_CHANGE, handleFrameRateChange);

    return () => {
      unsub(Event.ON_FRAME_RATE_CHANGE, handleFrameRateChange);
    };
  }, []);

  // #################################################
  //   RENDER
  // #################################################

  return (
    <section className={s.devToolsUI}>
      <p>{frameRate}</p>
    </section>
  );
};

export default DevToolsUI;

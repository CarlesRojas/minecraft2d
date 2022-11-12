import { useEffect, useRef, useState } from 'react';
import DevToolsUI from '@component/DevToolsUI';
import Controller from '@game/Controller';
import useDidMount from '@hook/useDidMount';
import useResize from '@hook/useResize';
import Vector2 from '@util/Vector2';
import { useEvents } from '@util/Events';
import s from '@style/App.module.scss';

const App = () => {
  const events = useEvents();

  // #################################################
  //   GAME CONTAINER
  // #################################################

  const container = useRef<HTMLElement>(null);

  // #################################################
  //   BOARD DIMENSIONS
  // #################################################

  const [dimensions, setDimensions] = useState(new Vector2(0, 0));
  useResize(() => setDimensions(new Vector2(window.innerWidth, window.innerHeight)), true);

  // #################################################
  //   CONTROLLER
  // #################################################

  const controller = useRef<Controller | null>(null);

  useDidMount(() => {
    if (!container.current) return;
    controller.current = new Controller({ container: container.current, dimensions, events });
  });

  useEffect(() => {
    if (controller.current) controller.current.handleResize(dimensions);
  }, [dimensions]);

  // #################################################
  //   RENDER
  // #################################################

  return (
    <>
      <DevToolsUI />
      <main className={s.game} ref={container} />;
    </>
  );
};

export default App;

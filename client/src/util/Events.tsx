import { createContext, useContext, useRef } from 'react';

enum Event {
  ON_FRAME_RATE_CHANGE = 'onFramerateChange',
  ON_MOUSE_POSITION_CHANGE = 'onMousePositionChange',
  ON_MOUSE_MOVE = 'onMouseMove',
  ON_KEY_DOWN = 'onKeyDown',
  ON_KEY_UP = 'onKeyUp',
  ON_GROUND_LOADED = 'onGroundLoaded',
}

export type Events = {
  sub: (eventName: any, func: any) => void;
  unsub: (eventName: any, func: any) => void;
  emit: (eventName: any, data?: any) => void;
};

type EventsProviderProps = { children: React.ReactNode };

const EventsContext = createContext<Events | undefined>(undefined);

function EventsProvider({ children }: EventsProviderProps) {
  const events = useRef<{ [key in Event]?: ((data?: any) => void)[] }>({});

  const sub = (eventName: Event, func: (data: any) => void) => {
    events.current[eventName] = events.current[eventName] || [];
    events.current[eventName]?.push(func);
  };

  const unsub = (eventName: Event, func: (data: any) => void) => {
    const currentEvent = events.current[eventName];
    if (currentEvent)
      for (let i = 0; i < currentEvent.length; i++)
        if (currentEvent[i] === func) {
          currentEvent.splice(i, 1);
          break;
        }
  };

  const emit = (eventName: Event, data: any) => {
    const currentEvent = events.current[eventName];
    if (currentEvent)
      currentEvent.forEach(function (func) {
        func(data);
      });
  };

  return <EventsContext.Provider value={{ sub, unsub, emit }}>{children}</EventsContext.Provider>;
}

function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) throw new Error('useEvents must be used within an EventsProvider');
  return context;
}

export { EventsProvider, useEvents, Event };

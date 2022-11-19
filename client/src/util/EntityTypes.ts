export default interface Entity {
  info: Info;
  parts: {
    [key: string]: {
      bounds: Bounds;
      origin: Origin;
      anchor: Anchor;
      zIndex: number;
    };
  };
  states: { [key: string]: State };
}

interface Info {
  heightInPixels: number;
  heightInTiles: number;
  widthInTiles: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Origin {
  x: number;
  y: number;
}

interface Anchor {
  x: number;
  y: number;
}

interface State {
  visibleParts: string[];
  animations: Animation[];
}

interface Animation {
  speed: number;
  amplidude: number;
  parts: string[];
  type: string;
  inverted: boolean[];
}

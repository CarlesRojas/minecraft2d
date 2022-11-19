export default class Vector2 {
  public static add(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x + b.x, a.y + b.y);
  }

  public static mul(a: Vector2, b: number): Vector2 {
    return new Vector2(a.x * b, a.y * b);
  }

  public static dot(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x * b.x + a.y * b.y);
  }

  public static toCoords(coords: string): Vector2 {
    const [x, y] = coords.split('-');
    return new Vector2(parseInt(x), parseInt(y));
  }

  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public get magnitude(): number {
    return Math.sqrt(this.sqrMagnitude);
  }

  public get sqrMagnitude(): number {
    return this.x * this.x + this.y * this.y;
  }

  public normalize() {
    const len = this.magnitude;
    if (len > 0) {
      this.x /= len;
      this.y /= len;
    }
  }

  public inverse() {
    this.x = -this.x;
    this.y = -this.y;
  }

  public get normalized(): Vector2 {
    const v = new Vector2(this.x, this.y);
    const len = this.magnitude;
    if (len > 0) {
      v.x /= len;
      v.y /= len;
    }
    return v;
  }

  public get inversed(): Vector2 {
    return new Vector2(-this.x, -this.y);
  }

  public toString(): string {
    return `${this.x} ${this.y}`;
  }

  public equals(v: Vector2): boolean {
    return this.x === v.x && this.y === v.y;
  }

  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}

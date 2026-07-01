import type { Container } from 'pixi.js';

export type GameState = 'intro' | 'playing' | 'ended';
export type RuntimeState = GameState | 'finishing';

export interface ScenePoint {
  x: number;
  y: number;
}

export interface Aabb {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScrollingEntity {
  container: Container;
  collected?: boolean;
  update(dt: number): void;
  getBounds(): Aabb;
  destroy(): void;
}

export interface ParallaxSprite {
  container: Container;
  speedFactor: number;
  width: number;
}

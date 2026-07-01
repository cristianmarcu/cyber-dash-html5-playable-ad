import { Container, Graphics, Sprite, type Texture } from 'pixi.js';
import { COLORS } from '../constants';
import type { Aabb, ScrollingEntity } from '../types';

export class Key implements ScrollingEntity {
  readonly container = new Container();
  collected = false;

  private readonly glow = new Graphics();
  private readonly burst = new Graphics();
  private readonly sprite: Sprite;
  private baseY: number;
  private baseScaleX = 1;
  private baseScaleY = 1;
  private time = 0;

  constructor(x: number, y: number, texture: Texture) {
    this.sprite = new Sprite(texture);
    this.container.position.set(x, y);
    this.baseY = y;
    this.draw();
  }

  setTrackPosition(x: number, y: number, scale: number, alpha: number, visible: boolean) {
    this.container.x = x;
    this.baseY = y;
    this.container.scale.set(scale);
    this.container.alpha = alpha;
    this.container.visible = visible && !this.collected;
  }

  update(dt: number) {
    this.time += dt;
    this.container.y = this.baseY + Math.sin(this.time * 4.6) * 6;
    this.sprite.rotation = -0.18 + Math.sin(this.time * 3.2) * 0.08;
    const pulse = 1 + Math.sin(this.time * 6) * 0.045;
    this.sprite.scale.set(this.baseScaleX * pulse, this.baseScaleY * pulse);
    this.glow.scale.set(1.05 + Math.sin(this.time * 5) * 0.14);
    this.glow.alpha = 0.32 + Math.sin(this.time * 5) * 0.12;
    this.burst.rotation += dt * 0.9;
  }

  collect() {
    this.collected = true;
    this.container.visible = false;
  }

  getBounds(): Aabb {
    const scale = this.container.scale.x;

    return {
      x: this.container.x - 24 * scale,
      y: this.container.y - 26 * scale,
      width: 48 * scale,
      height: 52 * scale,
    };
  }

  destroy() {
    this.container.destroy({ children: true });
  }

  private draw() {
    this.glow.circle(0, 0, 38).fill({ color: COLORS.yellow, alpha: 0.3 });
    this.glow.circle(0, 0, 23).fill({ color: COLORS.white, alpha: 0.1 });

    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      this.burst
        .moveTo(Math.cos(angle) * 24, Math.sin(angle) * 24)
        .lineTo(Math.cos(angle + 0.06) * 34, Math.sin(angle + 0.06) * 34)
        .lineTo(Math.cos(angle - 0.06) * 34, Math.sin(angle - 0.06) * 34)
        .closePath()
        .fill({ color: COLORS.yellowLight, alpha: 0.32 });
    }

    this.sprite.anchor.set(0.5);
    this.sprite.width = 62;
    this.sprite.height = 62;
    this.baseScaleX = this.sprite.scale.x;
    this.baseScaleY = this.sprite.scale.y;

    this.container.addChild(this.glow, this.burst, this.sprite);
  }
}

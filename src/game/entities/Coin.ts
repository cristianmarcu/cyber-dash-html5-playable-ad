import { Container, Graphics, Sprite, type Texture } from 'pixi.js';
import { COLORS } from '../constants';
import type { Aabb, ScrollingEntity } from '../types';

export class Coin implements ScrollingEntity {
  readonly container = new Container();
  collected = false;

  private readonly glow = new Graphics();
  private readonly ring = new Graphics();
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
    const pulse = 1 + Math.sin(this.time * 7) * 0.08;

    this.sprite.scale.set(this.baseScaleX * pulse, this.baseScaleY * pulse);
    this.glow.scale.set(1.08 + Math.sin(this.time * 5.5) * 0.12);
    this.glow.alpha = 0.32 + Math.sin(this.time * 5.5) * 0.1;
    this.ring.rotation += dt * 1.8;
    this.ring.alpha = 0.42 + Math.sin(this.time * 4.8) * 0.12;
    this.container.y = this.baseY + Math.sin(this.time * 5) * 3;
  }

  collect() {
    this.collected = true;
    this.container.visible = false;
  }

  getBounds(): Aabb {
    const scale = this.container.scale.x;

    return {
      x: this.container.x - 18 * scale,
      y: this.container.y - 18 * scale,
      width: 36 * scale,
      height: 36 * scale,
    };
  }

  destroy() {
    this.container.destroy({ children: true });
  }

  private draw() {
    this.glow.circle(0, 0, 27).fill({ color: COLORS.cyan, alpha: 0.26 });
    this.glow.circle(0, 0, 17).fill({ color: COLORS.white, alpha: 0.08 });

    this.ring.circle(0, 0, 24).stroke({ color: COLORS.cyanSoft, alpha: 0.66, width: 2 });
    this.ring.moveTo(0, -30).lineTo(5, -20).lineTo(-5, -20).closePath().fill({ color: COLORS.white, alpha: 0.5 });

    this.sprite.anchor.set(0.5);
    this.sprite.width = 44;
    this.sprite.height = 44;
    this.baseScaleX = this.sprite.scale.x;
    this.baseScaleY = this.sprite.scale.y;

    this.container.addChild(this.glow, this.ring, this.sprite);
  }
}

import { Container, Graphics, Text } from 'pixi.js';
import { COLORS } from './constants';

export interface VisualEffect {
  container: Container;
  update(dt: number): boolean;
  destroy(): void;
}

export class FloatingText implements VisualEffect {
  readonly container = new Container();

  private readonly label: Text;
  private readonly duration = 0.75;
  private age = 0;

  constructor(text: string, x: number, y: number, color = COLORS.yellow) {
    this.container.position.set(x, y);
    this.label = new Text({
      text,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 23,
        fontWeight: '900',
        fill: color,
        stroke: { color: COLORS.void, width: 6 },
      },
    });
    this.label.anchor.set(0.5);
    this.container.addChild(this.label);
  }

  update(dt: number) {
    this.age += dt;
    const progress = Math.min(1, this.age / this.duration);

    this.container.y -= 62 * dt;
    this.container.x += Math.sin(this.age * 9) * 0.3;
    this.container.alpha = 1 - progress;
    this.container.scale.set(1 + Math.sin(progress * Math.PI) * 0.22);

    return progress < 1;
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}

export class DustPuff implements VisualEffect {
  readonly container = new Container();

  private readonly art = new Graphics();
  private readonly duration = 0.46;
  private readonly velocityX: number;
  private readonly velocityY: number;
  private age = 0;

  constructor(x: number, y: number) {
    const radius = 5 + Math.random() * 5;

    this.container.position.set(x, y);
    this.velocityX = -22 + Math.random() * 44;
    this.velocityY = 16 + Math.random() * 24;
    this.art.ellipse(0, 0, radius * 2.2, radius * 0.72).fill({ color: COLORS.cyan, alpha: 0.26 });
    this.art.ellipse(-3, -1, radius * 1.1, radius * 0.42).fill({ color: COLORS.magenta, alpha: 0.18 });
    this.container.addChild(this.art);
  }

  update(dt: number) {
    this.age += dt;
    const progress = Math.min(1, this.age / this.duration);

    this.container.x += this.velocityX * dt;
    this.container.y += this.velocityY * dt;
    this.container.scale.set(1 + progress * 1.2, 1 + progress * 0.72);
    this.container.alpha = 1 - progress;

    return progress < 1;
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}

type Spark = {
  art: Graphics;
  velocityX: number;
  velocityY: number;
  spin: number;
};

export class SparkleBurst implements VisualEffect {
  readonly container = new Container();

  private readonly sparks: Spark[] = [];
  private readonly duration = 0.5;
  private age = 0;

  constructor(x: number, y: number, color = COLORS.yellow, count = 8) {
    this.container.position.set(x, y);

    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 88 + Math.random() * 48;
      const spark = new Graphics();
      const size = 3.5 + Math.random() * 3.4;

      spark
        .moveTo(0, -size)
        .lineTo(size, 0)
        .lineTo(0, size)
        .lineTo(-size, 0)
        .closePath()
        .fill(color);
      spark.circle(0, 0, size * 0.34).fill({ color: COLORS.white, alpha: 0.86 });

      this.sparks.push({
        art: spark,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed - 20,
        spin: (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 4),
      });
      this.container.addChild(spark);
    }
  }

  update(dt: number) {
    this.age += dt;
    const progress = Math.min(1, this.age / this.duration);

    for (const spark of this.sparks) {
      spark.art.x += spark.velocityX * dt;
      spark.art.y += spark.velocityY * dt;
      spark.velocityY += 145 * dt;
      spark.art.rotation += spark.spin * dt;
      spark.art.alpha = 1 - progress;
      spark.art.scale.set(1 - progress * 0.35);
    }

    return progress < 1;
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}

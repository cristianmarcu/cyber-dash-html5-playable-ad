import type { Container } from "pixi.js";
import {
  DustPuff,
  FloatingText,
  SparkleBurst,
  type VisualEffect,
} from "./effects";
import type { Player } from "./entities/Player";

export class GameEffects {
  private readonly layer: Container;
  private readonly effects: VisualEffect[] = [];
  private dustTimer = 0;

  constructor(layer: Container) {
    this.layer = layer;
  }

  resetDustTimer() {
    this.dustTimer = 0;
  }

  addCollectEffect(x: number, y: number, label: string, color: number) {
    const burst = new SparkleBurst(x, y, color, label.startsWith("-") ? 6 : 10);
    const scoreText = new FloatingText(label, x, y - 24, color);

    this.effects.push(burst, scoreText);
    this.layer.addChild(burst.container, scoreText.container);
  }

  emitRunDust(dt: number, player?: Player) {
    if (!player?.isGrounded) {
      return;
    }

    this.dustTimer -= dt;

    if (this.dustTimer > 0) {
      return;
    }

    this.dustTimer = 0.09;

    const dust = new DustPuff(
      player.footX + (Math.random() - 0.5) * 20,
      player.footY + 2,
    );

    this.effects.push(dust);
    this.layer.addChild(dust.container);
  }

  update(dt: number) {
    for (let i = this.effects.length - 1; i >= 0; i -= 1) {
      const effect = this.effects[i];

      if (!effect.update(dt)) {
        effect.destroy();
        this.effects.splice(i, 1);
      }
    }
  }

  clear() {
    for (const effect of this.effects) {
      effect.destroy();
    }

    this.effects.length = 0;
  }
}

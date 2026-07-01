import { Container, Graphics, Sprite, Text, type Texture } from "pixi.js";
import { COLORS, FLOOR_Y } from "../constants";
import type { Aabb, ScrollingEntity } from "../types";

export type ObstacleKind = "laser" | "crate";

export class Obstacle implements ScrollingEntity {
  readonly container = new Container();
  collected = false;
  hit = false;

  private readonly glow = new Graphics();
  private readonly warning = new Container();
  private readonly sprite: Sprite;
  private readonly kind: ObstacleKind;
  private readonly width: number;
  private readonly height: number;
  private baseSpriteScaleX = 1;
  private baseSpriteScaleY = 1;
  private depthAlpha = 1;
  private warningActive = false;
  private time = 0;

  constructor(x: number, texture: Texture, kind: ObstacleKind = "laser") {
    this.kind = kind;
    this.sprite = new Sprite(texture);

    // Keep obstacles compact so lane reads stay clear on small phones
    this.width = kind === "laser" ? 108 : 58;
    this.height = kind === "laser" ? 64 : 58;

    this.container.position.set(x, FLOOR_Y);
    this.draw();
  }

  setTrackPosition(
    x: number,
    groundY: number,
    scale: number,
    alpha: number,
    visible: boolean,
  ) {
    this.depthAlpha = alpha;
    this.container.position.set(x, groundY);
    this.container.scale.set(scale);
    this.container.visible = visible;
  }

  setWarning(active: boolean) {
    this.warningActive = active;
    this.warning.visible = active && !this.hit;
  }

  update(dt: number) {
    this.time += dt;

    const pulse =
      1 + Math.sin(this.time * 9) * (this.kind === "laser" ? 0.025 : 0.015);

    this.sprite.scale.set(
      this.baseSpriteScaleX * pulse,
      this.baseSpriteScaleY * pulse,
    );
    this.glow.alpha =
      (this.kind === "laser" ? 0.3 : 0.2) + Math.sin(this.time * 7) * 0.06;
    this.warning.alpha = this.warningActive
      ? 0.64 + Math.sin(this.time * 12) * 0.18
      : 0;

    this.container.alpha = (this.hit ? 0.58 : 1) * this.depthAlpha;
  }

  getBounds(): Aabb {
    const scale = this.container.scale.x;

    if (this.kind === "laser") {
      return {
        x: this.container.x - this.width * scale * 0.38,
        y: this.container.y - this.height * scale * 0.78,
        width: this.width * scale * 0.76,
        height: this.height * scale * 0.64,
      };
    }

    return {
      x: this.container.x - this.width * scale * 0.38,
      y: this.container.y - this.height * scale * 0.76,
      width: this.width * scale * 0.76,
      height: this.height * scale * 0.72,
    };
  }

  destroy() {
    this.container.destroy({ children: true });
  }

  private draw() {
    const glowColor = this.kind === "laser" ? COLORS.magenta : COLORS.purple;

    this.glow
      .roundRect(
        -this.width / 2 - 5,
        -this.height - 5,
        this.width + 10,
        this.height + 10,
        10,
      )
      .fill({ color: glowColor, alpha: 0.16 });

    this.glow
      .ellipse(0, 4, this.width * 0.38, 6)
      .fill({
        color: this.kind === "laser" ? COLORS.magenta : COLORS.cyan,
        alpha: 0.12,
      });

    this.sprite.anchor.set(0.5, 1);
    this.sprite.position.set(0, 0);
    this.sprite.width = this.width;
    this.sprite.height = this.height;
    this.baseSpriteScaleX = this.sprite.scale.x;
    this.baseSpriteScaleY = this.sprite.scale.y;

    const warningPlate = new Graphics();
    warningPlate
      .moveTo(0, -18)
      .lineTo(17, 14)
      .lineTo(-17, 14)
      .closePath()
      .fill({ color: COLORS.yellow, alpha: 0.88 })
      .stroke({ color: COLORS.danger, alpha: 0.8, width: 2 });

    const warningText = new Text({
      text: "!",
      style: {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: 21,
        fontWeight: "900",
        fill: COLORS.void,
      },
    });

    warningText.anchor.set(0.5);
    warningText.position.set(0, 2);

    this.warning.position.set(0, -this.height - 24);
    this.warning.visible = false;
    this.warning.addChild(warningPlate, warningText);

    this.container.addChild(this.glow, this.sprite, this.warning);
  }
}

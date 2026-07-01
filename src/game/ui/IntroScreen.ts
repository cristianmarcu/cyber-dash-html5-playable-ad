import { Container, Graphics, Sprite, Text } from "pixi.js";
import type { CyberTextures } from "../assets";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../constants";

export class IntroScreen {
  readonly container = new Container();

  private readonly background: Sprite;

  private readonly button = new Container();
  private readonly buttonShadow = new Graphics();
  private readonly buttonGlowOuter = new Graphics();
  private readonly buttonGlowInner = new Graphics();
  private readonly buttonBase = new Graphics();
  private readonly buttonInner = new Graphics();
  private readonly buttonSheen = new Graphics();

  private readonly buttonLabel = new Text({
    text: "TAP TO START",
    style: {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: 28,
      fontWeight: "900",
      fill: 0x1f1300,
      letterSpacing: 1.5,
      stroke: { color: 0xfff1a8, width: 2 },
    },
  });

  private readonly buttonHint = new Text({
    text: "Quick 15s run",
    style: {
      fontFamily: "Arial, sans-serif",
      fontSize: 16,
      fontWeight: "700",
      fill: 0xb8f7ff,
      letterSpacing: 0.8,
    },
  });

  private time = 0;
  private pressTimer = 0;

  constructor(textures: Pick<CyberTextures, "introReference">) {
    this.background = new Sprite(textures.introReference);
    this.draw();
  }

  show() {
    this.container.visible = true;
  }

  hide() {
    this.container.visible = false;
  }

  press() {
    this.pressTimer = 0.12;
  }

  update(dt: number) {
    this.time += dt;
    this.pressTimer = Math.max(0, this.pressTimer - dt);

    const pulse = 1 + Math.sin(this.time * 4.6) * 0.018;
    const pressScale = this.pressTimer > 0 ? 0.95 : 1;
    this.button.scale.set(pulse * pressScale);

    this.buttonGlowOuter.alpha = 0.22 + Math.sin(this.time * 5.5) * 0.06;
    this.buttonGlowInner.alpha = 0.35 + Math.sin(this.time * 5.8) * 0.07;

    // Sheen stays inside the button instead of entering/exiting from outside
    this.buttonSheen.x = Math.sin(this.time * 3.2) * 78;
    this.buttonSheen.alpha = 0.1 + Math.sin(this.time * 4.8) * 0.04;

    this.buttonHint.alpha = 0.8 + Math.sin(this.time * 4.5) * 0.15;
  }

  destroy() {
    this.container.destroy({ children: true });
  }

  private draw() {
    this.layoutBackground();

    // Drawn in Pixi to avoid shipping another tap-to-start image
    this.buttonShadow
      .roundRect(-170, -44, 340, 96, 26)
      .fill({ color: 0x000000, alpha: 0.28 });

    this.buttonGlowOuter
      .roundRect(-176, -50, 352, 108, 30)
      .fill({ color: 0xffd84d, alpha: 0.16 });

    this.buttonGlowOuter
      .roundRect(-182, -56, 364, 120, 34)
      .stroke({ color: 0xffc400, alpha: 0.3, width: 4 });

    this.buttonGlowInner
      .roundRect(-164, -38, 328, 84, 22)
      .stroke({ color: 0xfff1a8, alpha: 0.45, width: 3 });

    this.buttonBase
      .roundRect(-160, -34, 320, 76, 20)
      .fill({ color: 0xf5c400, alpha: 1 });

    this.buttonBase
      .roundRect(-160, -34, 320, 76, 20)
      .stroke({ color: 0x8a5b00, alpha: 0.85, width: 4 });

    this.buttonInner
      .roundRect(-148, -24, 296, 56, 16)
      .fill({ color: 0xffdf42, alpha: 1 });

    this.buttonInner
      .roundRect(-148, -24, 296, 56, 16)
      .stroke({ color: 0xfff3a6, alpha: 0.8, width: 2 });

    this.buttonSheen
      .moveTo(-18, -22)
      .lineTo(24, -22)
      .lineTo(8, 22)
      .lineTo(-34, 22)
      .closePath()
      .fill({ color: 0xffffff, alpha: 0.14 });

    this.buttonLabel.anchor.set(0.5);
    this.buttonLabel.position.set(0, 3);

    this.buttonHint.anchor.set(0.5);
    this.buttonHint.position.set(0, 68);

    this.button.position.set(GAME_WIDTH / 2, 760);
    this.button.addChild(
      this.buttonShadow,
      this.buttonGlowOuter,
      this.buttonGlowInner,
      this.buttonBase,
      this.buttonInner,
      this.buttonSheen,

      this.buttonLabel,
      this.buttonHint,
    );

    this.container.addChild(this.background, this.button);
  }

  private layoutBackground() {
    this.background.anchor.set(0.5);
    this.background.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    const textureWidth = this.background.texture.width || GAME_WIDTH;
    const textureHeight = this.background.texture.height || GAME_HEIGHT;

    const scale = Math.max(
      GAME_WIDTH / textureWidth,
      GAME_HEIGHT / textureHeight,
    );

    this.background.scale.set(scale);
  }
}

import { Container, Graphics, Sprite, Text } from "pixi.js";
import type { CyberTextures } from "../assets";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../constants";

export class EndCard {
  readonly container = new Container();

  private readonly background: Sprite;
  private readonly scorePanel: Sprite;

  private readonly scoreValue = new Text({
    text: "0",
    style: {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: 54,
      fontWeight: "900",
      fill: 0xffffff,
      letterSpacing: 1.5,
      stroke: { color: 0xff2bdc, width: 4 },
      dropShadow: {
        color: 0x7c3cff,
        alpha: 0.45,
        blur: 8,
        distance: 0,
      },
    },
  });

  private readonly button = new Container();
  private readonly buttonShadow = new Graphics();
  private readonly buttonGlowOuter = new Graphics();
  private readonly buttonGlowInner = new Graphics();
  private readonly buttonBase = new Graphics();
  private readonly buttonInner = new Graphics();
  private readonly buttonSheen = new Graphics();

  private readonly buttonLabel = new Text({
    text: "PLAY NOW",
    style: {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: 30,
      fontWeight: "900",
      fill: 0x1f1300,
      letterSpacing: 1.5,
      stroke: { color: 0xfff1a8, width: 2 },
    },
  });

  private readonly buttonBounds = {
    x: GAME_WIDTH / 2 - 170,
    y: 710,
    width: 340,
    height: 110,
  };

  private time = 0;
  private pressTimer = 0;

  constructor(
    textures: Pick<CyberTextures, "endcardReference" | "scorePanel">,
  ) {
    this.background = new Sprite(textures.endcardReference);
    this.scorePanel = new Sprite(textures.scorePanel);

    this.draw();
    this.hide();
  }

  show(score: number, _keyCollected: boolean) {
    this.scoreValue.text = String(score);
    this.container.visible = true;
  }

  hide() {
    this.container.visible = false;
  }

  containsCta(x: number, y: number) {
    // Bounds stay in design coordinates because the scene owns scaling
    return (
      x >= this.buttonBounds.x &&
      x <= this.buttonBounds.x + this.buttonBounds.width &&
      y >= this.buttonBounds.y &&
      y <= this.buttonBounds.y + this.buttonBounds.height
    );
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

    this.buttonSheen.x = Math.sin(this.time * 3.2) * 78;
    this.buttonSheen.alpha = 0.1 + Math.sin(this.time * 4.8) * 0.04;
  }

  destroy() {
    this.container.destroy({ children: true });
  }

  private draw() {
    this.layoutBackground();
    this.layoutScorePanel();
    this.buildButton();

    this.container.addChild(
      this.background,
      this.scorePanel,
      this.scoreValue,
      this.button,
    );
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

  private layoutScorePanel() {
    this.scorePanel.anchor.set(0.5);

    this.scorePanel.position.set(GAME_WIDTH / 2, 635);

    const targetWidth = 250;
    const textureWidth = this.scorePanel.texture.width || targetWidth;
    const scale = targetWidth / textureWidth;

    this.scorePanel.scale.set(scale);

    this.scoreValue.anchor.set(0.5);

    this.scoreValue.position.set(GAME_WIDTH / 2, 640);
  }

  private buildButton() {
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

    this.button.position.set(GAME_WIDTH / 2, 760);

    this.button.addChild(
      this.buttonShadow,
      this.buttonGlowOuter,
      this.buttonGlowInner,
      this.buttonBase,
      this.buttonInner,
      this.buttonSheen,
      this.buttonLabel,
    );
  }
}

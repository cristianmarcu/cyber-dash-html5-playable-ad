import { Container, Graphics, Sprite, Text } from "pixi.js";
import type { CyberTextures } from "../assets";
import { COLORS, GAME_WIDTH } from "../constants";

const SAFE_TOP = 16;
const SCORE_X = 14;
const SCORE_Y = SAFE_TOP;
const SCORE_W = 126;
const SCORE_H = 52;

const KEY_W = 118;
const KEY_H = 52;
const KEY_X = GAME_WIDTH - KEY_W - 14;
const KEY_Y = SAFE_TOP;

const PROGRESS_W = 236;
const PROGRESS_H = 10;
const PROGRESS_X = (GAME_WIDTH - PROGRESS_W) / 2;
const PROGRESS_Y = SAFE_TOP + 66;

export class Hud {
  readonly container = new Container();

  private readonly scoreText: Text;
  private readonly keyText: Text;

  private readonly progressTrack = new Graphics();
  private readonly progressFill = new Graphics();
  private readonly progressGlow = new Graphics();
  private readonly progressCap = new Graphics();

  private readonly keyIcon: Sprite;
  private flashTimer = 0;

  constructor(textures: Pick<CyberTextures, "creditOrb" | "accessKey">) {
    this.keyIcon = new Sprite(textures.accessKey);

    this.scoreText = new Text({
      text: "0",
      style: {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: 28,
        fontWeight: "900",
        fill: COLORS.white,
        stroke: { color: COLORS.void, width: 5 },
        dropShadow: {
          color: COLORS.cyan,
          alpha: 0.35,
          blur: 6,
          distance: 0,
        },
      },
    });

    this.keyText = new Text({
      text: "KEY 0/1",
      style: {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: 14,
        fontWeight: "900",
        fill: COLORS.cyanSoft,
        stroke: { color: COLORS.void, width: 4 },
      },
    });

    this.draw(textures.creditOrb);
    this.setScore(0);
    this.setProgress(0);
    this.setKey(false);
  }

  setScore(score: number) {
    this.scoreText.text = `${score}`;
  }

  setProgress(progress: number) {
    const clamped = Math.min(1, Math.max(0, progress));
    const fillWidth = PROGRESS_W * clamped;

    this.progressFill.clear();

    if (fillWidth > 0) {
      this.progressFill
        .roundRect(0, 0, fillWidth, PROGRESS_H, 5)
        .fill({ color: COLORS.yellow, alpha: 1 });

      this.progressFill
        .roundRect(0, 0, Math.max(8, fillWidth * 0.42), PROGRESS_H, 5)
        .fill({ color: COLORS.white, alpha: 0.24 });
    }

    this.progressCap.clear();

    if (clamped > 0.03) {
      this.progressCap
        .moveTo(0, -2)
        .lineTo(15, PROGRESS_H / 2)
        .lineTo(0, PROGRESS_H + 2)
        .closePath()
        .fill({ color: COLORS.yellowLight, alpha: 0.95 });

      this.progressCap.position.set(
        PROGRESS_X + Math.min(PROGRESS_W - 4, fillWidth),
        PROGRESS_Y,
      );
      this.progressCap.visible = true;
    } else {
      this.progressCap.visible = false;
    }
  }

  setKey(hasKey: boolean) {
    this.keyText.text = hasKey ? "KEY 1/1" : "KEY 0/1";
    this.keyText.style.fill = hasKey ? COLORS.yellowLight : COLORS.cyanSoft;

    this.keyIcon.alpha = hasKey ? 1 : 0.5;
    this.keyIcon.tint = hasKey ? COLORS.white : 0x8aa4d8;
  }

  flashScore() {
    this.flashTimer = 0.18;
  }

  update(dt: number) {
    if (this.flashTimer > 0) {
      this.flashTimer = Math.max(0, this.flashTimer - dt);
      const scale = 1 + Math.sin(this.flashTimer * 44) * 0.08;
      this.scoreText.scale.set(scale);
    } else {
      this.scoreText.scale.set(1);
    }
  }

  destroy() {
    this.container.destroy({ children: true });
  }

  private draw(creditTexture: CyberTextures["creditOrb"]) {
    const scorePill = new Graphics();

    scorePill
      .roundRect(SCORE_X, SCORE_Y, SCORE_W, SCORE_H, 12)
      .fill({ color: COLORS.panel, alpha: 0.82 });

    scorePill
      .roundRect(SCORE_X + 2, SCORE_Y + 2, SCORE_W - 4, SCORE_H - 4, 10)
      .stroke({ color: COLORS.cyan, alpha: 0.72, width: 2 });

    scorePill
      .roundRect(SCORE_X + 5, SCORE_Y + 5, SCORE_W - 10, 13, 7)
      .fill({ color: COLORS.white, alpha: 0.07 });

    const creditGlow = new Graphics();

    creditGlow
      .circle(SCORE_X + 27, SCORE_Y + 27, 19)
      .fill({ color: COLORS.cyan, alpha: 0.2 });

    const credit = new Sprite(creditTexture);

    credit.anchor.set(0.5);
    credit.position.set(SCORE_X + 27, SCORE_Y + 27);
    credit.width = 28;
    credit.height = 28;

    this.scoreText.anchor.set(0, 0.5);
    this.scoreText.position.set(SCORE_X + 50, SCORE_Y + 27);

    const keyPanel = new Graphics();

    keyPanel
      .roundRect(KEY_X, KEY_Y, KEY_W, KEY_H, 12)
      .fill({ color: COLORS.panel, alpha: 0.82 });

    keyPanel
      .roundRect(KEY_X + 2, KEY_Y + 2, KEY_W - 4, KEY_H - 4, 10)
      .stroke({ color: COLORS.magenta, alpha: 0.68, width: 2 });

    keyPanel
      .roundRect(KEY_X + 5, KEY_Y + 5, KEY_W - 10, 13, 7)
      .fill({ color: COLORS.white, alpha: 0.07 });

    this.keyIcon.anchor.set(0.5);
    this.keyIcon.position.set(KEY_X + 27, KEY_Y + 27);
    this.keyIcon.width = 28;
    this.keyIcon.height = 28;

    this.keyText.anchor.set(0, 0.5);
    this.keyText.position.set(KEY_X + 50, KEY_Y + 27);

    this.progressGlow
      .roundRect(
        PROGRESS_X - 7,
        PROGRESS_Y - 7,
        PROGRESS_W + 14,
        PROGRESS_H + 14,
        9,
      )
      .fill({ color: COLORS.cyan, alpha: 0.08 });

    this.progressTrack
      .roundRect(0, 0, PROGRESS_W, PROGRESS_H, 5)
      .fill({ color: COLORS.panel, alpha: 0.78 });

    this.progressTrack
      .roundRect(0, 0, PROGRESS_W, PROGRESS_H, 5)
      .stroke({ color: COLORS.cyan, alpha: 0.5, width: 1 });

    this.progressTrack.position.set(PROGRESS_X, PROGRESS_Y);
    this.progressFill.position.set(PROGRESS_X, PROGRESS_Y);

    this.container.addChild(
      scorePill,
      creditGlow,
      credit,
      this.scoreText,

      keyPanel,
      this.keyIcon,
      this.keyText,

      this.progressGlow,
      this.progressTrack,
      this.progressFill,
      this.progressCap,
    );
  }
}

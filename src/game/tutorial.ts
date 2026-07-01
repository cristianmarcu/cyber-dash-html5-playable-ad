import { Container, Graphics, Text } from "pixi.js";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "./constants";

export class TutorialBanner {
  readonly container = new Container();

  private readonly bg = new Graphics();
  private readonly label = new Text({
    text: "Tap left/right to dodge and collect symbols",
    style: {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: 13,
      fontWeight: "900",
      align: "center",
      fill: COLORS.white,
      stroke: { color: COLORS.void, width: 5 },
    },
  });

  constructor() {
    this.draw();
  }

  show() {
    this.container.visible = true;
    this.container.alpha = 1;
  }

  hide() {
    this.container.visible = false;
    this.container.alpha = 0;
  }

  update(elapsed: number, playerY?: number) {
    if (!this.container.visible) {
      return;
    }

    if (playerY !== undefined) {
      // Follow low near the player so HUD and progress stay readable
      const targetY = Math.min(GAME_HEIGHT - 62, playerY + 76);
      this.container.position.set(GAME_WIDTH / 2, targetY);
    }

    if (elapsed < 3.2) {
      this.container.alpha = 1;
      return;
    }

    const fade = Math.max(0, 1 - (elapsed - 3.2) / 0.7);

    this.container.alpha = fade;

    if (fade <= 0) {
      this.hide();
    }
  }

  destroy() {
    this.container.destroy({ children: true });
  }

  private draw() {
    this.bg.roundRect(-170, -24, 340, 48, 14).fill({
      color: COLORS.panel,
      alpha: 0.76,
    });

    this.bg.roundRect(-166, -20, 332, 40, 12).stroke({
      color: COLORS.cyan,
      alpha: 0.45,
      width: 2,
    });

    this.label.anchor.set(0.5);
    this.label.style.fontSize = 12;

    // Default low position covers the first frame before the player updates
    this.container.position.set(GAME_WIDTH / 2, GAME_HEIGHT - 72);
    this.hide();
    this.container.addChild(this.bg, this.label);
  }
}

import { Container, Graphics, Sprite } from "pixi.js";
import {
  COLORS,
  FLOOR_Y,
  PLAYER_WIDTH,
  PLAYER_X,
} from "../constants";
import type { CyberTextures } from "../assets";
import type { Aabb } from "../types";

const PLAYER_RENDER_HEIGHT = 122;

export class Player {
  readonly container = new Container();

  private readonly shadow = new Graphics();
  private readonly body = new Container();
  private readonly runSprites: Sprite[];

  private targetX = PLAYER_X;
  private runTime = 0;
  private laneShiftTimer = 0;
  private stumbleTimer = 0;
  private currentLane = 0;

  constructor(
    textures: Pick<
      CyberTextures,
      "playerRun1" | "playerRun2" | "playerRun3" | "playerRun4"
    >,
  ) {
    this.runSprites = [
      new Sprite(textures.playerRun1),
      new Sprite(textures.playerRun2),
      new Sprite(textures.playerRun3),
      new Sprite(textures.playerRun4),
    ];

    this.container.x = PLAYER_X;
    this.container.y = FLOOR_Y + 12;
    this.container.zIndex = 9000;

    this.draw();
  }

  reset(x = PLAYER_X) {
    this.targetX = x;
    this.currentLane = 0;
    this.runTime = 0;
    this.laneShiftTimer = 0;
    this.stumbleTimer = 0;

    this.container.x = x;
    this.container.y = FLOOR_Y + 12;
    this.container.alpha = 1;
    this.container.rotation = 0;

    this.body.x = 0;
    this.body.y = 0;
    this.body.rotation = 0;
    this.body.scale.set(1);

    this.showRunFrame(0);
  }

  moveToLane(lane: number, x: number) {
    const laneChanged = lane !== this.currentLane;

    this.currentLane = lane;
    this.targetX = x;

    if (laneChanged) {
      this.laneShiftTimer = 0.22;
    }
  }

  stumble() {
    this.stumbleTimer = 0.42;
  }

  get lane() {
    return this.currentLane;
  }

  get isGrounded() {
    return true;
  }

  update(dt: number) {
    this.runTime += dt;
    this.laneShiftTimer = Math.max(0, this.laneShiftTimer - dt);

    const follow = Math.min(1, dt * 13);
    this.container.x += (this.targetX - this.container.x) * follow;

    if (Math.abs(this.targetX - this.container.x) < 0.25) {
      this.container.x = this.targetX;
    }

    this.animate(dt);
  }

  getBounds(): Aabb {
    return {
      x: this.container.x - PLAYER_WIDTH * 0.34,
      y: this.container.y - PLAYER_RENDER_HEIGHT + 12,
      width: PLAYER_WIDTH * 0.68,
      height: PLAYER_RENDER_HEIGHT - 18,
    };
  }

  get footX() {
    return this.container.x;
  }

  get footY() {
    return this.container.y;
  }

  destroy() {
    this.container.destroy({ children: true });
  }

  private animate(dt: number) {
    const step = Math.sin(this.runTime * 9.5);
    const frame = Math.floor(this.runTime / 0.16) % this.runSprites.length;
    const laneLean =
      this.laneShiftTimer > 0 ? (this.targetX - this.container.x) * 0.0018 : 0;

    this.showRunFrame(frame);

    this.body.y = step * 1.6;
    this.body.rotation = step * 0.006 + laneLean;
    this.body.scale.set(1 + Math.abs(step) * 0.004, 1 - Math.abs(step) * 0.003);

    this.shadow.scale.set(1 + Math.abs(step) * 0.04, 1);
    this.shadow.alpha = 0.32;

    if (this.stumbleTimer > 0) {
      this.stumbleTimer = Math.max(0, this.stumbleTimer - dt);
      this.container.alpha =
        Math.floor(this.stumbleTimer * 24) % 2 === 0 ? 0.54 : 1;
      this.body.rotation += 0.12;
    } else {
      this.container.alpha = 1;
    }
  }

  private draw() {
    this.shadow.ellipse(0, 5, 34, 9).fill({ color: 0x000000, alpha: 0.32 });
    this.shadow.ellipse(0, 4, 24, 5).fill({ color: COLORS.cyan, alpha: 0.12 });

    for (const sprite of this.runSprites) {
      sprite.anchor.set(0.5, 1);
      sprite.height = PLAYER_RENDER_HEIGHT;
      sprite.scale.x = sprite.scale.y;
      sprite.position.set(0, 7);
      sprite.visible = false;
      this.body.addChild(sprite);
    }

    this.showRunFrame(0);
    this.container.addChild(this.shadow, this.body);
  }

  private showRunFrame(frame: number) {
    this.runSprites.forEach((sprite, index) => {
      sprite.visible = index === frame;
    });
  }
}

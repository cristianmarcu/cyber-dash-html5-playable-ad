import {
  Container,
  type FederatedPointerEvent,
} from "pixi.js";
import { GAME_WIDTH } from "./constants";
import type { RuntimeState, ScenePoint } from "./types";

interface GameInputOptions {
  stage: Container;
  scene: Container;
  getState: () => RuntimeState;
  onIntroTap: () => void;
  onEndedTap: (point: ScenePoint) => void;
  onLaneMove: (direction: -1 | 1) => void;
}

export class GameInput {
  private readonly stage: Container;
  private readonly scene: Container;
  private readonly getState: () => RuntimeState;
  private readonly onIntroTap: () => void;
  private readonly onEndedTap: (point: ScenePoint) => void;
  private readonly onLaneMove: (direction: -1 | 1) => void;
  private pointerStart: ScenePoint | null = null;
  private bound = false;

  constructor(options: GameInputOptions) {
    this.stage = options.stage;
    this.scene = options.scene;
    this.getState = options.getState;
    this.onIntroTap = options.onIntroTap;
    this.onEndedTap = options.onEndedTap;
    this.onLaneMove = options.onLaneMove;
  }

  bind() {
    if (this.bound) {
      return;
    }

    this.bound = true;
    this.stage.on("pointerdown", this.handlePointerDown);
    this.stage.on("pointerup", this.handlePointerUp);
    this.stage.on("pointerupoutside", this.handlePointerUp);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  destroy() {
    if (!this.bound) {
      return;
    }

    this.bound = false;
    this.stage.off("pointerdown", this.handlePointerDown);
    this.stage.off("pointerup", this.handlePointerUp);
    this.stage.off("pointerupoutside", this.handlePointerUp);
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  resetGesture() {
    this.pointerStart = null;
  }

  private handlePointerDown = (event: FederatedPointerEvent) => {
    event.preventDefault();

    const point = this.toScenePoint(event);
    const state = this.getState();

    if (state === "intro") {
      this.onIntroTap();
      return;
    }

    if (state === "playing") {
      this.pointerStart = point;
      return;
    }

    if (state === "ended") {
      this.onEndedTap(point);
    }
  };

  private handlePointerUp = (event: FederatedPointerEvent) => {
    if (this.getState() !== "playing") {
      this.resetGesture();
      return;
    }

    event.preventDefault();

    const point = this.toScenePoint(event);
    const start = this.pointerStart ?? point;
    const deltaX = point.x - start.x;
    const deltaY = point.y - start.y;

    this.resetGesture();

    if (Math.abs(deltaX) > 34 && Math.abs(deltaX) > Math.abs(deltaY) * 0.8) {
      this.onLaneMove(deltaX < 0 ? -1 : 1);
      return;
    }

    this.onLaneMove(point.x < GAME_WIDTH / 2 ? -1 : 1);
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.getState() !== "playing") {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      this.onLaneMove(-1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      this.onLaneMove(1);
    }
  };

  private toScenePoint(event: FederatedPointerEvent): ScenePoint {
    const sceneScale = this.scene.scale.x || 1;

    return {
      x: (event.global.x - this.scene.x) / sceneScale,
      y: (event.global.y - this.scene.y) / sceneScale,
    };
  }
}

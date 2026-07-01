import type { Graphics } from "pixi.js";
import { GAME_WIDTH } from "./constants";
import type { Player } from "./entities/Player";
import type { GameEffects } from "./gameEffects";
import type { TrackRuntime } from "./trackRuntime";

const FINISH_RUN_DURATION = 1.15;
const FINISH_TARGET_X = GAME_WIDTH / 2;
const FINISH_TARGET_Y = 312;
const FINISH_TARGET_SCALE = 0.34;

interface FinishRunOptions {
  dt: number;
  finishElapsed: number;
  player: Player;
  track: TrackRuntime;
  finishFlash: Graphics;
  gameEffects: GameEffects;
  updateVault: (progress: number, finishProgress: number) => void;
}

export function updateFinishRunStep(options: FinishRunOptions) {
  const finishElapsed = options.finishElapsed + options.dt;
  const progress = Math.min(1, finishElapsed / FINISH_RUN_DURATION);
  const eased = progress * progress * (3 - 2 * progress);

  options.updateVault(1, progress);
  options.player.update(options.dt);

  const startX = options.track.getPlayerLaneX(0);
  const startY = options.track.getPlayerY();

  options.player.container.x =
    startX + (FINISH_TARGET_X - startX) * eased;
  options.player.container.y =
    startY + (FINISH_TARGET_Y - startY) * eased;
  options.player.container.scale.set(
    1 + (FINISH_TARGET_SCALE - 1) * eased,
  );
  options.player.container.alpha =
    progress < 0.72 ? 1 : 1 - (progress - 0.72) / 0.28;

  options.finishFlash.alpha = Math.sin(progress * Math.PI) * 0.12;
  options.gameEffects.emitRunDust(options.dt * (1 - progress), options.player);

  return {
    finishElapsed,
    complete: progress >= 1,
  };
}

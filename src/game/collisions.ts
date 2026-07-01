import { COLORS } from "./constants";
import type { LevelState } from "./level";
import type { LaneIndex } from "./track";

const COLLECT_DISTANCE = 66;
const OBSTACLE_HIT_DISTANCE = 48;

export type CollisionEvent =
  | {
      kind: "coin";
      scoreDelta: 10;
      x: number;
      y: number;
      label: "+10";
      color: typeof COLORS.cyan;
    }
  | {
      kind: "key";
      scoreDelta: 50;
      x: number;
      y: number;
      label: "+50";
      color: typeof COLORS.yellow;
    }
  | {
      kind: "obstacle";
      scoreDelta: -5;
      x: number;
      y: number;
      label: "-5";
      color: typeof COLORS.danger;
    };

export function resolveCollisions(
  level: LevelState,
  playerLane: LaneIndex,
): CollisionEvent[] {
  const events: CollisionEvent[] = [];

  for (const placement of level.coinTracks) {
    const coin = placement.entity;

    if (
      !coin.collected &&
      coin.container.visible &&
      placement.lane === playerLane &&
      Math.abs(placement.distance) <= COLLECT_DISTANCE
    ) {
      coin.collect();
      events.push({
        kind: "coin",
        scoreDelta: 10,
        x: coin.container.x,
        y: coin.container.y,
        label: "+10",
        color: COLORS.cyan,
      });
    }
  }

  if (
    level.keyTrack &&
    level.key &&
    !level.key.collected &&
    level.key.container.visible &&
    level.keyTrack.lane === playerLane &&
    Math.abs(level.keyTrack.distance) <= COLLECT_DISTANCE
  ) {
    level.key.collect();
    events.push({
      kind: "key",
      scoreDelta: 50,
      x: level.key.container.x,
      y: level.key.container.y,
      label: "+50",
      color: COLORS.yellow,
    });
  }

  for (const placement of level.obstacleTracks) {
    const obstacle = placement.entity;

    if (Math.abs(placement.distance) > OBSTACLE_HIT_DISTANCE) {
      continue;
    }

    if (
      !obstacle.hit &&
      obstacle.container.visible &&
      placement.lane === playerLane
    ) {
      obstacle.hit = true;
      obstacle.setWarning(false);
      events.push({
        kind: "obstacle",
        scoreDelta: -5,
        x: obstacle.container.x,
        y: obstacle.container.y - 34 * obstacle.container.scale.x,
        label: "-5",
        color: COLORS.danger,
      });
    }
  }

  return events;
}

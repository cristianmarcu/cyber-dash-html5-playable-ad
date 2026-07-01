import type { Container } from "pixi.js";
import type { CyberTextures } from "./assets";
import { FLOOR_Y, GAME_WIDTH } from "./constants";
import { Coin } from "./entities/Coin";
import { Key } from "./entities/Key";
import { Obstacle, type ObstacleKind } from "./entities/Obstacle";
import type { LaneIndex } from "./track";

export type TrackEntity = Coin | Key | Obstacle;

export interface TrackPlacement<T extends TrackEntity> {
  entity: T;
  distance: number;
  lane: LaneIndex;
  lift: number;
}

export interface LevelState {
  coins: Coin[];
  obstacles: Obstacle[];
  coinTracks: Array<TrackPlacement<Coin>>;
  obstacleTracks: Array<TrackPlacement<Obstacle>>;
  key: Key | null;
  keyTrack: TrackPlacement<Key> | null;
}

type ApplyTrackPlacement = <T extends TrackEntity>(
  placement: TrackPlacement<T>,
) => void;

// Patterns use track distance so scroll speed stays centralized
const COIN_PATTERN: Array<{
  distance: number;
  lane: LaneIndex;
  lift: number;
}> = [
  { distance: 310, lane: 0, lift: 70 },
  { distance: 455, lane: -1, lift: 70 },
  { distance: 600, lane: -1, lift: 72 },
  { distance: 760, lane: 1, lift: 70 },
  { distance: 930, lane: 0, lift: 74 },
  { distance: 1110, lane: 1, lift: 70 },
  { distance: 1290, lane: -1, lift: 72 },
  { distance: 1480, lane: 0, lift: 74 },
  { distance: 1680, lane: 1, lift: 72 },
  { distance: 1880, lane: 1, lift: 74 },
  { distance: 2080, lane: 0, lift: 70 },
  { distance: 2280, lane: -1, lift: 72 },
  { distance: 2480, lane: 0, lift: 74 },
  { distance: 2690, lane: 1, lift: 70 },
  { distance: 2910, lane: -1, lift: 72 },
  { distance: 3130, lane: 0, lift: 70 },
];

const OBSTACLE_PATTERN: Array<{
  distance: number;
  lane: LaneIndex;
  kind: ObstacleKind;
}> = [
  { distance: 860, lane: 1, kind: "laser" },
  { distance: 1220, lane: -1, kind: "crate" },
  { distance: 1580, lane: 0, kind: "laser" },
  { distance: 1980, lane: 1, kind: "crate" },
  { distance: 2380, lane: -1, kind: "laser" },
  { distance: 2780, lane: 0, kind: "crate" },
  { distance: 3180, lane: 1, kind: "laser" },
];

const KEY_PLACEMENT = {
  // Key appears before the final run so success depends on lane choice
  distance: 2200,
  lane: -1,
  lift: 82,
} satisfies {
  distance: number;
  lane: LaneIndex;
  lift: number;
};

export function createEmptyLevel(): LevelState {
  return {
    coins: [],
    obstacles: [],
    coinTracks: [],
    obstacleTracks: [],
    key: null,
    keyTrack: null,
  };
}

export function seedLevelState(
  level: LevelState,
  textures: CyberTextures,
  objectLayer: Container,
  applyTrackPlacement: ApplyTrackPlacement,
) {
  // Seeding applies perspective immediately so intro-to-run has no pop-in
  for (const item of COIN_PATTERN) {
    const coin = new Coin(GAME_WIDTH / 2, FLOOR_Y, textures.creditOrb);
    const placement: TrackPlacement<Coin> = {
      entity: coin,
      distance: item.distance,
      lane: item.lane,
      lift: item.lift,
    };

    level.coins.push(coin);
    level.coinTracks.push(placement);
    objectLayer.addChild(coin.container);
    applyTrackPlacement(placement);
  }

  for (const item of OBSTACLE_PATTERN) {
    const texture =
      item.kind === "laser" ? textures.laserGate : textures.cyberCrate;
    const obstacle = new Obstacle(GAME_WIDTH / 2, texture, item.kind);
    const placement: TrackPlacement<Obstacle> = {
      entity: obstacle,
      distance: item.distance,
      lane: item.lane,
      lift: 0,
    };

    level.obstacles.push(obstacle);
    level.obstacleTracks.push(placement);
    objectLayer.addChild(obstacle.container);
    applyTrackPlacement(placement);
  }

  level.key = new Key(GAME_WIDTH / 2, FLOOR_Y, textures.accessKey);
  level.keyTrack = {
    entity: level.key,
    distance: KEY_PLACEMENT.distance,
    lane: KEY_PLACEMENT.lane,
    lift: KEY_PLACEMENT.lift,
  };

  objectLayer.addChild(level.key.container);
  applyTrackPlacement(level.keyTrack);
}

export function clearLevelState(level: LevelState) {
  // Try Again rebuilds the run from scratch to avoid stale Pixi containers
  for (const coin of level.coins) {
    coin.destroy();
  }

  level.coins.length = 0;
  level.coinTracks.length = 0;

  for (const obstacle of level.obstacles) {
    obstacle.destroy();
  }

  level.obstacles.length = 0;
  level.obstacleTracks.length = 0;

  level.key?.destroy();
  level.key = null;
  level.keyTrack = null;
}

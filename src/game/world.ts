import { Container, Graphics, Sprite, type Texture } from "pixi.js";
import {
  COLORS,
  FLOOR_Y,
  GAME_HEIGHT,
  GAME_WIDTH,
  SCROLL_SPEED,
} from "./constants";
import type { ParallaxSprite } from "./types";
import {
  getLaneX,
  NEAR_LANE_OFFSET_START,
  TRACK_DESPAWN_DISTANCE,
  TRACK_START_Y,
  TRACK_VISIBLE_DISTANCE,
  type LaneIndex,
} from "./track";

export interface TrackMarker {
  container: Container;
  distance: number;
  lane: LaneIndex;
  speedFactor: number;
}

type ApplyTrackMarker = (marker: TrackMarker) => void;

export function buildBackground(
  background: Container,
  backgroundTexture: Texture,
  parallaxItems: ParallaxSprite[],
) {
  const bg = new Sprite(backgroundTexture);

  bg.anchor.set(0.5);
  bg.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2);
  bg.height = GAME_HEIGHT;
  bg.scale.x = bg.scale.y;

  const grade = new Graphics();

  grade
    .rect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    .fill({ color: COLORS.void, alpha: 0.08 });
  grade.rect(0, 0, GAME_WIDTH, 122).fill({ color: COLORS.void, alpha: 0.28 });
  grade.rect(0, 122, GAME_WIDTH, 118).fill({
    color: COLORS.void,
    alpha: 0.1,
  });
  grade.rect(0, FLOOR_Y - 26, GAME_WIDTH, GAME_HEIGHT - FLOOR_Y + 26).fill({
    color: COLORS.void,
    alpha: 0.16,
  });

  background.addChild(bg, grade);

  // Small generated motes add motion without extra network requests
  addAmbientPixels(background, parallaxItems);
}

export function buildForeground(
  foreground: Container,
  trackMarkers: TrackMarker[],
  applyTrackMarker: ApplyTrackMarker,
) {
  foreground.sortableChildren = true;

  // Static rails use the same perspective math as moving gameplay objects
  const trackTop = TRACK_START_Y - 20;
  const trackBottom = FLOOR_Y + 40;

  const groundGlow = new Graphics();

  groundGlow
    .rect(0, FLOOR_Y - 18, GAME_WIDTH, GAME_HEIGHT - FLOOR_Y + 18)
    .fill({ color: COLORS.void, alpha: 0.1 });

  groundGlow
    .roundRect(26, FLOOR_Y - 10, GAME_WIDTH - 52, 3, 2)
    .fill({ color: COLORS.magenta, alpha: 0.24 });

  for (const divider of [-1.5, -0.5, 0.5, 1.5]) {
    const farX = getLaneX(divider, 0, NEAR_LANE_OFFSET_START);
    const nearX = getLaneX(divider, 1, NEAR_LANE_OFFSET_START);

    groundGlow
      .moveTo(farX, trackTop)
      .lineTo(nearX, trackBottom)
      .stroke({
        color: Math.abs(divider) === 1.5 ? COLORS.magenta : COLORS.cyan,
        alpha: Math.abs(divider) === 1.5 ? 0.16 : 0.13,
        width: Math.abs(divider) === 1.5 ? 3 : 2,
      });
  }

  for (const lane of [-1, 0, 1] as const) {
    const farX = getLaneX(lane, 0, NEAR_LANE_OFFSET_START);
    const nearX = getLaneX(lane, 1, NEAR_LANE_OFFSET_START);

    groundGlow
      .moveTo(farX, trackTop + 12)
      .lineTo(nearX, trackBottom)
      .stroke({
        color: lane === 0 ? COLORS.cyan : COLORS.magenta,
        alpha: lane === 0 ? 0.15 : 0.1,
        width: 2,
      });
  }

  foreground.addChild(groundGlow);

  for (let i = 0; i < 9; i += 1) {
    for (const lane of [-1, 0, 1] as const) {
      const laneMark = new Container();
      const art = new Graphics();
      const color = lane === 0 ? COLORS.cyan : COLORS.magenta;

      art.roundRect(-18, -2, 36, 4, 2).fill({
        color,
        alpha: 0.34,
      });

      art.roundRect(-8, 6, 16, 2, 1).fill({
        color: COLORS.white,
        alpha: 0.1,
      });

      laneMark.addChild(art);
      laneMark.zIndex = i;

      foreground.addChild(laneMark);

      const marker: TrackMarker = {
        container: laneMark,
        distance: 80 + i * 115,
        lane,
        speedFactor: 1.1,
      };

      trackMarkers.push(marker);
      applyTrackMarker(marker);
    }
  }
}

export function updateParallaxItems(
  parallaxItems: ParallaxSprite[],
  dt: number,
  motionBoost: number,
) {
  for (const item of parallaxItems) {
    item.container.x -= SCROLL_SPEED * item.speedFactor * motionBoost * dt;

    if (item.container.x < -item.width) {
      item.container.x += item.width * 2;
    }
  }
}

export function updateTrackMarkers(
  trackMarkers: TrackMarker[],
  dt: number,
  motionBoost: number,
  applyTrackMarker: ApplyTrackMarker,
) {
  // Markers loop in distance space so road motion matches entity motion
  for (const marker of trackMarkers) {
    marker.distance -= SCROLL_SPEED * marker.speedFactor * motionBoost * dt;

    if (marker.distance < TRACK_DESPAWN_DISTANCE) {
      marker.distance += TRACK_VISIBLE_DISTANCE - TRACK_DESPAWN_DISTANCE;
    }

    applyTrackMarker(marker);
  }
}

function addAmbientPixels(
  background: Container,
  parallaxItems: ParallaxSprite[],
) {
  for (let i = 0; i < 14; i += 1) {
    const mote = new Container();
    const art = new Graphics();
    const color =
      i % 3 === 0
        ? COLORS.cyan
        : i % 3 === 1
          ? COLORS.magenta
          : COLORS.yellow;
    const width = 2 + (i % 4) * 2;

    art.roundRect(0, 0, width, 2, 1).fill({ color, alpha: 0.42 });
    art.circle(width + 5, 1, 1.4).fill({
      color: COLORS.white,
      alpha: 0.28,
    });

    mote.addChild(art);
    mote.position.set((i * 47) % (GAME_WIDTH + 50), 86 + ((i * 73) % 476));

    background.addChild(mote);

    parallaxItems.push({
      container: mote,
      speedFactor: 0.1 + (i % 5) * 0.025,
      width: GAME_WIDTH + 80,
    });
  }
}

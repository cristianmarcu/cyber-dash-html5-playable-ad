import { FLOOR_Y, GAME_WIDTH } from "./constants";

export type LaneIndex = -1 | 0 | 1;

export const TRACK_VISIBLE_DISTANCE = 980;
export const TRACK_DESPAWN_DISTANCE = -140;

export const TRACK_START_Y = 168;
export const TRACK_END_Y = FLOOR_Y - 34;

export const FAR_LANE_OFFSET = 24;
export const NEAR_LANE_OFFSET_START = 140;
export const NEAR_LANE_OFFSET_END = 116;
export const LANE_SHRINK_START = 0.58;

export const PLAYER_DEPTH_START = 1;
export const PLAYER_DEPTH_END = 0.58;
export const PLAYER_TRACK_Y_OFFSET = 46;

export const TRACK_FAR_SCALE = 0.7;
export const TRACK_NEAR_SCALE = 0.96;

// Starts the finish shortly after the last obstacle to avoid empty ad time
export const RUN_DURATION = 15.45;

export interface TrackTransform {
  x: number;
  y: number;
  groundY: number;
  scale: number;
  alpha: number;
  visible: boolean;
}

export function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

export function smooth01(value: number) {
  // Smoothstep avoids lane jumps as objects move between depth bands
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

export function getRuntimeNearLaneOffset(routeProgress: number) {
  // Lanes pinch inward near the vault so the finish shot lines up
  const shrinkProgress = smooth01(
    (routeProgress - LANE_SHRINK_START) / (1 - LANE_SHRINK_START),
  );

  return lerp(NEAR_LANE_OFFSET_START, NEAR_LANE_OFFSET_END, shrinkProgress);
}

export function getLaneX(
  lane: number,
  depth: number,
  nearLaneOffset: number,
) {
  const easedDepth = smooth01(depth);
  const laneOffset = lerp(FAR_LANE_OFFSET, nearLaneOffset, easedDepth);

  return GAME_WIDTH / 2 + lane * laneOffset;
}

export function getTrackY(depth: number) {
  const easedDepth = smooth01(depth);

  return TRACK_START_Y + (TRACK_END_Y - TRACK_START_Y) * easedDepth;
}

export function getPlayerDepth(routeProgress: number) {
  return lerp(PLAYER_DEPTH_START, PLAYER_DEPTH_END, smooth01(routeProgress));
}

export function getPlayerY(routeProgress: number) {
  return getTrackY(getPlayerDepth(routeProgress)) + PLAYER_TRACK_Y_OFFSET;
}

export function getPlayerLaneX(lane: LaneIndex, routeProgress: number) {
  const nearLaneOffset = getRuntimeNearLaneOffset(routeProgress);
  return getLaneX(lane, getPlayerDepth(routeProgress), nearLaneOffset);
}

export function getTrackTransform(
  distance: number,
  lane: number,
  lift: number,
  routeProgress: number,
): TrackTransform {
  const playerDepth = getPlayerDepth(routeProgress);

  // Clamp distance so late frames fade out instead of overshooting the camera
  const clampedDistance = Math.max(
    0,
    Math.min(TRACK_VISIBLE_DISTANCE, distance),
  );

  const rawDepth = 1 - clampedDistance / TRACK_VISIBLE_DISTANCE;
  const trackDepth = rawDepth * playerDepth;
  const easedTrackDepth = smooth01(trackDepth);

  const nearLaneOffset = getRuntimeNearLaneOffset(routeProgress);
  const x = getLaneX(lane, trackDepth, nearLaneOffset);
  const groundY = getTrackY(trackDepth);

  // Shared scale keeps coins, hazards, key, and markers reading on one road
  const scale =
    TRACK_FAR_SCALE + (TRACK_NEAR_SCALE - TRACK_FAR_SCALE) * easedTrackDepth;

  const fadeIn =
    distance > TRACK_VISIBLE_DISTANCE - 110
      ? Math.max(0, (TRACK_VISIBLE_DISTANCE - distance) / 110)
      : 1;

  const fadeOut =
    distance < 0
      ? Math.max(0, 1 + distance / Math.abs(TRACK_DESPAWN_DISTANCE))
      : 1;

  const alpha = Math.min(1, 0.45 + easedTrackDepth * 0.55) * fadeIn * fadeOut;

  return {
    x,
    y: groundY - lift * scale * 0.22,
    groundY,
    scale,
    alpha,
    visible:
      distance <= TRACK_VISIBLE_DISTANCE &&
      distance >= TRACK_DESPAWN_DISTANCE &&
      alpha > 0.02,
  };
}

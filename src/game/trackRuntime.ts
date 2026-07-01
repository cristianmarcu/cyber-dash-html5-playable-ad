import type { Container, Texture } from "pixi.js";
import { SCROLL_SPEED } from "./constants";
import { Obstacle } from "./entities/Obstacle";
import type { TrackEntity, TrackPlacement } from "./level";
import {
  getPlayerLaneX,
  getPlayerY,
  getTrackTransform,
  RUN_DURATION,
  type LaneIndex,
} from "./track";
import type { RuntimeState, ParallaxSprite } from "./types";
import {
  buildBackground,
  buildForeground,
  updateParallaxItems,
  updateTrackMarkers,
  type TrackMarker,
} from "./world";

const WARNING_START_DISTANCE = 520;
const WARNING_END_DISTANCE = 120;

interface TrackRuntimeOptions {
  background: Container;
  foreground: Container;
  getRouteProgress: () => number;
}

export class TrackRuntime {
  private readonly background: Container;
  private readonly foreground: Container;
  private readonly getRouteProgress: () => number;
  private readonly parallaxItems: ParallaxSprite[] = [];
  private readonly trackMarkers: TrackMarker[] = [];

  constructor(options: TrackRuntimeOptions) {
    this.background = options.background;
    this.foreground = options.foreground;
    this.getRouteProgress = options.getRouteProgress;
  }

  build(backgroundTexture: Texture) {
    buildBackground(this.background, backgroundTexture, this.parallaxItems);
    buildForeground(this.foreground, this.trackMarkers, this.applyTrackMarker);
  }

  update(dt: number, state: RuntimeState, elapsed: number) {
    const motionBoost =
      state === "playing"
        ? 1 + Math.min(0.35, (elapsed / RUN_DURATION) * 0.35)
        : state === "finishing"
          ? 1.45
          : 1;

    updateParallaxItems(this.parallaxItems, dt, motionBoost);
    updateTrackMarkers(
      this.trackMarkers,
      dt,
      motionBoost,
      this.applyTrackMarker,
    );
  }

  updateTrackEntities<T extends TrackEntity>(
    items: Array<TrackPlacement<T>>,
    dt: number,
  ) {
    for (const item of items) {
      this.updateTrackEntity(item, dt);
    }
  }

  updateTrackEntity<T extends TrackEntity>(item: TrackPlacement<T>, dt: number) {
    item.distance -= SCROLL_SPEED * dt;
    this.applyTrackPlacement(item);
    item.entity.update(dt);
  }

  applyTrackPlacement<T extends TrackEntity>(placement: TrackPlacement<T>) {
    // Keeps all gameplay objects aligned to the same perspective lanes
    const transform = getTrackTransform(
      placement.distance,
      placement.lane,
      placement.lift,
      this.getRouteProgress(),
    );

    placement.entity.setTrackPosition(
      transform.x,
      transform.y,
      transform.scale,
      transform.alpha,
      transform.visible,
    );

    if (placement.entity instanceof Obstacle) {
      placement.entity.setWarning(
        placement.distance <= WARNING_START_DISTANCE &&
          placement.distance >= WARNING_END_DISTANCE &&
          !placement.entity.hit,
      );
    }

    placement.entity.container.zIndex = transform.groundY;
  }

  getPlayerY() {
    return getPlayerY(this.getRouteProgress());
  }

  getPlayerLaneX(lane: LaneIndex) {
    return getPlayerLaneX(lane, this.getRouteProgress());
  }

  private applyTrackMarker = (marker: TrackMarker) => {
    const transform = getTrackTransform(
      marker.distance,
      marker.lane,
      -10,
      this.getRouteProgress(),
    );

    marker.container.position.set(transform.x, transform.y);
    marker.container.scale.set(
      transform.scale * 0.9,
      Math.max(0.55, transform.scale * 0.72),
    );
    marker.container.alpha = transform.alpha * 0.7;
    marker.container.visible = transform.visible;
    marker.container.zIndex = transform.groundY;
  };
}

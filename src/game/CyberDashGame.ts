import {
  Application,
  Container,
  Graphics,
  Ticker,
} from "pixi.js";
import { loadCyberTextures, type CyberTextures } from "./assets";
import { resolveCollisions } from "./collisions";
import { dispatchCyberDashCta } from "./cta";
import { Player } from "./entities/Player";
import { updateFinishRunStep } from "./finishRun";
import { GameEffects } from "./gameEffects";
import { GameInput } from "./input";
import {
  clearLevelState,
  createEmptyLevel,
  seedLevelState,
} from "./level";
import {
  buildFinishFlash,
  showEndedState,
  showFinishingState,
  showIntroState,
  showPlayingState,
  type ScreenLayers,
} from "./screens";
import { TutorialBanner } from "./tutorial";
import { RUN_DURATION, type LaneIndex } from "./track";
import { TrackRuntime } from "./trackRuntime";
import type { RuntimeState, ScenePoint } from "./types";
import { EndCard } from "./ui/EndCard";
import { Hud } from "./ui/Hud";
import { IntroScreen } from "./ui/IntroScreen";
import { TryAgainScreen } from "./ui/TryAgainScreen";
import {
  createVaultView,
  updateVaultView,
  type VaultView,
} from "./vault";
import { resizeGameScene } from "./viewport";

export class CyberDashGame {
  private readonly host: HTMLElement;
  private readonly app = new Application();

  // Fixed design-space layers keep Pixi scaling simple inside mobile ad iframes
  private readonly scene = new Container();
  private readonly background = new Container();
  private readonly foreground = new Container();
  private readonly goalLayer = new Container();
  private readonly playLayer = new Container();
  private readonly objectLayer = new Container();
  private readonly playerLayer = new Container();
  private readonly effectsLayer = new Container();
  private readonly finishFlash = new Graphics();
  private readonly tutorial = new TutorialBanner();
  private readonly level = createEmptyLevel();
  private readonly gameEffects = new GameEffects(this.effectsLayer);
  private readonly track = new TrackRuntime({
    background: this.background,
    foreground: this.foreground,
    getRouteProgress: () => this.getRouteProgress(),
  });

  private textures?: CyberTextures;
  private player?: Player;
  private hud?: Hud;
  private intro?: IntroScreen;
  private endCard?: EndCard;
  private tryAgainScreen?: TryAgainScreen;
  private vault?: VaultView;
  private input?: GameInput;
  private screenLayers?: ScreenLayers;

  private state: RuntimeState = "intro";
  private score = 0;
  private elapsed = 0;
  private finishElapsed = 0;
  private keyCollected = false;
  private playerLane: LaneIndex = 0;
  private resizeObserver: ResizeObserver | null = null;
  private destroyed = false;
  private initialized = false;

  constructor(host: HTMLElement) {
    this.host = host;
  }

  async init() {
    if (this.initialized || this.destroyed) {
      return;
    }

    this.textures = await loadCyberTextures();

    if (this.destroyed) {
      return;
    }

    this.player = new Player(this.textures);
    this.hud = new Hud(this.textures);
    this.intro = new IntroScreen(this.textures);
    this.endCard = new EndCard(this.textures);
    this.tryAgainScreen = new TryAgainScreen(this.textures);
    this.screenLayers = {
      foreground: this.foreground,
      goalLayer: this.goalLayer,
      playLayer: this.playLayer,
      effectsLayer: this.effectsLayer,
      objectLayer: this.objectLayer,
      finishFlash: this.finishFlash,
      tutorial: this.tutorial,
      hud: this.hud,
      intro: this.intro,
      endCard: this.endCard,
      tryAgainScreen: this.tryAgainScreen,
    };

    // Cap resolution so high-DPR phones do not waste the ad size budget on fill rate
    await this.app.init({
      resizeTo: this.host,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      powerPreference: "high-performance",
    });

    if (this.destroyed) {
      this.app.destroy({ removeView: true }, { children: true });
      return;
    }

    this.initialized = true;

    this.host.appendChild(this.app.canvas);
    this.app.stage.addChild(this.scene);

    // Later layers are overlays, so gameplay can disappear cleanly behind cards
    this.scene.addChild(
      this.background,
      this.foreground,
      this.goalLayer,
      this.playLayer,
      this.effectsLayer,
      this.finishFlash,
      this.tutorial.container,
      this.hud.container,
      this.intro.container,
      this.endCard.container,
      this.tryAgainScreen.container,
    );

    this.objectLayer.sortableChildren = true;
    this.goalLayer.sortableChildren = true;
    this.playLayer.addChild(this.objectLayer, this.playerLayer);
    this.playerLayer.addChild(this.player.container);

    // Stage-level input keeps taps reliable when sprites move under the finger
    this.app.stage.eventMode = "static";
    this.input = this.createInput();

    this.track.build(this.textures.background);
    this.buildVault();
    buildFinishFlash(this.finishFlash);
    this.seedLevel();
    this.showIntro();

    this.input.bind();
    this.app.ticker.add(this.tick);

    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(this.host);
    this.resize();
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.input?.destroy();
    this.input = undefined;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.initialized) {
      this.app.ticker.remove(this.tick);
      this.app.destroy({ removeView: true }, { children: true });
      this.initialized = false;
      return;
    }

    this.clearLevel();
    this.gameEffects.clear();
    this.player?.destroy();
    this.hud?.destroy();
    this.intro?.destroy();
    this.endCard?.destroy();
    this.tryAgainScreen?.destroy();
    this.tutorial.destroy();
  }

  private showIntro() {
    if (!this.player || !this.screenLayers) {
      return;
    }

    this.state = "intro";
    this.input?.resetGesture();
    showIntroState(this.screenLayers);

    this.player.container.scale.set(1);
    this.player.reset(this.track.getPlayerLaneX(0));
  }

  private startGame() {
    if (!this.player || !this.hud || !this.screenLayers) {
      return;
    }

    this.state = "playing";
    this.score = 0;
    this.elapsed = 0;
    this.finishElapsed = 0;
    this.keyCollected = false;
    this.playerLane = 0;
    this.input?.resetGesture();
    this.gameEffects.resetDustTimer();

    this.clearLevel();
    this.gameEffects.clear();
    this.seedLevel();

    // A restart creates fresh entities so collected and hit flags never leak
    this.player.container.scale.set(1);
    this.player.container.alpha = 1;
    this.player.reset(this.track.getPlayerLaneX(0));

    this.hud.setScore(0);
    this.hud.setKey(false);
    this.hud.setProgress(0);

    showPlayingState(this.screenLayers);
    this.updateVault(0, 0);
  }

  private startFinishRun() {
    if (!this.player || !this.screenLayers) {
      this.endGame();
      return;
    }

    this.state = "finishing";
    this.finishElapsed = 0;
    this.input?.resetGesture();
    showFinishingState(this.screenLayers);

    this.playerLane = 0;
    this.player.moveToLane(0, this.track.getPlayerLaneX(0));
    this.player.container.zIndex = 9999;
  }

  private updateFinishRun(dt: number) {
    if (!this.player) {
      this.endGame();
      return;
    }

    const result = updateFinishRunStep({
      dt,
      finishElapsed: this.finishElapsed,
      player: this.player,
      track: this.track,
      finishFlash: this.finishFlash,
      gameEffects: this.gameEffects,
      updateVault: (progress, finishProgress) =>
        this.updateVault(progress, finishProgress),
    });

    this.finishElapsed = result.finishElapsed;

    if (result.complete) {
      this.endGame();
    }
  }

  private endGame() {
    if (!this.screenLayers) {
      return;
    }

    this.state = "ended";
    this.input?.resetGesture();
    this.gameEffects.clear();
    showEndedState(this.screenLayers, this.score, this.keyCollected);
  }

  private seedLevel() {
    if (!this.textures) {
      return;
    }

    seedLevelState(
      this.level,
      this.textures,
      this.objectLayer,
      (placement) => this.track.applyTrackPlacement(placement),
    );
  }

  private clearLevel() {
    clearLevelState(this.level);
  }

  private tick = (ticker: Ticker) => {
    const dt = Math.min(0.033, ticker.deltaMS / 1000);

    this.track.update(dt, this.state, this.elapsed);
    this.intro?.update(dt);
    this.endCard?.update(dt);
    this.tryAgainScreen?.update(dt);
    this.hud?.update(dt);
    this.gameEffects.update(dt);

    if (this.state === "playing") {
      this.updateGame(dt);
    }

    if (this.state === "finishing") {
      this.updateFinishRun(dt);
    }
  };

  private updateGame(dt: number) {
    if (!this.player || !this.hud) {
      return;
    }

    this.elapsed += dt;

    // Clamp progress so late frames do not push objects outside the track
    const progress = Math.min(1, this.elapsed / RUN_DURATION);

    this.player.update(dt);

    const playerTargetX = this.track.getPlayerLaneX(this.playerLane);

    this.player.moveToLane(this.playerLane, playerTargetX);
    this.player.container.x +=
      (playerTargetX - this.player.container.x) * Math.min(1, dt * 14);
    this.player.container.y = this.track.getPlayerY();
    this.player.container.scale.set(1 - progress * 0.18);

    this.updateVault(progress, 0);
    this.tutorial.update(this.elapsed, this.player.container.y);
    this.gameEffects.emitRunDust(dt, this.player);

    this.track.updateTrackEntities(this.level.coinTracks, dt);
    this.track.updateTrackEntities(this.level.obstacleTracks, dt);

    if (this.level.keyTrack) {
      this.track.updateTrackEntity(this.level.keyTrack, dt);
    }

    this.handleCollisionEvents();
    this.hud.setProgress(progress);

    if (this.elapsed >= RUN_DURATION) {
      this.hud.setProgress(1);
      this.startFinishRun();
    }
  }

  private handleCollisionEvents() {
    if (!this.player || !this.hud) {
      return;
    }

    for (const event of resolveCollisions(this.level, this.playerLane)) {
      if (event.kind === "key") {
        this.keyCollected = true;
      }

      this.score = Math.max(0, this.score + event.scoreDelta);
      this.hud.setScore(this.score);

      if (event.kind === "key") {
        this.hud.setKey(true);
      }

      this.hud.flashScore();

      if (event.kind === "obstacle") {
        this.player.stumble();
      }

      this.gameEffects.addCollectEffect(
        event.x,
        event.y,
        event.label,
        event.color,
      );
    }
  }

  private handleIntroTap = () => {
    this.intro?.press();

    window.setTimeout(() => {
      if (!this.destroyed && this.state === "intro") {
        this.startGame();
      }
    }, 90);
  };

  private handleEndedTap = (point: ScenePoint) => {
    if (this.keyCollected && this.endCard?.containsCta(point.x, point.y)) {
      this.endCard.press();
      dispatchCyberDashCta(this.score, this.keyCollected);
      return;
    }

    if (!this.keyCollected && this.tryAgainScreen?.containsCta(point.x, point.y)) {
      this.tryAgainScreen.press();

      window.setTimeout(() => {
        if (!this.destroyed && this.state === "ended") {
          this.startGame();
        }
      }, 90);
    }
  };

  private movePlayerLane = (direction: -1 | 1) => {
    if (!this.player || this.state !== "playing") {
      return;
    }

    const nextLane = Math.max(
      -1,
      Math.min(1, this.playerLane + direction),
    ) as LaneIndex;

    if (nextLane === this.playerLane) {
      return;
    }

    this.playerLane = nextLane;
    this.player.moveToLane(nextLane, this.track.getPlayerLaneX(nextLane));
  };

  private resize = () => {
    resizeGameScene(this.app, this.scene, this.initialized);
  };

  private buildVault() {
    if (!this.textures) {
      return;
    }

    this.vault = createVaultView(this.textures);
    this.goalLayer.addChild(this.vault.container);
  }

  private updateVault(progress: number, finishProgress: number) {
    if (!this.vault) {
      return;
    }

    updateVaultView(this.vault, progress, finishProgress);
  }

  private getRouteProgress() {
    // Intro and end screens keep the track at its authored starting shape
    if (this.state === "playing") {
      return Math.min(1, this.elapsed / RUN_DURATION);
    }

    if (this.state === "finishing") {
      return 1;
    }

    return 0;
  }

  private createInput() {
    return new GameInput({
      stage: this.app.stage,
      scene: this.scene,
      getState: () => this.state,
      onIntroTap: this.handleIntroTap,
      onEndedTap: this.handleEndedTap,
      onLaneMove: this.movePlayerLane,
    });
  }
}

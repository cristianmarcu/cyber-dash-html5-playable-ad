import type { Container, Graphics } from "pixi.js";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "./constants";
import type { TutorialBanner } from "./tutorial";
import type { EndCard } from "./ui/EndCard";
import type { Hud } from "./ui/Hud";
import type { IntroScreen } from "./ui/IntroScreen";
import type { TryAgainScreen } from "./ui/TryAgainScreen";

export interface ScreenLayers {
  foreground: Container;
  goalLayer: Container;
  playLayer: Container;
  effectsLayer: Container;
  objectLayer: Container;
  finishFlash: Graphics;
  tutorial: TutorialBanner;
  hud: Hud;
  intro: IntroScreen;
  endCard: EndCard;
  tryAgainScreen: TryAgainScreen;
}

export function showIntroState(layers: ScreenLayers) {
  layers.foreground.visible = false;
  layers.goalLayer.visible = false;
  layers.playLayer.visible = false;
  layers.effectsLayer.visible = false;
  layers.finishFlash.visible = false;
  layers.tutorial.hide();
  layers.objectLayer.visible = true;

  layers.hud.container.visible = false;
  layers.intro.show();
  layers.endCard.hide();
  layers.tryAgainScreen.hide();
}

export function showPlayingState(layers: ScreenLayers) {
  layers.objectLayer.visible = true;
  layers.foreground.visible = true;
  layers.goalLayer.visible = true;
  layers.playLayer.visible = true;
  layers.effectsLayer.visible = true;
  layers.finishFlash.visible = false;
  layers.tutorial.show();
  layers.hud.container.visible = true;

  layers.intro.hide();
  layers.endCard.hide();
  layers.tryAgainScreen.hide();
}

export function showFinishingState(layers: ScreenLayers) {
  // Hide hazards so the final read is the player entering the vault
  layers.objectLayer.visible = false;
  layers.tutorial.hide();
  layers.finishFlash.visible = true;
  layers.finishFlash.alpha = 0;
}

export function showEndedState(
  layers: ScreenLayers,
  score: number,
  keyCollected: boolean,
) {
  // Hide gameplay layers before showing the final card
  layers.foreground.visible = false;
  layers.goalLayer.visible = false;
  layers.playLayer.visible = false;
  layers.effectsLayer.visible = false;
  layers.finishFlash.visible = false;
  layers.tutorial.hide();
  layers.hud.container.visible = false;

  if (keyCollected) {
    layers.endCard.show(score, keyCollected);
    layers.tryAgainScreen.hide();
  } else {
    layers.endCard.hide();
    layers.tryAgainScreen.show(score);
  }
}

export function buildFinishFlash(finishFlash: Graphics) {
  finishFlash
    .rect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    .fill({ color: COLORS.yellowLight, alpha: 1 });
  finishFlash.visible = false;
  finishFlash.alpha = 0;
}

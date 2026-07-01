import { Application, Container, Rectangle } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants";

export function resizeGameScene(
  app: Application,
  scene: Container,
  initialized: boolean,
) {
  if (!initialized) {
    return;
  }

  const screen = app.screen;

  // Letterbox into any portrait iframe while preserving design coordinates
  const scale = Math.min(
    screen.width / GAME_WIDTH,
    screen.height / GAME_HEIGHT,
  );

  scene.scale.set(scale);
  scene.position.set(
    (screen.width - GAME_WIDTH * scale) / 2,
    (screen.height - GAME_HEIGHT * scale) / 2,
  );

  app.stage.hitArea = new Rectangle(0, 0, screen.width, screen.height);
}

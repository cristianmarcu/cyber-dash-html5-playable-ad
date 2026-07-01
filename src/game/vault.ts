import { Container, Sprite } from "pixi.js";
import type { CyberTextures } from "./assets";
import { GAME_WIDTH } from "./constants";

const VAULT_X = GAME_WIDTH / 2;
const VAULT_Y = 292;
const VAULT_CLOSED_SCALE_START = 0.44;
const VAULT_CLOSED_SCALE_END = 0.72;
const VAULT_OPEN_SCALE = 0.9;

export interface VaultView {
  container: Container;
  closed: Sprite;
  open: Sprite;
}

export function createVaultView(
  textures: Pick<CyberTextures, "vaultDoor" | "vaultDoorOpen">,
): VaultView {
  // Image-only vault avoids the old circular glow behind the door
  const container = new Container();
  const closed = new Sprite(textures.vaultDoor);
  const open = new Sprite(textures.vaultDoorOpen);

  for (const vault of [closed, open]) {
    vault.anchor.set(0.5);
    vault.width = 188;
    vault.scale.y = vault.scale.x;
  }

  open.visible = false;
  container.position.set(VAULT_X, VAULT_Y);
  container.alpha = 0.42;
  container.scale.set(VAULT_CLOSED_SCALE_START);
  container.zIndex = 20;
  container.addChild(closed, open);

  return { container, closed, open };
}

export function updateVaultView(
  vault: VaultView,
  progress: number,
  finishProgress: number,
) {
  // Clamp animation inputs so dropped frames cannot overshoot the end pose
  const clamped = Math.max(0, Math.min(1, progress));
  const finish = Math.max(0, Math.min(1, finishProgress));
  const eased = clamped * clamped * (3 - 2 * clamped);

  const scale =
    VAULT_CLOSED_SCALE_START +
    (VAULT_CLOSED_SCALE_END - VAULT_CLOSED_SCALE_START) * eased;
  const finishScale = scale + (VAULT_OPEN_SCALE - scale) * finish;

  vault.container.position.set(VAULT_X, VAULT_Y + eased * 34 - finish * 18);
  vault.container.scale.set(finishScale);
  vault.container.alpha = 0.42 + eased * 0.42 + finish * 0.16;

  vault.closed.visible = finish < 0.18;
  vault.open.visible = finish >= 0.18;
  vault.open.alpha = Math.min(1, Math.max(0, (finish - 0.18) / 0.18));
}

export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

export const FLOOR_Y = 694;
export const PLAYER_X = GAME_WIDTH / 2;
export const PLAYER_WIDTH = 72;

export const SCROLL_SPEED = 220;

// Keep assets relative so the ad works from /cyber-dash/
export const ASSET_PATHS = {
  background: "./assets/cyber-background.webp",
  introReference: "./assets/intro-reference.webp",
  tryAgainReference: "./assets/try-again-reference.webp",
  endcardReference: "./assets/endcard-reference.webp",
  scorePanel: "./assets/score-panel.webp",
  playerRun1: "./assets/player-run-1.webp",
  playerRun2: "./assets/player-run-2.webp",
  playerRun3: "./assets/player-run-3.webp",
  playerRun4: "./assets/player-run-4.webp",
  creditOrb: "./assets/credit-orb.webp",
  accessKey: "./assets/access-key.webp",
  laserGate: "./assets/laser-gate.webp",
  cyberCrate: "./assets/cyber-crate.webp",
  vaultDoor: "./assets/vault-door.webp",
  vaultDoorOpen: "./assets/vault-door-open.webp",
} as const;

export const COLORS = {
  void: 0x030716,
  midnight: 0x07122b,
  panel: 0x0b1738,
  panelLight: 0x142764,
  cyan: 0x22e8ff,
  cyanSoft: 0x80f7ff,
  magenta: 0xff2bdc,
  purple: 0x7c3cff,
  yellow: 0xffd92e,
  yellowDark: 0xd78b00,
  yellowLight: 0xffff9e,
  danger: 0xff387f,
  white: 0xffffff,
};

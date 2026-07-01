import { Assets, Texture } from "pixi.js";
import { ASSET_PATHS } from "./constants";

export type CyberTextures = {
  background: Texture;
  introReference: Texture;
  tryAgainReference: Texture;
  scorePanel: Texture;
  playerRun1: Texture;
  playerRun2: Texture;
  playerRun3: Texture;
  playerRun4: Texture;
  creditOrb: Texture;
  accessKey: Texture;
  laserGate: Texture;
  cyberCrate: Texture;
  vaultDoor: Texture;
  vaultDoorOpen: Texture;
  endcardReference: Texture;
};

export async function loadCyberTextures(): Promise<CyberTextures> {
  // Preload gameplay art so the 15s run never stalls on a late texture
  const [
    background,
    introReference,
    tryAgainReference,
    scorePanel,
    playerRun1,
    playerRun2,
    playerRun3,
    playerRun4,
    creditOrb,
    accessKey,
    laserGate,
    cyberCrate,
    vaultDoor,
    vaultDoorOpen,
    endcardReference,
  ] = await Promise.all([
    Assets.load(ASSET_PATHS.background),
    Assets.load(ASSET_PATHS.introReference),
    Assets.load(ASSET_PATHS.tryAgainReference),
    Assets.load(ASSET_PATHS.scorePanel),
    Assets.load(ASSET_PATHS.playerRun1),
    Assets.load(ASSET_PATHS.playerRun2),
    Assets.load(ASSET_PATHS.playerRun3),
    Assets.load(ASSET_PATHS.playerRun4),
    Assets.load(ASSET_PATHS.creditOrb),
    Assets.load(ASSET_PATHS.accessKey),
    Assets.load(ASSET_PATHS.laserGate),
    Assets.load(ASSET_PATHS.cyberCrate),
    Assets.load(ASSET_PATHS.vaultDoor),
    Assets.load(ASSET_PATHS.vaultDoorOpen),
    Assets.load(ASSET_PATHS.endcardReference),
  ]);

  return {
    background,
    introReference,
    tryAgainReference,
    scorePanel,
    playerRun1,
    playerRun2,
    playerRun3,
    playerRun4,
    creditOrb,
    accessKey,
    laserGate,
    cyberCrate,
    vaultDoor,
    vaultDoorOpen,
    endcardReference,
  };
}

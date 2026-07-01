export function dispatchCyberDashCta(score: number, keyCollected: boolean) {
  // Ad shells can listen for this instead of forcing a direct navigation
  window.dispatchEvent(
    new CustomEvent("cyber-dash:cta", {
      detail: {
        score,
        keyCollected,
      },
    }),
  );
}

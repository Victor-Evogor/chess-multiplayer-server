export const tick = (ms: number) =>
  new Promise((resolve) => setTimeout(() => resolve(undefined), ms));

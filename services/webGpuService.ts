/**
 * Checks if WebGPU is available in the current browser context.
 * Returns a promise resolving to a boolean.
 */
export const checkWebGPUSupport = async (): Promise<boolean> => {
  // Cast navigator to any as the gpu property is experimental and may not be in the default types
  const nav = navigator as any;

  if (!nav.gpu) {
    return false;
  }
  
  try {
    const adapter = await nav.gpu.requestAdapter();
    return !!adapter;
  } catch (e) {
    console.error("WebGPU Init Error:", e);
    return false;
  }
};
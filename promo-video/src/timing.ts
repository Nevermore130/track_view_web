import { useCurrentFrame, useVideoConfig } from "remotion";

export const BASE_FPS = 30;

export const toOutputFrames = (baseFrames: number, fps: number) =>
  Math.round((baseFrames * fps) / BASE_FPS);

export const useBaseFrame = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame * BASE_FPS) / fps;
};

'use client';

import type { ComponentType } from 'react';
import { Player } from '@remotion/player';
import {
  MARKETING_VIDEO_DURATION,
  MARKETING_VIDEO_FPS,
  MARKETING_VIDEO_HEIGHT,
  MARKETING_VIDEO_WIDTH,
  MarketingVideoComposition,
  type MarketingVideoProps,
} from './MarketingVideo';

const RemotionComponent = MarketingVideoComposition as unknown as ComponentType<Record<string, unknown>>;

export default function MarketingVideoPlayer(props: MarketingVideoProps) {
  return (
    <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-primary-100 bg-slate-950 p-2 shadow-2xl">
      <Player
        component={RemotionComponent}
        inputProps={props as unknown as Record<string, unknown>}
        durationInFrames={MARKETING_VIDEO_DURATION}
        compositionWidth={MARKETING_VIDEO_WIDTH}
        compositionHeight={MARKETING_VIDEO_HEIGHT}
        fps={MARKETING_VIDEO_FPS}
        controls
        loop
        style={{
          width: '100%',
          aspectRatio: `${MARKETING_VIDEO_WIDTH} / ${MARKETING_VIDEO_HEIGHT}`,
          borderRadius: '1.5rem',
          overflow: 'hidden',
        }}
      />
    </div>
  );
}

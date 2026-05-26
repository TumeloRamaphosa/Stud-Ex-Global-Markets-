'use client';

import { Player } from '@remotion/player';
import {
  MARKETING_VIDEO_DURATION,
  MARKETING_VIDEO_FPS,
  MARKETING_VIDEO_HEIGHT,
  MARKETING_VIDEO_WIDTH,
  MarketingVideoComposition,
  type MarketingVideoProps,
} from './MarketingVideo';

export default function MarketingVideoPlayer(props: MarketingVideoProps) {
  return (
    <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-primary-100 bg-slate-950 p-2 shadow-2xl">
      <Player
        component={MarketingVideoComposition}
        inputProps={props}
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

import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const MARKETING_VIDEO_FPS = 30;
export const MARKETING_VIDEO_WIDTH = 1080;
export const MARKETING_VIDEO_HEIGHT = 1920;
export const MARKETING_SLIDE_DURATION = 90;
export const MARKETING_VIDEO_SLIDE_COUNT = 6;
export const MARKETING_VIDEO_DURATION =
  MARKETING_SLIDE_DURATION * MARKETING_VIDEO_SLIDE_COUNT;

export interface MarketingVideoSlide {
  imageUrl: string;
  overlayText: string;
  order: number;
}

export interface MarketingVideoProps {
  slides: MarketingVideoSlide[];
  hookText?: string;
  ctaText?: string;
  brandName?: string;
}

const fallbackGradients = [
  ['#0ea5e9', '#fbbf24'],
  ['#38bdf8', '#fef3c7'],
  ['#0284c7', '#bae6fd'],
  ['#f59e0b', '#fff7ed'],
  ['#075985', '#e0f2fe'],
  ['#0f172a', '#fbbf24'],
];

function MarketingSlide({
  slide,
  index,
  brandName,
}: {
  slide: MarketingVideoSlide;
  index: number;
  brandName: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 18,
      stiffness: 90,
    },
  });
  const imageScale = interpolate(frame, [0, MARKETING_SLIDE_DURATION], [1.08, 1.0], {
    extrapolateRight: 'clamp',
  });
  const textOpacity = interpolate(frame, [0, 12, MARKETING_SLIDE_DURATION - 12], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const gradient = fallbackGradients[index % fallbackGradients.length];
  const overlay = slide.overlayText.trim() || `Slide ${index + 1}`;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
        color: 'white',
        overflow: 'hidden',
      }}
    >
      {slide.imageUrl ? (
        <Img
          src={slide.imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${imageScale})`,
          }}
        />
      ) : (
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.55), transparent 28%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.35), transparent 34%)',
          }}
        />
      )}

      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(15,23,42,0.18) 0%, rgba(15,23,42,0.2) 42%, rgba(15,23,42,0.78) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          top: 84,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: 34,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          opacity: 0.92,
        }}
      >
        <span>{brandName}</span>
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          bottom: 150,
          padding: '42px 46px',
          borderRadius: 42,
          background: 'rgba(255,255,255,0.92)',
          boxShadow: '0 34px 90px rgba(15,23,42,0.32)',
          transform: `translateY(${interpolate(entrance, [0, 1], [80, 0])}px)`,
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            color: '#0f172a',
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: 900,
            fontSize: 76,
            lineHeight: 1.02,
            letterSpacing: -2.8,
            whiteSpace: 'pre-line',
            textAlign: 'center',
          }}
        >
          {overlay}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          bottom: 74,
          height: 10,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.38)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${((index + 1) / MARKETING_VIDEO_SLIDE_COUNT) * 100}%`,
            height: '100%',
            background: '#fbbf24',
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

export function MarketingVideoComposition({
  slides,
  hookText,
  ctaText,
  brandName = 'Studex',
}: MarketingVideoProps) {
  const normalizedSlides = Array.from(
    { length: MARKETING_VIDEO_SLIDE_COUNT },
    (_, index) => {
      const slide = slides[index];
      return {
        imageUrl: slide?.imageUrl || '',
        overlayText:
          slide?.overlayText ||
          (index === 0 ? hookText || '' : index === 5 ? ctaText || '' : ''),
        order: index,
      };
    }
  );

  return (
    <AbsoluteFill style={{ background: '#f8fafc' }}>
      {normalizedSlides.map((slide, index) => (
        <Sequence
          key={slide.order}
          from={index * MARKETING_SLIDE_DURATION}
          durationInFrames={MARKETING_SLIDE_DURATION}
        >
          <MarketingSlide slide={slide} index={index} brandName={brandName} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

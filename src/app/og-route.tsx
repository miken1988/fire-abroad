import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'FIRE Abroad - Compare Early Retirement Across Countries';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 30,
          }}
        >
          <span style={{ fontSize: 80 }}>🔥</span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: 'white',
              marginLeft: 20,
            }}
          >
            FIRE Abroad
          </span>
        </div>
        
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Compare Early Retirement Across Countries
        </div>
        
        <div
          style={{
            display: 'flex',
            gap: 40,
            marginTop: 50,
          }}
        >
          {['🇺🇸', '🇵🇹', '🇪🇸', '🇲🇽', '🇹🇭'].map((flag, i) => (
            <span key={i} style={{ fontSize: 48 }}>{flag}</span>
          ))}
        </div>
        
        <div
          style={{
            display: 'flex',
            gap: 30,
            marginTop: 40,
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 24,
          }}
        >
          <span>💰 FIRE Calculator</span>
          <span>•</span>
          <span>📊 Tax Comparison</span>
          <span>•</span>
          <span>🛂 Visa Info</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

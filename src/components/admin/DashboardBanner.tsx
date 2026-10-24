import React from 'react'

export const DashboardBanner: React.FC = () => {
  return (
    <div
      style={{
        borderRadius: '24px',
        backgroundColor: '#2e0249',
        padding: '36px 40px',
        color: '#ffffff',
        marginBottom: '32px',
        boxShadow: '0 12px 30px rgba(46, 2, 73, 0.12)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Josefin Sans', -apple-system, sans-serif",
      }}
    >
      {/* Background radial accent */}
      <div
        style={{
          position: 'absolute',
          right: '-40px',
          top: '-40px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 123, 1, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <span
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight: 700,
          color: '#ffbd5b',
          display: 'block',
          marginBottom: '6px',
        }}
      >
        STUDIO CONTENT MANAGEMENT • BLOG & MEDIA
      </span>

      <h1
        style={{
          fontSize: '32px',
          fontWeight: 800,
          color: '#ffffff',
          margin: '0 0 10px 0',
          letterSpacing: '-0.02em',
          lineHeight: '1.2',
        }}
      >
        Studio Blog & Content
      </h1>

      <p
        style={{
          fontSize: '14px',
          color: '#e2d3be',
          margin: 0,
          maxWidth: '720px',
          lineHeight: '1.6',
        }}
      >
        Write bespoke tattoo stories, organize categories, manage high-resolution artwork uploads on Cloudflare R2, and publish live to your readers.
      </p>
    </div>
  )
}


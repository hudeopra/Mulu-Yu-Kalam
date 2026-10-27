import React from 'react'

export const DashboardBanner: React.FC = () => {
  return (
    <div className="studio-dashboard-banner">
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

      <span className="studio-dashboard-banner__eyebrow">
        STUDIO CONTENT MANAGEMENT • BLOG & MEDIA
      </span>

      <h1 className="studio-dashboard-banner__title">
        Studio Blog & Content
      </h1>

      <p className="studio-dashboard-banner__description">
        Write bespoke tattoo stories, organize categories, manage high-resolution artwork uploads on Cloudflare R2, and publish live to your readers.
      </p>
    </div>
  )
}

export default DashboardBanner

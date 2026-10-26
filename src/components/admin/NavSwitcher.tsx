import React from 'react'
import Link from 'next/link'

export const NavSwitcher: React.FC = () => {
  return (
    <div
      style={{
        padding: '12px 14px',
        margin: '0 8px 16px 8px',
        background: 'linear-gradient(135deg, rgba(255, 123, 1, 0.08) 0%, rgba(255, 189, 91, 0.12) 100%)',
        border: '1px solid rgba(255, 123, 1, 0.25)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#b45309',
          }}
        >
          Studio Portal
        </span>
        <span
          style={{
            fontSize: '9px',
            background: '#ff7b01',
            color: '#ffffff',
            padding: '1px 6px',
            borderRadius: '10px',
            fontWeight: 700,
          }}
        >
          LIVE
        </span>
      </div>

      <Link
        href="/admin"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          fontSize: '12px',
          fontWeight: 600,
          color: '#2e0249',
          background: '#ffffff',
          padding: '8px 10px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ fontSize: '14px' }}>📅</span>
        <span>Studio Appointments</span>
      </Link>

      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          fontSize: '11px',
          fontWeight: 500,
          color: '#666666',
          padding: '4px 6px',
        }}
      >
        <span>🌐</span>
        <span>View Public Website</span>
      </Link>
    </div>
  )
}


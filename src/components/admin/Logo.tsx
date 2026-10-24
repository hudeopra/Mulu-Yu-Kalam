import React from 'react'
import Image from 'next/image'

export const Logo: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '6px 0' }}>
      <Image
        src="/assets/img/Mulu-Yu-Kalam.svg"
        alt="Mulu Yu Kalam"
        width={160}
        height={42}
        style={{
          width: '150px',
          height: 'auto',
          display: 'block',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.06))',
        }}
        priority
      />
    </div>
  )
}


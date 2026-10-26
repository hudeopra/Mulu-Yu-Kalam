import React from 'react'
import Image from 'next/image'

export const Icon: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Image
        src="/assets/img/Mulu-Yu-Kalam.svg"
        alt="Mulu Yu Kalam"
        width={36}
        height={36}
        style={{
          width: '32px',
          height: 'auto',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}


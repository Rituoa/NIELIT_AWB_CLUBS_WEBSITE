"use client";

import dynamic from 'next/dynamic';

const WarpTextDynamic = dynamic(() => import('./WarpText'), { 
  ssr: false,
  loading: () => <div className="h-[320px] flex items-center justify-center text-zinc-600">Loading WebGL...</div>
});

export default WarpTextDynamic;
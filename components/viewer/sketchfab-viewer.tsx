'use client';

import { useEffect, useRef } from 'react';

interface SketchfabViewerProps {
  modelId: string;
  title?: string;
  height?: string;
  width?: string;
}

export default function SketchfabViewer({ modelId, title = 'Sketchfab Model', height = '400px', width = '100%' }: SketchfabViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Clean the model ID to ensure it's just the ID without any URL parts
  const cleanModelId = modelId.includes('/') ? 
    modelId.split('/').filter(part => part.length > 20)[0] : modelId;
  
  useEffect(() => {
    // Handle iframe resize or any initialization if needed
    const handleResize = () => {
      // Any resize handling code if needed
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const embedUrl = `https://sketchfab.com/models/${cleanModelId}/embed`;

  return (
    <div className="sketchfab-embed-wrapper" style={{ height, width }}>
      <iframe
        ref={iframeRef}
        title={title}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        style={{
          height: '100%',
          width: '100%',
          borderRadius: '0.5rem',
        }}
        src={embedUrl}
      />
    </div>
  );
}
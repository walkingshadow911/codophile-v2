import React, { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LivePreviewProps {
  html: string;
  css: string;
  js?: string;
  previewImage: string;
}

export function LivePreview({ html, css, js, previewImage }: LivePreviewProps) {
  const containerRef = useRef(null);

  const isInView = useInView(containerRef, {
    margin: "200px",
  });

  const [isHovered, setIsHovered] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const destroyTimer = useRef<NodeJS.Timeout | null>(null);

  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const handleVisibility = () => {
      setTabVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Manage iframe lifecycle
  useEffect(() => {
    if (!tabVisible) {
      setShouldRender(false);
      return;
    }

    if (isHovered && isInView) {
      setShouldRender(true);
    } else {
      destroyTimer.current = setTimeout(() => {
        setShouldRender(false);
      }, 800);
    }

    return () => {
      if (destroyTimer.current) clearTimeout(destroyTimer.current);
    };
  }, [isHovered, isInView, tabVisible]);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => {
      setIsHovered(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsHovered(false);
  };

  const srcDoc = `
  <html>
    <head>
      <style>
        html, body {
          margin:0;
          padding:0;
          width:100%;
          height:100%;
          display:flex;
          justify-content:center;
          align-items:center;
          background:transparent;
          overflow:hidden;
        }
        body > * {
          flex-shrink:0;
        }
        ${css}
      </style>
    </head>
    <body>
      ${html}
      <script>${js || ""}</script>
    </body>
  </html>
  `;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-[radial-gradient(circle_at_top_left,#1f1545,#0d0b1a_70%)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {shouldRender ? (
        <iframe
          srcDoc={srcDoc}
          className="
            w-[200%] h-[200%]
            absolute
            top-1/2 left-1/2
            -translate-x-1/2 -translate-y-1/2
            scale-[0.5]
            border-none
            bg-transparent
            transition-opacity duration-300
          "
          sandbox="allow-scripts"
          title="preview"
        />
      ) : (
        <>
          {previewImage ? (
            <img
              src={previewImage}
              alt="Effect Preview"
              className="w-full h-full object-cover pointer-events-none"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070707] text-gray-600">
               <span className="text-xs uppercase tracking-widest opacity-50 block mb-1">No Thumbnail</span>
               <span className="text-[10px] text-gray-700 uppercase tracking-widest">Hover to preview</span>
            </div>
          )}

          {!isInView && (
            <div className="absolute flex flex-col items-center justify-center text-gray-500 gap-2 animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs uppercase tracking-widest opacity-70">
                Preview
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
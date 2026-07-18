import React from "react";

interface NanditaLogoProps {
  className?: string;
  variant?: "horizontal" | "vertical" | "icon" | "certificate";
  height?: number | string;
  width?: number | string;
  lightText?: boolean;
  logoUrl?: string;
}

export default function NanditaLogo({
  className = "",
  variant = "horizontal",
  height,
  width,
  lightText = false,
  logoUrl
}: NanditaLogoProps) {
  // Brand Colors
  const navy = "#002d5c";
  const textColor = lightText ? "#ffffff" : "#002d5c";
  const badgeBg = lightText ? "rgba(255, 255, 255, 0.15)" : "#002d5c";
  const badgeText = lightText ? "#ffffff" : "#ffffff";
  const borderBadge = lightText ? "rgba(255, 255, 255, 0.2)" : "transparent";
  const gold = "#b89047";
  const white = "#ffffff";

  // Render SVG Shield Icon
  const renderShield = (size: number = 100) => (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className="inline-block drop-shadow-sm select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Golden outer border shield */}
      <path
        d="M 200,20 Q 310,65 350,110 Q 360,240 200,380 Q 40,240 50,110 Q 90,65 200,20 Z"
        fill={gold}
      />
      {/* Dark Navy inner shield */}
      <path
        d="M 200,26 Q 303,68 340,110 Q 349,235 200,368 Q 51,235 60,110 Q 97,68 200,26 Z"
        fill={navy}
      />
      {/* Inner thin white border line */}
      <path
        d="M 200,32 Q 296,71 330,110 Q 338,230 200,356 Q 62,230 70,110 Q 104,71 200,32 Z"
        fill="none"
        stroke={white}
        strokeWidth="2"
        opacity="0.8"
      />

      {/* 3 Gold Stars Sparkles at the top */}
      <g transform="translate(0, 0)">
        {/* Center Star */}
        <path
          d="M 200,55 Q 200,75 215,75 Q 200,75 200,95 Q 200,75 185,75 Q 200,75 200,55 Z"
          fill={gold}
        />
        {/* Left Star */}
        <path
          d="M 150,75 Q 150,90 160,90 Q 150,90 150,105 Q 150,90 140,90 Q 150,90 150,75 Z"
          fill={gold}
        />
        {/* Right Star */}
        <path
          d="M 250,75 Q 250,90 260,90 Q 250,90 250,105 Q 250,90 240,90 Q 250,90 250,75 Z"
          fill={gold}
        />
      </g>

      {/* NFH Gold Circle Logo on top left */}
      <g transform="translate(145, 130)">
        <circle cx="20" cy="20" r="30" fill="none" stroke={gold} strokeWidth="3" />
        <circle cx="20" cy="20" r="26" fill="none" stroke={navy} strokeWidth="2" />
        <text
          x="20"
          y="27"
          fontFamily="serif"
          fontWeight="bold"
          fontSize="20"
          fill={white}
          textAnchor="middle"
          letterSpacing="1"
        >
          NFH
        </text>
        {/* NFH Underline design arc */}
        <path
          d="M -5,25 Q 20,40 45,25"
          fill="none"
          stroke={gold}
          strokeWidth="2"
        />
      </g>

      {/* Cruise Ship & Waves Graphic in the center bottom */}
      <g>
        {/* The Cruise Ship / Vessel */}
        {/* Hull */}
        <path
          d="M 120,220 L 260,260 Q 320,260 330,230 L 333,215 Q 290,175 190,195 L 140,205 Z"
          fill={white}
        />
        {/* Windows and Cabins details on ship */}
        <path
          d="M 195,195 L 255,212 L 255,195 Z"
          fill={navy}
        />
        {/* Chimney funnel and decks */}
        <rect x="230" y="170" width="20" height="15" fill="#d32f2f" rx="2" transform="rotate(15 230 170)" />
        <rect x="233" y="165" width="14" height="6" fill="#111111" transform="rotate(15 230 170)" />
        <path d="M 200,190 L 250,190 L 245,180 L 210,180 Z" fill={white} />
        <circle cx="215" cy="185" r="2.5" fill={navy} />
        <circle cx="225" cy="185" r="2.5" fill={navy} />
        <circle cx="235" cy="185" r="2.5" fill={navy} />

        {/* Ship Windows Hull */}
        <circle cx="170" cy="220" r="3" fill={navy} />
        <circle cx="185" cy="223" r="3" fill={navy} />
        <circle cx="200" cy="227" r="3" fill={navy} />
        <circle cx="215" cy="231" r="3" fill={navy} />
        <circle cx="230" cy="235" r="3" fill={navy} />
        <circle cx="245" cy="239" r="3" fill={navy} />
        <circle cx="260" cy="243" r="3" fill={navy} />
        <circle cx="275" cy="246" r="3" fill={navy} />
        <circle cx="290" cy="249" r="3" fill={navy} />

        {/* Waves at the bottom of the shield */}
        {/* Gold Wave 1 */}
        <path
          d="M 98,280 Q 150,250 200,285 Q 250,320 302,280 L 310,295 Q 250,335 200,300 Q 150,265 92,295 Z"
          fill={gold}
        />
        {/* White Wave 2 */}
        <path
          d="M 80,305 Q 140,275 200,310 Q 260,345 320,305 Q 290,340 200,335 Q 110,330 80,305 Z"
          fill={white}
          opacity="0.9"
        />
        {/* Gold Wave 3 */}
        <path
          d="M 115,325 Q 160,300 200,325 Q 240,350 285,325 Q 240,360 200,350 Q 160,340 115,325 Z"
          fill={gold}
        />
      </g>

      {/* Hotel Building Graphic on Right */}
      <g transform="translate(265, 150)">
        <path
          d="M 0,40 L 40,50 L 40,0 L 0,-10 Z"
          fill={navy}
          stroke={gold}
          strokeWidth="1.5"
        />
        <rect x="5" y="0" width="6" height="8" fill={gold} />
        <rect x="15" y="3" width="6" height="8" fill={gold} />
        <rect x="25" y="5" width="6" height="8" fill={gold} />
        <rect x="5" y="15" width="6" height="8" fill={gold} />
        <rect x="15" y="18" width="6" height="8" fill={gold} />
        <rect x="25" y="21" width="6" height="8" fill={gold} />
        {/* HOTEL sign */}
        <rect x="-10" y="25" width="35" height="10" fill={navy} stroke={gold} strokeWidth="1" />
        <text x="7" y="32" fill={white} fontSize="6" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">HOTEL</text>
      </g>
    </svg>
  );

  // Render uploaded image or the default shield
  const renderShieldOrLogo = (size: number = 100) => {
    if (logoUrl && logoUrl.trim() !== "") {
      return (
        <div 
          className="inline-block relative overflow-hidden select-none bg-transparent rounded-lg flex items-center justify-center border border-gray-200/20 shadow-sm"
          style={{ width: size, height: size }}
        >
          <img
            src={logoUrl}
            alt="Logo Lembaga"
            className="max-w-full max-h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }
    return renderShield(size);
  };

  if (variant === "icon") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderShieldOrLogo(height ? Number(height) : 64)}
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {renderShieldOrLogo(height ? Number(height) : 110)}
        <div className="mt-3 text-center">
          <h1
            className="text-xl md:text-2xl font-bold tracking-widest font-serif leading-none"
            style={{ color: textColor }}
          >
            NANDITA
          </h1>
          <p
            className="text-xs md:text-sm font-bold tracking-widest uppercase mt-0.5"
            style={{ color: gold }}
          >
            FLOATING HOTEL
          </p>
          <div className="flex items-center justify-center my-1.5 space-x-2">
            <div className="w-10 h-[1px]" style={{ backgroundColor: gold }}></div>
            <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: gold }}></div>
            <div className="w-10 h-[1px]" style={{ backgroundColor: gold }}></div>
          </div>
          <div
            className="text-[9px] md:text-[10px] px-3 py-1 font-semibold uppercase tracking-wider rounded border"
            style={{ backgroundColor: badgeBg, color: badgeText, borderColor: borderBadge }}
          >
            Perhotelan &amp; Kapal Pesiar
          </div>
        </div>
      </div>
    );
  }

  if (variant === "certificate") {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        {renderShieldOrLogo(height ? Number(height) : 80)}
        <div className="text-left">
          <h2
            className="text-xl md:text-2xl font-serif font-bold tracking-wider leading-none"
            style={{ color: navy }}
          >
            NANDITA
          </h2>
          <p
            className="text-xs md:text-sm font-serif font-bold uppercase tracking-widest mt-1"
            style={{ color: gold }}
          >
            FLOATING HOTEL
          </p>
          <div className="w-full h-[1px] my-1" style={{ backgroundColor: gold }} />
          <p className="text-[9px] text-gray-500 font-sans italic">
            Pendidikan &amp; Pelatihan Perhotelan &amp; Kapal Pesiar
          </p>
        </div>
      </div>
    );
  }

  // Default "horizontal" layout (matching the uploaded image exactly)
  return (
    <div className={`flex items-center space-x-4 md:space-x-6 text-left ${className}`}>
      {renderShieldOrLogo(height ? Number(height) : 90)}
      <div className="flex flex-col justify-center">
        {/* NANDITA */}
        <h1
          className="text-3xl md:text-4xl font-serif font-bold tracking-widest leading-none"
          style={{ color: textColor }}
        >
          NANDITA
        </h1>
        
        {/* FLOATING HOTEL */}
        <p
          className="text-sm md:text-base font-serif font-semibold tracking-[0.25em] uppercase mt-1"
          style={{ color: gold }}
        >
          FLOATING HOTEL
        </p>

        {/* Separator gold line with diamond sparkle */}
        <div className="flex items-center my-2">
          <div className="flex-grow h-[1px]" style={{ backgroundColor: gold, width: "100px" }}></div>
          <div className="mx-2 w-2 h-2 rotate-45" style={{ backgroundColor: gold }}></div>
          <div className="flex-grow h-[1px]" style={{ backgroundColor: gold, width: "100px" }}></div>
        </div>

        {/* PERHOTELAN & KAPAL PESIAR rectangle banner */}
        <div
          className="px-4 py-1.5 rounded-md font-sans text-[10px] md:text-xs font-bold uppercase tracking-widest text-center border"
          style={{ backgroundColor: badgeBg, color: badgeText, borderColor: borderBadge }}
        >
          Perhotelan &amp; Kapal Pesiar
        </div>
      </div>
    </div>
  );
}

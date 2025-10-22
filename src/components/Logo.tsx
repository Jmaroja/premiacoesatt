import React from "react";

type LogoProps = {
  className?: string;
  ariaLabel?: string;
};

// Permite configurar o caminho do logo via variável de ambiente
// Ex.: crie um .env.local com VITE_LOGO_PATH=/logo-minha-empresa.png
const LOGO_PATH = (import.meta.env.VITE_LOGO_PATH as string | undefined) || "/Logo Nordil.png";

export function Logo({ className = "h-10 w-auto object-contain block", ariaLabel = "Nordil" }: LogoProps) {
  return <img src={LOGO_PATH} alt={ariaLabel} className={className} decoding="async" />;
}

export default Logo;

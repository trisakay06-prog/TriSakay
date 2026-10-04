import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  ariaLabel = 'Go back'
}) => (
  <button
    type="button"
    onClick={onClick}
    className="back-button"
    aria-label={ariaLabel}
    title={ariaLabel}
  >
    <ChevronLeft size={26} strokeWidth={2.75} aria-hidden="true" />
  </button>
);

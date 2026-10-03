import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface InformationBackButtonProps {
  onClick: () => void;
  label?: string;
}

export const InformationBackButton: React.FC<InformationBackButtonProps> = ({
  onClick,
  label = 'Back to Dashboard'
}) => (
  <button
    type="button"
    onClick={onClick}
    className="ios-back-btn information-page-back"
    aria-label={label}
  >
    <ArrowLeft size={20} aria-hidden="true" />
    <span>{label}</span>
  </button>
);

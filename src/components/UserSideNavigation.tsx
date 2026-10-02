import React from 'react';
import { Clock3, FileText, Fuel, HeartHandshake } from 'lucide-react';

interface UserSideNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const items = [
  { label: 'Reduce Waiting Time', icon: Clock3 },
  { label: 'Senior & PWD Friendly', icon: HeartHandshake },
  { label: 'Fuel & Route Efficiency', icon: Fuel }
];

export const UserSideNavigation: React.FC<UserSideNavigationProps> = ({ activeTab, setActiveTab }) => (
  <aside className="user-side-navigation" aria-label="TriSakay services">
    <p className="side-navigation-title">Why TriSakay</p>
    {items.map(({ label, icon: Icon }) => (
      <button key={label} type="button" onClick={() => setActiveTab('service-benefits')} className={activeTab === 'service-benefits' ? 'active' : ''}>
        <Icon size={18} /> <span>{label}</span>
      </button>
    ))}
    <div className="side-navigation-divider" />
    <button type="button" onClick={() => setActiveTab('fare-matrix')} className={activeTab === 'fare-matrix' ? 'active' : ''}>
      <FileText size={18} /> <span>Fare Matrix Estimator</span>
    </button>
  </aside>
);

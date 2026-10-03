import React from 'react';
import { Clock3, Fuel, HeartHandshake, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { InformationBackButton } from '../components/InformationBackButton';

interface AboutViewProps {
  onBack: () => void;
  backLabel?: string;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack, backLabel }) => (
  <div className="about-page-screen">
    <InformationBackButton onClick={onBack} label={backLabel} />
    <header className="about-page-header">
      <div>
        <span>ABOUT US</span>
        <h1>About TriSakay</h1>
      </div>
    </header>

    <section className="about-intro-card">
      <ShieldCheck size={34} />
      <div>
        <h2>Local transportation, made simpler.</h2>
        <p>TriSakay connects passengers with registered local tricycle drivers throughout the Municipality of Gonzaga.</p>
      </div>
    </section>

    <section className="about-purpose-grid">
      <article><span>OUR MISSION</span><h3>Accessible local mobility</h3><p>Provide a safe, reliable, and convenient way for Gonzaga communities to request local transportation.</p></article>
      <article><span>OUR VISION</span><h3>A connected Gonzaga</h3><p>Build a smarter community transport network that supports passengers, drivers, seniors, and PWDs.</p></article>
    </section>

    <section className="about-details-card">
      <h2>Why TriSakay?</h2>
      <div className="about-benefit-grid">
        <div><Clock3 size={23} /><strong>Reduced Waiting</strong><p>Reach nearby registered drivers faster.</p></div>
        <div><HeartHandshake size={23} /><strong>Inclusive Travel</strong><p>Senior- and PWD-friendly booking support.</p></div>
        <div><Fuel size={23} /><strong>Efficient Routes</strong><p>Clear pickup and destination information.</p></div>
      </div>
    </section>

    <footer className="about-contact-card">
      <span><MapPin size={16} /> Municipality of Gonzaga, Cagayan</span>
      <span><Phone size={16} /> 09628039440</span>
      <span><Mail size={16} /> trisakay@gmail.com</span>
    </footer>
  </div>
);

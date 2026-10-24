import Footer from './Footer';
import Grainient from './Grainient';
import StaggeredMenu from './StaggeredMenu';

import useDocumentTitle from '../lib/useDocumentTitle';
import { NAV_ITEMS, PAGE_THEME, SOCIAL_ITEMS } from '../data/site';

import logo from '../assets/logo.png';
import logoAlt from '../assets/logo_alt.png';

import './Lanyard.css';

export default function PageShell({ title, description, canonical, children }) {
  useDocumentTitle(title, description, { canonical });

  return (
    <>
      <main id="main" tabIndex={-1} className="compact-layout relative min-h-screen px-6 py-14 text-white sm:py-24">
        <div className="pixelblast-bg">
          <Grainient
            color1={PAGE_THEME.backgroundColor}
            color2={PAGE_THEME.gradientColors[1]}
            color3={PAGE_THEME.gradientColors[2]}
            timeSpeed={0.2}
            warpStrength={1.2}
            warpFrequency={4.5}
            warpSpeed={1.8}
            warpAmplitude={60}
            blendAngle={15}
            blendSoftness={0.08}
            rotationAmount={400}
            noiseScale={2.5}
            grainAmount={0.08}
            grainAnimated={true}
            contrast={1.4}
            saturation={1.1}
            zoom={0.9}
          />
        </div>

        <div className="lanyard-nav lanyard-nav--fixed">
          <StaggeredMenu
            position="right"
            items={NAV_ITEMS}
            socialItems={SOCIAL_ITEMS}
            displaySocials={true}
            logoUrl={logo}
            logoOpenUrl={logoAlt}
            displayItemNumbering={true}
            colors={PAGE_THEME.menuColors}
            menuButtonColor={PAGE_THEME.menuButtonColor}
            openMenuButtonColor={PAGE_THEME.openMenuButtonColor}
            menuTextColor={PAGE_THEME.menuTextColor}
            menuHoverColor={PAGE_THEME.menuHoverColor}
            accentColor={PAGE_THEME.accentColor}
            closeOnClickAway={true}
            isFixed={false}
          />
        </div>

        {children}
      </main>

      <Footer />
    </>
  );
}

import Footer from '../components/Footer';
import Lanyard from '../components/Lanyard';
import LogoLoop from '../components/LogoLoop';
import PositioningStrip from '@/components/PositioningStrip';
import GrowthChart from '@/components/GrowthChart';
import HomeCta from '@/components/HomeCta';
import useDocumentTitle from '../lib/useDocumentTitle';
import { ROUTE_META } from '../data/seo';

import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiJavascript,
  SiSupabase,
  SiPython,
  SiMysql,
  SiPostgresql,
  SiNodedotjs,
  SiFigma,
  SiShopify,
} from 'react-icons/si';

const IconWrapper = ({ children }) => (
  <span style={{ color: 'white', display: 'inline-flex', alignItems: 'center' }}>
    {children}
  </span>
);

const techLogos = [
  { node: <IconWrapper><SiReact /></IconWrapper>, title: 'React', href: 'https://react.dev' },
  { node: <IconWrapper><SiNextdotjs /></IconWrapper>, title: 'Next.js', href: 'https://nextjs.org' },
  { node: <IconWrapper><SiTypescript /></IconWrapper>, title: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { node: <IconWrapper><SiTailwindcss /></IconWrapper>, title: 'Tailwind CSS', href: 'https://tailwindcss.com' },
  { node: <IconWrapper><SiMysql /></IconWrapper>, title: 'MySQL', href: 'https://www.mysql.com' },
  { node: <IconWrapper><SiSupabase /></IconWrapper>, title: 'Supabase', href: 'https://supabase.com' },
  { node: <IconWrapper><SiPython /></IconWrapper>, title: 'Python', href: 'https://www.python.org' },
  { node: <IconWrapper><SiJavascript /></IconWrapper>, title: 'JavaScript', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { node: <IconWrapper><SiPostgresql /></IconWrapper>, title: 'PostgreSQL', href: 'https://www.postgresql.org' },
  { node: <IconWrapper><SiNodedotjs /></IconWrapper>, title: 'Node.js', href: 'https://nodejs.org/en' },
  { node: <IconWrapper><SiFigma /></IconWrapper>, title: 'Figma', href: 'https://www.figma.com/' },
  { node: <IconWrapper><SiShopify /></IconWrapper>, title: 'Shopify', href: 'https://www.shopify.com/' }
];

export default function Home() {
  useDocumentTitle(ROUTE_META['/'].title, ROUTE_META['/'].description);

  return (
    <>
      <main id="main" tabIndex={-1}>
        <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />

        <LogoLoop
          logos={techLogos}
          speed={70}
          direction="left"
           logoHeight={60}
           gap={60}
          hoverSpeed={0}
          scaleOnHover
          ariaLabel="Technology partners"
           marginY="clamp(4rem, 12vw, 10rem)"
           className="home-tech-loop"
        />

        <div className="relative z-10 mx-auto h-px w-full max-w-7xl bg-white/10" />

        <PositioningStrip />
        <GrowthChart />
        <HomeCta />
      </main>

      <Footer />
    </>
  );
}

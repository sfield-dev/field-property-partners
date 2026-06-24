'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SUPABASE_URL = 'https://mtarfkjlskgwaretlysf.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const N8N_WEBHOOK = 'https://n8n.s-field.dev/webhook/investor-lead';
const WA_DIRECT = 'https://wa.me/447593259196?text=Hi%2C%20I%27m%20interested%20in%20Field%20Property%20Partners';

const MANCHESTER_IMG = '/manchester.jpg';
const LIVERPOOL_IMG = '/liverpool.jpg';

const investorTypes = [
  { id: 'first', label: 'First Investment', sub: 'Looking to buy my first property' },
  { id: 'experienced', label: 'Experienced (1–5)', sub: 'Already own investment properties' },
  { id: 'portfolio', label: 'Portfolio (5+)', sub: 'Scaling an existing portfolio' },
  { id: 'cash', label: 'Cash Buyer', sub: 'Ready to move fast' },
];

const budgets = ['Under £100k', '£100k–£150k', '£150k–£250k', '£250k–£500k', '£500k+'];

const manchesterStats = [
  { val: '7–8%', label: 'Avg Gross Yield', sub: 'vs 4.5% London' },
  { val: '+29.4%', label: 'Projected Growth', sub: '2025–2029 Savills' },
  { val: '£247k', label: 'Avg Price', sub: 'vs £511k national' },
  { val: '+12.5%', label: 'Rental Growth YoY', sub: 'vs 8.6% UK avg' },
];

const liverpoolStats = [
  { val: '6–8%', label: 'Avg Gross Yield', sub: 'Anfield zones 7.5%+' },
  { val: '+8.5%', label: 'Price Growth YoY', sub: 'ONS Oct 2025' },
  { val: '£174k', label: 'Avg Entry Price', sub: '38% below UK avg' },
  { val: '+18%', label: 'Rental Demand Rise', sub: 'vs pre-pandemic' },
];

const yieldData = [
  { city: 'Liverpool', val: 7.5, label: '7.5%' },
  { city: 'Manchester', val: 7.0, label: '7%' },
  { city: 'Leeds', val: 6.2, label: '6.2%' },
  { city: 'Sheffield', val: 6.0, label: '6%' },
  { city: 'Birmingham', val: 5.5, label: '5.5%' },
  { city: 'Bristol', val: 5.0, label: '5%' },
  { city: 'London', val: 4.5, label: '4.5%' },
];

const growthData = [
  { city: 'Liverpool', val: 85, label: '8.5%' },
  { city: 'Manchester', val: 70, label: '7%' },
  { city: 'Sheffield', val: 58, label: '5.8%' },
  { city: 'Leeds', val: 52, label: '5.2%' },
  { city: 'Bristol', val: 38, label: '3.8%' },
  { city: 'UK avg', val: 22, label: '2.2%' },
  { city: 'London', val: 18, label: '1.8%' },
];

const priceTrajectory = [
  { year: '2020', manchester: 185, liverpool: 140 },
  { year: '2021', manchester: 205, liverpool: 152 },
  { year: '2022', manchester: 225, liverpool: 158 },
  { year: '2023', manchester: 235, liverpool: 162 },
  { year: '2024', manchester: 242, liverpool: 169 },
  { year: '2025', manchester: 247, liverpool: 174 },
  { year: '2026e', manchester: 262, liverpool: 185 },
  { year: '2027e', manchester: 278, liverpool: 197 },
  { year: '2028e', manchester: 295, liverpool: 210 },
  { year: '2029e', manchester: 314, liverpool: 224 },
];

const tickerLines = [
  'The North West has outperformed London on price growth for 6 consecutive years',
  'HMO yields average 2–3x a standard buy-to-let',
  'BRRR strategy allows investors to recycle 100% of deployed capital',
  'Regeneration spend precedes meaningful price growth by 18–36 months',
  'Every 1% yield advantage compounds significantly over a 10-year hold',
  'Professional rental demand in Manchester grew 34% post-pandemic',
  'Below-market acquisition is the single biggest driver of day-one equity',
  'Infrastructure spend does not just improve an area — it reprices the surrounding streets',
  'When a hospital, university and science campus expand in the same postcode, rental demand becomes structural',
  'Liverpool Waters is not just a development — it is a new city district being built from scratch on the waterfront',
  'Mayfield Quarter gives Manchester its first new park in 100 years — that changes how a neighbourhood is valued',
  'Knowledge Quarter Liverpool is Europe\'s fastest-growing life sciences district — the tenants it attracts do not leave',
  'Regeneration does not just improve an area — it reprices every street around it',
];

const regenPoints = [
  {
    city: 'Manchester',
    color: '#1C3A2E',
    items: [
      { val: '£4bn+', label: 'Northern Gateway', body: '15,000 new homes across M8, M9 and M40 — the largest housing-led regeneration scheme in Europe. Infrastructure spend driving above-average price uplift in target postcodes.' },
      { val: '£1.4bn', label: 'Mayfield Quarter', body: 'Manchester city centre\'s first new park in 100 years anchors a mixed-use district of homes, offices and retail — completing through 2027–2030. Green space reprices surrounding residential streets.' },
      { val: '£750m', label: 'NOMA District', body: 'Co-op\'s Northern quarter HQ expansion bringing 2,000+ jobs and significant residential demand pressure to M4 and surrounding postcodes.' },
    ],
  },
  {
    city: 'Liverpool',
    color: '#A0623A',
    items: [
      { val: '£5.5bn', label: 'Liverpool Waters', body: 'The single largest regeneration scheme in the UK — transforming 60 hectares of historic dockland into a new city district with 9,000 homes and 2m sq ft of commercial space.' },
      { val: '£2bn', label: 'Knowledge Quarter', body: 'Europe\'s fastest-growing life sciences district, anchored by the Royal Liverpool Hospital and University of Liverpool. Creating sustained professional rental demand across L1–L7.' },
      { val: '£500m', label: 'Paddington Village', body: 'Science and technology campus attracting global institutions. Directly driving demand in L7 and surrounding postcodes — an early-mover window for investors.' },
    ],
  },
];

function AnimatedBar({ city, val, max, color, delay, label }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setAnimated(true), delay * 1000); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
      <div style={{ fontSize: '0.68rem', color: 'rgba(26,26,24,0.45)', width: '78px', textAlign: 'right', flexShrink: 0 }}>{city}</div>
      <div style={{ flex: 1, height: '5px', background: 'rgba(28,58,46,0.07)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: color, borderRadius: '3px',
          width: animated ? `${(val / max) * 100}%` : '0%',
          transition: 'width 1.3s cubic-bezier(0.22, 1, 0.36, 1)',
          position: 'absolute', left: 0, top: 0,
        }} />
      </div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.9rem', fontWeight: 600, color: '#1C3A2E', width: '42px', flexShrink: 0 }}>{label}</div>
    </div>
  );
}

function LineGraph({ data }) {
  const w = 520, h = 200, padL = 48, padR = 60, padT = 20, padB = 36;
  const allVals = data.flatMap(d => [d.manchester, d.liverpool]);
  const minV = Math.min(...allVals) - 10;
  const maxV = Math.max(...allVals) + 10;
  const xScale = i => padL + (i / (data.length - 1)) * (w - padL - padR);
  const yScale = v => padT + (1 - (v - minV) / (maxV - minV)) * (h - padT - padB);
  const manchPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.manchester)}`).join(' ');
  const livPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.liverpool)}`).join(' ');
  const splitIdx = data.findIndex(d => d.year.includes('e'));

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {splitIdx > 0 && (
          <rect x={xScale(splitIdx)} y={padT} width={xScale(data.length - 1) - xScale(splitIdx)} height={h - padT - padB} fill="rgba(28,58,46,0.03)" />
        )}
        {[0, 0.33, 0.66, 1].map((t, i) => (
          <line key={i} x1={padL} x2={w - padR} y1={padT + t * (h - padT - padB)} y2={padT + t * (h - padT - padB)} stroke="rgba(28,58,46,0.07)" strokeWidth="1" strokeDasharray="3 3" />
        ))}
        {splitIdx > 0 && (
          <line x1={xScale(splitIdx)} x2={xScale(splitIdx)} y1={padT} y2={h - padB} stroke="rgba(28,58,46,0.2)" strokeWidth="1" strokeDasharray="4 3" />
        )}
        {splitIdx > 0 && (
          <text x={xScale(splitIdx) + 4} y={padT + 10} fontSize="7.5" fill="rgba(26,26,24,0.35)" fontFamily="Outfit, sans-serif">Forecast</text>
        )}
        {data.map((d, i) => (
          <text key={i} x={xScale(i)} y={h - 4} textAnchor="middle" fontSize="8.5" fill={d.year.includes('e') ? 'rgba(26,26,24,0.3)' : 'rgba(26,26,24,0.4)'} fontFamily="Outfit, sans-serif">{d.year}</text>
        ))}
        {[minV + 10, minV + (maxV - minV) / 2, maxV - 10].map((v, i) => (
          <text key={i} x={padL - 4} y={yScale(v) + 3} textAnchor="end" fontSize="8" fill="rgba(26,26,24,0.35)" fontFamily="Outfit, sans-serif">£{v}k</text>
        ))}
        <motion.path d={manchPath} fill="none" stroke="#1C3A2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 2, ease: 'easeInOut' }} />
        <motion.path d={livPath} fill="none" stroke="#A0623A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 2, delay: 0.25, ease: 'easeInOut' }} />
        {data.map((d, i) => (
          <motion.circle key={`m${i}`} cx={xScale(i)} cy={yScale(d.manchester)} r="3" fill="#1C3A2E"
            initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 1.8 + i * 0.04 }} />
        ))}
        {data.map((d, i) => (
          <motion.circle key={`l${i}`} cx={xScale(i)} cy={yScale(d.liverpool)} r="3" fill="#A0623A"
            initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 2.0 + i * 0.04 }} />
        ))}
        <text x={xScale(data.length - 1) + 5} y={yScale(data[data.length - 1].manchester) + 3} fontSize="9" fill="#1C3A2E" fontFamily="Playfair Display, serif" fontWeight="600">£{data[data.length - 1].manchester}k</text>
        <text x={xScale(data.length - 1) + 5} y={yScale(data[data.length - 1].liverpool) + 3} fontSize="9" fill="#A0623A" fontFamily="Playfair Display, serif" fontWeight="600">£{data[data.length - 1].liverpool}k</text>
      </svg>
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
        {[{ c: '#1C3A2E', l: 'Manchester' }, { c: '#A0623A', l: 'Liverpool' }].map((item, k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.68rem', color: 'rgba(26,26,24,0.45)' }}>
            <span style={{ width: '18px', height: '2.5px', background: item.c, display: 'block', borderRadius: '2px' }} />{item.l}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.68rem', color: 'rgba(26,26,24,0.35)' }}>
          <span style={{ width: '18px', height: '1px', borderTop: '2px dashed rgba(28,58,46,0.35)', display: 'block' }} />Forecast
        </div>
      </div>
    </div>
  );
}

function StatCell({ val, label, sub, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: '1.6rem 1.4rem' }}
    >
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.6rem,2.2vw,2.2rem)', fontWeight: 600, color: '#1C3A2E', lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#1A1A18', marginTop: '0.4rem' }}>{label}</div>
      <div style={{ fontSize: '0.62rem', color: 'rgba(26,26,24,0.4)', marginTop: '0.15rem' }}>{sub}</div>
    </motion.div>
  );
}

export default function Home() {
  const [investorType, setInvestorType] = useState(null);
  const [budget, setBudget] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) return;
    setSubmitting(true);
    setError(null);
    const payload = { name: formData.name, email: formData.email, investor_type: investorType, budget_range: budget || 'not_specified', source: 'landing_page', created_at: new Date().toISOString() };
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/investor_leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'return=minimal' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      fetch(N8N_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
      setFormStep(3);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const waLink = (investorType === 'cash' || investorType === 'portfolio')
    ? `https://wa.me/447593259196?text=Hi%2C%20I%27m%20a%20${encodeURIComponent(investorType || '')}%20investor`
    : WA_DIRECT;

  const eyebrow = (txt) => (
    <div style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#A0623A', display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.1rem' }}>
      <span style={{ width: '22px', height: '1px', background: '#A0623A', display: 'block' }} />{txt}
    </div>
  );

  const sectionH2 = (children) => (
    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.9rem,3.6vw,3rem)', fontWeight: 600, lineHeight: 1.08, color: '#1C3A2E', letterSpacing: '-0.02em', marginBottom: '1.4rem' }}>
      {children}
    </h2>
  );

  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      <div style={{ background: '#1C3A2E', padding: '0.5rem 5vw', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Now sourcing in M8, M9 & M40', 'Liverpool Waters corridor active', 'Register to access deals'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.67rem', fontWeight: 500, letterSpacing: '0.08em', color: 'rgba(247,244,239,0.55)', whiteSpace: 'nowrap' }}>
              {i > 0 && <span style={{ width: '3px', height: '3px', background: '#A0623A', borderRadius: '50%', display: 'block' }} />}
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* NAV */}
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          padding: '1.2rem 5vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(247,244,239,0.97)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(28,58,46,0.09)',
        }}
      >
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', fontWeight: 600, color: '#1C3A2E' }}>
          Field Property <span style={{ color: '#A0623A', fontStyle: 'italic' }}>Partners</span>
        </div>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[['Markets', '#markets'], ['Regeneration', '#regeneration'], ['Why Source', '#why-source'], ['Process', '#process']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(26,26,24,0.48)', textDecoration: 'none' }}>{l}</a>
          ))}
          <a href="#invest" style={{ padding: '0.62rem 1.4rem', background: '#1C3A2E', color: '#F7F4EF', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '2px' }}>
            Invest With Us
          </a>
        </div>
      </motion.nav>

      {/* HERO */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '88vh', overflow: 'hidden' }}>
        {/* Manchester */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <motion.div
            initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'absolute', inset: 0, backgroundImage: `url(${MANCHESTER_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center center' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, rgba(28,58,46,0.55) 0%, rgba(28,58,46,0.7) 50%, rgba(10,10,10,0.88) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: '2.5rem 4vw 3.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(247,244,239,0.4)', marginBottom: '0.8rem' }}>
              Manchester
            </motion.div>
            <div style={{ overflow: 'hidden' }}>
              <motion.h1 initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.6rem,4vw,4.2rem)', fontWeight: 600, lineHeight: 0.92, letterSpacing: '-0.025em', color: '#F7F4EF', marginBottom: '0.15rem' }}>
                Serious
              </motion.h1>
            </div>
            <div style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
              <motion.h1 initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.6rem,4vw,4.2rem)', fontWeight: 600, lineHeight: 0.92, letterSpacing: '-0.025em', color: '#C07848', fontStyle: 'italic' }}>
                deals.
              </motion.h1>
            </div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.7 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(247,244,239,0.08)', border: '1px solid rgba(247,244,239,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              {manchesterStats.map((s, i) => (
                <div key={i} style={{ padding: '0.9rem 0.9rem', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 600, color: '#F7F4EF', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(247,244,239,0.5)', marginTop: '0.2rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.55rem', color: 'rgba(247,244,239,0.28)', marginTop: '0.1rem' }}>{s.sub}</div>
                </div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.6 }}
              style={{ display: 'flex', gap: '0.7rem' }}>
              <a href="#invest" style={{ padding: '0.75rem 1.4rem', background: '#A0623A', color: '#F7F4EF', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '2px' }}>Register →</a>
              <a href="#markets" style={{ padding: '0.75rem 1.4rem', background: 'transparent', color: 'rgba(247,244,239,0.55)', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '2px', border: '1px solid rgba(247,244,239,0.18)' }}>View Data</a>
            </motion.div>
          </div>
        </div>

        {/* Liverpool */}
        <div style={{ position: 'relative', overflow: 'hidden', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          <motion.div
            initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 1.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'absolute', inset: 0, backgroundImage: `url(${LIVERPOOL_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center center' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, rgba(120,70,30,0.55) 0%, rgba(100,55,20,0.65) 50%, rgba(10,10,10,0.88) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: '2.5rem 4vw 3.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(247,244,239,0.4)', marginBottom: '0.8rem' }}>
              Liverpool
            </motion.div>
            <div style={{ overflow: 'hidden' }}>
              <motion.h1 initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.6rem,4vw,4.2rem)', fontWeight: 600, lineHeight: 0.92, letterSpacing: '-0.025em', color: '#F7F4EF', marginBottom: '0.15rem' }}>
                Serious
              </motion.h1>
            </div>
            <div style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
              <motion.h1 initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.67, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.6rem,4vw,4.2rem)', fontWeight: 600, lineHeight: 0.92, letterSpacing: '-0.025em', color: '#C07848', fontStyle: 'italic' }}>
                returns.
              </motion.h1>
            </div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95, duration: 0.7 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(247,244,239,0.08)', border: '1px solid rgba(247,244,239,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              {liverpoolStats.map((s, i) => (
                <div key={i} style={{ padding: '0.9rem 0.9rem', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 600, color: '#F7F4EF', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(247,244,239,0.5)', marginTop: '0.2rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.55rem', color: 'rgba(247,244,239,0.28)', marginTop: '0.1rem' }}>{s.sub}</div>
                </div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.6 }}>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.7, fontWeight: 300, color: 'rgba(247,244,239,0.48)', maxWidth: '320px' }}>
                We source below-market investment property across the North West — underwritten, due-diligenced, ready for deployment.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ overflow: 'hidden', background: '#1C3A2E', padding: '0.82rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.div
          animate={{ x: [0, -4200] }}
          transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', width: 'max-content' }}
        >
          {[...Array(2)].map((_, ri) =>
            tickerLines.map((t, i) => (
              <div key={`${ri}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0 3rem', whiteSpace: 'nowrap', fontSize: '0.65rem', fontWeight: 400, letterSpacing: '0.06em', color: 'rgba(247,244,239,0.38)' }}>
                <span style={{ width: '3px', height: '3px', background: '#A0623A', borderRadius: '50%', display: 'block', flexShrink: 0 }} />
                {t}
              </div>
            ))
          )}
        </motion.div>
      </div>

      {/* MARKETS */}
      <section id="markets" style={{ padding: '8rem 5vw', background: '#F7F4EF' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          {eyebrow('Market Intelligence')}
          {sectionH2(<>Why the North West <em style={{ color: '#A0623A' }}>outperforms.</em></>)}
          <p style={{ fontSize: '0.92rem', lineHeight: 1.8, color: 'rgba(26,26,24,0.55)', fontWeight: 300, maxWidth: '680px', marginBottom: '3.5rem' }}>
            While London yields have compressed to sub-5% and southern markets stagnate, Manchester and Liverpool offer a rare combination — strong rental demand from growing professional populations, significant below-market acquisition opportunities, and billions in committed regeneration spend that structurally supports long-term capital growth. These are not emerging markets. They are established cities at an inflection point.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '5rem' }}>
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
              <div style={{ width: '7px', height: '7px', background: '#1C3A2E', borderRadius: '50%' }} />
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1C3A2E' }}>Manchester</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid rgba(28,58,46,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              {manchesterStats.map((s, i) => <StatCell key={i} {...s} delay={i * 0.07} />)}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
              <div style={{ width: '7px', height: '7px', background: '#A0623A', borderRadius: '50%' }} />
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A0623A' }}>Liverpool</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid rgba(160,98,58,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
              {liverpoolStats.map((s, i) => <StatCell key={i} {...s} delay={i * 0.07} />)}
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3rem' }}>
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}>
            <div style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(26,26,24,0.38)', marginBottom: '1.3rem' }}>Gross Yield — UK City Comparison</div>
            {yieldData.map((d, i) => <AnimatedBar key={i} city={d.city} val={d.val} max={7.5} color="#A0623A" delay={i * 0.09} label={d.label} />)}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(26,26,24,0.38)', marginBottom: '1.3rem' }}>Annual Price Growth YoY — 2025</div>
            {growthData.map((d, i) => <AnimatedBar key={i} city={d.city} val={d.val} max={85} color="#1C3A2E" delay={i * 0.09} label={d.label} />)}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }}>
            <div style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(26,26,24,0.38)', marginBottom: '1.3rem' }}>Average Price Trajectory + Forecast (£k)</div>
            <LineGraph data={priceTrajectory} />
          </motion.div>
        </div>
      </section>

      {/* REGENERATION */}
      <section id="regeneration" style={{ padding: '8rem 5vw', background: '#EDE9E1', borderTop: '1px solid rgba(28,58,46,0.08)' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          {eyebrow('Regeneration Pipeline')}
          {sectionH2(<>The capital being deployed <em style={{ color: '#A0623A' }}>around your investment.</em></>)}
          <p style={{ fontSize: '0.92rem', lineHeight: 1.8, color: 'rgba(26,26,24,0.52)', fontWeight: 300, maxWidth: '660px', marginBottom: '3.5rem' }}>
            Regeneration spend is not just a headline figure — it is infrastructure that drives rental demand, reduces vacancy risk, and creates sustained price pressure in surrounding postcodes. When billions are committed to a city, the streets around the development reprice first. Here is what is actively being built.
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {regenPoints.map((city, ci) => (
            <motion.div key={ci} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: ci * 0.1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
                <div style={{ width: '7px', height: '7px', background: city.color, borderRadius: '50%' }} />
                <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: city.color }}>{city.city}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: `${city.color}15`, border: `1px solid ${city.color}18`, borderRadius: '2px', overflow: 'hidden' }}>
                {city.items.map((item, ii) => (
                  <motion.div key={ii}
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: ii * 0.1 }}
                    whileHover={{ background: '#F7F4EF' }}
                    style={{ background: '#FAF8F4', padding: '1.6rem 1.8rem', transition: 'background 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 600, color: city.color, lineHeight: 1, flexShrink: 0 }}>{item.val}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1C3A2E', letterSpacing: '0.03em' }}>{item.label}</div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(26,26,24,0.52)', lineHeight: 1.7, fontWeight: 300 }}>{item.body}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY SOURCE */}
      <section id="why-source" style={{ padding: '8rem 5vw', background: '#F7F4EF', borderTop: '1px solid rgba(28,58,46,0.08)' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          {eyebrow('The Sourcing Advantage')}
          {sectionH2(<>What a sourcing partner <em style={{ color: '#A0623A' }}>actually does.</em></>)}
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(28,58,46,0.1)', border: '1px solid rgba(28,58,46,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
          {[
            { icon: '◈', title: 'Strong Margin Deals', body: 'Every deal is assessed on margin, not just price. Whether sourced below survey value or through value-add potential, we only present opportunities where the numbers genuinely work.' },
            { icon: '◎', title: 'Due Diligence Done', body: 'Comparables, yield calculations, refurb estimates and legal red flags reviewed before it reaches you. One briefing — not a 40-hour research project.' },
            { icon: '◉', title: 'Your Time Protected', body: 'No viewings. No agent calls. No spreadsheet hours. You receive a fully packaged opportunity and make one decision.' },
            { icon: '⬡', title: 'Scalable Deal Flow', body: 'From your first BTL to a 10-property portfolio — consistent pipeline, not one-off luck. Built to grow with your ambition.' },
          ].map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ background: '#EDE9E1' }}
              style={{ background: '#F7F4EF', padding: '2.6rem 2.4rem', transition: 'background 0.25s', position: 'relative' }}>
              <div style={{ fontSize: '1.2rem', color: '#A0623A', marginBottom: '1rem' }}>{c.icon}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.35rem', fontWeight: 600, color: '#1C3A2E', marginBottom: '0.65rem' }}>{c.title}</div>
              <p style={{ fontSize: '0.83rem', color: 'rgba(26,26,24,0.52)', lineHeight: 1.75, fontWeight: 300 }}>{c.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" style={{ padding: '8rem 5vw', background: '#EDE9E1', borderTop: '1px solid rgba(28,58,46,0.08)' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          {eyebrow('How It Works')}
          {sectionH2(<>Three steps to <em style={{ color: '#A0623A' }}>your next deal.</em></>)}
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2rem' }}>
          {[
            { n: '01', title: 'Consultation', body: 'Tell us your criteria — budget, target yield, preferred strategy. We align on what a good deal looks like before sourcing begins.' },
            { n: '02', title: 'Deal Presented', body: 'We send a fully underwritten opportunity: comparables, yield, refurb estimate, legal status. Nothing speculative ever reaches you.' },
            { n: '03', title: 'You Complete', body: 'You make the call. We handle solicitor introductions and the handover. Zero pressure, full transparency throughout.' },
          ].map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.15 }}
              style={{ padding: '2.4rem 2rem', border: '1px solid rgba(28,58,46,0.1)', borderRadius: '2px', position: 'relative', overflow: 'hidden', background: '#F7F4EF' }}>
              <div style={{ position: 'absolute', top: '-0.5rem', right: '1.5rem', fontFamily: 'Playfair Display, serif', fontSize: '5rem', fontWeight: 700, color: 'rgba(28,58,46,0.05)', lineHeight: 1, userSelect: 'none' }}>{s.n}</div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(160,98,58,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', fontWeight: 600, color: '#A0623A', marginBottom: '1.8rem' }}>{s.n}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 600, color: '#1C3A2E', marginBottom: '0.65rem' }}>{s.title}</div>
              <p style={{ fontSize: '0.83rem', color: 'rgba(26,26,24,0.52)', lineHeight: 1.75, fontWeight: 300 }}>{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* INVEST */}
      <section id="invest" style={{ padding: '8rem 5vw', background: '#1C3A2E', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '550px', height: '550px', background: 'radial-gradient(circle, rgba(160,98,58,0.14) 0%, transparent 65%)', pointerEvents: 'none', borderRadius: '50%' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7rem', alignItems: 'start', position: 'relative', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(247,244,239,0.38)', display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.1rem' }}>
              <span style={{ width: '22px', height: '1px', background: '#A0623A', display: 'block' }} />Investor Registration
            </div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.9rem,3.3vw,2.8rem)', fontWeight: 600, lineHeight: 1.05, color: '#F7F4EF', letterSpacing: '-0.02em', marginBottom: '1.4rem' }}>
              Ready to deploy <em style={{ color: '#C07848' }}>capital?</em>
            </h2>
            <p style={{ fontSize: '0.87rem', lineHeight: 1.8, color: 'rgba(247,244,239,0.42)', fontWeight: 300, marginBottom: '2rem' }}>
              Tell us who you are. We will route you to the right conversation — our investor community or a direct line for live deals.
            </p>
            {['No spam. No unsolicited calls.', 'Stored securely in our investor database.', 'Cash buyers and portfolio investors prioritised.', 'WhatsApp community for ongoing deal flow.'].map((pt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.78rem', color: 'rgba(247,244,239,0.42)', marginBottom: '0.6rem' }}>
                <span style={{ color: '#C07848', fontSize: '0.7rem', flexShrink: 0 }}>✓</span>{pt}
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}
            style={{ background: '#F7F4EF', borderRadius: '2px', padding: '2.4rem' }}>
            <AnimatePresence mode="wait">
              {formStep === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.28 }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,26,24,0.36)', marginBottom: '1.2rem' }}>Step 1 of 2 — Your investor profile</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', marginBottom: '1.2rem' }}>
                    {investorTypes.map(t => (
                      <button key={t.id} onClick={() => setInvestorType(t.id)}
                        style={{ padding: '1rem', background: investorType === t.id ? 'rgba(28,58,46,0.06)' : 'transparent', border: `1px solid ${investorType === t.id ? '#1C3A2E' : 'rgba(28,58,46,0.12)'}`, borderRadius: '2px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                        <span style={{ display: 'block', fontSize: '0.77rem', fontWeight: 600, color: investorType === t.id ? '#1C3A2E' : '#1A1A18' }}>{t.label}</span>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'rgba(26,26,24,0.4)', marginTop: '0.1rem' }}>{t.sub}</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(26,26,24,0.36)', marginBottom: '0.6rem' }}>Budget (optional)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.2rem' }}>
                    {budgets.map(b => (
                      <button key={b} onClick={() => setBudget(budget === b ? null : b)}
                        style={{ padding: '0.4rem 0.85rem', background: budget === b ? '#1C3A2E' : 'transparent', border: `1px solid ${budget === b ? '#1C3A2E' : 'rgba(28,58,46,0.12)'}`, borderRadius: '20px', fontSize: '0.7rem', fontWeight: 500, color: budget === b ? '#F7F4EF' : 'rgba(26,26,24,0.45)', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {b}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => investorType && setFormStep(2)} disabled={!investorType}
                    style={{ width: '100%', padding: '0.92rem', background: '#1C3A2E', color: '#F7F4EF', fontFamily: 'Outfit, sans-serif', fontSize: '0.73rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', borderRadius: '2px', cursor: investorType ? 'pointer' : 'not-allowed', opacity: investorType ? 1 : 0.38, transition: 'opacity 0.2s' }}>
                    Continue →
                  </button>
                </motion.div>
              )}
              {formStep === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.28 }}>
                  <button onClick={() => setFormStep(1)} style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: 'rgba(26,26,24,0.36)', cursor: 'pointer', padding: 0, marginBottom: '1.1rem' }}>← Back</button>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,26,24,0.36)', marginBottom: '1.1rem' }}>Step 2 of 2 — Your details</div>
                  <input placeholder="Full name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    style={{ width: '100%', padding: '0.82rem 1rem', background: '#EDE9E1', border: '1px solid rgba(28,58,46,0.12)', borderRadius: '2px', fontFamily: 'Outfit, sans-serif', fontSize: '0.84rem', color: '#1A1A18', outline: 'none', marginBottom: '0.72rem' }} />
                  <input placeholder="Email address" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    style={{ width: '100%', padding: '0.82rem 1rem', background: '#EDE9E1', border: '1px solid rgba(28,58,46,0.12)', borderRadius: '2px', fontFamily: 'Outfit, sans-serif', fontSize: '0.84rem', color: '#1A1A18', outline: 'none', marginBottom: '0.72rem' }} />
                  {error && <div style={{ fontSize: '0.72rem', color: '#c0392b', padding: '0.65rem', background: 'rgba(192,57,43,0.07)', borderRadius: '2px', marginBottom: '0.72rem' }}>{error}</div>}
                  <button onClick={handleSubmit} disabled={submitting || !formData.name || !formData.email}
                    style={{ width: '100%', padding: '0.92rem', background: '#1C3A2E', color: '#F7F4EF', fontFamily: 'Outfit, sans-serif', fontSize: '0.73rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', borderRadius: '2px', cursor: 'pointer', opacity: submitting ? 0.5 : 1 }}>
                    {submitting ? 'Submitting...' : 'Submit & Get Connected →'}
                  </button>
                  <p style={{ fontSize: '0.61rem', color: 'rgba(26,26,24,0.3)', textAlign: 'center', marginTop: '0.85rem', lineHeight: 1.6 }}>Stored securely. No spam. No third-party sharing.</p>
                </motion.div>
              )}
              {formStep === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ textAlign: 'center' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1.5px solid #1C3A2E', color: '#1C3A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', margin: '0 auto 1.2rem' }}>✓</motion.div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', fontWeight: 600, color: '#1C3A2E', marginBottom: '0.55rem' }}>You're registered.</div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(26,26,24,0.46)', lineHeight: 1.7, marginBottom: '1.5rem', fontWeight: 300 }}>
                    {investorType === 'cash' || investorType === 'portfolio' ? "As an established investor, message us directly. We'll respond within 24 hours." : "Join our community for regular deal flow and market updates."}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.58rem' }}>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.88rem', background: '#1C3A2E', color: '#F7F4EF', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '2px', textDecoration: 'none' }}>Connect on WhatsApp</a>
                    <a href="mailto:hello@fieldpropertypartners.co.uk" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.88rem', background: 'transparent', border: '1px solid rgba(28,58,46,0.12)', color: 'rgba(26,26,24,0.52)', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '2px', textDecoration: 'none' }}>Send an Email</a>
                    <a href="tel:+447593259196" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.88rem', background: 'transparent', border: '1px solid rgba(28,58,46,0.12)', color: 'rgba(26,26,24,0.52)', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '2px', textDecoration: 'none' }}>Call Us</a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '2.5rem 5vw', borderTop: '1px solid rgba(28,58,46,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#F7F4EF' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', fontWeight: 600, color: '#1C3A2E' }}>Field Property <span style={{ color: '#A0623A', fontStyle: 'italic' }}>Partners</span></div>
        <div style={{ fontSize: '0.67rem', color: 'rgba(26,26,24,0.3)', letterSpacing: '0.06em' }}>Manchester & Liverpool · Property Sourcing · 2025</div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['Privacy', 'Terms', 'Contact'].map(l => <a key={l} href="#" style={{ fontSize: '0.67rem', color: 'rgba(26,26,24,0.3)', textDecoration: 'none' }}>{l}</a>)}
        </div>
      </footer>
    </>
  );
}
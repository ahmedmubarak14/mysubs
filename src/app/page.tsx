'use client';

import { useState } from "react";
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const PRIMARY = "#1F0433";
const PRIMARY_FG = "#FFFFFF";
const BG = "#FFFFFF";
const CARD = "#FFFFFF";
const MUTED = "#F5F4F6";
const MUTED_FG = "#6E6475";
const BORDER = "#E8E4EB";
const FG = "#1F0433";

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    color: ${FG};
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .animate-float    { animation: float 6s ease-in-out infinite; }
  .animate-fade-in  { animation: fade-in 0.6s ease forwards; }

  /* Card */
  .card {
    background: ${CARD};
    border: 1px solid ${BORDER};
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(31,4,51,0.06);
    transition: box-shadow 0.2s;
  }
  .card:hover { box-shadow: 0 4px 16px rgba(31,4,51,0.1); }

  /* Card header muted strip */
  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid ${BORDER};
    background: ${MUTED};
  }
  .card-header-center {
    padding: 20px 20px 16px;
    border-bottom: 1px solid ${BORDER};
    background: ${MUTED};
    text-align: center;
  }
  .card-body { padding: 20px; }

  /* Icon boxes */
  .icon-box {
    width: 40px; height: 40px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .icon-box-lg {
    width: 48px; height: 48px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    margin: 0 auto 12px;
  }
  .icon-amber   { background: rgba(245,158,11,0.1); }
  .icon-green   { background: rgba(34,197,94,0.1); }
  .icon-purple  { background: rgba(168,85,247,0.1); }
  .icon-red     { background: rgba(239,68,68,0.1); }
  .icon-emerald { background: rgba(16,185,129,0.1); }
  .icon-orange  { background: rgba(249,115,22,0.1); }
  .icon-teal    { background: rgba(20,184,166,0.1); }
  .icon-blue    { background: rgba(59,130,246,0.1); }
  .icon-plum    { background: rgba(31,4,51,0.08); }

  /* Step number circle */
  .step-num {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px;
    border-radius: 50%;
    background: ${PRIMARY};
    color: ${PRIMARY_FG};
    font-weight: 700; font-size: 13px;
  }

  /* Badge */
  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(31,4,51,0.07);
    border: 1px solid rgba(31,4,51,0.15);
    font-size: 13px; font-weight: 500;
    color: ${PRIMARY};
  }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 10px;
    font-weight: 600; font-size: 15px;
    cursor: pointer;
    transition: all 0.15s ease;
    border: none;
    text-decoration: none;
  }
  .btn-lg { height: 48px; padding: 0 32px; font-size: 16px; }
  .btn-md { height: 40px; padding: 0 20px; }
  .btn-sm { height: 34px; padding: 0 16px; font-size: 14px; }
  .btn-full { width: 100%; height: 44px; }

  .btn-primary {
    background: ${PRIMARY};
    color: ${PRIMARY_FG};
  }
  .btn-primary:hover { background: #2d0649; transform: translateY(-1px); }

  .btn-outline {
    background: transparent;
    color: ${PRIMARY};
    border: 1.5px solid ${PRIMARY};
  }
  .btn-outline:hover { background: rgba(31,4,51,0.05); }

  .btn-ghost {
    background: transparent;
    color: ${FG};
  }
  .btn-ghost:hover { background: ${MUTED}; }

  /* Pricing card featured */
  .card-featured {
    border: 2px solid ${PRIMARY};
    border-radius: 16px;
    overflow: hidden;
    background: ${CARD};
    box-shadow: 0 4px 20px rgba(31,4,51,0.12);
  }
  .card-dim {
    border: 1px solid ${BORDER};
    border-radius: 16px;
    overflow: hidden;
    background: ${CARD};
    opacity: 0.6;
  }

  /* Most popular badge */
  .badge-popular {
    display: inline-block;
    background: #DDFF55;
    color: ${PRIMARY};
    font-size: 10px; font-weight: 700;
    padding: 3px 8px;
    border-radius: 999px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  /* Layout helpers */
  .section { position: relative; padding: 0 24px 80px; }
  .container { max-width: 960px; margin: 0 auto; }
  .text-center { text-align: center; }
  .section-title {
    font-size: 40px; font-weight: 800;
    color: ${PRIMARY};
    margin-bottom: 12px;
    letter-spacing: -0.025em;
  }
  .section-sub {
    font-size: 18px;
    color: ${MUTED_FG};
    margin-bottom: 48px;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    max-width: 680px;
    margin: 0 auto;
  }
  .grid-stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  /* Header */
  header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 50;
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid ${BORDER};
    box-shadow: 0 1px 4px rgba(31,4,51,0.06);
  }
  .header-inner {
    max-width: 1200px; margin: 0 auto;
    padding: 16px 24px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  nav a {
    color: ${FG}; text-decoration: none;
    font-weight: 500; font-size: 15px;
    transition: color 0.15s;
  }
  nav a:hover { color: ${PRIMARY}; opacity: 0.7; }

  /* Hero */
  .hero { position: relative; padding: 140px 24px 80px; text-align: center; }
  .hero h1 {
    font-size: clamp(36px, 6vw, 64px);
    font-weight: 800;
    color: ${PRIMARY};
    line-height: 1.1;
    letter-spacing: -0.03em;
  }
  .hero p {
    font-size: clamp(17px, 2vw, 21px);
    color: ${MUTED_FG};
    max-width: 560px; margin: 0 auto 36px;
    line-height: 1.6;
  }

  /* Blobs */
  .blobs {
    position: fixed; inset: 0;
    overflow: hidden; pointer-events: none; z-index: 0;
  }
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
  }

  /* Stat card */
  .stat-card {
    background: ${CARD};
    border: 1px solid ${BORDER};
    border-radius: 14px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 1px 4px rgba(31,4,51,0.05);
  }
  .stat-number {
    font-size: 32px; font-weight: 800;
    color: ${PRIMARY};
    letter-spacing: -0.03em;
  }
  .stat-label { font-size: 13px; color: ${MUTED_FG}; margin-top: 4px; }

  /* Checklist */
  .check-item {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 14px; color: ${MUTED_FG};
    margin-bottom: 10px;
  }
  .check-icon { color: ${PRIMARY}; font-size: 16px; flex-shrink: 0; margin-top: 1px; }

  /* Testimonial */
  .testimonial-card {
    background: ${CARD};
    border: 1px solid ${BORDER};
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 4px rgba(31,4,51,0.05);
  }
  .testimonial-quote { font-size: 15px; color: ${FG}; line-height: 1.6; margin-bottom: 16px; font-style: italic; }
  .testimonial-author { font-size: 13px; font-weight: 600; color: ${PRIMARY}; }
  .testimonial-role { font-size: 12px; color: ${MUTED_FG}; }

  /* FAQ */
  .faq-item {
    border-bottom: 1px solid ${BORDER};
    padding: 20px 0;
  }
  .faq-q { font-size: 16px; font-weight: 600; color: ${FG}; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
  .faq-a { font-size: 14px; color: ${MUTED_FG}; margin-top: 12px; line-height: 1.7; }

  /* Footer */
  footer {
    position: relative;
    padding: 48px 24px;
    border-top: 1px solid ${BORDER};
    background: rgba(245,244,246,0.5);
    text-align: center;
  }

  /* Logo SVG mark */
  .logo-mark { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .logo-text { font-size: 20px; font-weight: 800; color: ${PRIMARY}; letter-spacing: -0.03em; }
  .logo-text span { opacity: 0.5; font-weight: 400; }

  @media (max-width: 640px) {
    .hide-mobile { display: none !important; }
    .section-title { font-size: 30px; }
    .hero h1 { font-size: 34px; }
    .btn-row { flex-direction: column; align-items: stretch; }
  }

  /* RTL Specifics */
  [dir="rtl"] .logo-mark { flex-direction: row-reverse; }
  [dir="rtl"] .header-inner { flex-direction: row-reverse; }
  [dir="rtl"] nav { flex-direction: row-reverse; }
  [dir="rtl"] .btn-row { flex-direction: row-reverse; }
  [dir="rtl"] .check-item { flex-direction: row-reverse; }
  [dir="rtl"] .faq-q { flex-direction: row-reverse; }
  [dir="rtl"] .card-body p, [dir="rtl"] .card-body h3 { text-align: right; }
  [dir="rtl"] .check-item span { text-align: right; }
  [dir="rtl"] .testimonial-card { text-align: right; }
  [dir="rtl"] .faq-a { text-align: right; }
`;

const Logo = () => (
  <div className="logo-mark">
    <svg width="32" height="32" viewBox="0 0 46 32" fill="none">
      <circle cx="13" cy="16" r="13" fill="#A855F7" opacity="0.5" />
      <circle cx="33" cy="16" r="13" fill="#9333EA" opacity="0.7" />
      <circle cx="23" cy="16" r="10" fill="#7C3AED" opacity="1" />
    </svg>
    <span className="logo-text">Sub<span>Track</span></span>
  </div>
);


export default function SubTrackLanding() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const FEATURES = [
    { icon: "📥", cls: "icon-plum", title: t('land_feat1_title'), desc: t('land_feat1_desc') },
    { icon: "🔔", cls: "icon-orange", title: t('land_feat2_title'), desc: t('land_feat2_desc') },
    { icon: "👤", cls: "icon-blue", title: t('land_feat3_title'), desc: t('land_feat3_desc') },
    { icon: "📊", cls: "icon-green", title: t('land_feat4_title'), desc: t('land_feat4_desc') },
    { icon: "💱", cls: "icon-amber", title: t('land_feat5_title'), desc: t('land_feat5_desc') },
    { icon: "💬", cls: "icon-purple", title: t('land_feat6_title'), desc: t('land_feat6_desc') },
  ];

  const STEPS = [
    { icon: "🏢", cls: "icon-blue", n: "1", title: t('land_step1_title'), desc: t('land_step1_desc') },
    { icon: "➕", cls: "icon-emerald", n: "2", title: t('land_step2_title'), desc: t('land_step2_desc') },
    { icon: "⚡", cls: "icon-amber", n: "3", title: t('land_step3_title'), desc: t('land_step3_desc') },
  ];

  const PRICING = [
    {
      title: t('land_price_free'),
      price: "$0",
      period: t('land_price_mo'),
      desc: t('land_price_free_desc'),
      features: [t('land_price_free_f1'), t('land_price_free_f2'), t('land_price_free_f3'), t('land_price_free_f4')],
      cta: t('land_price_free_cta'),
      featured: false,
    },
    {
      title: t('land_price_pro'),
      price: "$29",
      period: t('land_price_mo'),
      desc: t('land_price_pro_desc'),
      badge: t('land_price_popular'),
      features: [t('land_price_pro_f1'), t('land_price_pro_f2'), t('land_price_pro_f3'), t('land_price_pro_f4'), t('land_price_pro_f5'), t('land_price_pro_f6')],
      cta: t('land_price_pro_cta'),
      featured: true,
    },
    {
      title: t('land_price_biz'),
      price: "$49",
      period: t('land_price_mo'),
      desc: t('land_price_biz_desc'),
      features: [t('land_price_biz_f1'), t('land_price_biz_f2'), t('land_price_biz_f3'), t('land_price_biz_f4'), t('land_price_biz_f5')],
      cta: t('land_price_biz_cta'),
      featured: false,
    },
  ];

  const TESTIMONIALS = [
    { quote: t('land_test1_q'), name: t('land_test1_a'), role: t('land_test1_r') },
    { quote: t('land_test2_q'), name: t('land_test2_a'), role: t('land_test2_r') },
    { quote: t('land_test3_q'), name: t('land_test3_a'), role: t('land_test3_r') },
  ];

  const FAQS = [
    { q: t('land_faq1_q'), a: t('land_faq1_a') },
    { q: t('land_faq2_q'), a: t('land_faq2_a') },
    { q: t('land_faq3_q'), a: t('land_faq3_a') },
    { q: t('land_faq4_q'), a: t('land_faq4_a') },
    { q: t('land_faq5_q'), a: t('land_faq5_a') },
  ];


  return (
    <>
      <style>{CSS}</style>

      {/* Blobs */}
      <div className="blobs">
        <div className="blob animate-float" style={{ top: 0, left: "25%", width: 384, height: 384, background: "rgba(192,214,234,0.3)", animationDelay: "0s" }} />
        <div className="blob animate-float" style={{ bottom: 0, right: "25%", width: 384, height: 384, background: "rgba(221,255,85,0.18)", animationDelay: "2s" }} />
        <div className="blob animate-float" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 256, height: 256, background: "rgba(31,4,51,0.07)", animationDelay: "4s" }} />
      </div>

      {/* Page gradient bg */}
      <div style={{ position: "fixed", inset: 0, zIndex: -1, background: "linear-gradient(135deg, #F6F2E8 0%, rgba(197,192,201,0.2) 50%, rgba(192,214,234,0.3) 100%)" }} />

      {/* Header */}
      <header>
        <div className="header-inner">
          <Logo />
          <nav className="hide-mobile" style={{ display: "flex", gap: 32 }}>
            <a href="#features">{t('land_nav_features')}</a>
            <a href="#how">{t('land_nav_how')}</a>
            <a href="#pricing">{t('land_nav_pricing')}</a>
          </nav>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <LanguageSwitcher />
            <Link href="/login" className="btn btn-ghost btn-sm hide-mobile">{t('land_nav_login')}</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">{t('land_nav_get_started')}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero" style={{ position: "relative", zIndex: 1, paddingTop: 180 }}>
        <div className="animate-fade-in">
          <span className="badge">{t('land_hero_badge')}</span>
        </div>
        <h1 className="animate-fade-in" style={{ animationDelay: "0.1s", whiteSpace: 'pre-line' }}>
          {t('land_hero_title')}
        </h1>
        <p className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {t('land_hero_desc')}
        </p>
        <div className="animate-fade-in btn-row" style={{ display: "flex", gap: 12, justifyContent: "center", animationDelay: "0.3s" }}>
          <Link href="/signup" className="btn btn-primary btn-lg">{t('land_hero_cta')}</Link>
          <button className="btn btn-outline btn-lg" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>{t('land_hero_cta2')}</button>
        </div>
        {/* Social proof strip */}
        <div className="animate-fade-in" style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", animationDelay: "0.45s" }}>
          {[
            { icon: "🔒", text: t('land_proof_1') as string },
            { icon: "⚡", text: t('land_proof_2') as string },
            { icon: "💳", text: t('land_proof_3') as string },
            { icon: "🔗", text: t('land_proof_4') as string },
          ].map(p => (
            <div key={p.text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: MUTED_FG, fontWeight: 500 }}>
              <span>{p.icon}</span>
              <span>{p.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="section" style={{ zIndex: 1, position: "relative", marginTop: 40 }}>
        <div className="container">
          <div className="grid-stats">
            {[
              { n: t('land_stat1_n'), l: t('land_stat1_l') },
              { n: t('land_stat2_n'), l: t('land_stat2_l') },
              { n: t('land_stat3_n'), l: t('land_stat3_l') },
              { n: t('land_stat4_n'), l: t('land_stat4_l') },
            ].map(s => (
              <div key={s.n as string} className="stat-card">
                <div className="stat-number">{s.n}</div>
                <div className="stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section" style={{ zIndex: 1, position: "relative" }}>
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">{t('land_feat_title')}</h2>
            <p className="section-sub">{t('land_feat_sub')}</p>
          </div>
          <div className="grid-3">
            {FEATURES.map(f => (
              <div key={f.title as string} className="card">
                <div className="card-header">
                  <div className={`icon-box ${f.cls}`}>{f.icon}</div>
                </div>
                <div className="card-body">
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: FG }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: MUTED_FG, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section" style={{ zIndex: 1, position: "relative" }}>
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">{t('land_how_title')}</h2>
            <p className="section-sub">{t('land_how_sub')}</p>
          </div>
          <div className="grid-3">
            {STEPS.map(s => (
              <div key={s.title as string} className="card">
                <div className="card-header-center">
                  <div className={`icon-box-lg ${s.cls}`}>{s.icon}</div>
                  <div className="step-num">{s.n}</div>
                </div>
                <div className="card-body" style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: FG }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: MUTED_FG, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section" style={{ zIndex: 1, position: "relative" }}>
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">{t('land_price_title')}</h2>
            <p className="section-sub">{t('land_price_sub')}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20, maxWidth: 880, margin: "0 auto" }}>
            {PRICING.map(p => (
              <div key={p.title as string} className={p.featured ? "card-featured" : "card-dim"}>
                <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${BORDER}`, background: MUTED, textAlign: "center" }}>
                  {p.badge && <div style={{ marginBottom: 8 }}><span className="badge-popular">{p.badge}</span></div>}
                  <div style={{ fontSize: 22, fontWeight: 700, color: FG }}>{p.title}</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: p.featured ? PRIMARY : MUTED_FG, letterSpacing: "-0.03em" }}>
                    {p.price}<span style={{ fontSize: 15, fontWeight: 400 }}>{p.period}</span>
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <p style={{ fontSize: 14, color: MUTED_FG, marginBottom: 16, textAlign: "center" }}>{p.desc}</p>
                  {p.features.map(f => (
                    <div key={f as string} className="check-item">
                      <span className="check-icon">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                  <button className={`btn ${p.featured ? "btn-primary" : "btn-outline"} btn-full`} style={{ marginTop: 20 }}>
                    {p.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ zIndex: 1, position: "relative" }}>
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">{t('land_test_title')}</h2>
            <p className="section-sub">{t('land_test_sub')}</p>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map(t => (
              <div key={t.name as string} className="testimonial-card">
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ zIndex: 1, position: "relative" }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <div className="text-center">
            <h2 className="section-title">{t('land_faq_title')}</h2>
            <p className="section-sub">{t('land_faq_sub')}</p>
          </div>
          {FAQS.map((f, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{f.q}</span>
                <span style={{ fontSize: 20, color: MUTED_FG }}>{openFaq === i ? "−" : "+"}</span>
              </div>
              {openFaq === i && <p className="faq-a">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="section" style={{ paddingBottom: 120, zIndex: 1, position: "relative" }}>
        <div className="container">
          <div className="card" style={{ padding: "64px 48px", textAlign: "center" }}>
            <span className="badge" style={{ marginBottom: 20 }}>{t('land_cta_badge')}</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: FG, margin: "0 auto 16px", letterSpacing: "-0.025em", whiteSpace: "pre-line" }}>
              {t('land_cta_title')}
            </h2>
            <p style={{ fontSize: 17, color: MUTED_FG, maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6 }}>
              {t('land_cta_desc')}
            </p>
            <div className="btn-row" style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link href="/signup" className="btn btn-primary btn-lg">{t('land_cta_btn1')}</Link>
              <button className="btn btn-outline btn-lg" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>{t('land_cta_btn2')}</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ zIndex: 1, position: "relative" }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Logo /></div>
        <p style={{ fontSize: 14, color: MUTED_FG, marginBottom: 8 }}>{t('land_footer_desc')}</p>
        <p style={{ fontSize: 13, color: MUTED_FG }}>{t('land_footer_copy')}</p>
      </footer>
    </>
  );
}

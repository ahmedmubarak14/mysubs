'use client';

import { useState } from "react";
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  Zap, ArrowRight, ShieldCheck, CreditCard,
  BarChart3, RefreshCw, BellRing, Smartphone,
  CheckCircle2, Plus
} from 'lucide-react';

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
    <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo-white.png`} alt="SubTrack" style={{ height: 48, width: 'auto' }} />
  </div>
);

const LogoDark = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
    <svg width="32" height="32" viewBox="0 0 46 32" fill="none">
      <circle cx="13" cy="16" r="13" fill="#A855F7" opacity="0.5" />
      <circle cx="33" cy="16" r="13" fill="#9333EA" opacity="0.7" />
      <circle cx="23" cy="16" r="10" fill="#7C3AED" opacity="1" />
    </svg>
    <span style={{ fontSize: 22, fontWeight: 800, color: '#1F0433', letterSpacing: '-0.03em' }}>
      Sub<span style={{ opacity: 0.5, fontWeight: 400 }}>Track</span>
    </span>
  </div>
);

export default function SubTrackLanding() {
  const { t } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const slideCount = 3;

  const FAQS = [
    { q: t('land_faq1_q'), a: t('land_faq1_a') },
    { q: t('land_faq2_q'), a: t('land_faq2_a') },
    { q: t('land_faq3_q'), a: t('land_faq3_a') },
    { q: t('land_faq4_q'), a: t('land_faq4_a') },
    { q: t('land_faq5_q'), a: t('land_faq5_a') },
  ];

  return (
    <div className="antialiased font-body" style={{ color: '#1D1F1E', backgroundColor: '#FFFFFF' }}>
      {/* HEADER & HERO SECTION */}
      <section className="relative" style={{ backgroundColor: '#1F0433' }}>
        <img className="absolute top-0 left-0 w-full h-full object-cover" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/fauna-assets/headers/bg-waves.png`} alt="" />

        <nav className="py-6 position-relative z-10">
          <div className="container mx-auto px-4">
            <div className="relative flex items-center justify-between">
              <Link className="inline-block" href="/">
                <Logo />
              </Link>
              <ul className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex">
                <li className="mr-8"><a className="inline-block text-white hover:text-purple-400 font-medium transition duration-200" href="#solutions">{t('land_nav_features')}</a></li>
                <li className="mr-8"><a className="inline-block text-white hover:text-purple-400 font-medium transition duration-200" href="#how">{t('land_nav_how')}</a></li>
                <li className="mr-8"><a className="inline-block text-white hover:text-purple-400 font-medium transition duration-200" href="#pricing">{t('land_nav_pricing')}</a></li>
              </ul>
              <div className="flex items-center justify-end gap-4">
                <LanguageSwitcher />
                <div className="hidden md:block">
                  <Link href="/login" className="inline-flex py-2 px-4 items-center justify-center text-sm font-medium text-white hover:text-purple-300 transition duration-200">
                    {t('land_nav_login')}
                  </Link>
                  <Link href="/signup" className="inline-flex group py-2 px-4 items-center justify-center text-sm font-medium text-white hover:text-[#1F0433] border border-white hover:bg-white rounded-full transition duration-200 ml-2">
                    <span className="mr-2">{t('land_nav_get_started')}</span>
                    <span className="transform group-hover:translate-x-0.5 transition-transform duration-200">
                      <ArrowRight size={16} />
                    </span>
                  </Link>
                </div>
                <button className="md:hidden text-white hover:text-purple-400" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.19995 23.2H26.7999" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M5.19995 16H26.7999" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M5.19995 8.79999H26.7999" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative pt-18 pb-24 sm:pb-32 lg:pt-36 lg:pb-62">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-xl xl:max-w-2xl mx-auto text-center" style={{ animation: 'fade-in 0.8s ease-out' }}>
              <div className="inline-flex items-center px-5 py-2 mb-8 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                <span className="text-sm sm:text-base font-medium text-white flex items-center">{t('land_hero_badge')}</span>
              </div>
              <h1 className="text-5xl xs:text-6xl xl:text-7xl tracking-tight text-white mb-8 font-bold" style={{ lineHeight: 1.1 }}>
                {t('land_hero_title')}
              </h1>
              <p className="max-w-md xl:max-w-none text-lg text-white opacity-80 mb-10 mx-auto">
                {t('land_hero_desc')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link className="inline-flex w-full sm:w-auto py-4 px-8 items-center justify-center text-lg font-medium text-white border border-[#A855F7] hover:border-white rounded-full transition duration-300" style={{ backgroundColor: '#A855F7' }} href="/signup">
                  {t('land_hero_cta')}
                </Link>
                <a className="inline-flex w-full sm:w-auto py-4 px-8 items-center justify-center text-lg font-medium text-white border border-white hover:bg-white hover:text-[#1F0433] rounded-full transition duration-300" href="#solutions">
                  {t('land_hero_cta2')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <div className="md:hidden" style={{ pointerEvents: mobileNavOpen ? 'auto' : 'none', zIndex: 50, position: 'relative' }}>
          {/* Backdrop */}
          <div
            onClick={() => setMobileNavOpen(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(31, 4, 51, 0.5)', zIndex: 40,
              opacity: mobileNavOpen ? 1 : 0, transition: 'opacity 0.3s ease',
              pointerEvents: mobileNavOpen ? 'auto' : 'none'
            }}
          />
          {/* Sidebar */}
          <nav
            className="fixed top-0 left-0 bottom-0 bg-white z-50 flex flex-col py-6 px-6 overflow-y-auto shadow-2xl"
            style={{
              width: '85%', maxWidth: '320px',
              transform: mobileNavOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease',
              borderRight: '1px solid #E8E4EB'
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <Link className="inline-block" href="/" onClick={() => setMobileNavOpen(false)}>
                <LogoDark />
              </Link>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-[#1F0433] transition-colors rounded-full hover:bg-gray-100"
              >
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.2 8.79999L8.80005 23.2M8.80005 8.79999L23.2 23.2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
            </div>

            <div className="mb-auto">
              <ul className="flex flex-col space-y-4">
                <li><a className="block py-2 text-[#1F0433] hover:text-[#A855F7] font-medium text-lg transition-colors" href="#solutions" onClick={() => setMobileNavOpen(false)}>{t('land_nav_features')}</a></li>
                <li><a className="block py-2 text-[#1F0433] hover:text-[#A855F7] font-medium text-lg transition-colors" href="#how" onClick={() => setMobileNavOpen(false)}>{t('land_nav_how')}</a></li>
                <li><a className="block py-2 text-[#1F0433] hover:text-[#A855F7] font-medium text-lg transition-colors" href="#pricing" onClick={() => setMobileNavOpen(false)}>{t('land_nav_pricing')}</a></li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col space-y-4">
              <Link className="flex w-full py-3 px-4 items-center justify-center text-base font-medium text-[#1F0433] hover:bg-gray-50 border border-gray-200 rounded-xl transition duration-200" href="/login" onClick={() => setMobileNavOpen(false)}>
                {t('land_nav_login')}
              </Link>
              <Link href="/signup" onClick={() => setMobileNavOpen(false)} className="flex w-full py-3 px-4 items-center justify-center text-base font-medium text-white shadow-md rounded-xl transition duration-200 hover:shadow-lg" style={{ backgroundColor: '#A855F7' }}>
                {t('land_nav_get_started')}
              </Link>
            </div>
          </nav>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', width: '100%' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '40px 24px', borderRadius: '24px', border: '1px solid rgba(31, 4, 51, 0.05)', boxShadow: '0 4px 20px -10px rgba(31, 4, 51, 0.1)', textAlign: 'center' }}>
              <h5 className="text-4xl xl:text-5xl font-bold mb-3" style={{ color: '#1F0433' }}>{t('land_stat1_n')}</h5>
              <span className="text-sm xl:text-base text-gray-500 font-medium leading-tight block">{t('land_stat1_l')}</span>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '40px 24px', borderRadius: '24px', border: '1px solid rgba(31, 4, 51, 0.05)', boxShadow: '0 4px 20px -10px rgba(31, 4, 51, 0.1)', textAlign: 'center' }}>
              <h5 className="text-4xl xl:text-5xl font-bold mb-3" style={{ color: '#A855F7' }}>{t('land_stat2_n')}</h5>
              <span className="text-sm xl:text-base text-gray-500 font-medium leading-tight block">{t('land_stat2_l')}</span>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '40px 24px', borderRadius: '24px', border: '1px solid rgba(31, 4, 51, 0.05)', boxShadow: '0 4px 20px -10px rgba(31, 4, 51, 0.1)', textAlign: 'center' }}>
              <h5 className="text-4xl xl:text-5xl font-bold mb-3" style={{ color: '#1F0433' }}>{t('land_stat3_n')}</h5>
              <span className="text-sm xl:text-base text-gray-500 font-medium leading-tight block">{t('land_stat3_l')}</span>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '40px 24px', borderRadius: '24px', border: '1px solid rgba(31, 4, 51, 0.05)', boxShadow: '0 4px 20px -10px rgba(31, 4, 51, 0.1)', textAlign: 'center' }}>
              <h5 className="text-4xl xl:text-5xl font-bold mb-3" style={{ color: '#A855F7' }}>{t('land_stat4_n')}</h5>
              <span className="text-sm xl:text-base text-gray-500 font-medium leading-tight block">{t('land_stat4_l')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS (FEATURES) BENTO */}
      <section id="solutions" className="p-4 bg-white mt-12">
        <div className="pt-16 pb-24 px-5 xs:px-8 xl:px-12 rounded-3xl" style={{ backgroundColor: '#F8F6FA' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 justify-center mb-4">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#A855F7' }}></span>
                <h2 className="text-4xl md:text-5xl font-bold" style={{ color: '#1F0433', letterSpacing: '-0.02em' }}>
                  {t('land_feat_title')}
                </h2>
              </div>
              <p className="text-lg md:text-xl text-gray-500 font-medium">
                {t('land_feat_sub')}
              </p>
            </div>

            <div className="border-t pt-14 mt-4" style={{ borderColor: 'rgba(31, 4, 51, 0.1)' }}>

              {/* Dashboard Preview Image */}
              <div className="relative w-full max-w-6xl mx-auto mb-20 md:mb-32">
                <div className="absolute inset-0 bg-gradient-to-t from-[#F8F6FA] via-transparent to-transparent z-10 top-1/2"></div>
                <div className="rounded-2xl md:rounded-[3rem] overflow-hidden border border-gray-200/50 shadow-2xl shadow-purple-900/10">
                  <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/dashboard-preview.png`} alt="SubTrack Dashboard" className="w-full h-auto" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px', position: 'relative', zIndex: 20, marginTop: '-24px' }}>
                {/* Feature 1 */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(31, 4, 51, 0.08)', border: '1px solid rgba(31, 4, 51, 0.05)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    <RefreshCw size={28} />
                  </div>
                  <h5 className="text-2xl font-bold mb-3" style={{ color: '#1F0433' }}>{t('land_feat1_title')}</h5>
                  <p className="text-gray-600 leading-relaxed">{t('land_feat1_desc')}</p>
                </div>
                {/* Feature 2 */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(31, 4, 51, 0.08)', border: '1px solid rgba(31, 4, 51, 0.05)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    <BellRing size={28} />
                  </div>
                  <h5 className="text-2xl font-bold mb-3" style={{ color: '#1F0433' }}>{t('land_feat2_title')}</h5>
                  <p className="text-gray-600 leading-relaxed">{t('land_feat2_desc')}</p>
                </div>
                {/* Feature 3 */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(31, 4, 51, 0.08)', border: '1px solid rgba(31, 4, 51, 0.05)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    <ShieldCheck size={28} />
                  </div>
                  <h5 className="text-2xl font-bold mb-3" style={{ color: '#1F0433' }}>{t('land_feat3_title')}</h5>
                  <p className="text-gray-600 leading-relaxed">{t('land_feat3_desc')}</p>
                </div>
                {/* Feature 4 */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(31, 4, 51, 0.08)', border: '1px solid rgba(31, 4, 51, 0.05)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    <BarChart3 size={28} />
                  </div>
                  <h5 className="text-2xl font-bold mb-3" style={{ color: '#1F0433' }}>{t('land_feat4_title')}</h5>
                  <p className="text-gray-600 leading-relaxed">{t('land_feat4_desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 justify-center mb-4">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#A855F7' }}></span>
              <h2 className="text-4xl md:text-5xl font-bold" style={{ color: '#1F0433', letterSpacing: '-0.02em' }}>
                {t('land_how_title')}
              </h2>
            </div>
            <p className="text-lg md:text-xl text-gray-500 font-medium">
              {t('land_how_sub')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', maxWidth: '1152px', margin: '0 auto' }}>
            {/* Step 1 */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '24px', border: '1px solid #E8E4EB', boxShadow: '0 4px 24px rgba(31,4,51,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1F0433', color: 'white', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '24px', fontWeight: 'bold', fontSize: '18px' }}>1</div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#1F0433' }}>{t('land_step1_title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('land_step1_desc')}</p>
            </div>
            {/* Step 2 */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '24px', border: '1px solid #E8E4EB', boxShadow: '0 4px 24px rgba(31,4,51,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1F0433', color: 'white', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '24px', fontWeight: 'bold', fontSize: '18px' }}>2</div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#1F0433' }}>{t('land_step2_title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('land_step2_desc')}</p>
            </div>
            {/* Step 3 */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '24px', border: '1px solid #E8E4EB', boxShadow: '0 4px 24px rgba(31,4,51,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1F0433', color: 'white', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '24px', fontWeight: 'bold', fontSize: '18px' }}>3</div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#1F0433' }}>{t('land_step3_title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('land_step3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#F8F6FA' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 justify-center mb-4">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#A855F7' }}></span>
              <h2 className="text-4xl md:text-5xl font-bold" style={{ color: '#1F0433', letterSpacing: '-0.02em' }}>
                {t('land_faq_title')}
              </h2>
            </div>
            <p className="text-lg md:text-xl text-gray-500 font-medium">
              {t('land_faq_sub')}
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {FAQS.map((faq, idx) => (
              <button key={idx} className="flex w-full py-6 px-8 mb-4 items-start justify-between text-left shadow-sm rounded-2xl bg-white border border-gray-100 transition duration-200 hover:border-purple-200" onClick={(e) => { e.preventDefault(); setOpenFaq(openFaq === idx ? null : idx); }}>
                <div>
                  <div className="pr-5">
                    <h5 className="text-lg font-bold" style={{ color: '#1F0433' }}>{faq.q}</h5>
                  </div>
                  <div style={{
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    maxHeight: openFaq === idx ? '500px' : '0px',
                    opacity: openFaq === idx ? 1 : 0,
                    marginTop: openFaq === idx ? '16px' : '0px'
                  }}>
                    <p className="text-gray-600 leading-relaxed pr-5">{faq.a}</p>
                  </div>
                </div>
                <span className="flex-shrink-0 mt-1">
                  <div style={{
                    transition: 'transform 0.3s ease',
                    transform: openFaq === idx ? 'rotate(45deg)' : 'rotate(0deg)',
                    color: openFaq === idx ? '#A855F7' : '#9CA3AF'
                  }}>
                    <Plus size={24} />
                  </div>
                </span>
              </button>
            ))}

            <div className="sm:flex py-10 px-6 sm:px-10 rounded-2xl mt-12 items-center" style={{ backgroundColor: '#1F0433' }}>
              <div className="mb-6 sm:mb-0 sm:mr-8 flex-shrink-0">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#A855F7' }}>
                  <Smartphone size={32} />
                </div>
              </div>
              <div>
                <h5 className="text-xl font-bold mb-3 text-white">Still have questions?</h5>
                <p className="text-gray-300 leading-relaxed">
                  Support is available 24/7 for all our users. Check out our detailed documentation inside the app or chat with our team directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* FINAL CTA ENCLOSURE */}
      < section className="py-20 lg:py-32 px-4 relative bg-white" >
        <div className="max-w-5xl mx-auto text-center relative overflow-hidden" style={{ backgroundColor: '#1F0433', padding: '80px 40px', borderRadius: '32px', boxShadow: '0 20px 60px -15px rgba(168, 85, 247, 0.2)' }}>
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-[32px] pointer-events-none">
            <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '50%', height: '100%', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(31,4,51,0) 70%)' }}></div>
            <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '50%', height: '100%', background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(31,4,51,0) 70%)' }}></div>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
              Stop paying for software nobody uses
            </h1>
            <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-purple-200">
              Join hundreds of teams already using SubTrack to cut SaaS waste and take back control of their budgets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                className="inline-flex w-full sm:w-auto py-4 px-10 items-center justify-center text-lg font-bold text-white hover:text-[#1F0433] rounded-full transition-all duration-300 shadow-lg border border-[#A855F7] hover:bg-white"
                style={{ backgroundColor: '#A855F7' }}
                href="/signup"
              >
                Get early access 🚀
              </Link>
            </div>
          </div>
        </div>
      </section >

      {/* FOOTER */}
      < section className="relative py-12 lg:py-20 bg-white overflow-hidden" >
        <img className="absolute bottom-0 left-0 opacity-5" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/fauna-assets/footer/waves-lines-left-bottom.png`} alt="" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-center">
            <LogoDark />
            <p className="text-gray-500 mt-6 mb-2 text-center max-w-sm">{t('land_footer_desc')}</p>
            <p className="text-sm text-gray-400">© 2026 SubTrack. {t('land_footer_copy')}</p>
          </div>
        </div>
      </section >

    </div >
  );
}

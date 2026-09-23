import { useEffect, useRef, useState } from 'react';
import { ViewType } from '../types';
import { ShoppingCart, User, Upload, LogIn, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LiquidMetalButton from './LiquidMetalButton';
import MorphingText from './MorphingText';
import gsap from 'gsap';

interface NavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  cartCount: number;
  onOpenCart: () => void;
  onLogin: () => void;
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export default function Navbar({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  isLoggedIn = false,
  userName,
  onLogout,
}: NavbarProps) {
  // Trigger counter for playing the morph animation on click
  const [logoMorphTrigger, setLogoMorphTrigger] = useState<number>(0);

  const handleLogoClick = () => {
    onNavigate('home');
    setLogoMorphTrigger((prev) => prev + 1);
  };

  // Button refs for GSAP interactive physics and animations
  const browseRef = useRef<HTMLButtonElement>(null);
  const drumkitsRef = useRef<HTMLButtonElement>(null);
  const samplesRef = useRef<HTMLButtonElement>(null);
  const serumRef = useRef<HTMLButtonElement>(null);
  const sellRef = useRef<HTMLButtonElement>(null);

  // Helper to attach Apple-inspired GSAP haptic micro-interactions
  const attachGsapInteractions = (element: HTMLElement | null, scaleUp = 1.05) => {
    if (!element) return () => {};

    const handleMouseEnter = () => {
      gsap.to(element, {
        scale: scaleUp,
        y: -1.5,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        y: 0,
        duration: 0.26,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const handleMouseDown = () => {
      gsap.to(element, {
        scale: 0.94,
        y: 0,
        duration: 0.1,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    };

    const handleMouseUp = () => {
      gsap.to(element, {
        scale: scaleUp,
        y: -1.5,
        duration: 0.18,
        ease: 'back.out(2)',
        overwrite: 'auto',
      });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
    };
  };

  // Mount GSAP animations
  useEffect(() => {
    const cleanups = [
      attachGsapInteractions(browseRef.current, 1.06),
      attachGsapInteractions(drumkitsRef.current, 1.06),
      attachGsapInteractions(samplesRef.current, 1.06),
      attachGsapInteractions(serumRef.current, 1.06),
      attachGsapInteractions(sellRef.current, 1.06),
    ];

    // Elegant GSAP initial entrance stagger on navigation controls
    const animatedButtons = [
      browseRef.current,
      drumkitsRef.current,
      samplesRef.current,
      serumRef.current,
      sellRef.current,
    ].filter(Boolean) as HTMLElement[];

    if (animatedButtons.length > 0) {
      gsap.fromTo(
        animatedButtons,
        { y: -6, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.04,
          duration: 0.45,
          ease: 'power2.out',
          delay: 0.05,
        }
      );
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [isLoggedIn]);

  // GSAP Active Tab change micro-pulse
  useEffect(() => {
    let targetButton: HTMLElement | null = null;
    if (currentView === 'catalog') targetButton = browseRef.current;
    else if (currentView === 'sell') targetButton = sellRef.current;

    if (targetButton) {
      gsap.fromTo(
        targetButton,
        { scale: 0.94 },
        { scale: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    }
  }, [currentView]);

  return (
    <nav
      id="main-navbar"
      style={{ borderRadius: '21px' }}
      className="sticky top-3 sm:top-4 w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] max-w-[1440px] mx-auto z-50 transition-all duration-300 backdrop-blur-2xl backdrop-saturate-150 bg-white/70 dark:bg-[#0c0d12]/70 border border-white/60 dark:border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(255,255,255,0.04)] flex justify-between items-center px-5 md:px-7 py-2.5 sm:py-3"
    >
      <div className="flex items-center gap-6 md:gap-10">
          {/* Brand Logo with Morphing Text Animation on Click */}
          <button
            onClick={handleLogoClick}
            className="font-sans text-xl md:text-2xl font-extrabold text-primary tracking-tighter uppercase focus:outline-none cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 select-none min-w-[145px] md:min-w-[172px]"
            id="nav-logo"
            aria-label="SONIC_LAB Home"
          >
            <span className="relative inline-flex items-center h-7 md:h-8 w-[145px] md:w-[172px]">
              <MorphingText
                texts={['SONIC_LAB', 'AUDIO', 'SOUND', 'KITS', 'SONIC_LAB']}
                morphTime={0.65}
                cooldownTime={0.25}
                autoPlay={false}
                loop={false}
                trigger={logoMorphTrigger}
                triggerOnClick={true}
                className="h-7 md:h-8 w-[145px] md:w-[172px] text-xl md:text-2xl tracking-tighter uppercase text-left font-extrabold text-primary"
              />
            </span>
          </button>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1 font-sans text-sm font-medium tracking-wide">
            <button
              ref={browseRef}
              id="nav-link-browse"
              onClick={() => onNavigate('catalog')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors cursor-pointer select-none ${
                currentView === 'catalog'
                  ? 'bg-black/10 dark:bg-white/15 text-primary font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08]'
              }`}
            >
              Browse
            </button>
            <button
              ref={drumkitsRef}
              id="nav-link-drumkits"
              onClick={() => onNavigate('catalog')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] cursor-pointer transition-colors select-none"
            >
              Drum Kits
            </button>
            <button
              ref={samplesRef}
              id="nav-link-samples"
              onClick={() => onNavigate('catalog')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] cursor-pointer transition-colors select-none"
            >
              Sample Packs
            </button>
            <button
              ref={serumRef}
              id="nav-link-serum"
              onClick={() => onNavigate('catalog')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] cursor-pointer transition-colors select-none"
            >
              Serum Banks
            </button>
            <button
              ref={sellRef}
              id="nav-link-sell"
              onClick={() => onNavigate('sell')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors cursor-pointer select-none ${
                currentView === 'sell'
                  ? 'bg-black/10 dark:bg-white/15 text-primary font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08]'
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Theme Switcher Toggle */}
          <ThemeToggle id="nav-theme-switcher" />

          {/* Sell Button on Mobile / Tablet */}
          <button
            id="nav-btn-sell-mobile"
            onClick={() => onNavigate('sell')}
            className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-primary focus:outline-none"
            title="Vender som"
          >
            <Upload className="w-5 h-5" />
          </button>

          {/* Liquid Metal Checkout Cart Button */}
          <LiquidMetalButton
            id="nav-btn-cart"
            viewMode="icon"
            icon={<ShoppingCart className="w-4 h-4 text-white" />}
            badge={cartCount}
            onClick={onOpenCart}
            title="Carrinho de compras"
            ariaLabel="Carrinho de compras"
          />

          {/* Login or User Status */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                id="nav-btn-profile"
                onClick={() => onNavigate('profile')}
                className={`font-sans text-xs sm:text-sm cursor-pointer hover:underline transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] border ${
                  currentView === 'profile'
                    ? 'text-primary font-bold border-black/20 dark:border-white/30 bg-black/[0.06] dark:bg-white/15 shadow-sm'
                    : 'text-neutral-800 dark:text-neutral-200 border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.04] hover:border-black/30 dark:hover:border-white/30 hover:bg-black/[0.05] dark:hover:bg-white/10'
                }`}
                title="Meu Perfil"
              >
                <User className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs font-semibold max-w-[110px] truncate hidden sm:inline">
                  {userName || 'PRODUCER'}
                </span>
              </button>

              {onLogout && (
                <button
                  id="nav-btn-logout"
                  onClick={onLogout}
                  className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 border border-transparent dark:border-white/10 rounded-[8px] transition-colors cursor-pointer"
                  title="Sair / Desconectar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Liquid Metal Login Button & Register Button */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <LiquidMetalButton
                id="nav-btn-login"
                viewMode="text"
                label="Login"
                icon={<LogIn className="w-3.5 h-3.5 text-white" />}
                onClick={() => onNavigate('login')}
                title="Fazer login"
                ariaLabel="Fazer login"
              />
              <button
                id="nav-btn-register"
                onClick={() => onNavigate('register')}
                className={`font-mono text-xs px-2.5 sm:px-3 py-1.5 rounded-[9px] border cursor-pointer transition-all ${
                  currentView === 'register'
                    ? 'text-primary font-bold border-black dark:border-white bg-black/10 dark:bg-white/15 shadow-sm'
                    : 'text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white bg-black/[0.02] dark:bg-white/[0.04]'
                }`}
                title="Criar nova conta"
              >
                Cadastrar
              </button>
            </div>
          )}

          {/* Profile Switcher when not logged in */}
          {!isLoggedIn && (
            <button
              id="nav-btn-profile-guest"
              onClick={() => onNavigate('profile')}
              className={`font-sans text-xs sm:text-sm cursor-pointer hover:underline transition-all duration-200 flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] border border-transparent hover:border-black/20 dark:hover:border-white/20 ${
                currentView === 'profile'
                  ? 'text-primary font-bold border-black/20 dark:border-white/30 bg-black/[0.05] dark:bg-white/10'
                  : 'text-neutral-800 dark:text-neutral-200'
              }`}
            >
              <User className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline font-sans text-xs">Guest</span>
            </button>
          )}
        </div>
    </nav>
  );
}


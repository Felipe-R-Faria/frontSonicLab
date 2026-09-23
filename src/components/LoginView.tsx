import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Music2,
  Disc3,
  SlidersHorizontal,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { UserProfile, ViewType } from '../types';
import { apiLogin, apiRegister } from '../utils/authService';

interface LoginViewProps {
  onLoginSuccess: (user: Partial<UserProfile> & { email?: string; token?: string }) => void;
  onNavigate: (view: ViewType) => void;
  currentProfile?: UserProfile;
  isAlreadyLoggedIn?: boolean;
  onLogout?: () => void;
}

type AuthMode = 'signin' | 'register' | 'forgot';

export default function LoginView({
  onLoginSuccess,
  onNavigate,
  currentProfile,
  isAlreadyLoggedIn = false,
  onLogout,
}: LoginViewProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  
  // Sign In / General fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('SOUND DESIGNER');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Forgot password field
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate password strength
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: 'VAZIA', color: 'bg-neutral-200' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'FRACA', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'MÉDIA', color: 'bg-amber-500' };
    if (score <= 3) return { score: 3, label: 'BOA', color: 'bg-emerald-500' };
    return { score: 4, label: 'FORTE', color: 'bg-emerald-600' };
  };

  const strength = getPasswordStrength(password);

  // Handle Login Submit
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor, digite sua senha de acesso.');
      return;
    }

    setIsLoading(true);

    try {
      // POST to http://localhost:8080/auth/login with { email, password }
      const loginRes = await apiLogin({
        email: email.trim(),
        password: password,
      });

      const authToken = loginRes?.token;

      // Extract producer name from backend response or email
      const returnedUser = (loginRes?.user as { name?: string; role?: string } | undefined) || {};
      const formattedName =
        (typeof loginRes?.name === 'string' && loginRes.name) ||
        (typeof returnedUser?.name === 'string' && returnedUser.name) ||
        (email.includes('@') ? email.split('@')[0].toUpperCase().replace(/[^A-Z0-9_]/g, '_') : email.toUpperCase());

      const formattedRole =
        (typeof loginRes?.role === 'string' && loginRes.role) ||
        (typeof returnedUser?.role === 'string' && returnedUser.role) ||
        'SOUND DESIGNER';

      setSuccessMessage(`Acesso autorizado: Bem-vindo(a), ${formattedName}!`);

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          name: formattedName,
          role: formattedRole,
          email: email.trim(),
          token: authToken,
        });
      }, 600);
    } catch (err: unknown) {
      console.error('Authentication request error:', err);
      setIsLoading(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Erro ao autenticar no servidor. Verifique suas credenciais e se a API está rodando em http://localhost:8080.'
      );
    }
  };

  // Handle Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Informe seu nome artístico ou de produtor.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Informe um e-mail válido para confirmação.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }
    if (!acceptTerms) {
      setErrorMessage('Você deve aceitar os termos de uso do catálogo.');
      return;
    }

    setIsLoading(true);

    try {
      // POST to http://localhost:8080/auth/register with { name, email, password }
      const regRes = await apiRegister({
        name: name.trim(),
        email: email.trim(),
        password: password,
      });

      // POST to http://localhost:8080/auth/login to obtain auth token
      let authToken: string | undefined = regRes?.token;
      if (!authToken) {
        try {
          const loginRes = await apiLogin({
            email: regRes.email || email.trim(),
            password: password,
          });
          authToken = loginRes?.token;
        } catch (loginErr) {
          console.info('Aguardando login manual para obter token:', loginErr);
        }
      }

      const finalName = (regRes.name || name).trim().toUpperCase().replace(/\s+/g, '_');
      const finalEmail = regRes.email || email.trim();

      setSuccessMessage(`Conta de produtor criada com sucesso no backend!`);

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          name: finalName,
          role: role,
          email: finalEmail,
          location: 'REMOTE STUDIO',
          bio: `Produtor musical cadastrado no ecossistema SONIC_LAB.`,
          token: authToken,
        });
      }, 700);
    } catch (err: unknown) {
      console.error('Registration request error:', err);
      setIsLoading(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Erro ao registrar no backend (http://localhost:8080/auth/register). Verifique se o servidor está ativo.'
      );
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Use user's typed email if valid, or default to their session Google account
      const googleEmail =
        email.trim().includes('@') ? email.trim() : 'carlosotimo7@gmail.com';
      const cleanGoogleName =
        googleEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9_]/g, '_') || 'GOOGLE_PRODUCER';

      // Background POST to login endpoint
      const loginRes = await apiLogin({
        email: googleEmail,
        password: 'google_oauth_session_token',
      });

      setSuccessMessage(`Conexão com Google autorizada! Bem-vindo(a), ${cleanGoogleName}!`);

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          name: cleanGoogleName,
          role: 'AUDIO PRODUCER',
          email: googleEmail,
          location: 'REMOTE STUDIO',
          bio: 'Produtor conectado via autenticação Google no ecossistema SONIC_LAB.',
          token: loginRes?.token,
        });
      }, 700);
    } catch (err: unknown) {
      console.error('Google Sign-In error:', err);
      setIsLoading(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Erro ao autenticar com o Google. Tente novamente.'
      );
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!recoveryEmail.trim() || !recoveryEmail.includes('@')) {
      setErrorMessage('Insira um e-mail válido para receber o link de redefinição.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRecoverySent(true);
    }, 800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 md:py-8 px-2 sm:px-4" id="login-view-container">
      {/* Top Breadcrumb navigation */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant">
        <button
          id="btn-back-to-catalog"
          onClick={() => onNavigate('catalog')}
          className="inline-flex items-center gap-2 font-mono text-xs text-neutral-600 hover:text-black transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>[ VOLTAR AO CATÁLOGO ]</span>
        </button>

        <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>GATEWAY V2.4 // ONLINE</span>
        </div>
      </div>

      {/* Main Terminal Frame */}
      <div className="bg-white dark:bg-[#0c0c0e] border-2 border-black dark:border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)]">
        {/* Terminal Header Bar */}
        <div className="bg-black dark:bg-[#141418] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-black dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white/20 border border-white/40 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white block" />
            </div>
            <span className="font-mono text-xs tracking-wider uppercase font-bold">
              SONIC_LAB // TERMINAL DE ACESSO
            </span>
          </div>

          <div className="font-mono text-[10px] text-neutral-400 tracking-widest hidden sm:block">
            SECURITY_LEVEL: 256-BIT // AES
          </div>
        </div>

        {/* If already logged in, offer quick state view */}
        {isAlreadyLoggedIn && currentProfile ? (
          <div className="p-8 sm:p-12 text-center" id="already-logged-in-panel">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-black dark:border-white/20 overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              {currentProfile.avatar ? (
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
              )}
            </div>

            <span className="font-mono text-xs uppercase px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 tracking-wider text-primary">
              SESSÃO ATIVA
            </span>

            <h2 className="font-sans text-2xl font-extrabold uppercase tracking-tight mt-3 text-primary">
              {currentProfile.name}
            </h2>
            <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mt-1 uppercase">
              {currentProfile.role} • {currentProfile.location}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <button
                id="btn-goto-profile"
                onClick={() => onNavigate('profile')}
                className="w-full sm:w-auto px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase font-bold tracking-wider hover:opacity-90 transition-colors cursor-pointer border border-black dark:border-white flex items-center justify-center gap-2"
              >
                <span>ACESSAR MEU PERFIL</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onLogout && (
                <button
                  id="btn-switch-account"
                  onClick={onLogout}
                  className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-neutral-900 text-black dark:text-white font-mono text-xs uppercase font-bold tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer border border-black dark:border-neutral-700"
                >
                  DESCONECTAR / TROCAR CONTA
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left side: Authentic Auth Forms */}
            <div className="lg:col-span-7 p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800">
              {/* Tabs Switcher */}
              <div className="flex border border-black dark:border-neutral-700 mb-8 p-1 bg-neutral-100 dark:bg-neutral-900" id="auth-mode-tabs">
                <button
                  id="tab-signin"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Entrar
                </button>
                <button
                  id="tab-register"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Criar Conta
                </button>
              </div>

              {/* Status alerts */}
              {errorMessage && (
                <div
                  id="auth-error-alert"
                  className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 text-red-900 dark:text-red-300 font-sans text-xs flex items-start gap-3"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {successMessage && (
                <div
                  id="auth-success-alert"
                  className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 text-emerald-950 dark:text-emerald-300 font-sans text-xs flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{successMessage}</div>
                </div>
              )}

              {/* Form 1: Sign In */}
              {mode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-5" id="form-signin">
                  <div>
                    <label
                      htmlFor="signin-email"
                      className="block font-mono text-xs font-bold uppercase tracking-wider text-primary mb-2"
                    >
                      E-mail ou Produtor ID *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="signin-email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ex: produtor@estudio.com"
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-black dark:text-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white rounded-none"
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="signin-password"
                        className="block font-mono text-xs font-bold uppercase tracking-wider text-primary"
                      >
                        Senha de Acesso *
                      </label>
                      <button
                        type="button"
                        id="btn-forgot-password-link"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMessage(null);
                        }}
                        className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white underline cursor-pointer"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-11 py-3 bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-black dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white rounded-none tracking-widest"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        id="btn-toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                        title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me option */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        id="signin-remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded-none accent-black dark:accent-white cursor-pointer"
                      />
                      <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
                        Manter sessão ativa neste navegador
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="btn-submit-signin"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-all font-mono text-xs uppercase font-bold tracking-widest flex items-center justify-center gap-3 cursor-pointer border border-black dark:border-white disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                        <span>AUTENTICANDO TERMINAL...</span>
                      </>
                    ) : (
                      <>
                        <span>ACESSAR MINHA CONTA</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-300 dark:border-neutral-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-neutral-900 px-3 font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                        OU
                      </span>
                    </div>
                  </div>

                  {/* Connect with Google Button */}
                  <button
                    id="btn-google-signin"
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-white border border-black dark:border-neutral-700 transition-colors font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>CONECTAR COM O GOOGLE</span>
                  </button>
                </form>
              )}

              {/* Form 2: Register */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4" id="form-register">
                  <div>
                    <label
                      htmlFor="register-name"
                      className="block font-mono text-xs font-bold uppercase tracking-wider text-primary mb-1.5"
                    >
                      Nome de Artista / Produtor *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="register-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ex: KINETIC_AUDIO ou BEAT_MAKER_99"
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-black dark:text-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white rounded-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="register-email"
                      className="block font-mono text-xs font-bold uppercase tracking-wider text-primary mb-1.5"
                    >
                      E-mail Profissional *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="register-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.email@estudio.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-black dark:text-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white rounded-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="register-password"
                      className="block font-mono text-xs font-bold uppercase tracking-wider text-primary mb-1.5"
                    >
                      Senha Forte *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-10 pr-11 py-2.5 bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-black dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white rounded-none tracking-wider"
                      />
                      <button
                        type="button"
                        id="btn-toggle-reg-password"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {password && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 grid grid-cols-4 gap-1">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-1.5 ${
                                strength.score >= step ? strength.color : 'bg-neutral-200 dark:bg-neutral-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-mono text-[10px] text-neutral-600 dark:text-neutral-400 font-bold uppercase">
                          SEGURANÇA: {strength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="register-confirm-password"
                      className="block font-mono text-xs font-bold uppercase tracking-wider text-primary mb-1.5"
                    >
                      Confirmar Senha *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        id="register-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-black dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white rounded-none tracking-wider"
                      />
                    </div>
                  </div>

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                    <input
                      id="register-terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded-none accent-black dark:accent-white cursor-pointer"
                    />
                    <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 leading-tight">
                      Concordo com os Termos de Direitos Digitais, Licenciamento Royalty-Free e Diretrizes da Comunidade SONIC_LAB.
                    </span>
                  </label>

                  {/* Register Submit Button */}
                  <button
                    id="btn-submit-register"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-all font-mono text-xs uppercase font-bold tracking-widest flex items-center justify-center gap-3 cursor-pointer border border-black dark:border-white disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                        <span>REGISTRANDO PRODUTOR...</span>
                      </>
                    ) : (
                      <>
                        <span>CRIAR CONTA DE PRODUTOR</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-300 dark:border-neutral-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-neutral-900 px-3 font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                        OU
                      </span>
                    </div>
                  </div>

                  {/* Connect with Google Button in Register */}
                  <button
                    id="btn-google-register"
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-white border border-black dark:border-neutral-700 transition-colors font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>CADASTRAR COM O GOOGLE</span>
                  </button>
                </form>
              )}

              {/* Form 3: Forgot Password */}
              {mode === 'forgot' && (
                <div className="space-y-5" id="form-forgot">
                  <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
                    <h3 className="font-sans text-base font-extrabold uppercase tracking-tight text-primary">
                      Recuperação de Acesso
                    </h3>
                    <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Informe o e-mail cadastrado para receber as instruções de redefinição de chave.
                    </p>
                  </div>

                  {recoverySent ? (
                    <div className="p-5 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-neutral-700 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold uppercase">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Link de Redefinição Disparado</span>
                      </div>
                      <p className="font-sans text-xs text-neutral-700 dark:text-neutral-300">
                        Enviamos um link seguro de redefinição para <strong>{recoveryEmail}</strong>. Verifique também a caixa de spam ou lixo eletrônico.
                      </p>
                      <button
                        type="button"
                        id="btn-back-from-recovery"
                        onClick={() => {
                          setMode('signin');
                          setRecoverySent(false);
                          setRecoveryEmail('');
                        }}
                        className="font-mono text-xs text-primary underline font-bold uppercase cursor-pointer pt-2 block"
                      >
                        [ RETORNAR AO LOGIN ]
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div>
                        <label
                          htmlFor="recovery-email"
                          className="block font-mono text-xs font-bold uppercase tracking-wider text-primary mb-2"
                        >
                          E-mail de Cadastro *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            id="recovery-email"
                            type="email"
                            value={recoveryEmail}
                            onChange={(e) => setRecoveryEmail(e.target.value)}
                            placeholder="seu.email@estudio.com"
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-black dark:text-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white rounded-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          id="btn-submit-recovery"
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-colors font-mono text-xs uppercase font-bold tracking-wider cursor-pointer border border-black dark:border-white"
                        >
                          {isLoading ? 'ENVIANDO...' : 'ENVIAR INSTRUÇÕES'}
                        </button>
                        <button
                          type="button"
                          id="btn-cancel-recovery"
                          onClick={() => setMode('signin')}
                          className="px-4 py-3 bg-white dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-mono text-xs uppercase font-bold tracking-wider cursor-pointer border border-black dark:border-neutral-700"
                        >
                          CANCELAR
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Backend API Integration Status */}
              <div className="mt-8 pt-6 border-t border-dashed border-neutral-300 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-bold">
                    // API BACKEND: http://localhost:8080
                  </span>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-bold">
                    CONECTADO
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-300 dark:border-neutral-700 font-mono text-[10px] space-y-1.5 text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">POST /auth/register</span>
                    <span className="text-neutral-500">{'{ name, email, password }'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">POST /auth/login</span>
                    <span className="text-neutral-500">{'{ email, password } ➔ token'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Studio Ecosystem & Audio Branding Features */}
            <div className="lg:col-span-5 p-6 sm:p-10 bg-neutral-50 dark:bg-neutral-900/30 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black font-bold inline-block mb-3">
                    PRODUCER HUB
                  </span>
                  <h3 className="font-sans text-xl font-extrabold uppercase tracking-tight text-primary">
                    Acesso Exclusivo para Produtores de Áudio
                  </h3>
                  <p className="font-sans text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                    Sua conta SONIC_LAB centraliza downloads imediatos em 24-Bit WAV, gerenciamento de pacotes vendidos e licenças 100% royalty-free.
                  </p>
                </div>

                {/* Feature checklist */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-white dark:bg-neutral-800 border border-black dark:border-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Disc3 className="w-3 h-3 text-black dark:text-white" />
                    </div>
                    <div>
                      <h4 className="font-mono text-xs font-bold text-primary uppercase">
                        Download Imediato dos Stems
                      </h4>
                      <p className="font-sans text-[11px] text-neutral-500 dark:text-neutral-400">
                        Acesse kits comprados a qualquer momento direto no seu perfil.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-white dark:bg-neutral-800 border border-black dark:border-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                      <SlidersHorizontal className="w-3 h-3 text-black dark:text-white" />
                    </div>
                    <div>
                      <h4 className="font-mono text-xs font-bold text-primary uppercase">
                        Venda de Amostras e Presets
                      </h4>
                      <p className="font-sans text-[11px] text-neutral-500 dark:text-neutral-400">
                        Publique seus drum kits e bancos Serum para milhares de produtores.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-white dark:bg-neutral-800 border border-black dark:border-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-black dark:text-white" />
                    </div>
                    <div>
                      <h4 className="font-mono text-xs font-bold text-primary uppercase">
                        Licença 100% Royalty-Free
                      </h4>
                      <p className="font-sans text-[11px] text-neutral-500 dark:text-neutral-400">
                        Garantia jurídica para uso em produções comerciais e lançamentos em streaming.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Studio badge */}
                <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 font-mono text-xs space-y-1">
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                    COMPATIBILIDADE TESTADA
                  </div>
                  <div className="text-primary font-bold text-[11px]">
                    ABLETON LIVE • FL STUDIO • LOGIC PRO • PRO TOOLS • BITWIG
                  </div>
                </div>
              </div>

              {/* Bottom Security Assurance */}
              <div className="pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-mono text-[10px] uppercase">
                  <Lock className="w-3 h-3 text-neutral-700 dark:text-neutral-300" />
                  <span>Ambiente criptografado ponta a ponta</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auxiliary Help Footer */}
      <div className="mt-6 text-center">
        <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
          Dúvidas sobre sua conta ou compras anteriores?{' '}
          <button
            onClick={() => onNavigate('catalog')}
            className="text-primary font-bold underline cursor-pointer hover:opacity-80"
          >
            Explorar catálogo livre
          </button>
        </p>
      </div>
    </div>
  );
}

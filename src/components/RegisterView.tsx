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
  Disc3,
  SlidersHorizontal,
  ArrowLeft,
  UserPlus
} from 'lucide-react';
import { ViewType } from '../types';
import { apiRegister } from '../utils/authService';

interface RegisterViewProps {
  onRegisterSuccess: (registeredEmail: string) => void;
  onNavigate: (view: ViewType) => void;
}

export default function RegisterView({
  onRegisterSuccess,
  onNavigate,
}: RegisterViewProps) {
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password strength calculation
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

  // Handle Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Informe seu nome artístico ou de produtor.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Informe um e-mail válido para cadastro.');
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
      await apiRegister({
        name: name.trim(),
        email: email.trim(),
        password: password,
      });

      // Crucial: DO NOT log in automatically. Notify user and redirect to login screen
      setSuccessMessage('Conta criada com sucesso! Redirecionando para o login...');

      setTimeout(() => {
        setIsLoading(false);
        onRegisterSuccess(email.trim());
      }, 1200);
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

  return (
    <div className="min-h-[calc(100vh-140px)] w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <button
            id="btn-register-back-home"
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 font-mono text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>[RETORNAR AO CATÁLOGO]</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-neutral-500">Já é membro?</span>
            <button
              id="btn-go-to-login-top"
              type="button"
              onClick={() => onNavigate('login')}
              className="font-mono text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Fazer Login &rarr;
            </button>
          </div>
        </div>

        {/* Main Registration Card */}
        <div className="bg-white dark:bg-neutral-950 border border-black dark:border-white shadow-2xl p-6 sm:p-10 relative">
          {/* Header */}
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-mono font-bold text-base">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-mono text-xl sm:text-2xl font-bold uppercase tracking-tight text-black dark:text-white">
                  CADASTRO DE PRODUTOR
                </h1>
                <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                  SONIC_LAB // ACESSO DE CRIADOR & SOUND DESIGNER
                </p>
              </div>
            </div>
            <p className="font-sans text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2">
              Crie sua conta para publicar e comercializar suas livrarias de áudio ou baixar packs exclusivos.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div
              id="register-error-banner"
              className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-500 text-red-700 dark:text-red-300 font-mono text-xs flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold uppercase tracking-wider mb-1">// ERRO DE CADASTRO</div>
                <div className="font-sans leading-relaxed">{errorMessage}</div>
              </div>
            </div>
          )}

          {successMessage && (
            <div
              id="register-success-banner"
              className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500 text-emerald-800 dark:text-emerald-300 font-mono text-xs flex items-start gap-3 animate-fade-in"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold uppercase tracking-wider mb-1">// REGISTRO CONCLUÍDO</div>
                <div className="font-sans leading-relaxed">{successMessage}</div>
                <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                  Redirecionando para o login...
                </div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Field: Name */}
            <div>
              <label
                htmlFor="register-name"
                className="block font-mono text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Nome / Produtor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="register-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Guilherme Silva ou METRO_BOOMIN"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-black dark:text-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white rounded-none"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Field: Email */}
            <div>
              <label
                htmlFor="register-email"
                className="block font-mono text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                E-mail Corporativo ou de Estúdio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="register-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: produtor@estudio.com"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-black dark:text-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white rounded-none"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="register-password"
                  className="font-mono text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
                >
                  Senha de Acesso <span className="text-red-500">*</span>
                </label>
                {password && (
                  <span className="font-mono text-[10px] text-neutral-500">
                    FORÇA: <span className="font-bold text-black dark:text-white">{strength.label}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full pl-10 pr-10 py-3 bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-black dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white rounded-none"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                  tabIndex={-1}
                  aria-label="Alternar exibição de senha"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 transition-all ${
                        step <= strength.score ? strength.color : 'bg-neutral-200 dark:bg-neutral-800'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Field: Confirm Password */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="block font-mono text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Confirmar Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua senha"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-black dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white rounded-none"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  id="register-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-none border-black text-black focus:ring-black dark:border-neutral-700"
                />
                <span className="font-sans text-xs text-neutral-600 dark:text-neutral-400">
                  Concordo com os{' '}
                  <span className="font-semibold text-black dark:text-white underline">
                    Termos de Distribuição
                  </span>{' '}
                  e política de 100% Royalty-Free do ecossistema SONIC_LAB.
                </span>
              </label>
            </div>

            {/* Notice about manual login requirement */}
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>
                <strong>Nota de Segurança:</strong> Após cadastrar sua conta, você será redirecionado para a tela de login para realizar a autenticação e receber seu token.
              </span>
            </div>

            {/* Submit Button */}
            <button
              id="btn-register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-mono font-bold text-sm tracking-widest uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                  <span>REGISTRANDO NO BACKEND...</span>
                </>
              ) : (
                <>
                  <span>FINALIZAR CADASTRO</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer switch to Login */}
          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <p className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
              Já possui uma conta registrada?{' '}
              <button
                id="btn-register-switch-login"
                type="button"
                onClick={() => onNavigate('login')}
                className="font-bold text-primary hover:underline ml-1 cursor-pointer"
              >
                Fazer Login
              </button>
            </p>
          </div>

          {/* Backend Info Box */}
          <div className="mt-6 p-3 bg-neutral-50 dark:bg-neutral-900/60 border border-dashed border-neutral-300 dark:border-neutral-800 font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary">ENDPOINT DE REGISTRO:</span>
              <span>POST http://localhost:8080/auth/register</span>
            </div>
            <div className="mt-1 text-neutral-400">
              Payload: <code className="text-black dark:text-white">{'{ name, email, password }'}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

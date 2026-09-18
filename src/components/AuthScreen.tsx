import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, KeyRound, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { User } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'credentials' | 'two_factor'>('credentials');
  const [email, setEmail] = useState('admin@alphabit.sv');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA state
  const DEMO_OTP = '742918';
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'two_factor' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('two_factor');
      setResendTimer(45);
      setCanResend(false);
      // focus first input after a tick
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }, 450);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if complete
    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      verifyCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      verifyCode(pasted);
    }
  };

  const handleFillDemoCode = () => {
    const digits = DEMO_OTP.split('');
    setOtp(digits);
    inputRefs.current[5]?.focus();
    verifyCode(DEMO_OTP);
  };

  const verifyCode = (code: string) => {
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Accept demo code or any 6-digit code
      if (code.length === 6) {
        const user: User = {
          id: 'user_alphabit_admin',
          name: 'Equipo Creativo ALPHABIT',
          email: email.trim(),
          role: 'Director de Estudio',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          twoFactorVerified: true
        };
        if (rememberMe) {
          localStorage.setItem('alphabit_auth_user', JSON.stringify(user));
        } else {
          sessionStorage.setItem('alphabit_auth_user', JSON.stringify(user));
        }
        onLoginSuccess(user);
      } else {
        setError('Código inválido. Por favor verifica e intenta nuevamente.');
      }
    }, 500);
  };

  const handleVerifyClick = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setError('Por favor ingresa los 6 dígitos del código de verificación.');
      return;
    }
    verifyCode(fullCode);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle modern backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-100/60 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[350px] bg-slate-200/50 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand identity */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-extrabold text-xl mx-auto mb-3 shadow-studio-md font-['Outfit',sans-serif]">
            A
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight font-['Outfit',sans-serif]">
            ALPHABIT
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestor de Portafolio y Contenido del Estudio
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-studio-lg p-7 sm:p-8">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'credentials' ? (
            /* STEP 1: CREDENTIALS */
            <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 text-xs">
                    Correo Electrónico
                  </label>
                  <span className="text-[11px] text-slate-400">admin@alphabit.sv</span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@alphabit.sv"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 text-xs">
                    Contraseña
                  </label>
                  <span className="text-[11px] text-slate-400">Acceso Seguro</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0055FF] focus:ring-[#0055FF]"
                  />
                  <span>Recordar sesión</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setEmail('admin@alphabit.sv'); setPassword('alphabit2026'); }}
                  className="text-[11px] font-medium text-[#0055FF] hover:underline"
                >
                  Credenciales demo
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-accent w-full py-2.5 text-xs font-semibold mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <span>Continuar a Verificación 2FA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-400">
                  Acceso exclusivo para el equipo de diseño y dirección de ALPHABIT
                </span>
              </div>
            </form>
          ) : (
            /* STEP 2: TWO-FACTOR AUTH (2FA) */
            <form onSubmit={handleVerifyClick} className="space-y-5 text-xs">
              <div className="text-center space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0055FF] flex items-center justify-center mx-auto mb-2 border border-blue-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                  Verificación en 2 Pasos (2FA)
                </h3>
                <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
                  Ingresa el código de 6 dígitos generado para tu cuenta <strong className="text-slate-700">{email}</strong>
                </p>
              </div>

              {/* 6 Digit Input boxes */}
              <div className="flex items-center justify-center gap-2 pt-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-12 text-center text-lg font-bold font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-xs"
                  />
                ))}
              </div>

              {/* Quick Demo Autofill Pill */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  Código de demostración: <strong className="text-slate-800 font-mono font-bold">{DEMO_OTP}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleFillDemoCode}
                  className="px-2 py-1 rounded-md bg-white border border-slate-200 font-semibold text-[#0055FF] hover:bg-blue-50 transition-colors"
                >
                  Auto-llenar
                </button>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-accent w-full py-2.5 text-xs font-semibold cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verificando código...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verificar y Entrar al Estudio</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setOtp(['', '', '', '', '', '']); }}
                    className="text-slate-500 hover:text-slate-800 font-medium"
                  >
                    &larr; Volver al inicio de sesión
                  </button>

                  <button
                    type="button"
                    disabled={!canResend}
                    onClick={() => {
                      setResendTimer(45);
                      setCanResend(false);
                      setError(null);
                    }}
                    className={`font-medium ${canResend ? 'text-[#0055FF] hover:underline cursor-pointer' : 'text-slate-400 cursor-not-allowed'}`}
                  >
                    {canResend ? 'Reenviar código' : `Reenviar en ${resendTimer}s`}
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Autenticación de 2 Factores Encriptada</span>
        </div>

      </div>
    </div>
  );
};

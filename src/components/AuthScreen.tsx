import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ChevronLeft,
  Shield
} from 'lucide-react';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  // Navigation modes:
  // - 'credentials': login / register first admin
  // - 'two_factor': 2FA OTP verification for login/register
  // - 'forgot_email': Enter email for recovery
  // - 'reset_2fa': Enter OTP + new password
  const [mode, setMode] = useState<'credentials' | 'two_factor' | 'forgot_email' | 'reset_2fa'>('credentials');
  
  // Database state: whether at least 1 administrator exists
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState<boolean>(true);

  // Form fields (Nombre completo input placeholder and initial value are empty)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // 2FA state
  const [otpCode, setOtpCode] = useState('');
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [smtpStatusMessage, setSmtpStatusMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [smtpConfigured, setSmtpConfigured] = useState<boolean>(true);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Interactive Antigravity / Parallax cursor coordinates
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalized coordinates (-1 to 1) from window center
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Check admin status from backend on mount
  const checkAdminStatus = async () => {
    setIsCheckingAdmin(true);
    setError(null);
    try {
      const res = await apiService.getAdminStatus();
      setHasAdmin(Boolean(res.hasAdmin));
    } catch {
      setHasAdmin(true);
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  // 60-second cooldown timer for 2FA resend
  useEffect(() => {
    let interval: any;
    if ((mode === 'two_factor' || mode === 'reset_2fa') && resendTimer > 0) {
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
  }, [mode, resendTimer]);

  const validateEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const validatePassword = (val: string): boolean => {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(val);
  };

  // Submit initial form
  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Por favor introduce tu correo electrónico.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('Introduce un formato válido de correo electrónico (ej. usuario@dominio.com).');
      return;
    }

    if (!password) {
      setError('Por favor introduce tu contraseña.');
      return;
    }

    // Register first admin
    if (!hasAdmin) {
      const cleanName = name.trim();
      if (!cleanName || cleanName.length < 2) {
        setError('El nombre completo es obligatorio (mínimo 2 caracteres).');
        return;
      }

      if (!validatePassword(password)) {
        setError('La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await apiService.registerAdmin(cleanName, cleanEmail, password, confirmPassword);
        setSmtpConfigured(Boolean(res.smtpConfigured));
        setDevOtpCode(res.devCode || null);
        setSmtpStatusMessage(res.smtpSent ? null : (res.smtpReason || 'Envío por correo no disponible'));
        setMode('two_factor');
        setResendTimer(30);
        setCanResend(false);
        setOtpCode('');
      } catch (err: any) {
        setError(err.message || 'No fue posible registrar la cuenta administrativa.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Existing admin login
      setIsLoading(true);
      try {
        const res = await apiService.loginAdmin(cleanEmail, password);
        setSmtpConfigured(Boolean(res.smtpConfigured));
        setDevOtpCode(res.devCode || null);
        setSmtpStatusMessage(res.smtpSent ? null : (res.smtpReason || 'Envío por correo no disponible'));
        setMode('two_factor');
        setResendTimer(30);
        setCanResend(false);
        setOtpCode('');
      } catch (err: any) {
        if (err.noAdmin) {
          setHasAdmin(false);
          setError('No hay administradores registrados aún. Por favor crea la cuenta principal.');
        } else {
          setError(err.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Submit 2FA verification for Login / Register (supports auto-submit)
  const handleVerify2fa = async (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    const targetCode = customCode !== undefined ? customCode : otpCode;
    const cleanOtp = targetCode.trim().replace(/[\s\-]/g, '').toUpperCase();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Introduce el código de 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.verify2fa(email.trim().toLowerCase(), cleanOtp);
      if (res.token) {
        apiService.setAuthToken(res.token, true);
      }
      localStorage.setItem('alphabit_auth_user', JSON.stringify(res.user));
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'El código de verificación es incorrecto.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Forgot Password request (sends 2FA code)
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setError('Introduce un correo electrónico válido.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.forgotPassword(cleanEmail);
      setSmtpConfigured(Boolean(res.smtpConfigured));
      setDevOtpCode(res.devCode || null);
      setSmtpStatusMessage(res.smtpSent ? null : (res.smtpReason || 'Envío por correo no disponible'));
      setMode('reset_2fa');
      setResendTimer(30);
      setCanResend(false);
      setOtpCode('');
      setSuccessNotice(`Código de recuperación generado para ${cleanEmail}`);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setError(err.message || 'No fue posible procesar la recuperación de contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Password Reset with 2FA
  const handleResetPasswordWith2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    const cleanOtp = otpCode.trim().replace(/[\s\-]/g, '').toUpperCase();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Introduce el código de verificación de 6 caracteres.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('La nueva contraseña debe tener al menos 8 caracteres (letras y números).');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Las nuevas contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.resetPassword(email.trim().toLowerCase(), cleanOtp, newPassword, confirmNewPassword);
      if (res.token) {
        apiService.setAuthToken(res.token, true);
      }
      localStorage.setItem('alphabit_auth_user', JSON.stringify(res.user));
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'No fue posible restablecer la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend 2FA code (Login or Reset)
  const handleResendCode = async () => {
    if (!canResend || isLoading) return;
    setError(null);
    setSuccessNotice(null);
    setIsLoading(true);

    try {
      let res: any;
      if (mode === 'reset_2fa') {
        res = await apiService.forgotPassword(email.trim().toLowerCase());
      } else {
        res = await apiService.resend2fa(email.trim().toLowerCase());
      }
      setDevOtpCode(res.devCode || null);
      setSmtpStatusMessage(res.smtpSent ? null : (res.smtpReason || 'Envío por correo no disponible'));
      setSuccessNotice('Se ha generado un nuevo código de verificación.');
      setResendTimer(30);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || 'No fue posible reenviar el código. Inténtalo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setMode('credentials');
    setOtpCode('');
    setDevOtpCode(null);
    setSmtpStatusMessage(null);
    setError(null);
    setSuccessNotice(null);
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-5 h-5 text-slate-700 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Iniciando...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      
      {/* Dynamic Antigravity Liquid Glass Circles (Floating & Cursor Responsive) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Soft Violet/Lavender Ambient Bubble - Reacts to cursor */}
        <div 
          className="absolute -top-16 -left-16 w-[440px] h-[440px] rounded-full bg-gradient-to-br from-violet-200/45 via-purple-100/35 to-transparent blur-[85px] transition-transform duration-700 ease-out will-change-transform"
          style={{
            transform: `translate(${mousePos.x * -35}px, ${mousePos.y * -35}px)`
          }}
        />
        
        {/* Warm Peach / Amber Glow - Counter floating */}
        <div 
          className="absolute top-1/4 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-amber-200/40 via-rose-100/30 to-transparent blur-[90px] transition-transform duration-1000 ease-out will-change-transform"
          style={{
            transform: `translate(${mousePos.x * 45}px, ${mousePos.y * 45}px)`
          }}
        />
        
        {/* Fresh Emerald / Mint Accent */}
        <div 
          className="absolute -bottom-24 left-1/3 w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-emerald-100/50 via-teal-100/30 to-transparent blur-[95px] transition-transform duration-700 ease-out will-change-transform"
          style={{
            transform: `translate(${mousePos.x * -25}px, ${mousePos.y * 30}px)`
          }}
        />

        {/* Antigravity Glass Ring 1 - Floating with subtle rotation */}
        <div 
          className="absolute top-20 right-[18%] w-56 h-56 rounded-full border border-violet-400/20 bg-white/40 backdrop-blur-[6px] shadow-[0_8px_32px_rgba(139,92,246,0.08)] transition-transform duration-500 ease-out will-change-transform animate-[pulse_6s_ease-in-out_infinite]"
          style={{
            transform: `translate(${mousePos.x * 28}px, ${mousePos.y * 28}px)`
          }}
        />

        {/* Antigravity Glass Ring 2 - Small floating orb */}
        <div 
          className="absolute bottom-28 left-[14%] w-36 h-36 rounded-full border border-teal-400/25 bg-white/50 backdrop-blur-[4px] shadow-[0_8px_24px_rgba(20,184,166,0.08)] transition-transform duration-700 ease-out will-change-transform"
          style={{
            transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)`
          }}
        />

        {/* Antigravity Floating Mini Orb */}
        <div 
          className="absolute top-1/2 left-[8%] w-20 h-20 rounded-full border border-rose-300/30 bg-white/40 backdrop-blur-[3px] shadow-[0_4px_16px_rgba(244,63,94,0.08)] transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `translate(${mousePos.x * 20}px, ${mousePos.y * -20}px)`
          }}
        />
      </div>

      {/* Brand Header */}
      <div className="relative z-10 text-center mb-6">
        <h1 className="text-2xl font-bold tracking-[0.22em] text-slate-900 font-['Outfit',sans-serif]">
          ALPHABIT
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Panel de Administración
        </p>
      </div>

      {/* Main Pure White Liquid Glass Card */}
      <div 
        className="relative z-10 w-full max-w-[420px] rounded-3xl p-6 sm:p-8 bg-white/80 backdrop-blur-2xl border border-white shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08),0_0_0_1px_rgba(226,232,240,0.6)] transition-all duration-300 hover:shadow-[0_25px_60px_-12px_rgba(15,23,42,0.12),0_0_0_1px_rgba(203,213,225,0.8)]"
        style={{
          transform: `perspective(1000px) rotateX(${mousePos.y * -1.5}deg) rotateY(${mousePos.x * 1.5}deg)`
        }}
      >
        
        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Success notification */}
        {successNotice && (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex-1 leading-relaxed">{successNotice}</div>
          </div>
        )}

        {/* MODE 1: CREDENTIALS (CREAR ADMINISTRADOR vs INICIAR SESIÓN) */}
        {mode === 'credentials' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                {!hasAdmin ? 'Crear Administrador' : 'Iniciar Sesión'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {!hasAdmin 
                  ? 'Configura la cuenta principal para acceder al sistema.' 
                  : 'Ingresa tus credenciales administrativas.'}
              </p>
            </div>

            <form onSubmit={handleSubmitCredentials} className="space-y-4">
              
              {/* Name (only when 0 admins exist) - COMPLETELY EMPTY INPUT AS REQUESTED */}
              {!hasAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=""
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/90 border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all duration-200 disabled:opacity-50 shadow-sm"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/90 border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all duration-200 disabled:opacity-50 shadow-sm"
                />
              </div>

              {/* Password with View toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Contraseña
                  </label>
                  {hasAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setSuccessNotice(null);
                        setMode('forgot_email');
                      }}
                      className="text-[11px] font-medium text-violet-600 hover:text-violet-700 hover:underline transition-colors cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 pr-11 text-xs rounded-xl bg-white/90 border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all duration-200 disabled:opacity-50 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password with View toggle (Only when registering) */}
              {!hasAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder=""
                      disabled={isLoading}
                      className="w-full px-3.5 py-2.5 pr-11 text-xs rounded-xl bg-white/90 border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all duration-200 disabled:opacity-50 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Button: Refined dark/violet contrast */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-md shadow-slate-900/15 hover:shadow-slate-900/25 hover:scale-[1.008] active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>{!hasAdmin ? 'Crear Administrador' : 'Iniciar Sesión'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* MODE 2: 2FA VERIFICATION (LOGIN / REGISTER) */}
        {mode === 'two_factor' && (
          <div>
            <button
              type="button"
              onClick={handleBackToCredentials}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                Verificación de dos pasos
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Introduce el código de 6 caracteres enviado a <strong className="text-slate-800">{email}</strong>.
              </p>
            </div>



            <form onSubmit={handleVerify2fa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Código de verificación
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                    setOtpCode(val);
                    if (val.length === 6) {
                      handleVerify2fa(undefined, val);
                    }
                  }}
                  placeholder=""
                  disabled={isLoading}
                  className="w-full text-center tracking-[0.45em] font-mono text-base font-bold px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all duration-200 disabled:opacity-50 shadow-sm"
                />
                <span className="block text-[11px] text-slate-400 mt-1.5 text-center">
                  El código expira en 10 minutos y es de un solo uso.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || otpCode.trim().length < 6}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-md shadow-slate-900/15 hover:shadow-slate-900/25 hover:scale-[1.008] active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <span>Verificar y acceder</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    Reenviar código
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Puedes solicitar otro código en {resendTimer} segundos
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* MODE 3: FORGOT PASSWORD REQUEST */}
        {mode === 'forgot_email' && (
          <div>
            <button
              type="button"
              onClick={handleBackToCredentials}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                Recuperar Contraseña
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ingresa tu correo registrado. Te enviaremos un código de seguridad para verificar tu identidad y restablecer la contraseña.
              </p>
            </div>

            <form onSubmit={handleRequestPasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Correo electrónico registrado
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all duration-200 disabled:opacity-50 shadow-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-md shadow-slate-900/15 hover:shadow-slate-900/25 hover:scale-[1.008] active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando código...</span>
                    </>
                  ) : (
                    <span>Enviar código de recuperación</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODE 4: RESET PASSWORD WITH 2FA VERIFICATION */}
        {mode === 'reset_2fa' && (
          <div>
            <button
              type="button"
              onClick={handleBackToCredentials}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                Nueva Contraseña
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ingresa el código 2FA enviado a <strong className="text-slate-800">{email}</strong> y define tu nueva contraseña.
              </p>
            </div>



            <form onSubmit={handleResetPasswordWith2fa} className="space-y-4">
              {/* 2FA Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Código de verificación (6 caracteres)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder=""
                  disabled={isLoading}
                  className="w-full text-center tracking-[0.45em] font-mono text-base font-bold px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all duration-200 disabled:opacity-50 shadow-sm"
                />
              </div>

              {/* New Password with View toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder=""
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 pr-11 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all duration-200 disabled:opacity-50 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                    aria-label={showNewPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password with View toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder=""
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 pr-11 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all duration-200 disabled:opacity-50 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    tabIndex={-1}
                    aria-label={showConfirmNewPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || otpCode.trim().length < 6}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-md shadow-slate-900/15 hover:shadow-slate-900/25 hover:scale-[1.008] active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Actualizando contraseña...</span>
                    </>
                  ) : (
                    <span>Restablecer y acceder</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    Reenviar código
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Puedes solicitar otro código en {resendTimer} segundos
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

      </div>

    </div>
  );
};

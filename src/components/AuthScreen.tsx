import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound, 
  RefreshCw, 
  AlertCircle, 
  UserPlus, 
  LogIn, 
  User as UserIcon, 
  Copy, 
  Check, 
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'credentials' | 'two_factor'>('credentials');
  
  // Registration & Login fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSystem, setIsCheckingSystem] = useState(true);
  const [hasRegisteredUsers, setHasRegisteredUsers] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // 2FA state
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [directGmailUrl, setDirectGmailUrl] = useState<string | null>(null);
  const [mailtoUrl, setMailtoUrl] = useState<string | null>(null);
  const [sentViaSmtp, setSentViaSmtp] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if system has any registered users initially
  const checkInitialUsers = async () => {
    setIsCheckingSystem(true);
    try {
      const status = await apiService.getAuthStatus();
      setHasRegisteredUsers(status.hasUsers);
      if (!status.hasUsers) {
        setTab('register');
        setInfoMessage('No hay administradores registrados aún en el sistema. Debes crear la cuenta principal para acceder.');
      } else {
        setTab('login');
      }
    } catch {
      // Default to login if offline
      setTab('login');
    } finally {
      setIsCheckingSystem(false);
    }
  };

  useEffect(() => {
    checkInitialUsers();
  }, []);

  // 2FA Resend Countdown timer
  useEffect(() => {
    let interval: any;
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

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!password) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.loginAdmin(cleanEmail, password);
      setGeneratedCode(res.code || null);
      setDirectGmailUrl(res.directGmailUrl || null);
      setMailtoUrl(res.mailtoUrl || null);
      setSentViaSmtp(Boolean(res.sentViaSmtp));
      setStep('two_factor');
      setResendTimer(45);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
      if (err.notRegistered) {
        setTab('register');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || cleanName.length < 2) {
      setError('El nombre completo debe tener al menos 2 caracteres.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Por favor ingresa un correo electrónico válido (ej. 20240035@ricaldone.edu.sv).');
      return;
    }

    if (!password || password.length < 6) {
      setError('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.registerAdmin(cleanName, cleanEmail, password);
      setGeneratedCode(res.code || null);
      setDirectGmailUrl(res.directGmailUrl || null);
      setMailtoUrl(res.mailtoUrl || null);
      setSentViaSmtp(Boolean(res.sentViaSmtp));
      setStep('two_factor');
      setResendTimer(45);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Error al registrar la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend 2FA
  const handleResend = async () => {
    if (!canResend) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiService.resend2fa(email.trim());
      setGeneratedCode(res.code || null);
      setDirectGmailUrl(res.directGmailUrl || null);
      setMailtoUrl(res.mailtoUrl || null);
      setSentViaSmtp(Boolean(res.sentViaSmtp));
      setResendTimer(45);
      setCanResend(false);
      setInfoMessage('Se ha enviado un nuevo código de seguridad a tu correo.');
    } catch (err: any) {
      setError(err.message || 'Error al reenviar código.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Inputs handling
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit on 6 digits
    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      submitVerification(fullCode);
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
      submitVerification(pasted);
    }
  };

  // Quick fill generated code
  const handleFillCode = () => {
    if (!generatedCode) return;
    const digits = generatedCode.split('');
    setOtp(digits);
    inputRefs.current[5]?.focus();
    submitVerification(generatedCode);
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Verify OTP submission
  const submitVerification = async (codeToVerify: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await apiService.verify2fa(email.trim(), codeToVerify);
      if (res.user) {
        if (rememberMe) {
          localStorage.setItem('alphabit_auth_user', JSON.stringify(res.user));
        } else {
          sessionStorage.setItem('alphabit_auth_user', JSON.stringify(res.user));
        }
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Código inválido o expirado. Por favor verifica los 6 dígitos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setError('Por favor ingresa los 6 dígitos del código de verificación.');
      return;
    }
    submitVerification(fullCode);
  };

  // Reset users in DB (for testing initial state)
  const handleResetUsersForTesting = async () => {
    if (window.confirm('¿Deseas reiniciar la base de datos de usuarios a 0 para probar el registro desde cero?')) {
      await apiService.resetUsers();
      setEmail('');
      setPassword('');
      setName('');
      setConfirmPassword('');
      setStep('credentials');
      await checkInitialUsers();
    }
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
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-extrabold text-xl mx-auto mb-3 shadow-studio-md font-['Outfit',sans-serif]">
            A
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight font-['Outfit',sans-serif]">
            ALPHABIT
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Panel Administrativo &bull; Servicios Digitales
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-studio-lg p-6 sm:p-8">
          
          {/* Messages */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 text-xs flex items-start gap-2 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#0055FF]" />
              <span className="leading-relaxed">{infoMessage}</span>
            </div>
          )}

          {step === 'credentials' ? (
            <>
              {/* Tabs: Login vs Register */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(null); }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    tab === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setError(null); }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    tab === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrarse</span>
                  {!hasRegisteredUsers && hasRegisteredUsers !== null && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </button>
              </div>

              {tab === 'login' ? (
                /* TAB 1: LOGIN */
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-semibold text-slate-700 text-xs">
                        Correo Electrónico
                      </label>
                      <span className="text-[11px] text-slate-400">Gmail o Institucional</span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu-correo@ricaldone.edu.sv"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-semibold text-slate-700 text-xs">
                        Contraseña
                      </label>
                      <span className="text-[11px] text-slate-400">Mínimo 6 caracteres</span>
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
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-accent w-full py-2.5 text-xs font-semibold mt-2 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verificando credenciales...</span>
                      </>
                    ) : (
                      <>
                        <span>Continuar a Verificación 2FA</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-[11px] text-slate-500">
                    ¿No tienes cuenta registrada?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('register'); setError(null); }}
                      className="text-[#0055FF] font-semibold hover:underline"
                    >
                      Regístrate aquí
                    </button>
                  </div>
                </form>
              ) : (
                /* TAB 2: REGISTER */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Rodrigo Morales"
                        className="w-full pl-10 pr-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-semibold text-slate-700 text-xs">
                        Correo Electrónico
                      </label>
                      <span className="text-[10px] text-slate-400">Recibirás tu código 2FA aquí</span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="20240035@ricaldone.edu.sv"
                        className="w-full pl-10 pr-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-xs">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mín. 6 chars"
                          className="w-full pl-8 pr-2.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-xs">
                        Confirmar
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repite clave"
                          className="w-full pl-8 pr-2.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-accent w-full py-2.5 text-xs font-semibold mt-2 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Registrando y enviando 2FA...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Crear Cuenta y Recibir Código 2FA</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-[11px] text-slate-500">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('login'); setError(null); }}
                      className="text-[#0055FF] font-semibold hover:underline"
                    >
                      Inicia sesión
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* STEP 2: TWO-FACTOR AUTH (2FA) */
            <form onSubmit={handleManualVerify} className="space-y-4 text-xs">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0055FF] flex items-center justify-center mx-auto mb-1.5 border border-blue-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                  Código de Verificación 2FA
                </h3>
                <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
                  Código de 6 dígitos enviado a <strong className="text-slate-800 break-all">{email}</strong>
                </p>
              </div>

              {/* GMAIL & DIRECT DISPATCH ACTION CARD */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Código generado con éxito
                  </span>
                  {sentViaSmtp && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Enviado por Gmail SMTP
                    </span>
                  )}
                </div>

                {/* Display Code with 1-click Copy & Autofill */}
                {generatedCode && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between shadow-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Código numérico:</div>
                      <div className="text-xl font-bold font-mono tracking-widest text-[#0055FF]">
                        {generatedCode}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copiado' : 'Copiar'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleFillCode}
                        className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-[#0055FF] font-semibold text-[11px] transition-colors"
                      >
                        Auto-llenar
                      </button>
                    </div>
                  </div>
                )}

                {/* GMAIL WEB & MAILTO BUTTONS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {directGmailUrl && (
                    <a
                      href={directGmailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200/80 text-red-700 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Abrir en Gmail</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {mailtoUrl && (
                    <a
                      href={mailtoUrl}
                      className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Cliente de correo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* 6 Digit Input boxes */}
              <div className="flex items-center justify-center gap-2 pt-1" onPaste={handlePaste}>
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

              {/* Submit & Navigation */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-accent w-full py-2.5 text-xs font-semibold cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verificando código...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verificar y Entrar al Panel</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setOtp(['', '', '', '', '', '']); setError(null); }}
                    className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                  >
                    &larr; Volver
                  </button>

                  <button
                    type="button"
                    disabled={!canResend || isLoading}
                    onClick={handleResend}
                    className={`font-medium ${
                      canResend && !isLoading
                        ? 'text-[#0055FF] hover:underline cursor-pointer'
                        : 'text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canResend ? 'Reenviar código' : `Reenviar en ${resendTimer}s`}
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>

        {/* Security badge & Testing controls */}
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Autenticación 2FA encriptada con persistencia</span>
          </div>

          <button
            type="button"
            onClick={handleResetUsersForTesting}
            className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
            title="Borra todos los usuarios registrados para probar el sistema sin usuarios iniciales"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Probar flujo inicial (vaciar usuarios registrados)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

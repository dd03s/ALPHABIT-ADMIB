import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShieldAlert, 
  KeyRound, 
  Mail, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAccountDeleted: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAccountDeleted
}) => {
  const [step, setStep] = useState<'initial' | 'otp_verification'>('initial');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    if (isLoading) return;
    setStep('initial');
    setCode('');
    setDevCode(null);
    setErrorMessage('');
    setInfoMessage('');
    onClose();
  };

  // Paso 1: Solicitar código A2F de borrado
  const handleRequestOtp = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    setDevCode(null);

    try {
      const res = await apiService.requestDeleteAccount();
      if (res.devCode) {
        setDevCode(res.devCode);
      }
      setInfoMessage(
        res.smtpSent
          ? `Se envió un código de verificación A2F a ${res.email}. Ingrésalo a continuación para confirmar.`
          : `Código de seguridad A2F generado para ${res.email}. Revisa tu bandeja de correo para confirmar.`
      );
      setStep('otp_verification');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al solicitar el código de verificación.');
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: Confirmar código A2F y borrar la cuenta
  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().replace(/[\s\-]/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      setErrorMessage('Por favor ingresa el código de 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await apiService.confirmDeleteAccount(cleanCode);
      // Éxito: cuenta eliminada
      onAccountDeleted();
    } catch (err: any) {
      setErrorMessage(err.message || 'El código ingresado es incorrecto o ha expirado.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header banner */}
        <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950 font-['Outfit',sans-serif]">
                Zona de Seguridad: Eliminar Cuenta
              </h3>
              <p className="text-[11px] text-rose-600 font-medium">
                Acción crítica e irreversible
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'initial' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 text-xs space-y-2">
                <p className="font-semibold text-slate-900">
                  Estás a punto de solicitar la baja de tu cuenta:
                </p>
                <div className="flex items-center gap-2 text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-slate-800 font-medium">{currentUser?.email}</span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Al eliminar tu cuenta de administrador, tus permisos de acceso se revocarán de inmediato. 
                  Por motivos de seguridad contra accesos no autorizados, este proceso exige confirmación por doble factor (A2F).
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <p>
                  Te enviaremos un código de seguridad de 6 dígitos a tu correo institucional para verificar que realmente eres tú quien realiza la solicitud.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando código A2F...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Enviar código A2F al correo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmDelete} className="space-y-4">
              {infoMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{infoMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Código de Confirmación (A2F)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                    placeholder="••••••"
                    maxLength={6}
                    autoFocus
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono tracking-[0.4em] font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-300"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Introduce el código de 6 caracteres enviado a tu correo.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('initial')}
                  disabled={isLoading}
                  className="text-xs text-slate-500 hover:text-slate-700 underline font-medium"
                >
                  Volver atrás
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verificando y borrando...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirmar Eliminación Definitiva</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

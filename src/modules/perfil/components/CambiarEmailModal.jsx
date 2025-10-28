/**
 * @file CambiarEmailModal.jsx
 * @description Componente de Interfaz de Usuario (UI) que presenta el flujo de cambio de correo.
 * Este es un componente "tonto" o "presentacional". No contiene lógica de negocio;
 * su única responsabilidad es renderizar la UI basándose en el estado que recibe del
 * hook `useCambiarEmail` y conectar las interacciones del usuario (clics, envíos) a los
 * manejadores proporcionados por ese hook.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal es visible.
 * @param {function} props.onClose - Función para notificar al componente padre que se debe cerrar el modal.
 * @returns {JSX.Element}
 */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../../components/ui/Modal';
import Spinner from '../../../components/ui/Spinner';
import { FiKey, FiMail, FiCheckCircle } from 'react-icons/fi';
import { useCambiarEmail } from '../hooks/useCambiarEmail';
import { STYLES } from '../../../utils/styleConstants';

const CambiarEmailModal = ({ isOpen, onClose }) => {
    // --- CONSUMO DEL HOOK DE LÓGICA ---
    // Aquí es donde la magia sucede. Obtenemos todo el estado y la lógica del hook.
    // Este componente no sabe *cómo* se verifica una contraseña, solo sabe que debe
    // llamar a `handleVerificarPassword`.
    const {
        pasoActual, isSubmitting, emailPendiente, PASOS,
        formPassword, formEmail,
        handleVerificarPassword, handleSolicitarCambio,
        resetFlujo, finalizarYcerrar,
    } = useCambiarEmail({ onSuccess: onClose });

    // --- EFECTO DE SINCRONIZACIÓN ---
    // Este efecto garantiza que cada vez que el modal se abre, el flujo se reinicia.
    useEffect(() => {
        if (isOpen) {
            resetFlujo();
        }
    }, [isOpen, resetFlujo]); // Dependencias: el efecto se re-ejecuta si `isOpen` cambia.

    // --- PREPARACIÓN PARA EL RENDERIZADO ---
    // Desestructuramos las propiedades necesarias de `react-hook-form` para mantener el JSX limpio.
    const { register: registerPass,
        handleSubmit: handleSubmitPass,
        formState: { errors: errorsPass }
    } = formPassword;
    const { register: registerEmail,
        handleSubmit: handleSubmitEmail,
        formState: { errors: errorsEmail }
    } = formEmail;

    // Función de ayuda para determinar el título del modal. Mantiene el JSX principal más limpio.
    const getTitle = () => {
        switch (pasoActual) {
            case PASOS.VERIFICAR_PASS: return 'Verificar Identidad';
            case PASOS.INGRESAR_EMAIL: return 'Ingresar Nuevo Correo';
            case PASOS.CONFIRMACION_ENVIADA: return 'Verificación Enviada';
            default: return 'Cambiar Correo';
        }
    };

    // --- ESTRUCTURA JSX ---
    return (
        // Utilizamos nuestro componente genérico `Modal` como contenedor.
        // Le pasamos el control de visibilidad y cierre.
        <Modal isOpen={isOpen} onClose={finalizarYcerrar} title={getTitle()}>

            {/* Sección de instrucciones para el usuario */}
            <div className="text-secondary mb-6 text-center">
                {pasoActual === PASOS.VERIFICAR_PASS && <p>Por tu seguridad, ingresa tu contraseña actual para continuar.</p>}
                {pasoActual === PASOS.INGRESAR_EMAIL && <p>Introduce tu nueva dirección de correo. Te enviaremos un enlace para confirmar el cambio.</p>}
            </div>

            {/* Renderizado condicional del cuerpo del modal basado en el paso actual */}

            {/* PASO 1: Formulario de Contraseña */}
            {pasoActual === PASOS.VERIFICAR_PASS && (
                <form onSubmit={handleSubmitPass(handleVerificarPassword)} noValidate>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="contraseña" className={STYLES.label}>Contraseña Actual</label>
                            <div className="relative">
                                <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="contraseña"
                                    type="password"
                                    {...registerPass('contraseña')}
                                    className={`${STYLES.input} pl-10 ${errorsPass.contraseña ? 'border-red-500' : ''}`}
                                    autoFocus
                                />
                            </div>
                            {errorsPass.contraseña && <p className="text-red-500 text-sm mt-1">{errorsPass.contraseña.message}</p>}
                        </div>
                        {/* Botones de acción para el formulario */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={finalizarYcerrar} className="btn-secondary" disabled={isSubmitting}>Cancelar</button>
                            <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? <Spinner /> : 'Verificar'}</button>
                        </div>
                    </div>
                </form>
            )}

            {/* PASO 2: Formulario de Nuevo Email */}
            {pasoActual === PASOS.INGRESAR_EMAIL && (
                <form onSubmit={handleSubmitEmail(handleSolicitarCambio)} noValidate>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="nuevoEmail" className={STYLES.label}>Nueva Dirección de Correo</label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="nuevoEmail"
                                    type="email"
                                    {...registerEmail('nuevoEmail')}
                                    className={`${STYLES.input} pl-10 ${errorsEmail.nuevoEmail ? 'border-red-500' : ''}`}
                                    autoFocus
                                />
                            </div>
                            {errorsEmail.nuevoEmail && <p className="text-red-500 text-sm mt-1">{errorsEmail.nuevoEmail.message}</p>}
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={finalizarYcerrar} className="btn-secondary" disabled={isSubmitting}>Cancelar</button>
                            <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? <Spinner /> : 'Enviar Verificación'}</button>
                        </div>
                    </div>
                </form>
            )}

            {/* PASO 3: Mensaje de Confirmación */}
            {pasoActual === PASOS.CONFIRMACION_ENVIADA && (
                <div className="text-center">
                    <FiCheckCircle className="mx-auto h-16 w-16 text-green-500" />
                    <h3 className="mt-4 text-xl font-semibold text-primary">¡Revisa tu bandeja de entrada!</h3>
                    <p className="mt-2 text-secondary">Hemos enviado un enlace de verificación a:</p>
                    <p className="font-bold text-primary my-2">{emailPendiente}</p>
                    <p className="text-sm text-tertiary">Haz clic en ese enlace para completar el cambio. El enlace expirará en 15 minutos.</p>
                    <div className="mt-8">
                        <button onClick={finalizarYcerrar} className="btn-primary w-full sm:w-auto">Entendido</button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default CambiarEmailModal;
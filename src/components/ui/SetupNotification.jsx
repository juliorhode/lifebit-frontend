import React from 'react';
import { SETUP_STATES } from '../../config/constants.js'; // Asumimos que este archivo ya existe

// Componente interno para la barra de progreso visual
const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-3">
        <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);

/**
 * @description Banner de notificación que guía al administrador a través del
 * proceso de configuración inicial. Es persistente hasta que la configuración se completa.
 * 
 * @param {object} props - Propiedades del componente.
 * @param {string} props.estado - El estado de configuración actual (ej. 'PASO_1_UNIDADES').
 * @param {function} props.onContinue - La función a llamar cuando se hace clic en 'Continuar'.
 * @returns {JSX.Element|null} El banner de notificación o null si no es necesario.
 */
const SetupNotification = ({ estado, onContinue }) => {
    // Mapeo de los estados a la información que mostraremos en la UI.
    // Centralizar esto hace que sea fácil añadir nuevos pasos en el futuro.
    const steps = {
        [SETUP_STATES.PASO_1_UNIDADES]: { text: 'Crear las unidades', step: 1, progress: 33 },
        [SETUP_STATES.PASO_2_RECURSOS]: { text: 'Definir los recursos', step: 2, progress: 66 },
        [SETUP_STATES.PASO_3_RESIDENTES]: { text: 'Invitar a los residentes', step: 3, progress: 100 },
    };

    const currentStep = steps[estado];

    // Si el estado no corresponde a un paso de configuración, no mostramos nada.
    if (!currentStep) {
        return null;
    }

    return (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-blue-800 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="mb-4 sm:mb-0">
                    <h3 className="font-bold text-lg text-white">¡Bienvenido a LifeBit!</h3>
                    <p className="text-gray-300">
                        Siguiente paso ({currentStep.step} de 3): <span className="font-semibold text-blue-400">{currentStep.text}</span>
                    </p>
                </div>
                <button
                    onClick={onContinue}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto"
                >
                    Continuar Configuración
                </button>
            </div>
            <ProgressBar progress={currentStep.progress} />
        </div>
    );
};

export default SetupNotification;
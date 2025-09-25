import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * @description Placeholder page para el paso 3 del setup wizard de residentes
 * Se muestra cuando el administrador completa el setup y llega al paso de residentes
 * Proporciona información motivacional y redirige al módulo completo
 * @returns {JSX.Element} Componente placeholder del setup de residentes
 */
const ResidentesPageSetup = () => {
    const navigate = useNavigate();

    /**
     * @description Maneja la navegación al módulo completo de residentes
     */
    const handleIrAModuloCompleto = () => {
        navigate('/dashboard/residentes');
    };

    /**
     * @description Maneja la opción de completar setup después
     */
    const handleCompletarDespues = () => {
        navigate('/dashboard');
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Contenedor principal con tema oscuro */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                {/* Título y mensaje */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        ¡Tu edificio está casi listo!
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        Has configurado exitosamente las unidades y recursos.
                        Ahora puedes invitar a tus primeros residentes para que accedan a la plataforma.
                    </p>
                </div>

                {/* Información adicional */}
                <div className="bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-center mb-3">
                        <i className="fas fa-users text-blue-400 mr-2 text-lg"></i>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-300">Próximo paso</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        El módulo de residentes te permitirá gestionar invitaciones
                        y el estado de los residentes de manera sencilla.
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={handleIrAModuloCompleto}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center"
                    >
                        <i className="fas fa-arrow-right mr-2"></i>
                        Ir al Módulo de Residentes
                    </button>

                    <button
                        onClick={handleCompletarDespues}
                        className="bg-gray-500 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium py-3 px-8 rounded-lg transition-colors duration-200 border border-gray-300 dark:border-gray-500"
                    >
                        <i className="fas fa-clock mr-2"></i>
                        Completar Después
                    </button>
                </div>

                {/* Nota informativa */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                    Podrás volver a este módulo desde el menú principal en cualquier momento.
                </p>
            </div>
        </div>
    );
};

export default ResidentesPageSetup;
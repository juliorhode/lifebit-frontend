import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { SETUP_STATES } from '../../config/constants';
import apiService from '../../services/apiService';

/**
 * @description Componente que muestra indicador de progreso de residentes en el dashboard
 * Aparece cuando el setup está completo pero faltan residentes por registrar
 * Aplica el principio de Zeigarnik para motivar la finalización
 * @returns {JSX.Element|null} Indicador de progreso o null si no debe mostrarse
 */
const IndicadorProgresoResidentes = () => {
    const navigate = useNavigate();
    const { usuario, unidades } = useAuthStore();
    const [residentesActuales, setResidentesActuales] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // CARGA INICIAL: Obtener residentes actuales
    useEffect(() => {
        cargarResidentesActuales();
    }, []);

    /**
     * @description Carga la lista actual de residentes
     * @async
     */
    const cargarResidentesActuales = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.get('/admin/residentes');
            setResidentesActuales(response.data.data || []);
        } catch (error) {
            console.error('Error al cargar residentes para indicador:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // CONDICIONES PARA MOSTRAR: Setup completo y faltan residentes
    const isSetupCompleto = usuario?.estado_configuracion === SETUP_STATES.COMPLETADO;
    const totalUnidades = unidades?.length || 0;
    const totalResidentes = residentesActuales.length;
    const faltanResidentes = totalUnidades - totalResidentes;
    const progreso = totalUnidades > 0 ? (totalResidentes / totalUnidades) * 100 : 0;

    // NO MOSTRAR: Si no cumple condiciones o está cargando
    if (!isSetupCompleto || faltanResidentes <= 0 || isLoading) {
        return null;
    }

    /**
     * @description Maneja la navegación al módulo de residentes
     */
    const handleIrAModulo = () => {
        navigate('/dashboard/residentes');
    };

    return (
        <div className="bg-gradient-to-r from-yellow-900 to-orange-900 rounded-lg border-l-4 border-yellow-400 p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center mb-2">
                        <i className="fas fa-users text-yellow-400 mr-3 text-xl"></i>
                        <h3 className="text-white font-semibold text-lg">
                            ¡Completa tu edificio!
                        </h3>
                    </div>

                    <p className="text-yellow-200 mb-4 leading-relaxed">
                        Has registrado <span className="font-semibold text-white">{totalResidentes}</span> de{' '}
                        <span className="font-semibold text-white">{totalUnidades}</span> unidades.
                        Te faltan <span className="font-semibold text-white">{faltanResidentes}</span> residentes por invitar.
                    </p>

                    {/* BARRA DE PROGRESO */}
                    <div className="w-full bg-yellow-800 bg-opacity-50 rounded-full h-3 mb-4">
                        <div
                            className="bg-yellow-400 h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progreso}%` }}
                        ></div>
                    </div>

                    <div className="flex items-center text-sm text-yellow-300">
                        <i className="fas fa-lightbulb mr-2"></i>
                        <span>Los residentes podrán acceder a la plataforma una vez que acepten su invitación</span>
                    </div>
                </div>

                {/* BOTÓN DE ACCIÓN */}
                <div className="ml-6 flex-shrink-0">
                    <button
                        onClick={handleIrAModulo}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    >
                        <i className="fas fa-arrow-right mr-2"></i>
                        Gestionar Residentes
                    </button>
                </div>
            </div>

            {/* ANIMACIÓN PULSANTE PARA LLAMAR LA ATENCIÓN */}
            <style jsx>{`
                @keyframes pulse-yellow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4); }
                    50% { box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
                }
                .animate-pulse-yellow {
                    animation: pulse-yellow 2s infinite;
                }
            `}</style>
        </div>
    );
};

export default IndicadorProgresoResidentes;
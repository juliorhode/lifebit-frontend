/**
 * @file Contiene el formulario para que el administrador defina o actualice
 * la estructura extendida de su edificio (sótanos y azotea).
 * Este componente es "tonto" y se reutiliza dentro de un Modal.
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// El esquema de validación se importa desde su ubicación centralizada en el módulo.
import { estructuraEdificioSchema } from '../utils/recursos.schemas';
import { STYLES } from '../../../utils/styleConstants';
import Spinner from '../../../components/ui/Spinner';

/**
 * @description Formulario para definir/actualizar la estructura de sótanos y azotea de un edificio.
 * Es un componente presentacional que encapsula los campos del formulario y delega
 * la lógica de envío a través de la prop `onSubmit`.
 *
 * @param {object} props
 * @param {function} props.onSubmit - La función callback a la que se le pasarán los datos validados del formulario.
 * @param {boolean} props.isSubmitting - Bandera que indica si una operación de guardado está en curso.
 */
const FormularioEstructuraEdificio = ({ onSubmit, isSubmitting }) => {
    // --- GESTIÓN DEL FORMULARIO ---
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        // Se conecta el formulario con nuestro esquema de validación de Yup.
        resolver: yupResolver(estructuraEdificioSchema),
        // Se establecen los valores por defecto para los campos del formulario.
        defaultValues: {
            pisosSotano: 0,
            incluyeAzotea: false,
        },
        // Se activa la validación en cada cambio para dar feedback inmediato al usuario.
        mode: 'onChange',
    });

    return (
        // El `handleSubmit` de react-hook-form se encarga de ejecutar la validación
        // antes de llamar a nuestra función `onSubmit`.
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* --- CABECERA DEL FORMULARIO --- */}
            <div>
                <h3 className="text-lg font-medium text-primary">Definir Estructura del Edificio</h3>
                <p className="text-secondary mt-1 text-sm">
                    Para una mejor gestión de las ubicaciones, por favor completa estos datos.
                    Solo tendrás que hacerlo una vez.
                </p>
            </div>

            {/* --- CUERPO DEL FORMULARIO --- */}
            <div className="border-t border-theme-light pt-6 space-y-4">

                {/* CAMPO: Pisos Sótano */}
                <div>
                    <label htmlFor="pisosSotano" className="label-theme">
                        ¿Cuántos niveles de sótano tiene el edificio?
                    </label>
                    <input
                        id="pisosSotano"
                        type="number"
                        {...register('pisosSotano')}
                        className={`input-theme ${errors.pisosSotano ? 'border-red-500' : ''}`}
                        placeholder="Ej: 2"
                        autoFocus // Ponemos el foco en el primer campo para mejorar la UX.
                    />
                    {errors.pisosSotano && <p className="text-red-500 text-sm mt-1">{errors.pisosSotano.message}</p>}
                </div>

                {/* CAMPO: Incluye Azotea */}
                <div className="flex items-center gap-3 pt-2">
                    <input
                        id="incluyeAzotea"
                        type="checkbox"
                        {...register('incluyeAzotea')}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="incluyeAzotea" className="text-primary cursor-pointer">
                        El edificio cuenta con azotea
                    </label>
                </div>
            </div>

            {/* --- PIE DE FORMULARIO: ACCIONES --- */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    className="btn-primary"
                    // El botón se deshabilita si el formulario no es válido o si ya se está enviando.
                    disabled={!isValid || isSubmitting}
                >
                    {isSubmitting ? <Spinner type="dots" /> : 'Guardar Estructura'}
                </button>
            </div>
        </form>
    );
};

export default FormularioEstructuraEdificio;
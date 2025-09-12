import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { editarTipoRecursoSchema, toTitleCase } from '../utils/recursos.schemas';
import apiService from '../../../services/apiService';
import { STYLES } from '../../../utils/styleConstants';
import { toast } from 'react-hot-toast';
import Spinner from '../../../components/ui/Spinner';

/**
 * @description Contenido del modal para editar un Tipo de Recurso.
 * Este componente es un "lienzo" que vive dentro de un Modal genérico.
 * @param {object} props
 * @param {object} props.tipo - El objeto del tipo de recurso a editar.
 * @param {function} props.onSuccess - Callback para notificar al padre que la edición fue exitosa.
 * @param {function} props.onCancel - Callback para cerrar el modal.
 */
const FormularioEditarTipoRecurso = ({ tipo, onSuccess, onCancel }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        setValue,
    } = useForm({
        resolver: yupResolver(editarTipoRecursoSchema),
        defaultValues: {
            nombre: tipo.nombre,
            tipo: tipo.tipo,
        },
        mode: 'onChange',
    });

    
    // Desacoplamos las props de register
    const { onChange: defaultOnChange, ...registerProps } = register('nombre');

    const onSubmit = async (data) => {
        const toastId = toast.loading('Actualizando tipo de recurso...');
        try {
            await apiService.patch(`/admin/recursos/tipos/${tipo.id}`, data);
            toast.success('Tipo de recurso actualizado con éxito', { id: toastId });
            onSuccess(); // Llama al callback para refrescar y cerrar.
        } catch (error) {
            const errorMessage = error.response?.data?.error?.mensaje || 'Error al actualizar el tipo de recurso.';
            
            // AQUI VA EL CAMBIO: MANEJO DE ERROR DE DUPLICADO TAMBIÉN EN LA EDICIÓN
            if (errorMessage.includes('llave duplicada') || errorMessage.includes('unique constraint')) {
                toast.error('Ya existe un tipo de recurso con ese nombre.', { id: toastId });
            } else {
                toast.error(errorMessage, { id: toastId });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <div>
                    <label htmlFor="nombre" className={STYLES.label}>Nombre del Recurso</label>
                    <input
                        id="nombre"
                        {...register('nombre')}
                        className={STYLES.input}
                        onChange={(event) => {
                            setValue('nombre', toTitleCase(event.target.value), { shouldValidate: true });
                        }}
                    />
                    {errors.nombre && <p className={STYLES.errorText}>{errors.nombre.message} </p>}
                </div>
                <div>
                    <label htmlFor="tipo" className={STYLES.label}>Tipo</label>
                    <select id="tipo" {...register('tipo')} className={STYLES.input}>
                        <option value="asignable">Asignable</option>
                        <option value="inventario">Inventario</option>
                    </select>
                    {errors.tipo && <p className={STYLES.errorText}>{errors.tipo.message}</p>}
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className={STYLES.buttonSecondary}>
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    className={STYLES.buttonPrimaryAuto}
                    disabled={!isValid || isSubmitting}
                >
                    {isSubmitting ? <Spinner type="dots"/> : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
};

export default FormularioEditarTipoRecurso;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { solicitudSchema } from '../utils/validationSchemas';

// Función de utilidad para capitalizar texto
const toTitleCase = (str) => {
    if (!str) return str;
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const SolicitudForm = ({ selectedPlan }) => {
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        resolver: yupResolver(solicitudSchema),
        // Establecemos los valores por defecto del formulario
        defaultValues: {
            nombre_solicitante: '',
            apellido_solicitante: '',
            email_solicitante: '',
            telefono_solicitante: '',
            cedula_solicitante: '',
            nombre_edificio: '',
            direccion_edificio: '',
            id_licencia_solicitada: selectedPlan || '2',
        },
    });

    // Efecto para sincronizar el plan si cambia desde las props
    useEffect(() => {
        if (selectedPlan) {
            setValue('id_licencia_solicitada', selectedPlan);
        }
    }, [selectedPlan, setValue]);

    // Función que se ejecuta cuando el formulario es válido
    const onSubmit = async (data) => {
        setSuccess('');
        setServerError('');
        setLoading(true);

        const submissionData = new FormData();

        // Adjuntamos todos los datos de texto
        Object.keys(data).forEach(key => {
            // No adjuntamos los campos de archivo aquí
            if (key !== 'archivo_cedula' && key !== 'documento_condominio') {
                submissionData.append(key, data[key]);
            }
        });

        // Adjuntamos los archivos solo si existen
        if (data.archivo_cedula && data.archivo_cedula[0]) {
            submissionData.append('archivo_cedula', data.archivo_cedula[0]);
        }
        if (data.documento_condominio && data.documento_condominio[0]) {
            submissionData.append('documento_condominio', data.documento_condominio[0]);
        }

        try {
            await axios.post('/api/solicitudes', submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess('¡Solicitud enviada con éxito! Nuestro equipo te contactará pronto.');
            reset(); // Resetea el formulario a sus valores por defecto
        } catch (err) {
            console.error('Error en la solicitud:', err);
            setServerError(err.response?.data?.error?.mensaje || 'Ocurrió un error al enviar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    // Función de utilidad para capitalizar campos de texto mientras se escribe
    const handleCapitalize = (e) => {
        const { name, value } = e.target;
        setValue(name, toTitleCase(value), { shouldValidate: true });
    };

    // Manejador específico para los campos de archivo
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        // Actualiza el valor en react-hook-form y dispara la validación
        setValue(name, files, { shouldValidate: true });
    };

    // Estilos reutilizables
    const inputStyle = "w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white";
    const labelStyle = "block text-left text-sm font-semibold mb-2 text-gray-200";
    const errorStyle = "text-red-400 text-xs mt-1";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left bg-gray-900 p-8 rounded-lg shadow-2xl">
            {serverError && <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded-md">{serverError}</div>}
            {success && <div className="bg-green-900 border border-green-700 text-green-200 p-3 rounded-md">{success}</div>}

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="nombre_solicitante" className={labelStyle}>Nombre *</label>
                    <input {...register("nombre_solicitante")} onChange={handleCapitalize} className={inputStyle} />
                    {errors.nombre_solicitante && <p className={errorStyle}>{errors.nombre_solicitante.message}</p>}
                </div>
                <div>
                    <label htmlFor="apellido_solicitante" className={labelStyle}>Apellido *</label>
                    <input {...register("apellido_solicitante")} onChange={handleCapitalize} className={inputStyle} />
                    {errors.apellido_solicitante && <p className={errorStyle}>{errors.apellido_solicitante.message}</p>}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="email_solicitante" className={labelStyle}>Email *</label>
                    <input type="email" {...register("email_solicitante")} className={inputStyle} />
                    {errors.email_solicitante && <p className={errorStyle}>{errors.email_solicitante.message}</p>}
                </div>
                <div>
                    <label htmlFor="telefono_solicitante" className={labelStyle}>Teléfono</label>
                    <input type="tel" {...register("telefono_solicitante")} className={inputStyle} placeholder="04141234567" />
                    {errors.telefono_solicitante && <p className={errorStyle}>{errors.telefono_solicitante.message}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="cedula_solicitante" className={labelStyle}>Cédula / RIF</label>
                <input type="text" {...register("cedula_solicitante")} className={inputStyle} placeholder="V12345678" />
                {errors.cedula_solicitante && <p className={errorStyle}>{errors.cedula_solicitante.message}</p>}
            </div>

            <hr className="border-gray-700" />

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="nombre_edificio" className={labelStyle}>Nombre del Edificio *</label>
                    <input {...register("nombre_edificio")} onChange={handleCapitalize} className={inputStyle} />
                    {errors.nombre_edificio && <p className={errorStyle}>{errors.nombre_edificio.message}</p>}
                </div>
                <div>
                    <label htmlFor="id_licencia_solicitada" className={labelStyle}>Plan Deseado *</label>
                    <select {...register("id_licencia_solicitada")} className={inputStyle}>
                        <option value="1">Básico</option>
                        <option value="2">Gold</option>
                        <option value="3">Premium</option>
                    </select>
                    {errors.id_licencia_solicitada && <p className={errorStyle}>{errors.id_licencia_solicitada.message}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="direccion_edificio" className={labelStyle}>Dirección del Edificio</label>
                <textarea {...register("direccion_edificio")} onChange={handleCapitalize} className={inputStyle} rows="3"></textarea>
                {errors.direccion_edificio && <p className={errorStyle}>{errors.direccion_edificio.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="archivo_cedula" className={labelStyle}>Cédula / RIF (Archivo, Opcional)</label>
                    <input
                        type="file"
                        // Usamos un nombre diferente para el register para evitar conflictos
                        {...register("archivo_cedula_input")}
                        onChange={handleFileChange}
                        // Le damos un 'name' que coincida con nuestro schema
                        name="archivo_cedula"
                        className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                    />
                    {errors.archivo_cedula && <p className={errorStyle}>{errors.archivo_cedula.message}</p>}
                </div>
                <div>
                    <label htmlFor="documento_condominio" className={labelStyle}>Documento de Condominio (Opcional)</label>
                    <input
                        type="file"
                        {...register("documento_condominio_input")}
                        onChange={handleFileChange}
                        name="documento_condominio"
                        className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                    />
                    {errors.documento_condominio && <p className={errorStyle}>{errors.documento_condominio.message}</p>}
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
                {loading ? 'Enviando...' : 'Enviar Solicitud de Prueba'}
            </button>
        </form>
    );
};

export default SolicitudForm;
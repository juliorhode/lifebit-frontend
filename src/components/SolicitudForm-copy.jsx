import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { solicitudSchema } from '../utils/validationSchemas.jsx';
import { STYLES } from '../utils/styleConstants.jsx';
import Spinner from './ui/Spinner';

const toTitleCase = (str) => {
    if (!str) return str;
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const SolicitudForm = ({ selectedPlan }) => {
    // 1. Reintroducimos nuestro propio estado de carga. Este es el que controlará la UI.
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
        mode: 'onChange',
        resolver: yupResolver(solicitudSchema),
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

    useEffect(() => {
        if (selectedPlan) {
            setValue('id_licencia_solicitada', selectedPlan);
        }
    }, [selectedPlan, setValue]);

    // 2. Esta es nuestra función de lógica de negocio pura.
    const onFormSubmit = async (data) => {
        setLoading(true); // Activamos la carga aquí.
        setSuccess('');
        setServerError('');

        const submissionData = new FormData();
        Object.keys(data).forEach(key => {
            if (key !== 'archivo_cedula' && key !== 'documento_condominio') {
                submissionData.append(key, data[key]);
            }
        });
        if (data.archivo_cedula && data.archivo_cedula[0]) {
            submissionData.append('archivo_cedula', data.archivo_cedula[0]);
        }
        if (data.documento_condominio && data.documento_condominio[0]) {
            submissionData.append('documento_condominio', data.documento_condominio[0]);
        }

        // Demora para desarrollo/UX
        const delay = new Promise(resolve => setTimeout(resolve, 2000));

        try {
            await delay;
            await axios.post('/api/solicitudes', submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess('¡Solicitud enviada con éxito! Nuestro equipo te contactará pronto.');
            reset();
        } catch (err) {
            console.error('Error en la solicitud:', err);
            setServerError(err.response?.data?.error?.mensaje || 'Ocurrió un error al enviar la solicitud.');
        } finally {
            setLoading(false); // Desactivamos la carga al final, pase lo que pase.
        }
    };

    const handleCapitalize = (e) => {
        const { name, value } = e.target;
        setValue(name, toTitleCase(value), { shouldValidate: true });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setValue(name, files, { shouldValidate: true });
    };

    return (
        // 3. El onSubmit del formulario ahora llama a handleSubmit, que a su vez llama a onFormSubmit.
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 text-left bg-gray-900 p-8 rounded-lg shadow-2xl">
            {/* Campos del formulario con React Hook Form */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="nombre_solicitante" className={STYLES.label}>Nombre *</label>
                    <input {...register("nombre_solicitante")} onChange={handleCapitalize} className={STYLES.input} />
                    {errors.nombre_solicitante && <p className={STYLES.errorText}>{errors.nombre_solicitante.message}</p>}
                </div>
                <div>
                    <label htmlFor="apellido_solicitante" className={STYLES.label}>Apellido *</label>
                    <input {...register("apellido_solicitante")} onChange={handleCapitalize} className={STYLES.input} />
                    {errors.apellido_solicitante && <p className={STYLES.errorText}>{errors.apellido_solicitante.message}</p>}
                </div>
            </div>

            {/* Teléfono y Email */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="email_solicitante" className={STYLES.label}>Email *</label>
                    <input type="email" {...register("email_solicitante")} className={STYLES.input} />
                    {errors.email_solicitante && <p className={STYLES.errorText}>{errors.email_solicitante.message}</p>}
                </div>
                <div>
                    <label htmlFor="telefono_solicitante" className={STYLES.label}>Teléfono</label>
                    <input type="tel" {...register("telefono_solicitante")} className={STYLES.input} placeholder="04141234567" />
                    {errors.telefono_solicitante && <p className={STYLES.errorText}>{errors.telefono_solicitante.message}</p>}
                </div>
            </div>

            {/* Cédula */}
            <div>
                <label htmlFor="cedula_solicitante" className={STYLES.label}>Cédula / RIF</label>
                <input type="text" {...register("cedula_solicitante")} onChange={handleCapitalize} className={STYLES.input} placeholder="V12345678" />
                {errors.cedula_solicitante && <p className={STYLES.errorText}>{errors.cedula_solicitante.message}</p>}
            </div>

            <hr className="border-gray-700" />

            {/* Edificio y Plan */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="nombre_edificio" className={STYLES.label}>Nombre del Edificio *</label>
                    <input {...register("nombre_edificio")} onChange={handleCapitalize} className={STYLES.input} />
                    {errors.nombre_edificio && <p className={STYLES.errorText}>{errors.nombre_edificio.message}</p>}
                </div>
                <div>
                    <label htmlFor="id_licencia_solicitada" className={STYLES.label}>Plan Deseado *</label>
                    <select {...register("id_licencia_solicitada")} className={STYLES.input}>
                        <option value="1">Básico</option>
                        <option value="2">Gold</option>
                        <option value="3">Premium</option>
                    </select>
                </div>
            </div>

            {/* Dirección */}
            <div>
                <label htmlFor="direccion_edificio" className={STYLES.label}>Dirección del Edificio</label>
                <textarea {...register("direccion_edificio")} onChange={handleCapitalize} className={STYLES.input} rows="3"></textarea>
                {errors.direccion_edificio && <p className={STYLES.errorText}>{errors.direccion_edificio.message}</p>}
            </div>

            {/* Archivos */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="archivo_cedula" className={STYLES.label}>Cédula / RIF (Archivo, Opcional)</label>
                    <input type="file" name="archivo_cedula" onChange={handleFileChange} className={`${STYLES.inputFile}`} />
                    {errors.archivo_cedula && <p className={STYLES.errorText}>{errors.archivo_cedula.message}</p>}
                </div>
                <div>
                    <label htmlFor="documento_condominio" className={STYLES.label}>Documento de Condominio (Opcional)</label>
                    <input type="file" name="documento_condominio" onChange={handleFileChange} className={`${STYLES.inputFile}`} />
                    {errors.documento_condominio && <p className={STYLES.errorText}>{errors.documento_condominio.message}</p>}
                </div>
            </div>

            {/* 4. El botón ahora usa nuestro estado 'loading'. */}
            <button type="submit" disabled={loading} className={STYLES.buttonPrimary}>
                {loading ? <Spinner type="dots" /> : 'Enviar Solicitud de Prueba'}
            </button>

            <div className="text-center h-4">
                {serverError && <p className={`${STYLES.errorText} text-base`}>{serverError}</p>}
                {success && <p className={STYLES.successText}>{success}</p>}
            </div>
        </form>
    );
};

export default SolicitudForm;
import React, { useState, useEffect } from 'react';
import axios from 'axios';


const SolicitudForm = ({ selectedPlan }) => {
    const [formData, setFormData] = useState({
        nombre_solicitante: '',
        apellido_solicitante: '',
        email_solicitante: '',
        telefono_solicitante: '',
        cedula_solicitante: '',
        nombre_edificio: '',
        direccion_edificio: '',
        id_licencia_solicitada: selectedPlan || '2', // Gold por defecto
    });

    const [files, setFiles] = useState({
        archivo_cedula: null,
        documento_condominio: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Sincroniza el estado del formulario si el plan seleccionado cambia desde las props
        if (selectedPlan) {
            setFormData(prevData => ({
                ...prevData,
                id_licencia_solicitada: selectedPlan
            }));
        }
    }, [selectedPlan]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files: inputFiles } = e.target;
        setFiles({ ...files, [name]: inputFiles[0] });
    };

    const validateForm = () => {
        const { nombre_solicitante, apellido_solicitante, email_solicitante, nombre_edificio } = formData;
        if (!nombre_solicitante || !apellido_solicitante || !email_solicitante || !nombre_edificio) {
            setError('Por favor, completa todos los campos requeridos (*).');
            return false;
        }
        // Validación simple de email
        if (!/\S+@\S+\.\S+/.test(email_solicitante)) {
            setError('Por favor, introduce un correo electrónico válido.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const submissionData = new FormData();

        // Adjuntar datos del formulario
        for (const key in formData) {
            submissionData.append(key, formData[key]);
        }

        // Adjuntar archivos si existen
        if (files.archivo_cedula) {
            submissionData.append('archivo_cedula', files.archivo_cedula);
        }
        if (files.documento_condominio) {
            submissionData.append('documento_condominio', files.documento_condominio);
        }

        try {
            // NOTA DE SEGURIDAD: El endpoint de la API debe estar en una variable de entorno.
            // Usamos '/api/solicitudes' asumiendo una configuración de proxy en Vite.
            const response = await axios.post('/api/solicitudes', submissionData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess('¡Solicitud enviada con éxito! Nuestro equipo te contactará pronto.');
            // Resetear formulario
            setFormData({
                nombre_solicitante: '', apellido_solicitante: '', email_solicitante: '',
                telefono_solicitante: '', cedula_solicitante: '', nombre_edificio: '',
                direccion_edificio: '', id_licencia_solicitada: '2',
            });
            setFiles({ archivo_cedula: null, documento_condominio: null });
            e.target.reset(); // Limpia los inputs de archivo

        } catch (err) {
            // NOTA DE SEGURIDAD: Mostramos un mensaje genérico al usuario.
            // El error real (err) se debería registrar en un servicio de monitoreo (ej. Sentry)
            // para depuración interna, pero nunca exponerlo al cliente.
            console.error('Error en la solicitud:', err);
            setError('Ocurrió un error al enviar la solicitud. Por favor, verifica tus datos e inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelStyle = "block text-left text-sm font-semibold mb-2";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-left bg-gray-900 p-8 rounded-lg shadow-2xl">
            {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md">{error}</div>}
            {success && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-md">{success}</div>}

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="nombre_solicitante" className={labelStyle}>Nombre *</label>
                    <input type="text" name="nombre_solicitante" value={formData.nombre_solicitante} onChange={handleInputChange} className={inputStyle} required />
                </div>
                <div>
                    <label htmlFor="apellido_solicitante" className={labelStyle}>Apellido *</label>
                    <input type="text" name="apellido_solicitante" value={formData.apellido_solicitante} onChange={handleInputChange} className={inputStyle} required />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="email_solicitante" className={labelStyle}>Email *</label>
                    <input type="email" name="email_solicitante" value={formData.email_solicitante} onChange={handleInputChange} className={inputStyle} required />
                </div>
                <div>
                    <label htmlFor="telefono_solicitante" className={labelStyle}>Teléfono</label>
                    <input type="tel" name="telefono_solicitante" value={formData.telefono_solicitante} onChange={handleInputChange} className={inputStyle} />
                </div>
            </div>

            <div>
                <label htmlFor="cedula_solicitante" className={labelStyle}>Cédula / RIF</label>
                <input type="text" name="cedula_solicitante" value={formData.cedula_solicitante} onChange={handleInputChange} className={inputStyle} />
            </div>

            <hr className="border-gray-700" />

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="nombre_edificio" className={labelStyle}>Nombre del Edificio *</label>
                    <input type="text" name="nombre_edificio" value={formData.nombre_edificio} onChange={handleInputChange} className={inputStyle} required />
                </div>
                <div>
                    <label htmlFor="id_licencia_solicitada" className={labelStyle}>Plan Deseado *</label>
                    <select name="id_licencia_solicitada" value={formData.id_licencia_solicitada} onChange={handleInputChange} className={inputStyle}>
                        <option value="1">Básico</option>
                        <option value="2">Gold</option>
                        <option value="3">Premium</option>
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="direccion_edificio" className={labelStyle}>Dirección del Edificio</label>
                <textarea name="direccion_edificio" value={formData.direccion_edificio} onChange={handleInputChange} className={inputStyle} rows="3"></textarea>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="archivo_cedula" className={labelStyle}>Cédula / RIF (Archivo, Opcional)</label>
                    <input type="file" name="archivo_cedula" onChange={handleFileChange} className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`} />
                </div>
                <div>
                    <label htmlFor="documento_condominio" className={labelStyle}>Documento de Condominio (Opcional)</label>
                    <input type="file" name="documento_condominio" onChange={handleFileChange} className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`} />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
                {loading ? 'Enviando...' : 'Enviar Solicitud de Prueba'}
            </button>
        </form>
    );
};

export default SolicitudForm;
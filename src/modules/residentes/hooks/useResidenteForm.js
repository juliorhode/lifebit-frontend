// ===============================================
//          CONSTRUCCIÓN: useResidenteForm.js
// ===============================================

/**
 * 🐛 PROBLEMA SOLUCIONADO:
 *
 * ANTES: Al hacer clic en "Continuar" con un borrador, el formulario se abría vacío
 * porque el hook no manejaba correctamente los datos de localStorage.
 *
 * SOLUCIÓN IMPLEMENTADA:
 * ✅ Agregado useEffect para manejar initialData de borradores
 * ✅ El formulario ahora se precarga correctamente con datos del borrador
 * ✅ Funciona tanto para creación como para edición
 * ✅ Logging detallado para debugging
 *
 * FLUJO COMPLETO:
 * 1. Usuario guarda borrador → localStorage
 * 2. Usuario hace clic "Continuar" → BorradoresPanel.onCargarBorrador()
 * 3. ResidentesPage.handleCargarBorrador() → useGestionResidentes.handleCargarBorrador()
 * 4. ✅ NUEVO: useResidenteForm recibe initialData y precarga formulario
 * 5. Usuario ve formulario con datos precargados
 */

// --- 1. Importaciones Esenciales ---
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { residenteSchema } from '../utils/residentes.schemas';
import * as utils from '../utils/residentes.utils';
import apiService from '../../../services/apiService';
import { toast } from 'react-hot-toast';

/**
 * @description Hook personalizado que encapsula TODA la lógica del formulario
 * de creación y edición de residentes.
 *
 * FUNCIONALIDADES:
 * ✅ Creación de nuevos residentes
 * ✅ Edición de residentes existentes
 * ✅ ✅ NUEVO: Carga de borradores desde localStorage
 * ✅ Validación en tiempo real con Yup
 * ✅ Auto-guardado de borradores
 * ✅ Manejo de unidades disponibles
 *
 * FLUJO DE BORRADORES:
 * 1. Usuario llena formulario parcialmente
 * 2. Hace clic en "Guardar Borrador"
 * 3. Datos se guardan en localStorage
 * 4. ✅ NUEVO: Al hacer clic "Continuar", se cargan en el formulario
 * 5. Usuario puede completar y enviar
 *
 * @param {Object} options - Opciones de configuración.
 * @param {Function} options.onSuccess - Callback a ejecutar tras un envío exitoso.
 * @param {Object | null} options.residenteEditando - Datos del residente a editar.
 * @param {Object | null} options.initialData - ✅ NUEVO: Datos de un borrador para precargar el formulario.
 * @returns {Object} La API pública del hook para ser usada por componentes.
 */
export const useResidenteForm = ({ onSuccess, residenteEditando = null, initialData = null, onBorradorGuardado = null }) => {

    // --- 2. Estado Interno y Motor del Formulario (Área de Gestión) ---
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isDirty, isSubmitting },
        setValue,
        reset,
    } = useForm({
        resolver: yupResolver(residenteSchema),
        defaultValues: initialData || {},
        mode: 'onChange' // Validación en tiempo real mientras escribe
    });

    // Estados para la Comunicación Externa
    const [unidades, setUnidades] = useState([]);
    const [isLoadingUnidades, setIsLoadingUnidades] = useState(true);

    // ✅ NUEVO: Estado para trackear si se cargó un borrador
    const [borradorCargado, setBorradorCargado] = useState(false);

    // ✅ NUEVO: Estado para almacenar la clave del borrador cargado
    const [borradorKey, setBorradorKey] = useState(null);

    // ✅ NUEVO: Estado para almacenar los datos originales del borrador
    const [borradorOriginal, setBorradorOriginal] = useState(null);

    // ✅ NUEVO: ID secuencial simple del borrador
    const [borradorId, setBorradorId] = useState(null);

    // ✅ NUEVO: Estado para persistir el ID del borrador entre renders
    const [borradorIdPersistente, setBorradorIdPersistente] = useState(null);

    // --- 3. Lógica de Efectos Secundarios (Área de Comunicación Externa) ---
    useEffect(() => {
        const cargarUnidades = async () => {
            try {
                setIsLoadingUnidades(true);
                const [unidadesResponse, residentesResponse] = await Promise.all([
                    apiService.get('/admin/unidades'),
                    apiService.get('/admin/residentes')
                ]);
                const unidadesData = unidadesResponse.data.data?.unidades || [];
                const residentesData = residentesResponse.data.data || [];
                
                const unidadesOcupadas = new Set(
                    residentesData
                        .filter(res => res.estado === 'activo' && res.id !== residenteEditando?.id)
                        .map(res => res.numero_unidad)
                );
                
                let unidadesFiltradas = unidadesData.filter(u => !unidadesOcupadas.has(u.numero_unidad));

                if (residenteEditando && residenteEditando.numero_unidad) {
                    const unidadActual = unidadesData.find(u => u.numero_unidad === residenteEditando.numero_unidad);
                    if (unidadActual && !unidadesFiltradas.some(u => u.id === unidadActual.id)) {
                        unidadesFiltradas.push(unidadActual);
                    }
                }
                setUnidades(unidadesFiltradas);
            } catch (error) {
                console.error('Error al cargar unidades:', error);
                toast.error('No se pudieron cargar las unidades.');
            } finally {
                setIsLoadingUnidades(false);
            }
        };
        cargarUnidades();
    }, [residenteEditando]);
    
    // Efecto para popular el formulario cuando los datos de edición están disponibles.
    useEffect(() => {
        if (residenteEditando) {
            reset({
                nombre: residenteEditando.nombre || '',
                apellido: residenteEditando.apellido || '',
                email: residenteEditando.email || '',
                cedula: residenteEditando.cedula || '',
                telefono: residenteEditando.telefono || '',
                unidad_id: residenteEditando.numero_unidad || '',
            });
        }
    }, [residenteEditando, reset]);

    /**
     * ✅ NUEVO EFECTO CRÍTICO: Manejo de datos de borrador
     *
     * PROBLEMA QUE SOLUCIONA:
     * Cuando se hace clic en "Continuar" con un borrador, el formulario se abría vacío
     * porque react-hook-form solo usa defaultValues en el montaje inicial.
     *
     * SOLUCIÓN:
     * Este useEffect detecta cuando llegan nuevos initialData (de un borrador)
     * y actualiza el formulario usando setValue() para precargar los campos
     * SIN alterar el estado dirty del formulario.
     *
     * CONDICIONES:
     * - initialData existe (hay datos de borrador)
     * - !residenteEditando (no estamos editando, es un borrador)
     * - ✅ NUEVO: unidades.length > 0 (espera a que las unidades se carguen)
     *
     * FLUJO:
     * 1. Usuario hace clic "Continuar borrador"
     * 2. BorradoresPanel → ResidentesPage → useGestionResidentes
     * 3. Se establece datosBorrador en el estado del hook
     * 4. ✅ Este useEffect detecta el cambio y precarga el formulario
     * 5. Usuario ve el formulario con datos precargados
     * 6. ✅ Usuario puede modificar campos y guardar (isDirty funciona correctamente)
     *
     * DEPENDENCIAS:
     * - initialData: Se ejecuta cuando cambian los datos del borrador
     * - residenteEditando: Evita conflicto con edición
     * - unidades: Espera a que las unidades se carguen
     * - setValue: Función de react-hook-form para actualizar campos individuales
     */
    useEffect(() => {
        console.log('🔄 useResidenteForm.useEffect - INICIO');
        console.log('🔄 initialData recibido:', initialData);
        console.log('🔄 residenteEditando:', residenteEditando);
        console.log('🔄 unidades.length:', unidades.length);

        if (initialData && !residenteEditando && unidades.length > 0) {
            console.log('🎯 useResidenteForm: Cargando datos de borrador:', initialData);
            console.log('🏢 Unidades disponibles:', unidades.map(u => u.numero_unidad));
            console.log('🎯 Unidad del borrador:', initialData.unidad_id);
            console.log('🎯 ID del borrador en initialData:', initialData.id);

            // ✅ CORRECCIÓN: Usar setValue con shouldValidate para mantener validación activa
            setValue('nombre', initialData.nombre || '', { shouldValidate: true });
            setValue('apellido', initialData.apellido || '', { shouldValidate: true });
            setValue('email', initialData.email || '', { shouldValidate: true });
            setValue('cedula', initialData.cedula || '', { shouldValidate: true });
            setValue('telefono', initialData.telefono || '', { shouldValidate: true });
            setValue('unidad_id', initialData.unidad_id || '', { shouldValidate: true });

            // ✅ NUEVO: Sistema robusto de identificación de borradores
            setBorradorCargado(true);
            setBorradorOriginal(initialData); // Almacenar datos completos del borrador

            // ✅ Usar ID del borrador si existe, sino mantener el persistente
            let idUnico = initialData.id || borradorIdPersistente;

            if (!idUnico) {
                // Buscar el número más alto de borradores existentes
                let maxNumero = 0;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('borrador_residente_')) {
                        try {
                            const borradorGuardado = JSON.parse(localStorage.getItem(key));
                            if (borradorGuardado.id && borradorGuardado.id.startsWith('borrador_')) {
                                const numero = parseInt(borradorGuardado.id.replace('borrador_', ''));
                                if (!isNaN(numero) && numero > maxNumero) {
                                    maxNumero = numero;
                                }
                            }
                        } catch (error) {
                            // Ignorar errores de parsing
                        }
                    }
                }
                idUnico = `borrador_${maxNumero + 1}`;
            }

            console.log('🎯 Carga de borrador - initialData.id:', initialData.id);
            console.log('🎯 Carga de borrador - borradorIdPersistente:', borradorIdPersistente);
            console.log('🎯 Carga de borrador - idUnico final:', idUnico);

            setBorradorId(idUnico);
            setBorradorIdPersistente(idUnico); // ✅ Mantener persistente
            console.log('🆔 ID secuencial del borrador:', idUnico);

            // Buscar la clave del borrador cargado para futuras actualizaciones
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('borrador_residente_')) {
                    try {
                        const borradorGuardado = JSON.parse(localStorage.getItem(key));
                        // Comparar ID único para identificar el borrador correcto
                        if (borradorGuardado.id === idUnico) {
                            setBorradorKey(key);
                            console.log('🔑 Clave del borrador cargado:', key);
                            break;
                        }
                    } catch (error) {
                        console.warn('⚠️ Error procesando borrador existente:', error);
                    }
                }
            }

            console.log('✅ Formulario precargado con datos del borrador (isDirty preserved)');
        } else if (initialData && !residenteEditando && unidades.length === 0) {
            console.log('⏳ Esperando unidades para cargar borrador...');
        }
    }, [initialData, residenteEditando, unidades, setValue]);


    // --- 4. Lógica de Negocio (Handlers y Submit) ---
    const onSubmitLogic = async (data) => {
        console.log('📤 onSubmitLogic - INICIO');
        console.log('📤 Data del formulario:', data);
        console.log('📤 residenteEditando:', residenteEditando);
        console.log('📤 borradorCargado:', borradorCargado);
        console.log('📤 borradorId:', borradorId);

        try {
            const payload = {
                nombre: data.nombre,
                apellido: data.apellido,
                email: data.email,
                ...(data.cedula && { cedula: data.cedula.trim() }),
                ...(data.telefono && { telefono: data.telefono.trim() }),
            };

            console.log('📤 Payload a enviar:', payload);

            if (residenteEditando) {
                payload.numeroUnidad = data.unidad_id;
                console.log('📤 Editando residente, PATCH:', `/admin/residentes/${residenteEditando.id}`);
                await apiService.patch(`/admin/residentes/${residenteEditando.id}`, payload);
            } else {
                const unidadSeleccionada = unidades.find(u => u.numero_unidad === data.unidad_id);
                if (!unidadSeleccionada) throw new Error('Unidad seleccionada no es válida.');
                payload.idUnidad = unidadSeleccionada.id;
                console.log('📤 Enviando invitación, POST:', '/admin/invitaciones/residentes');
                await apiService.post('/admin/invitaciones/residentes', payload);
            }

            console.log('📤 Invitación enviada exitosamente');
            console.log('📤 Datos del envío exitoso:', {
                residenteEditando,
                borradorCargado,
                borradorId,
                currentValues: watch()
            });

            if(onSuccess) {
                console.log('📤 Llamando onSuccess callback');
                onSuccess();
                console.log('📤 onSuccess callback ejecutado');
            } else {
                console.log('📤 No hay onSuccess callback definido');
            }

        } catch (error) {
            console.error('📤 Error al procesar residente:', error);
            if (error.response?.status === 409) {
                toast.error('Ya existe un residente con este email');
            } else {
                toast.error(`Error al ${residenteEditando ? 'actualizar' : 'invitar'}.`);
            }
        }
    };
    
    const handleNombreChange = (e) => setValue('nombre', utils.capitalizarTexto(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')), { shouldValidate: true });
    const handleApellidoChange = (e) => setValue('apellido', utils.capitalizarTexto(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')), { shouldValidate: true });
    const handleCedulaChange = (e) => setValue('cedula', utils.formatearCedula(e.target.value), { shouldValidate: true });
    const handleTelefonoChange = (e) => setValue('telefono', utils.formatearTelefono(e.target.value), { shouldValidate: true });

    // Lógica para guardar el borrador manualmente.
    const handleGuardarBorrador = () => {
        console.log('💾 handleGuardarBorrador - INICIO');

        const currentValues = watch();

        console.log('💾 handleGuardarBorrador - Estado actual:');
        console.log('- borradorCargado:', borradorCargado);
        console.log('- borradorId:', borradorId);
        console.log('- borradorIdPersistente:', borradorIdPersistente);
        console.log('- borradorKey:', borradorKey);
        console.log('- borradorOriginal:', borradorOriginal);
        console.log('- currentValues:', currentValues);
        console.log('- residenteEditando:', residenteEditando);

        // ✅ ESTRATEGIA DEFINITIVA: Usar ID persistente
        let idUnico;
        let esActualizacion = false;
        let storageKey = `borrador_residente_${Date.now()}`;

        if (borradorIdPersistente) {
            // ✅ Si existe ID persistente, usar SIEMPRE ese ID
            idUnico = borradorIdPersistente;
            console.log('🔄 Usando ID persistente:', idUnico);

            // Buscar el borrador por su ID persistente
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('borrador_residente_')) {
                    try {
                        const borradorGuardado = JSON.parse(localStorage.getItem(key));
                        if (borradorGuardado.id === idUnico) {
                            esActualizacion = true;
                            storageKey = key;
                            console.log('✅ Borrador encontrado por ID persistente:', key);
                            break;
                        }
                    } catch (error) {
                        console.warn('⚠️ Error procesando borrador existente:', error);
                    }
                }
            }
        } else {
            // ✅ Si no hay ID persistente, generar uno nuevo
            let maxNumero = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('borrador_residente_')) {
                    try {
                        const borradorGuardado = JSON.parse(localStorage.getItem(key));
                        if (borradorGuardado.id && borradorGuardado.id.startsWith('borrador_')) {
                            const numero = parseInt(borradorGuardado.id.replace('borrador_', ''));
                            if (!isNaN(numero) && numero > maxNumero) {
                                maxNumero = numero;
                            }
                        }
                    } catch (error) {
                        // Ignorar errores de parsing
                    }
                }
            }
            idUnico = `borrador_${maxNumero + 1}`;
            setBorradorIdPersistente(idUnico); // ✅ Establecer como persistente
            console.log('🆕 Generando ID persistente para borrador nuevo:', idUnico);
        }

        console.log('- esActualizacion:', esActualizacion);
        console.log('- storageKey:', storageKey);
        console.log('- idUnico:', idUnico);

        const timestampActual = Date.now();
        const timestampFinal = esActualizacion && borradorOriginal ? borradorOriginal.timestamp : timestampActual;

        console.log('💾 Generando timestamp:', {
            esActualizacion,
            timestampActual,
            timestampOriginal: borradorOriginal?.timestamp,
            timestampFinal
        });

        const borrador = {
            ...currentValues,
            id: idUnico, // ID constante (original si existe, nuevo si no)
            timestamp: timestampFinal,
            // CORRECCIÓN DEL BUG: Adjuntamos el ID de edición si existe.
            editandoId: residenteEditando ? residenteEditando.id : null,
        };

        console.log('💾 Borrador final a guardar:', borrador);
        console.log('💾 ID en borrador final:', borrador.id);
        console.log('💾 Timestamp en borrador final:', borrador.timestamp);

        console.log('💾 Borrador a guardar:', borrador);
        console.log('💾 Clave de localStorage:', storageKey);

        // ✅ Guardar usando la clave identificada
        localStorage.setItem(storageKey, JSON.stringify(borrador));
        console.log('💾 Borrador guardado en localStorage');

        // ✅ Verificar que se guardó correctamente
        const borradorVerificado = localStorage.getItem(storageKey);
        if (borradorVerificado) {
            const borradorParsed = JSON.parse(borradorVerificado);
            console.log('✅ Verificación: Borrador guardado correctamente:', borradorParsed);
        } else {
            console.error('❌ ERROR: Borrador no se guardó correctamente');
        }

        const mensaje = esActualizacion ? 'Borrador actualizado exitosamente' : 'Borrador guardado exitosamente';
        toast.success(mensaje);

        console.log('✅ handleGuardarBorrador - FIN:', { storageKey, esActualizacion, mensaje, id: borrador.id });

        // ✅ NUEVO: Notificar que se guardó un borrador para refrescar el panel
        if (onBorradorGuardado) {
            onBorradorGuardado();
        }

        // ❌ REMOVIDO: No cerrar modal al guardar borrador
        // El usuario debe poder continuar editando después de guardar
        // if (onSuccess) {
        //     onSuccess(); // Esto causaba mensaje incorrecto de "Solicitud enviada"
        // }
    };


    // ✅ NUEVO: Verificar si los campos requeridos están completos y válidos
    const camposRequeridosCompletos = () => {
        const valores = watch();
        return (
            valores.nombre?.trim() &&
            valores.apellido?.trim() &&
            valores.email?.trim() &&
            valores.unidad_id &&
            !errors.nombre &&
            !errors.apellido &&
            !errors.email &&
            !errors.unidad_id
        );
    };

    // --- 5. API Pública del Hook ---
    return {
        register,
        onSubmit: handleSubmit(onSubmitLogic),
        errors,
        isSubmitting,
        isDirty,
        unidades,
        isLoadingUnidades,
        handleNombreChange,
        handleApellidoChange,
        handleCedulaChange,
        handleTelefonoChange,
        handleGuardarBorrador,
        // ✅ CORRECCIÓN: Solo permitir guardar si campos requeridos están completos y válidos
        puedeGuardarBorrador: camposRequeridosCompletos(),
    };
};
# 📋 **ADR-008: Sistema de Inteligencia Artificial para Asistencia al Usuario**

## 📅 **Fecha:** 20 de septiembre de 2025
## 👤 **Autor:** Arquitecto de LifeBit
## 📊 **Estado:** Propuesto

---

## 🎯 **Contexto**

LifeBit es una plataforma SaaS compleja para gestión de condominios con múltiples funcionalidades. Los usuarios (especialmente no técnicos) necesitan asistencia contextual para:

- **Configuración inicial** del edificio y unidades
- **Gestión diaria** de residentes y recursos
- **Resolución de problemas** comunes
- **Descubrimiento de funcionalidades** avanzadas

**Problema identificado:**
- Usuarios abandonan durante configuración inicial
- Soporte recibe preguntas repetitivas sobre funcionalidades básicas
- Documentación estática no es efectiva para usuarios no técnicos
- Curva de aprendizaje empinada para funcionalidades complejas

**Oportunidad:**
- Reducir soporte en 60-80%
- Mejorar conversión de usuarios nuevos
- Crear experiencia más intuitiva
- Diferenciación competitiva

---

## 🎯 **Decisión**

Implementar **Asistente IA Artesanal** basado en lógica programática y base de conocimiento estructurada, completamente gratuito y mantenible.

### **Alcance:**
- ✅ Asistente conversacional integrado
- ✅ Base de conocimiento editable por administrador
- ✅ Sistema de gestión de conocimiento estructurado
- ✅ Análisis de efectividad y sugerencias de mejora
- ✅ Integración gradual con funcionalidades existentes

### **Fuera de alcance:**
- ❌ Modelos de IA externos (ChatGPT, Claude, etc.) por costos
- ❌ Machine Learning complejo inicialmente
- ❌ Procesamiento de lenguaje natural avanzado
- ❌ Integraciones con servicios externos

---

## 🏗️ **Solución Técnica**

### **1. Motor de IA (services/iaAsistente.js)**

```javascript
class AsistenteLifeBit {
    constructor() {
        this.baseConocimiento = {};
        this.historialConversacion = [];
        this.estadisticas = {
            totalInteracciones: 0,
            tasaEfectividad: 0,
            preguntasFrecuentes: []
        };
    }

    async procesarPregunta(pregunta, contexto = {}) {
        // 1. Normalizar pregunta
        const preguntaLimpia = this.normalizarPregunta(pregunta);

        // 2. Buscar en base de conocimiento
        const respuesta = this.buscarRespuesta(preguntaLimpia, contexto);

        // 3. Calcular confianza
        const confianza = this.calcularConfianza(respuesta, preguntaLimpia);

        // 4. Registrar interacción
        await this.registrarInteraccion(pregunta, respuesta, contexto, confianza);

        return {
            respuesta,
            confianza,
            sugerenciasCorreccion: confianza < 0.7
        };
    }

    normalizarPregunta(pregunta) {
        return pregunta
            .toLowerCase()
            .replace(/[¿?¡!.,;:]/g, '')
            .trim();
    }

    buscarRespuesta(pregunta, contexto) {
        // Algoritmo de búsqueda por palabras clave
        const palabrasClave = this.extraerPalabrasClave(pregunta);

        for (const palabra of palabrasClave) {
            const respuesta = this.baseConocimiento[palabra];
            if (respuesta) {
                return this.adaptarRespuesta(respuesta, contexto);
            }
        }

        return this.respuestaPorDefecto(contexto);
    }

    calcularConfianza(respuesta, pregunta) {
        if (!respuesta) return 0;

        // Lógica simple de cálculo de confianza
        const palabrasPregunta = pregunta.split(' ');
        const palabrasRespuesta = respuesta.split(' ');
        const interseccion = palabrasPregunta.filter(p =>
            palabrasRespuesta.some(r => r.includes(p))
        );

        return Math.min(interseccion.length / palabrasPregunta.length, 1);
    }
}
```

### **2. Base de Conocimiento (JSON Estructurado)**

```javascript
// data/base-conocimiento-ia.json
{
    "version": "1.0.0",
    "ultima_actualizacion": "2025-09-20",
    "autor": "Administrador LifeBit",

    "conocimiento": {
        "configurar": {
            "edificio": {
                "palabras_clave": ["configurar", "edificio", "propiedad", "setup"],
                "respuesta": "Para configurar tu edificio: 1) Ve a Configuración > Propiedad, 2) Selecciona tipo de propiedad, 3) Define pisos y unidades, 4) Configura alícuotas. ¿Te ayudo con algún paso específico?",
                "contexto_necesario": ["tipo_propiedad"],
                "dificultad": "facil",
                "veces_usada": 0,
                "efectividad_promedio": 0
            }
        },

        "residentes": {
            "invitar": {
                "palabras_clave": ["invitar", "residente", "agregar", "nuevo"],
                "respuesta": "Para invitar residente: 1) Ve a Residentes, 2) Clic 'Invitar Residente', 3) Completa nombre, email y unidad. Recibirán email de activación.",
                "acciones_sugeridas": ["ir_a_residentes", "mostrar_modal_invitacion"],
                "dificultad": "facil"
            },

            "problemas": {
                "token_expirado": {
                    "patrones": ["token expirado", "enlace caducado", "no funciona invitacion"],
                    "respuesta": "Los tokens expiran en 24 horas por seguridad. Puedes reenviar la invitación desde la lista de residentes: busca al residente, haz clic en el botón 'Reenviar' (📧) junto a su nombre.",
                    "solucion": "reenviar_invitacion",
                    "prevencion": "informar_tiempo_limite"
                }
            }
        }
    },

    "conversacion": {
        "saludos": [
            "¡Hola! Soy tu asistente de LifeBit. ¿En qué puedo ayudarte?",
            "¡Bienvenido! Estoy aquí para ayudarte con LifeBit. ¿Qué necesitas?"
        ],

        "no_entendi": [
            "No estoy seguro de entender tu pregunta. ¿Podrías reformularla?",
            "Disculpa, no tengo información sobre eso. ¿Puedes darme más detalles?"
        ],

        "correccion": [
            "¿Te parece bien esta respuesta o quieres que la corrija?",
            "Si esta respuesta no es correcta, puedes enseñarme la versión correcta."
        ]
    }
}
```

### **3. Sistema de Aprendizaje (services/aprendizajeIA.js)**

```javascript
class SistemaAprendizajeIA {
    async registrarInteraccion(pregunta, respuesta, contexto, feedback) {
        // Guardar en base de datos
        await db.interaccionesIA.create({
            pregunta_original: pregunta,
            respuesta_dada: respuesta,
            contexto: contexto,
            feedback: feedback,
            timestamp: new Date()
        });

        // Actualizar estadísticas
        await this.actualizarEstadisticas(pregunta, feedback);

        // Identificar patrones de mejora
        if (feedback < 3) {
            await this.identificarMejoraNecesaria(pregunta, respuesta);
        }
    }

    async actualizarEstadisticas(pregunta, feedback) {
        const preguntaNormalizada = this.normalizarPregunta(pregunta);

        await db.estadisticasPreguntas.upsert({
            where: { pregunta: preguntaNormalizada },
            update: {
                frecuencia: { increment: 1 },
                ultimo_uso: new Date(),
                efectividad_promedio: feedback ? (feedback + this.efectividad_actual) / 2 : this.efectividad_actual
            },
            create: {
                pregunta: preguntaNormalizada,
                frecuencia: 1,
                ultimo_uso: new Date(),
                efectividad_promedio: feedback || 0
            }
        });
    }

    async identificarMejoraNecesaria(pregunta, respuesta) {
        // Lógica para identificar qué mejorar
        const analisis = {
            pregunta_frecuente: await this.esPreguntaFrecuente(pregunta),
            respuesta_insuficiente: this.analizarCalidadRespuesta(respuesta),
            contexto_faltante: this.detectarContextoFaltante(pregunta)
        };

        if (analisis.pregunta_frecuente || analisis.respuesta_insuficiente) {
            await this.generarSugerenciaMejora(pregunta, analisis);
        }
    }

    async generarSugerenciasMejora() {
        const preguntasProblematicas = await db.estadisticasPreguntas.findMany({
            where: {
                frecuencia: { gt: 5 },
                efectividad_promedio: { lt: 3 }
            },
            orderBy: { frecuencia: 'desc' }
        });

        return preguntasProblematicas.map(pregunta => ({
            tipo: 'mejorar_respuesta',
            pregunta: pregunta.pregunta,
            problema: `Tasa de error: ${(5 - pregunta.efectividad_promedio).toFixed(1)}/5`,
            sugerencia: 'Considera agregar esta pregunta a la base de conocimiento',
            prioridad: pregunta.frecuencia > 10 ? 'alta' : 'media'
        }));
    }
}
```

### **4. Interfaz de Administración (pages/admin/IAGestion.jsx)**

```jsx
const IAGestion = () => {
    const [conocimiento, setConocimiento] = useState({});
    const [estadisticas, setEstadisticas] = useState({});
    const [sugerencias, setSugerencias] = useState([]);

    useEffect(() => {
        cargarDatosIA();
    }, []);

    const cargarDatosIA = async () => {
        const [dataConocimiento, dataEstadisticas, dataSugerencias] = await Promise.all([
            iaAPI.obtenerConocimiento(),
            iaAPI.obtenerEstadisticas(),
            iaAPI.obtenerSugerencias()
        ]);

        setConocimiento(dataConocimiento);
        setEstadisticas(dataEstadisticas);
        setSugerencias(dataSugerencias);
    };

    return (
        <div className="ia-gestion">
            <h2>🎓 Gestión de IA - Asistente LifeBit</h2>

            {/* Dashboard de Estadísticas */}
            <div className="estadisticas-grid">
                <MetricaCard
                    titulo="Total Interacciones"
                    valor={estadisticas.totalInteracciones}
                    icono="💬"
                />

                <MetricaCard
                    titulo="Tasa de Éxito"
                    valor={`${estadisticas.tasaEfectividad}%`}
                    icono="✅"
                    color={estadisticas.tasaEfectividad > 80 ? 'verde' : 'amarillo'}
                />

                <MetricaCard
                    titulo="Preguntas sin Respuesta"
                    valor={estadisticas.preguntasSinRespuesta}
                    icono="❓"
                    color="rojo"
                />

                <MetricaCard
                    titulo="Mejoras Sugeridas"
                    valor={sugerencias.length}
                    icono="💡"
                />
            </div>

            {/* Editor de Conocimiento */}
            <EditorConocimiento
                conocimiento={conocimiento}
                onChange={setConocimiento}
                onSave={() => iaAPI.actualizarConocimiento(conocimiento)}
            />

            {/* Sugerencias de Mejora */}
            <div className="sugerencias-mejora">
                <h3>💡 Sugerencias para Mejorar</h3>
                {sugerencias.map((sugerencia, i) => (
                    <SugerenciaCard key={i} sugerencia={sugerencia} />
                ))}
            </div>
        </div>
    );
};
```

### **5. Componente de Chat (components/IA/ChatAsistente.jsx)**

```jsx
const ChatAsistente = ({ contexto }) => {
    const [mensajes, setMensajes] = useState([]);
    const [mensajeActual, setMensajeActual] = useState('');
    const [mostrarCorreccion, setMostrarCorreccion] = useState(false);
    const [respuestaActual, setRespuestaActual] = useState('');

    const enviarMensaje = async () => {
        if (!mensajeActual.trim()) return;

        // Agregar mensaje del usuario
        setMensajes(prev => [...prev, {
            tipo: 'usuario',
            texto: mensajeActual,
            timestamp: new Date()
        }]);

        // Procesar con IA
        const resultado = await iaAsistente.procesarPregunta(mensajeActual, contexto);

        // Agregar respuesta de IA
        setMensajes(prev => [...prev, {
            tipo: 'asistente',
            texto: resultado.respuesta,
            confianza: resultado.confianza,
            timestamp: new Date()
        }]);

        // Mostrar opción de corrección si confianza baja
        if (resultado.confianza < 0.7) {
            setMostrarCorreccion(true);
        }

        setMensajeActual('');
    };

    return (
        <div className="chat-asistente">
            <div className="mensajes">
                {mensajes.map((msg, i) => (
                    <MensajeChat
                        key={i}
                        mensaje={msg}
                        onCorregir={() => setMostrarCorreccion(true)}
                    />
                ))}
            </div>

            {mostrarCorreccion && (
                <CorreccionIA
                    preguntaOriginal={mensajeActual}
                    respuestaActual={mensajes[mensajes.length - 1]?.texto}
                    contexto={contexto}
                    onCerrar={() => setMostrarCorreccion(false)}
                />
            )}

            <div className="input-area">
                <input
                    value={mensajeActual}
                    onChange={(e) => setMensajeActual(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                    placeholder="Pregúntame sobre LifeBit..."
                />
                <button onClick={enviarMensaje}>Enviar</button>
            </div>
        </div>
    );
};
```

---

## 🗄️ **Estructura de Base de Datos**

### **Tabla: interacciones_ia**
```sql
CREATE TABLE interacciones_ia (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    contexto JSONB,
    confianza DECIMAL(3,2),
    feedback INTEGER CHECK (feedback >= 1 AND feedback <= 5),
    corregida BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_usuario_timestamp (usuario_id, timestamp),
    INDEX idx_feedback (feedback),
    INDEX idx_confianza (confianza)
);
```

### **Tabla: conocimiento_ia**
```sql
CREATE TABLE conocimiento_ia (
    id SERIAL PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL,
    subcategoria VARCHAR(100),
    palabras_clave TEXT[],
    respuesta TEXT NOT NULL,
    contexto_necesario JSONB,
    dificultad ENUM('facil', 'medio', 'dificil') DEFAULT 'medio',
    veces_usada INTEGER DEFAULT 0,
    efectividad_promedio DECIMAL(3,2) DEFAULT 0,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_categoria (categoria),
    INDEX idx_palabras_clave USING GIN (palabras_clave),
    INDEX idx_efectividad (efectividad_promedio)
);
```

### **Tabla: estadisticas_ia**
```sql
CREATE TABLE estadisticas_ia (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total_interacciones INTEGER DEFAULT 0,
    interacciones_utiles INTEGER DEFAULT 0,
    preguntas_sin_respuesta INTEGER DEFAULT 0,
    tasa_efectividad DECIMAL(5,2),
    preguntas_mas_frecuentes JSONB,

    UNIQUE(fecha)
);
```

---

## 🔄 **Consecuencias**

### **Positivas:**
- ✅ **Reducción de soporte** 60-80% en preguntas básicas
- ✅ **Mejora UX** para usuarios no técnicos
- ✅ **Escalabilidad** - crece con la aplicación
- ✅ **Costo cero** - completamente gratuito
- ✅ **Privacidad total** - datos quedan en servidor propio
- ✅ **Mantenibilidad** - código controlable y debuggeable
- ✅ **Evolución orgánica** - mejora con uso real

### **Riesgos:**
- ⚠️ **Alcance limitado** - no tan "inteligente" como IA avanzada
- ⚠️ **Mantenimiento manual** - requiere actualización de conocimiento
- ⚠️ **Curva de aprendizaje** - para configurar base de conocimiento
- ⚠️ **Dependencia de calidad** - efectividad depende de conocimiento base

### **Mitigaciones:**
- 📚 **Base de conocimiento estructurada** - fácil de mantener
- 🔄 **Sistema de corrección** - usuarios pueden enseñar
- 📊 **Análisis de efectividad** - métricas para identificar mejoras
- 🎯 **Enfoque gradual** - empezar simple y crecer

---

## 📋 **Plan de Implementación**

### **Fase 1: Base Funcional (2 semanas)**
- [ ] Crear motor de IA básico
- [ ] Implementar sistema de búsqueda por palabras clave
- [ ] Crear base de conocimiento inicial
- [ ] Desarrollar interfaz de chat simple

### **Fase 2: Sistema de Aprendizaje (2 semanas)**
- [ ] Implementar registro de interacciones
- [ ] Crear sistema de feedback de usuarios
- [ ] Desarrollar análisis de estadísticas
- [ ] Construir generador de sugerencias

### **Fase 3: Interfaz de Administración (1 semana)**
- [ ] Crear panel de gestión de conocimiento
- [ ] Implementar editor de respuestas
- [ ] Desarrollar dashboard de estadísticas
- [ ] Construir sistema de import/export

### **Fase 4: Integración Completa (2 semanas)**
- [ ] Integrar en setup wizard
- [ ] Agregar a panel de administración
- [ ] Implementar en módulos principales
- [ ] Testing con usuarios reales

### **Fase 5: Optimización (1 semana)**
- [ ] Análisis de efectividad
- [ ] Optimizaciones basadas en datos
- [ ] Mejoras de UX
- [ ] Documentación completa

---

## 📊 **Métricas de Éxito**

### **Métricas de Usuario:**
- **Satisfacción:** > 4.2/5 en feedback de IA
- **Reducción soporte:** 60% menos consultas básicas
- **Tiempo configuración:** 70% más rápido
- **Tasa completitud setup:** > 90%

### **Métricas Técnicas:**
- **Tasa respuesta:** < 500ms promedio
- **Disponibilidad:** 99.9%
- **Precisión respuestas:** > 85%
- **Crecimiento base conocimiento:** + 20% mensual

### **Métricas de Negocio:**
- **Retención usuarios:** + 25%
- **Conversión trial:** + 40%
- **Costo soporte:** - 50%
- **Valor percibido:** + 30%

---

## 🎯 **Alternativas Consideradas**

### **Opción 1: IA Externa (ChatGPT, Claude)**
- **Ventajas:** Más inteligente, rápido desarrollo
- **Desventajas:** Costoso ($0.002/token), dependiente, privacidad
- **Decisión:** Rechazada por presupuesto limitado

### **Opción 2: IA Local Avanzada (DeepSeek, etc.)**
- **Ventajas:** Privada, inteligente, sin costos recurrentes
- **Desventajas:** Compleja configuración, recursos intensivos
- **Decisión:** Considerada para futuro, pero sobrekill inicial

### **Opción 3: Sistema de Ayuda Estático**
- **Ventajas:** Simple, barato, mantenible
- **Desventajas:** No interactivo, menos efectivo
- **Decisión:** Baseline, nuestra solución es superior

---

## 📝 **Notas Adicionales**

### **Consideraciones Éticas:**
- **Transparencia:** Siempre indicar cuando es IA vs humano
- **Privacidad:** No almacenar datos sensibles de conversaciones
- **Consentimiento:** Permitir desactivar IA si usuario prefiere
- **Responsabilidad:** Sistema de reporte de respuestas incorrectas

### **Evolución Futura:**
- **Fase 2:** Integración con modelos de IA locales
- **Fase 3:** Machine Learning para predicción de necesidades
- **Fase 4:** Personalización avanzada por perfil de usuario

### **Mantenimiento:**
- **Revisiones semanales:** Actualizar base de conocimiento
- **Análisis mensual:** Revisar estadísticas y efectividad
- **Feedback continuo:** Incorporar correcciones de usuarios

---

**Estado:** ⏳ **Pendiente de Implementación**
**Prioridad:** 🔴 **Alta**
**Esfuerzo Estimado:** 8-10 semanas
**Riesgo:** 🟡 **Medio**
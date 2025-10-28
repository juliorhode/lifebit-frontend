/**
 * @file CountdownCircle.jsx
 * @description Componente de UI reutilizable que muestra un contador visual en forma de círculo
 * que se vacía con el tiempo. Ideal para redirecciones automáticas o acciones temporizadas.
 *
 * @param {object} props - Propiedades del componente.
 * @param {number} props.duration - La duración total de la cuenta regresiva en segundos.
 * @param {function} props.onComplete - Callback que se ejecuta cuando el contador llega a cero.
 * @param {number} [props.size=100] - El tamaño (ancho y alto) del SVG en píxeles.
 * @param {number} [props.strokeWidth=8] - El grosor del trazo del círculo.
 * @returns {JSX.Element}
 */
import React, { useState, useEffect, useMemo } from 'react';

const CountdownCircle = ({ duration, onComplete, size = 100, strokeWidth = 8 }) => {
    // --- ESTADO INTERNO ---
    // `timeLeft` almacena el número de segundos restantes. Se inicializa con la duración total.
    const [timeLeft, setTimeLeft] = useState(duration);

    // --- LÓGICA DEL TEMPORIZADOR ---
    // Este `useEffect` se encarga de la cuenta regresiva.
    useEffect(() => {
        // Si el tiempo llega a 0, no hacemos nada más.
        if (timeLeft <= 0) {
            // Llamamos a la función onComplete que nos pasaron desde el componente padre.
            if (onComplete) onComplete();
            return;
        }

        // `setInterval` es una función de JavaScript que ejecuta un bloque de código
        // repetidamente cada X milisegundos. Aquí, cada 1000ms (1 segundo).
        const intervalId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        // --- FUNCIÓN DE LIMPIEZA ---
        // Esta es la parte más importante de un `useEffect` con intervalos o suscripciones.
        // La función que se retorna se ejecuta cuando el componente se "desmonta" (deja de renderizarse)
        // o antes de que el efecto se vuelva a ejecutar.
        // `clearInterval` detiene el intervalo, previniendo fugas de memoria y bugs.
        return () => clearInterval(intervalId);

    }, [timeLeft, onComplete]); // El efecto depende de `timeLeft`. Se re-evalúa cada vez que cambia.

    // --- CÁLCULOS PARA LA ANIMACIÓN SVG ---
    // `useMemo` es un hook de optimización. Estos cálculos solo se volverán a ejecutar
    // si `size` o `strokeWidth` cambian, no en cada re-renderizado por el cambio de `timeLeft`.
    const { radius, circumference, strokeDashoffset } = useMemo(() => {
        // El radio es la mitad del tamaño, menos la mitad del grosor del trazo para que encaje perfectamente.
        const radius = (size - strokeWidth) / 2;
        // La circunferencia del círculo (perímetro). Fórmula: 2 * PI * radio.
        const circumference = 2 * Math.PI * radius;
        // Calculamos el progreso. Ej: si quedan 3 de 5s, el progreso es 0.6.
        const progress = timeLeft / duration;
        // `strokeDashoffset` es la magia de la animación. Mueve el "inicio" del trazo.
        // Al cambiarlo de `circumference` (completamente "vacío") a 0 (completamente "lleno"),
        // creamos el efecto de animación. Aquí lo hacemos al revés para que se "vacíe".
        const strokeDashoffset = circumference * (1 - progress);

        return { radius, circumference, strokeDashoffset };
    }, [size, strokeWidth, timeLeft, duration]);

    // --- RENDERIZADO DEL SVG ---
    return (
        <div className="relative" style={{ width: size, height: size }}>
            {/* El SVG es el contenedor de nuestros elementos gráficos. */}
            <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
                {/* Círculo de fondo: es el trazo gris que siempre está visible. */}
                <circle
                    className="text-gray-200 dark:text-gray-700"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Círculo de progreso: es el trazo azul que se anima. */}
                <circle
                    className="text-blue-500"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round" // Bordes redondeados para el trazo.
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    // `stroke-dasharray` define el patrón de guiones. Al poner la circunferencia,
                    // creamos un "guion" del tamaño exacto del círculo.
                    strokeDasharray={circumference}
                    // `stroke-dashoffset` mueve el inicio de ese guion. Animando este valor,
                    // parece que el círculo se llena o se vacía.
                    style={{
                        strokeDashoffset,
                        transform: 'rotate(-90deg)', // Rotamos -90 grados para que empiece desde arriba.
                        transformOrigin: '50% 50%', // El punto de rotación es el centro.
                        transition: 'stroke-dashoffset 0.5s linear', // Animación suave.
                    }}
                />
            </svg>
            {/* El número del contador: posicionado absolutamente en el centro del div. */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">{timeLeft}</span>
            </div>
        </div>
    );
};

export default CountdownCircle;
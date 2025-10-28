/**
 * @file Sandbox.jsx
 * @description Esta página es un "cajón de arena" para el desarrollo.
 * No forma parte de la aplicación final. Su único propósito es permitirnos
 * probar y visualizar componentes de forma aislada y rápida.
 * @returns {JSX.Element}
 */
import React from 'react';
import CountdownCircle from '../components/ui/CountdownCircle';
import { STYLES } from '../utils/styleConstants';
import ThemeToggle from '../components/ThemeToggle'; // Importamos el toggle para probar ambos temas
import { FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Sandbox = () => {

    const handleCountdownComplete = () => {
        console.log("¡Contador finalizado en el Sandbox!");
        // En un entorno de prueba, podemos añadir alertas o logs para verificar que el callback funciona.
        // alert("¡Temporizador completado!");
    };

    return (
        // Usamos el fondo de página estándar para una previsualización precisa.
        <main className={`${STYLES.backgroundPage} min-h-screen p-8`}>
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-theme-light">
                    <h1 className="text-primary text-3xl font-bold">Component Sandbox</h1>
                    <ThemeToggle />
                </div>

                <section className="card-theme p-8">
                    <h2 className="text-xl font-semibold text-primary mb-6">Prueba Visual: CountdownCircle</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-items-center">

                        {/* Ejemplo 1: Tamaño estándar */}
                        <div className="flex flex-col items-center">
                            <h3 className="text-secondary mb-4">Duración: 5s, Tamaño: 120px</h3>
                            <CountdownCircle
                                duration={5}
                                onComplete={handleCountdownComplete}
                                size={120}
                                strokeWidth={10}
                            />
                        </div>

                        {/* Ejemplo 2: Tamaño pequeño */}
                        <div className="flex flex-col items-center">
                            <h3 className="text-secondary mb-4">Duración: 10s, Tamaño: 80px</h3>
                            <CountdownCircle
                                duration={10}
                                onComplete={handleCountdownComplete}
                                size={80}
                                strokeWidth={6}
                            />
                        </div>

                        {/* Ejemplo 3: Larga duración */}
                        <div className="flex flex-col items-center">
                            <h3 className="text-secondary mb-4">Duración: 15s, Tamaño: 100px</h3>
                            <CountdownCircle
                                duration={15}
                                onComplete={handleCountdownComplete}
                                size={100}
                                strokeWidth={8}
                            />
                        </div>
                    </div>
                </section>

                {/* Aquí podríamos añadir más componentes para probar en el futuro */}
                <>
                    <FiCheckCircle className="h-20 w-20 text-green-500" />
                    <h2 className="text-2xl font-semibold text-primary mt-4">¡Correo Verificado Exitosamente!</h2>
                    <p className="text-secondary mt-2">
                        Tu dirección de correo ha sido actualizada. Serás redirigido a la página de inicio de sesión en 5 segundos.
                    </p>
                    <Link to="/login" className="btn-primary mt-6">Ir a Login Ahora</Link>
                </>
            </div>
        </main>
    );
};

export default Sandbox;
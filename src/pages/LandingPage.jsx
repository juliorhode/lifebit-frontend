import React, { useState } from 'react';
import { FiXCircle, FiCheckCircle, FiSettings, FiZap, FiMessageSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SolicitudForm from '../components/SolicitudForm';
import nosotros from '../assets/nosotros.jpg';
import Logo from '../components/ui/Logo';

// Sub-componente para el Header
const Header = () => (
    <header className="bg-gray-900 bg-opacity-80 backdrop-blur-sm text-white p-4 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
            <Logo />
            <nav>
                <Link
                    to="/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Iniciar Sesión
                </Link>
            </nav>
        </div>
    </header>
);

const HeroSection = () => (
    <section className="relative h-screen flex items-center justify-center text-white">
        <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://picsum.photos/seed/lifebit-hero/1920/1080')" }}
        ></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        {/* 
        pt-24: Esta es la clase clave. pt significa padding-top. El número 24 en Tailwind corresponde a 6rem o 96px. Esto "empujará" todo el contenido del Hero (el h1, el párrafo, el botón) 96 píxeles hacia abajo, dejando espacio más que suficiente para que el Header se vea sin tapar nada.
        sm:pt-4: Este es un ajuste responsivo. sm significa "small screens" y superiores. Le decimos: "En pantallas pequeñas (móvil) aplica el padding-top de 24. Pero en pantallas un poco más grandes (sm y hacia arriba), donde el layout cambia, vuelve a un padding más normal (pt-4), porque el flex items-center ya se encarga de centrar el contenido verticalmente en la pantalla completa (h-screen).
         */}
        <div className="relative z-10 text-center p-4 pt-24 sm:pt-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
                Menos Caos. Más Comunidad.
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
                LifeBit es la plataforma todo-en-uno que centraliza las finanzas, la comunicación y la administración de tu edificio. Transparencia para los residentes, poder para el administrador.
            </p>
            <a
                href="#solicitud"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-transform transform hover:scale-105"
            >
                Inicia tu Prueba Gratuita de 30 Días
            </a>
            <p className="mt-4 text-sm text-gray-300">
                La plataforma de confianza para administradores modernos.
            </p>
        </div>
    </section>
);

// Sub-componente para la sección "Problema/Solución"
const ProblemSolutionSection = () => (
    <section className="py-20 bg-gray-800 text-gray-200">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Columna "Antes" */}
                <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-bold text-white mb-6">¿Te suena familiar?</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start">
                            <FiXCircle className="text-red-500 mr-3 mt-1 flex-shrink-0" size={20} />
                            <span>Grupos de WhatsApp fuera de control y llenos de ruido.</span>
                        </li>
                        <li className="flex items-start">
                            <FiXCircle className="text-red-500 mr-3 mt-1 flex-shrink-0" size={20} />
                            <span>Hojas de cálculo interminables que nunca cuadran.</span>
                        </li>
                        <li className="flex items-start">
                            <FiXCircle className="text-red-500 mr-3 mt-1 flex-shrink-0" size={20} />
                            <span>Falta de transparencia en las cuentas que genera desconfianza.</span>
                        </li>
                        <li className="flex items-start">
                            <FiXCircle className="text-red-500 mr-3 mt-1 flex-shrink-0" size={20} />
                            <span>Proceso de cobranza manual, repetitivo y agotador.</span>
                        </li>
                    </ul>
                </div>
                {/* Columna "Después" */}
                <div className="bg-gray-900 p-8 rounded-lg shadow-lg border-t-4 border-blue-600">
                    <h3 className="text-2xl font-bold text-white mb-6">Bienvenido a la Claridad.</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start">
                            <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                            <span>Comunicación centralizada, profesional y directa.</span>
                        </li>
                        <li className="flex items-start">
                            <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                            <span>Finanzas automatizadas y reportes a un solo clic.</span>
                        </li>
                        <li className="flex items-start">
                            <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                            <span>Transparencia total en gastos y pagos para generar confianza.</span>
                        </li>
                        <li className="flex items-start">
                            <FiCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                            <span>Automatización de recordatorios y registro de cobros.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
);

// Sub-componente para la sección "Cómo Funciona"
const HowItWorksSection = () => (
    <section className="py-20 bg-gray-900 text-gray-200">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Empezar es muy fácil</h2>
            <p className="text-lg text-gray-400 mb-12">En solo tres pasos, tu condominio estará en el futuro.</p>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
                    <div className="bg-blue-600/20 text-blue-400 rounded-full p-4 mb-6">
                        <FiSettings size={40} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">1. Configura</h3>
                    <p className="text-gray-400">Genera la estructura de tu edificio, unidades y residentes en minutos.</p>
                </div>
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
                    <div className="bg-blue-600/20 text-blue-400 rounded-full p-4 mb-6">
                        <FiZap size={40} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">2. Automatiza</h3>
                    <p className="text-gray-400">Crea reglas para la cobranza, multas y comunicación recurrente.</p>
                </div>
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
                    <div className="bg-blue-600/20 text-blue-400 rounded-full p-4 mb-6">
                        <FiMessageSquare size={40} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">3. Comunícate</h3>
                    <p className="text-gray-400">Publica noticias, realiza votaciones y mantén a todos informados.</p>
                </div>
            </div>
        </div>
    </section>
);

// Sub-componente para la sección de Testimonios
const TestimonialsSection = () => (
    <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-white mb-12">Lo que dicen nuestros administradores</h2>
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
                    <div className="flex items-center mb-4">
                        <img src="https://picsum.photos/seed/person1/100/100" alt="Ana Pérez" className="w-16 h-16 rounded-full mr-4" />
                        <div>
                            <p className="font-bold text-lg text-gray-100">Ana Pérez</p>
                            <p className="text-gray-400">Administradora, Residencias El Sol</p>
                        </div>
                    </div>
                    <p className="text-gray-300 text-lg italic">
                        "Desde que usamos LifeBit, redujimos la morosidad en un 40%. La conciliación de pagos que me tomaba 8 horas ahora la hago en 30 minutos."
                    </p>
                </div>
                <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
                    <div className="flex items-center mb-4">
                        <img src="https://picsum.photos/seed/person2/100/100" alt="Carlos Rodríguez" className="w-16 h-16 rounded-full mr-4" />
                        <div>
                            <p className="font-bold text-lg text-gray-100">Carlos Rodríguez</p>
                            <p className="text-gray-400">Junta de Condominio, Edificio Altamira</p>
                        </div>
                    </div>
                    <p className="text-gray-300 text-lg italic">
                        "La comunicación mejoró 100%. Los residentes se sienten escuchados y las votaciones online nos ahorraron semanas de coordinación."
                    </p>
                </div>
            </div>
        </div>
    </section>
);

// Sub-componente para la tarjeta de un plan
const PlanCard = ({ plan, popular, onSelectPlan }) => (
    <div className={`max-w-sm bg-gray-800 p-8 rounded-lg shadow-lg text-center flex flex-col ${popular ? 'border-4 border-blue-600 transform scale-105' : 'border border-gray-700'}`}>
        {popular && (
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase absolute -top-4 left-1/2 -translate-x-1/2">
                Más Popular
            </span>
        )}
        <h3 className="text-2xl font-bold mb-4 text-gray-100">{plan.name}</h3>
        <p className="text-4xl font-extrabold mb-2 text-white">{plan.price}</p>
        <p className="text-gray-400 mb-6">{plan.period}</p>
        <ul className="space-y-4 text-gray-300 mb-8 flex-grow">
            {plan.features.map((feature, index) => (
                feature ? (
                    <li key={index} className="flex items-center">
                        <FiCheckCircle className="text-green-500 mr-2" />
                        <span>{feature}</span>
                    </li>
                ) : (
                    <li key={index} className="flex items-center" aria-hidden="true">
                        <FiCheckCircle className="text-transparent mr-2" />
                        <span className="text-transparent select-none">.</span>
                    </li>
                )
            ))}
        </ul>
        <a
            href="#solicitud"
            onClick={() => onSelectPlan(plan.id)}
            className={`w-full block py-3 px-6 rounded-lg font-bold transition-colors ${popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
        >
            Elegir Plan
        </a>
    </div>
);

// Sub-componente para la sección "Sobre Nosotros"
const AboutUsSection = () => (
    <section className="py-20 bg-gray-900 text-gray-200">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-4xl font-bold text-white mb-6">Sobre Nosotros</h2>
                    <p className="text-lg mb-6">
                        En LifeBit, creemos que la vida en comunidad puede ser más fácil, transparente y conectada.
                        Nuestra misión es empoderar a administradores y residentes con herramientas que fomenten la confianza
                        y simplifiquen la gestión del día a día.
                    </p>
                    <p className="text-lg">
                        Nos apasiona crear soluciones innovadoras que respondan a las necesidades reales de los condominios,
                        desde la automatización de tareas financieras hasta la comunicación efectiva y la toma de decisiones
                        colaborativas.
                    </p>
                </div>
                <div>
                    <img
                        src={nosotros}
                        alt="Equipo LifeBit"
                        className="rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </div>
    </section>
);

// Sub-componente para la sección "¿Por qué somos innovadores?"
const WhyInnovativeSection = () => (
    <section className="py-20 bg-gray-800 text-gray-200">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">¿Por qué LifeBit es Innovador?</h2>
            <p className="text-lg text-gray-400 mb-8">
                No solo digitalizamos tareas, transformamos la experiencia de vivir en comunidad.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Psicología del Comportamiento</h3>
                    <p className="text-gray-400">
                        Diseñamos funciones que incentivan la participación y la transparencia, creando un sentido de pertenencia y responsabilidad compartida.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Automatización Inteligente</h3>
                    <p className="text-gray-400">
                        Nuestro motor de reglas aprende de tus necesidades, anticipa problemas y ofrece soluciones personalizadas, liberándote de tareas repetitivas.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Diseño Centrado en el Usuario</h3>
                    <p className="text-gray-400">
                        Cada detalle de LifeBit está pensado para ser intuitivo y accesible, garantizando una experiencia fluida para todos, sin importar su nivel de experiencia tecnológica.
                    </p>
                </div>
            </div>
        </div>
    </section>
);

// Sub-componente para la sección de Planes
const PlansSection = ({ onSelectPlan }) => {
    const plans = [
        {
            id: '1',
            name: 'Básico',
            price: '$49',
            period: 'por mes',
            features: [
                'Gestión de hasta 50 unidades',
                'Comunicación y Noticias',
                'Reporte de Pagos',
                'Soporte por Email',
                '' // Placeholder
            ]
        },
        {
            id: '2',
            name: 'Gold',
            price: '$99',
            period: 'por mes',
            features: [
                'Todo en Básico',
                'Unidades Ilimitadas',
                'Conciliación Bancaria',
                'Motor de Reglas Básico',
                'Soporte Prioritario'
            ],
            popular: true
        },
        {
            id: '3',
            name: 'Premium',
            price: '$149',
            period: 'por mes',
            features: [
                'Todo en Gold',
                'Módulo de Elecciones',
                'Motor de Reglas Avanzado',
                'Soporte Dedicado 24/7',
                '' // Placeholder
            ]
        }
    ];

    return (
        <section className="py-20 bg-gray-900 text-gray-200">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold text-white mb-4">Planes para cada necesidad</h2>
                <p className="text-lg text-gray-400 mb-12">Elige el plan que mejor se adapte al tamaño y complejidad de tu condominio.</p>
                <div className="grid justify-items-center gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto relative">
                    {plans.map((plan) => (
                        <PlanCard key={plan.id} plan={plan} popular={plan.popular} onSelectPlan={onSelectPlan} />
                    ))}
                </div>
            </div>
        </section>
    );
};

// Sub-componente para la sección del Formulario
const FormSection = ({ selectedPlan }) => (
    <section id="solicitud" className="py-20 bg-gray-800 text-white">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4">Empieza tus 30 Días de Prueba Gratuita</h2>
            <p className="text-lg text-gray-300 mb-8">Sin Riesgos. Sin Tarjeta de Crédito Requerida.</p>
            <div className="max-w-4xl mx-auto">
                <SolicitudForm selectedPlan={selectedPlan} />
            </div>
        </div>
    </section>
);

// Sub-componente para el Footer
const Footer = () => (
    <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-6 text-center">
            <p>&copy; {new Date().getFullYear()} LifeBit. Todos los derechos reservados.</p>
            <div className="flex justify-center space-x-6 mt-4">
                <a href="#" className="hover:text-white">Términos de Servicio</a>
                <a href="#" className="hover:text-white">Política de Privacidad</a>
            </div>
        </div>
    </footer>
);


const LandingPage = () => {
    const [selectedPlan, setSelectedPlan] = useState('2'); // Gold por defecto

    return (
        <div className="bg-black">
            <Header />
            <HeroSection />
            <main>
                <ProblemSolutionSection />
                <AboutUsSection />
                <WhyInnovativeSection />
                <HowItWorksSection />
                <TestimonialsSection />
                <PlansSection onSelectPlan={setSelectedPlan} />
                <FormSection selectedPlan={selectedPlan} />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
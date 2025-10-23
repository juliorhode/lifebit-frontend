/**
 * @file Archivo de configuración central para la navegación del Dashboard.
 * Define la estructura de los enlaces del Sidebar y los permisos de rol
 * para cada uno. Sirve como la ÚNICA FUENTE DE VERDAD para la navegación.
 *
 * ESTRUCTURA DE UN OBJETO DE ENLACE:
 * - to: La ruta de react-router a la que apunta el enlace.
 * - IconComponent: El componente de icono a mostrar (NO el JSX).
 * - text: El texto del enlace.
 * - rolesPermitidos: Un array de strings con los roles que pueden ver este enlace.
 * - type: (Opcional) 'link' o 'action'. Por defecto es 'link'.
 * - exact: (Opcional) Booleano para la coincidencia exacta de ruta en NavLink.
 */
import { FiGrid, FiUsers, FiCpu, FiSettings, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import { FaFileContract } from 'react-icons/fa';

// --- ENLACES DE NAVEGACIÓN PRINCIPAL ---
export const navLinksConfig = [
	{
		to: '/dashboard',
		IconComponent: FiGrid,
		text: 'Dashboard',
		rolesPermitidos: ['dueño_app', 'administrador', 'residente'],
		exact: true,
	},
	{
		to: '/dashboard/contratos',
		IconComponent: FaFileContract,
		text: 'Contratos',
		rolesPermitidos: ['dueño_app'],
	},
	{
		to: '/dashboard/residentes',
		IconComponent: FiUsers,
		text: 'Residentes',
		rolesPermitidos: ['administrador'],
	},
	{
		to: '/dashboard/recursos',
		IconComponent: FiCpu,
		text: 'Recursos',
		rolesPermitidos: ['administrador'],
	},
];

// --- ENLACES DE NAVEGACIÓN SECUNDARIA ---
export const bottomLinksConfig = [
	{
		type: 'link',
		to: '/dashboard/mi-cuenta',
		IconComponent: FiSettings,
		text: 'Mi Cuenta',
		rolesPermitidos: ['dueño_app', 'administrador', 'residente'],
	},
	{
		type: 'link',
		to: '/dashboard/ayuda',
		IconComponent: FiHelpCircle,
		text: 'Ayuda',
		rolesPermitidos: ['dueño_app', 'administrador', 'residente'],
	},
	{
		type: 'action',
		action: 'logout',
		IconComponent: FiLogOut,
		text: 'Salir',
		rolesPermitidos: ['dueño_app', 'administrador', 'residente'],
	},
];

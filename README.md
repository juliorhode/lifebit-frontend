# react-hook-form: 
Es la librería principal que nos ayudará a gestionar el estado del formulario (qué ha escrito el usuario, qué campos tienen errores, etc.) de una manera muy eficiente.
# yup: 
Es nuestra "biblioteca de reglas". Es donde definiremos cómo deben ser nuestros datos (ej. "el email debe parecer un email", "la cédula debe tener este formato"). 
## Instalacion
`npm install react-hook-form yup`
## Propósito: 
Yup en un esquema como un contrato o un molde que le dice a nuestros datos: "Para ser considerados válidos, deben tener esta forma y cumplir estas reglas".
## Centralización: 
En lugar de poner las reglas de validación directamente dentro del componente del formulario, las definiremos por separado. Esto sigue el principio de Separación de Preocupaciones. Nuestro componente se encargará de "pintar" el formulario, y el esquema se encargará de "validarlo".

# React Hook Form:
- useForm(): Este es el hook principal. Nos dará un conjunto de herramientas para trabajar.
- register: Una función que "registra" cada input en el formulario. Le dice a React Hook Form: "Quiero que gestiones el estado de este campo".
- handleSubmit: Una función que envuelve nuestro propio onSubmit. Su magia es que solo llamará a nuestra función si y solo si todas las validaciones del esquema de Yup han pasado.
- formState: { errors }: Un objeto que contendrá todos los mensajes de error de validación.
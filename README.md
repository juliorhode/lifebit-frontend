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


# NOTA IMPORTANTE
- En src/components/auth/ForgotPasswordForm.jsx eliminar las siguientes lineas, al pasar a produccion
  - Linea 46: const delay = new Promise(resolve => setTimeout(resolve, 2000));
  - Linea 50: await delay 

# Libreria dnd-kit
El "Porqué" de dnd-kit:
- Moderna y Potente: Está construida con hooks de React modernos y es extremadamente personalizable.
- Accesibilidad Primero: A diferencia de otras librerías, fue diseñada desde cero para ser totalmente accesible, funcionando con lectores de pantalla y navegación por teclado. Esto es un requisito de calidad enorme.
- Ligera y de Alto Rendimiento: No causa problemas de rendimiento.
- Agnóstica a la Apariencia: Nos da la lógica del drag-and-drop, pero nos deja a nosotros (con Tailwind) el control total sobre cómo se ven las cosas.
## Instalacion
`npm install @dnd-kit/core @dnd-kit/sortable`
- @dnd-kit/core: Este es el paquete principal. Contiene el "cerebro" de la librería, los contextos y los hooks para definir qué es arrastrable y qué es un área de destino.
- @dnd-kit/sortable: Este es un paquete de utilidades construido sobre el core. Es perfecto para nuestro caso de uso, ya que nos da herramientas pre-construidas para crear listas reordenables (como nuestros bloques en el "lienzo").

- \<Block />: Será el componente más simple, pero el más fundamental. Representará una "pieza" individual, arrastrable. Será un componente "tonto", que solo mostrará el texto y el estilo que le pasemos.
- \<DraggablePalette />: La "caja de herramientas". Su única misión será renderizar una lista de componentes <Block /> haciéndolos arrastrables.
- \<DroppableCanvas />: El "lienzo de construcción". Será el área donde el usuario podrá soltar los bloques de la paleta.
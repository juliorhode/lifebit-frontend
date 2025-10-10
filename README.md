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

# Libreria react Toast Notification
Es un sistema de notificaciones no intrusivo. "Toast Notification" (también llamado "Snackbar") es un pequeño mensaje que aparece en una esquina de la pantalla (generalmente la superior derecha) durante unos segundos y luego desaparece automáticamente.

## Instalacion
`npm install react-hot-toast`

# Libreria uuid
Es una librería que nos permite generar identificadores únicos universales (UUIDs). Estos identificadores son útiles cuando necesitamos un ID que sea único en todo el sistema, como para identificar usuarios, sesiones, transacciones, etc. Los UUIDs son especialmente valiosos en aplicaciones distribuidas donde múltiples sistemas pueden estar generando IDs simultáneamente, ya que la probabilidad de colisión (dos sistemas generando el mismo ID) es extremadamente baja.
## Instalacion
`npm install uuid`

## Uso
Lo usaremos en src/modules/residentes/hooks/useGestionResidentes.js para generar IDs únicos para los borradores de residentes que se almacenan en localStorage. Esto asegura que cada borrador tenga un identificador único, facilitando su gestión (creación, edición, eliminación) sin riesgo de colisiones con otros borradores.


# Comando Git
* git branch tmp-residentes-refactor (Para nombrar y salvar tu trabajo actual)
  Crea una nueva rama llamada tmp-residentes-refactor que apunta exactamente al commit que acabas de hacer. Tu HEAD todavía está desacoplado, pero tu trabajo ya tiene un nombre y está a salvo.
* git checkout main (Para volver a tu rama de trabajo principal)
  Mueve tu HEAD de vuelta a la punta de la rama main. Ahora estás de nuevo en un estado "normal". Tu terminal debería indicarte que estás en la rama main.
* git merge tmp-residentes-refactor (Para incorporar tu trabajo a la rama principal)
  Git aplicará el commit que hiciste (que está en la punta de tmp-residentes-refactor) sobre tu rama main. Como main probablemente no ha cambiado desde que te desacoplaste, esto debería ser una fusión "fast-forward", lo que significa que simplemente moverá el puntero de main para que apunte a tu nuevo commit. No debería haber conflictos.
* git push (Para subir los cambios al remoto)
* git branch -d tmp-residentes-refactor (Para limpiar la rama temporal)
  Borra la rama tmp-residentes-refactor de tu repositorio local, manteniendo todo limpio.

# Manual de Supervivencia de Git: Guía de Casos Reales

Este documento es una guía de referencia rápida para resolver problemas comunes en Git. El objetivo es proporcionar soluciones seguras y explicar el "porqué" de cada comando.

## Escenario 1: "Estoy en un `HEAD` desacoplado" (Tu caso)

-   **Síntoma:** Al hacer `git status` ves `HEAD detached at <commit-hash>` y al hacer `git push` recibes `fatal: Currently not on any branch`.
-   **Causa Común:** Hiciste `checkout` directamente a un hash de commit, a una etiqueta (`tag`), o a una rama remota (`git checkout origin/feature-xyz`) en lugar de a una rama local.
-   **El Peligro:** Si haces nuevos commits en este estado y luego te cambias a otra rama, esos commits pueden "perderse" (quedan huérfanos y serán eliminados por el recolector de basura de Git).

### Solución Segura:

1.  **NO ENTRES EN PÁNICO.** Tu trabajo no se ha perdido, especialmente si ya hiciste `commit`.
2.  **Salva tu trabajo actual dándole un nombre (creando una rama):**
    ```bash
    # Crea una nueva rama llamada 'mi-trabajo-salvado' justo donde estás ahora
    git branch mi-trabajo-salvado
    ```
3.  **Vuelve a tu rama de trabajo principal** (usualmente `main` o `master`):
    ```bash
    git checkout main
    ```
4.  **Fusiona los cambios salvados** en tu rama principal:
    ```bash
    # 'merge' traerá los commits de 'mi-trabajo-salvado' a 'main'
    git merge mi-trabajo-salvado
    ```
    *En este punto, tus cambios ya están seguros en `main`.*
5.  **(Opcional) Sube tus cambios al repositorio remoto:**
    ```bash
    git push
    ```
6.  **Limpia la rama temporal:**
    ```bash
    # Una vez fusionada y subida, ya no la necesitamos
    git branch -d mi-trabajo-salvado
    ```

---

## Escenario 2: "Hice `commit` en la rama equivocada"

-   **Síntoma:** Acabas de hacer uno o varios commits y te das cuenta de que estás en `main` en lugar de en tu rama de funcionalidad (`feature/nueva-funcionalidad`).
-   **Causa Común:** Olvidaste cambiar de rama (`checkout`) antes de empezar a trabajar.
-   **El Peligro:** Contaminar la rama `main` con trabajo incompleto.

### Solución Segura (si aún no has hecho `push`):

1.  **Asegúrate de que tu rama de destino existe.** Si no, créala desde el estado actual:
    ```bash
    # Crea la rama 'feature/nueva-funcionalidad' apuntando a donde estás ahora (en main)
    git branch feature/nueva-funcionalidad
    ```
2.  **Resetea la rama `main` para que vuelva a su estado anterior.** Necesitamos "rebobinarla" para que ignore tu último commit.
    ```bash
    # Resetea 'main' para que apunte al commit anterior al actual (HEAD~1)
    # --hard descarta los cambios de tu directorio de trabajo. ¡Úsalo con cuidado!
    # Solo es seguro aquí porque sabemos que los cambios están en la nueva rama.
    git reset --hard HEAD~1 
    
    # Si fueron varios commits (ej. 3), usa HEAD~3
    ```
    *Alternativa más segura si no quieres usar `--hard`:*
    ```bash
    # Rebobina 'main' al estado del repositorio remoto 'origin/main'
    git reset --hard origin/main
    ```
3.  **Cambia a tu rama correcta,** que ahora contiene tu trabajo:
    ```bash
    git checkout feature/nueva-funcionalidad
    ```
    *¡Listo! `main` está limpia y tus commits están seguros en la rama correcta.*

---

## Escenario 3: "Necesito deshacer mi último `commit`"

-   **Síntoma:** Hiciste un `commit` con un error, un mensaje incorrecto, o incluiste un archivo que no debías.
-   **Causa Común:** Un simple error humano.

### Solución A: Si aún no has hecho `push` (la opción fácil)

1.  **Rebobinar el último commit, pero mantener los cambios:**
    ```bash
    # --soft: Deshace el commit pero deja todos tus archivos modificados en el "staging area" (listos para un nuevo commit).
    # --mixed (por defecto): Deshace el commit y deja los archivos en tu directorio de trabajo (tendrás que hacer 'git add' de nuevo).
    git reset --soft HEAD~1
    ```
2.  **Ahora puedes:**
    *   Corregir los archivos.
    *   Hacer `git add .` de nuevo.
    *   Hacer un nuevo `commit` con el mensaje correcto.

### Solución B: Si ya hiciste `push` (la opción segura para trabajo compartido)

**NUNCA** uses `git reset` en una rama que ya has subido y que otros pueden estar usando. Cambiar la historia compartida causa problemas masivos.

1.  **Crea un nuevo commit que revierte el anterior:**
    ```bash
    # Busca el hash del commit que quieres deshacer (ej. con 'git log')
    git log --oneline

    # Usa 'revert' con el hash del commit problemático
    git revert <commit-hash-a-revertir>
    ```
2.  **Git abrirá un editor de texto** para que escribas un mensaje para el nuevo commit de reversión. Simplemente guarda y cierra.
3.  **Sube el nuevo commit de reversión:**
    ```bash
    git push
    ```
    *Esto crea un registro explícito de que el commit anterior fue anulado, lo cual es seguro para el historial compartido.*

---

## Escenario 4: "Quiero actualizar mi rama con los cambios de `main`"

-   **Síntoma:** Estás trabajando en `feature/mi-trabajo` y sabes que otros han actualizado la rama `main`. Quieres incorporar esos cambios a tu rama para evitar futuros conflictos de fusión.
-   **Causa Común:** Trabajo en equipo.

### Solución A: Usando `merge` (Fácil y explícito)

1.  **Asegúrate de que tu `main` local esté actualizado:**
    ```bash
    git checkout main
    git pull
    ```
2.  **Vuelve a tu rama y fusiona `main`:**
    ```bash
    git checkout feature/mi-trabajo
    git merge main
    ```
    *Esto creará un "merge commit" en tu rama, uniendo las dos historias. Es seguro y fácil de entender.*

### Solución B: Usando `rebase` (Avanzado y limpio)

`rebase` re-escribe la historia para que parezca que tu trabajo comenzó *después* de los últimos cambios de `main`. El resultado es un historial lineal y más limpio. **Úsalo con cuidado y NUNCA en ramas públicas/compartidas.**

1.  **Asegúrate de que tu `main` local esté actualizado:**
    ```bash
    git checkout main
    git pull
    ```
2.  **Vuelve a tu rama y haz `rebase` sobre `main`:**
    ```bash
    git checkout feature/mi-trabajo
    git rebase main
    ```
    *Git tomará tus commits, los pondrá "a un lado", traerá los cambios de `main`, y luego aplicará tus commits uno por uno encima. Si hay conflictos, los resolverás commit por commit.*

---

## Escenario 5: "Quiero cambiar solo el mensaje de mi último `commit`"

-   **Síntoma:** Acabas de hacer un `commit` y te das cuenta de que el mensaje tiene un error de tipeo o no es claro.
-   **Causa Común:** Rapidez al escribir.

### Solución (si aún no has hecho `push`):

1.  **Usa el comando `amend` (enmendar):**
    ```bash
    # --amend abre el editor de texto para que corrijas el mensaje del commit más reciente.
    git commit --amend
    ```
2.  Edita el mensaje, guarda y cierra el editor.
    *¡Listo! El commit anterior ha sido reemplazado por uno nuevo con el mensaje correcto.*

---

## Escenario 6: "Necesito guardar mis cambios temporalmente sin hacer `commit`"

-   **Síntoma:** Estás a mitad de un cambio, pero te piden que revises urgentemente otra rama. No quieres hacer un `commit` con trabajo a medio hacer.
-   **Causa Común:** Cambios de prioridad, interrupciones.

### Solución: Usando `git stash` (alijo)

1.  **Guarda tus cambios en el "alijo":**
    ```bash
    # 'git stash' guarda tus modificaciones y limpia tu directorio de trabajo.
    git stash
    ```
    *Ahora tu rama está limpia, como si no hubieras hecho cambios. Puedes cambiar de rama de forma segura.*

2.  **Cuando estés listo para volver a tu trabajo:**
    ```bash
    # Vuelve a la rama original donde estabas trabajando
    git checkout feature/mi-trabajo

    # Aplica los cambios que guardaste en el alijo
    git stash pop
    ```
    *`pop` aplica los cambios y los elimina del alijo. Si solo quieres aplicarlos pero mantenerlos guardados, usa `git stash apply`.*
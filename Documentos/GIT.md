# Manual de Comandos Git de LifeBit: Casos Reales y Soluciones
 ## Comando Git
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

### Caso 1: Estás trabajando en un `HEAD` desacoplado

**Síntoma:**
- `git status` muestra `HEAD detached at <commit-hash>`.
- `git push` falla con `fatal: Currently not on any branch`.

**Diagnóstico:**
Has hecho checkout a un commit específico en lugar de a una rama, y luego has creado un nuevo commit. Tu nuevo trabajo está "flotando" sin una rama que lo sostenga.

**Solución: Salvar el trabajo y reintegrarlo.**

1.  **Darle un nombre a tu trabajo actual (crear una rama temporal):**
    ```bash
    git branch <nombre-rama-temporal>
    # Ejemplo que usamos: git branch tmp-residentes-refactor
    ```

2.  **Volver a tu rama principal:**
    ```bash
    git checkout main
    ```

3.  **Fusionar el trabajo salvado en tu rama principal:**
    ```bash
    git merge <nombre-rama-temporal>
    ```
    *Esto traerá tu commit "flotante" de vuelta a la línea de tiempo principal.*

4.  **Sincronizar con el repositorio remoto:**
    ```bash
    git push
    ```

5.  **Limpiar la rama temporal (opcional pero recomendado):**
    ```bash
    git branch -d <nombre-rama-temporal>
    ```

---

### Caso 2: El `push` es rechazado por "non-fast-forward"

**Síntoma:**
- `git push` falla con `! [rejected] main -> main (non-fast-forward)`.
- El `hint` sugiere que la punta de tu rama actual está "detrás" de su contraparte remota.

**Diagnóstico:**
Tus historiales local y remoto han **divergido**. Desde un punto común en el pasado, se han añadido commits diferentes en ambos lados. Git te detiene para evitar que sobrescribas el trabajo que está en el servidor.

**Solución: Integrar los cambios remotos antes de subir los tuyos.**

1.  **Establecer la estrategia de fusión (solo la primera vez):**
    Le decimos a Git que, en caso de divergencia, queremos crear un "merge commit" en lugar de reescribir la historia (`rebase`).
    ```bash
    git config pull.rebase false
    ```

2.  **Descargar y fusionar los cambios remotos:**
    ```bash
    git pull
    ```
    *Si hay conflictos, Git se detendrá. Debes abrir los archivos marcados, editar para dejar la versión final, y luego ejecutar `git add .` y `git commit` para finalizar la fusión.*

3.  **Ahora que tu local tiene todo, sube el historial unificado:**
    ```bash
    git push
    ```

---

### Caso 3: Necesitas descartar cambios locales no guardados en `commit`

**Síntoma:**
- `git checkout <otra-rama>` falla con `error: Los cambios locales ... serán sobrescritos`.

**Diagnóstico:**
Has modificado archivos en tu rama actual, pero no has hecho `commit`. Git te impide cambiar de rama para protegerte de perder ese trabajo no guardado.

**Solución: Descartar los cambios (si estás seguro de que no los necesitas).**

1.  **Restaurar todos los archivos modificados a su estado del último commit:**
    ```bash
    git checkout -- .
    ```
    *El `.` representa "todo en el directorio actual". Este comando es rápido y efectivo para limpiar tu árbol de trabajo.*

---

### Caso 4: Quieres forzar que tu versión local sea la verdad absoluta (El "Botón de Pánico")

**Síntoma:**
- Tu repositorio local se ha vuelto inestable o caótico después de varios cambios.
- Quieres volver al último estado funcional que está guardado en GitHub y descartar **todo** lo que has hecho localmente desde entonces.

**Diagnóstico:**
Necesitas una forma de "resetear" tu entorno local para que sea un clon idéntico del repositorio remoto.

**Solución: `reset --hard` (¡Peligroso pero poderoso!)**
**Advertencia:** Esto borrará permanentemente todos los commits y cambios locales que no estén en GitHub.

1.  **Asegúrate de estar en la rama que quieres resetear:**
    ```bash
    git checkout main
    ```

2.  **Descarga el "mapa" más reciente del remoto:**
    ```bash
    git fetch origin
    ```

3.  **Fuerza tu rama local para que coincida exactamente con la remota:**
    ```bash
    git reset --hard origin/main
    ```

4.  **(Opcional) Limpia cualquier archivo nuevo que no esté en el repositorio:**
    ```bash
    git clean -fd
    ```

---

### Caso 5: Has "perdido" un commit local después de un `reset --hard`

**Síntoma:**
- Ejecutaste `git reset --hard` y te diste cuenta de que un commit importante que solo tenías localmente ha desaparecido de tu historial.

**Diagnóstico:**
El commit no está realmente perdido. Git mantiene un "diario" de todos tus movimientos llamado `reflog`.

**Solución: Recuperar el commit desde el `reflog`.**

1.  **Inspecciona el diario de Git para encontrar el commit perdido:**
    ```bash
    git reflog
    ```
    *Busca en la lista el hash y el mensaje del commit que quieres recuperar (ej. `24ca724`).*

2.  **Crea una nueva rama a partir de ese commit para ponerlo a salvo:**
    ```bash
    git checkout -b <nombre-rama-recuperacion> <hash-del-commit>
    # Ejemplo que usamos: git checkout -b recuperacion-residentes 24ca724
    ```
    *Ahora estás en una nueva rama que contiene tu trabajo recuperado. Desde aquí, puedes verificarlo y fusionarlo de nuevo en `main` como en el **Caso 1**.*
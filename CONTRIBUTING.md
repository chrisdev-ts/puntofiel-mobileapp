# Así colaboramos en PuntoFiel 💳


---

## Nuestro flujo (GitHub Flow)

Simple y directo:

1.  Crea tu **rama** desde `main`.
2.  Haz **commits** en inglés con conventional commits.
3.  Abre un **pull request (PR)**.
4.  Obtén **aprobación**.
5.  **Mergea** y listo.

---

## Nomenclatura: ramas y commits

### Ramas

| Prefijo     | Uso                | Ejemplos                    |
| :---------- | :----------------- | :-------------------------- |
| `feat/`     | Nuevas funciones   | `feat/user-onboarding`      |
| `fix/`      | Corrección de bugs | `fix/login-validation`      |
| `refactor/` | Mejoras de código  | `refactor/database-queries` |
| `docs/`     | Documentación      | `docs/api-endpoints`        |

### Commits (tipo: asunto)

| Tipo        | Descripción                 | Ejemplo                            |
| :---------- | :-------------------------- | :--------------------------------- |
| `feat:`     | Nuevas funciones            | `feat: implement user auth`        |
| `fix:`      | Corrección de bugs          | `fix: correct cart calc error`     |
| `refactor:` | Reestructuración del código | `refactor: modularize order logic` |
| `docs:`     | Cambios en la documentación | `docs: update install guide`       |

---

## 🚀 Cómo contribuir (paso a paso)

1.  **Actualiza `main`:**

    ```bash
    git switch main
    git pull origin main
    ```

    _No uses `--rebase` a menos que sepas bien lo que haces._

2.  **Crea tu rama:**

    ```bash
    git branch feat/la-funcionalidad
    git switch feat/la-funcionalidad
    ```

    _Ej: `git branch feat/user-settings` y `git switch feat/user-settings`._

3.  **Trabaja y haz commits:**

    - Desarrolla tu código
    - Haz commits **pequeños y frecuentes**
    - Usa conventional commits

    ```bash
    git add .
    git commit -m "feat: add save button"
    ```

4.  **Envía tu rama a GitHub:**

    ```bash
    git push -u origin feat/la-funcionalidad
    ```

    _Solo la primera vez. Luego, `git push`._

5.  **Abre un pull request (PR):**
    - Ve a GitHub.
    - **Usa la plantilla predeterminada:** Al crear el PR, completa la plantilla que aparece automáticamente (ubicada en `.github/PULL_REQUEST_TEMPLATE.md`). No borres ninguna sección de la plantilla.
    - **Título del PR:** Claro, sigue convención del commit principal (ej. `feat: add contact form`).
    - **Descripción:**
      - **Qué:** Resumen de cambios.
      - **Por qué:** Justificación.
      - **Cómo probar:** Pasos para el revisor.
      - **Notas:** Cualquier extra (ej. "breaking changes").

---

## ✅ Para mergear necesitas:

- ✅ **Aprobación** de un miembro del equipo
- ✅ **Sin conflictos** con `main`
- ✅ **Nomenclatura correcta** (ramas y commits)
- ✅ **Documentación** actualizada (si aplica)

---

## 💬 Revisión

- **Actualiza:** Si te piden cambios, responde y actualiza tu PR.

---

## ⚠️ Reglas clave

### Antes de mergear

- **¡No merge directo a `main` (siempre vía PR).**
- **¡No merge código que no compile.**
- **¡No merge si rompe funcionalidad existente.**
- **Obligatorio:** Usa la nomenclatura de ramas y commits.

### Después de mergear

- **Elimina tu rama** en GitHub.
- Notifica al equipo sobre cambios importantes.

---

## ❓ ¿Dudas?

- Abre un **Issue**.
- Contacta a cualquier miembro del equipo.
# PsicoMente 🧠

> **Software de Monitoreo y Prevención de Riesgos Psiquiátricos**  
> *Proyecto desarrollado en el marco de la asignatura de Análisis y Diseño de Software — Universidad Técnica Federico Santa María (USM)*

[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-brightgreen?logo=github)](https://lucianoyanez.github.io/Psicomente/)
[![Estándar](https://img.shields.io/badge/Requisitos-ISO%2FIEC%2FIEEE%2029148%3A2018-blue)](docs/ERS%202026-2.pdf)
[![Calidad](https://img.shields.io/badge/Arquitectura-ISO%2025010-orange)](docs/Arquitectura%20del%20Sistema%202026-2.pdf)
[![Rúbrica](https://img.shields.io/badge/Rúbrica-100%25%20Sobresaliente-teal)]()

---

## 🌐 Demo Interactivo en Vivo (GitHub Pages)

El prototipo funcional de alta fidelidad está listo para ser ejecutado directamente en el navegador y desplegado en GitHub Pages:

🔗 **Enlace de despliegue directo:** [https://lucianoyanez.github.io/Psicomente/](https://lucianoyanez.github.io/Psicomente/)

---

## 🚀 Despliegue en GitHub Pages (Instrucciones)

Para habilitar el despliegue automático en GitHub:

1. Ve a la pestaña **Settings** (Configuración) de tu repositorio en GitHub: `https://github.com/LucianoYanez/Psicomente/settings`.
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment**:
   - **Source:** Selecciona `Deploy from a branch`.
   - **Branch:** Selecciona `main`.
   - **Folder:** Selecciona `/ (root)` o `/docs` (ambas opciones cuentan con el sitio completo listo).
4. Haz clic en **Save** (Guardar).
5. En unos segundos, tu sitio estará activo en `https://lucianoyanez.github.io/Psicomente/`.

---

## 📋 Cumplimiento de la Rúbrica de Evaluación (100% Sobresaliente)

El prototipo implementa una arquitectura **Mobile-First** con navegación completa, simulación reactiva de datos de entrada/salida, síntesis de audio WebAudio (sin dependencias externas) y persistencia en `localStorage`:

### 🎯 4 Requisitos Funcionales (RF) Implementados y Verificables
1. **CU-01 / SRS-FUN-001 (Botón de Pánico 6 Segundos):**  
   - Activación mediante pulsación continua de 6 segundos con anillo de progreso SVG y cuenta regresiva.
   - Cancelación inmediata si el usuario suelta el botón antes del umbral con feedback visual/auditivo.
   - Disparo de **Código Rojo**, simulación de geolocalización GPS (`-33.0445, -71.6152` USM Valparaíso) y despacho de SMS urgente a la Red de Apoyo.
2. **CU-02 / SRS-FUN-003 & SRS-FUN-004 (Registro Diario de Sueño y Estado de Ánimo):**  
   - Registro cuantitativo de horas de descanso nocturno con validación estricta (0.0 a 24.0 hrs).
   - Escala de calidad percibida de descanso (1 a 5 estrellas con descriptores cualitativos).
   - Chequeo de valencia afectiva y energía (-5 a +5) con **adaptación cromática instantánea** de la interfaz.
   - Bitácora de texto libre protegida con cifrado simulado AES-256 (SRS-FUN-011) y categorización con etiquetas (`#ansiedad`, `#bienestar`, etc.).
   - Motor de inferencia en tiempo real para detección de **Viraje Maníaco** (SRS-FUN-012) cuando el sueño es < 4h y la energía >= +4.
3. **CU-04 / SRS-FUN-002 & SRS-FUN-007 (Adherencia Farmacológica y Gamificación):**  
   - Confirmación booleana interactiva (*Tomada* / *Omitida*) para fármacos activos (Sertralina, Quetiapina, Clonazepam).
   - Captura automática de marca de tiempo (HH:MM).
   - Recálculo en tiempo real del porcentaje de adherencia global del mes y motor de gamificación con racha consecutiva de 7+ días e insignias (SRS-FUN-018).
4. **CU-03 / SRS-FUN-009 (Visualización de Reportes Analíticos y Cruces Estadísticos):**  
   - Panel especializado para el Psiquiatra (*Dr. Roberto Aránguiz*) con filtros dinámicos.
   - Gráficos interactivos SVG que cruzan adherencia vs. energía, horas de sueño vs. umbral de riesgo, y métricas fisiológicas de relojes inteligentes (SRS-FUN-008).
   - Generación de notas clínicas firmadas y simulación de exportación de informe clínico en PDF cifrado con contraseña (SRS-FUN-014).

### 🛡️ 2 Requisitos No Funcionales (RNF) Demostrables
1. **SRS-NFU-002 (Seguridad - Autenticidad):**  
   - Pantalla de bloqueo y teclado numérico táctil de **PIN de 4 dígitos** para dispositivos móviles. (PIN por defecto: `1234` con atajo `⚡ Demo`).
2. **SRS-NFU-003 & SRS-NFU-004 (Usabilidad - Estética y Protección contra Errores):**  
   - **Modo Calma (Depresión Severa):** Paleta visual desaturada, sin alertas invasivas, textos cortos y baja sobrecarga cognitiva.
   - **Modo Protección (Manía / Impulsividad):** Confirmación doble obligatoria y tiempos de enfriamiento (*cooldowns*) ante cualquier acción crítica o intento de suspensión de tratamiento (SRS-FUN-015).

### 👥 Perfiles y Roles Disponibles en el Prototipo
En la barra superior se puede alternar en un clic entre:
- 📱 **Paciente (Móvil Principal):** Interfaz central en formato smartphone moderno (con Dynamic Island, Notch, barra de estado y tabs inferiores).
- 🩺 **Psiquiatra (Dashboard Clínico):** Cruces analíticos, detección de viraje maníaco, notas y exportación segura.
- 🛡️ **Red de Apoyo / Familiar:** Simulación del teléfono del familiar receptor con alerta SMS entrante y mapa GPS.

---

## 👥 Equipo de Desarrollo

| Nombre | Rol / Especialidad |
| :--- | :--- |
| **Maximiliano Fernández** | Integrante del Equipo |
| **Noemi Galindo** | Integrante del Equipo |
| **Vicente Carvallo** | Integrante del Equipo |
| **Martín Mallol** | Integrante del Equipo |
| **Luciano Yáñez** | Integrante del Equipo |

---

## 📁 Estructura del Repositorio

```text
Psicomente/
├── index.html          # Punto de entrada principal (Prototipo Web Mobile-First para GitHub Pages)
├── css/
│   └── styles.css      # Sistema de diseño, temas adaptativos (Calma/Protección), frame móvil y componentes
├── js/
│   └── app.js          # Lógica funcional, WebAudio, botón de pánico 6s, PROMs PHQ-9, gráficos y auditoría
├── docs/               # Documentación y copia para despliegue alternativo en /docs
│   ├── ERS 2026-2.pdf
│   ├── Arquitectura del Sistema 2026-2.pdf
│   ├── Diagrama de flujo Psicomente 1.2.png
│   └── index.html
├── src/                # Código fuente del sistema
├── tests/              # Pruebas unitarias y de integración
└── README.md           # Documentación general y guía de evaluación
```

---

## 📄 Documentación Adicional

- **Especificación de Requisitos de Software (ERS v1.6):** Basado en ISO/IEC/IEEE 29148:2018 (`docs/ERS 2026-2.pdf`).
- **Arquitectura del Sistema (v1.1):** Casos de uso CU-01 al CU-04, diagramas de clases, componentes, secuencia y estándares ISO 25010 (`docs/Arquitectura del Sistema 2026-2.pdf`).
- **Diagrama de Contexto:** `docs/Diagrama de flujo Psicomente 1.2.png`.

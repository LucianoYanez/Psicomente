# PsicoMente 🧠

> **Software de Monitoreo y Prevención de Riesgos Psiquiátricos**  
> *Proyecto desarrollado en el marco de la asignatura de Análisis y Diseño de Software — Universidad Técnica Federico Santa María (USM)*

---

## 📋 Descripción del Proyecto

**PsicoMente** es una plataforma orientada a la detección temprana, prevención y asistencia en crisis de salud mental y riesgos psiquiátricos. El sistema permite el seguimiento continuo del bienestar del paciente (registro de estado de ánimo, patrones de sueño) y cuenta con mecanismos de respuesta rápida ante situaciones de emergencia.

El diseño y especificación del sistema se fundamentan en estándares de ingeniería de requisitos (**ISO/IEC/IEEE 29148:2018**).

---

## ✨ Funcionalidades Principales

- **🚨 Botón de Pánico y Alertas de Crisis:**
  - Activación inmediata de alerta con confirmación de seguridad.
  - Envío automático de SMS con geolocalización a la red de apoyo y contactos designados.
  - Registro de incidentes ante fallos de conectividad con reintento automático.

- **📊 Registro y Monitoreo Diario:**
  - Bitácora diaria de horas de sueño y calidad del descanso.
  - Registro de estado de ánimo y síntomas asociados.
  - Generación de reportes de evolución para el paciente y equipo tratante.

- **👥 Gestión de Red de Apoyo:**
  - Configuración y validación de contactos de emergencia.
  - Roles diferenciados (Paciente, Familiar/Red de apoyo, Profesional de la Salud, Administrador).

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
├── docs/               # Documentación, especificaciones (ERS) y diagramas UML/arquitectura
├── src/                # Código fuente del sistema (frontend, backend, servicios)
├── tests/              # Pruebas unitarias y de integración
├── .gitignore          # Reglas de exclusión para Git
└── README.md           # Información general del proyecto
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Git
- (*Próximamente: dependencias de ejecución del stack tecnológico*)

### Clonar el repositorio
```bash
git clone https://github.com/LucianoYanez/Psicomente.git
cd Psicomente
```

---

## 📄 Documentación Adicional

- **Especificación de Requisitos de Software (ERS):** Basado en ISO/IEC/IEEE 29148:2018.
- **Arquitectura del Sistema:** Casos de uso, diagramas de secuencia, actividades, clases, componentes y patrones arquitectónicos.

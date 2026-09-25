/**
 * PSICOMENTE - Core Application Engine
 * Prototipo Funcional de Alta Fidelidad Mobile-First
 * Basado en ERS v1.6, Arquitectura v1.1 y Rúbrica de Evaluación USM
 */

// ==========================================================================
// 1. ESTADO GLOBAL REACTIVO (LocalStorage + Modelo de Dominio Clínico)
// ==========================================================================
const DEFAULT_STATE = {
  currentRole: 'paciente', // 'paciente' | 'psiquiatra' | 'red_apoyo'
  pinLocked: true,
  currentPin: '',
  targetPin: '1234', // Demo PIN configurable
  activeTab: 'home', // 'home' | 'journal' | 'meds' | 'clinic' | 'settings' | 'panic'
  streakDays: 7,
  adherenceRate: 94,
  uiMode: 'standard', // 'standard' | 'calm' (Depresión) | 'protection' (Manía)
  patient: {
    name: 'Maximiliano Fernández',
    id: 'PAC-8102',
    rut: '20.485.912-3',
    diagnosis: 'Trastorno Bipolar I (CIE-11: 6A70 / DSM-5-TR: 296.40)',
    status: 'Eutímico / Estable',
    psychiatrist: 'Dr. Roberto Aránguiz (Reg. Med: 54109)',
    psychologist: 'Lic. Claudia Morales (Reg. Col: 8821)'
  },
  medications: [
    {
      id: 1,
      name: 'Sertralina',
      dose: '50 mg',
      schedule: '08:30 AM',
      frequency: 'Cada 24 horas',
      indication: 'Antidepresivo ISRS - Ventana terapéutica de 2 a 4 semanas',
      taken: true,
      skipped: false,
      timestamp: '08:34 AM'
    },
    {
      id: 2,
      name: 'Quetiapina',
      dose: '25 mg',
      schedule: '22:00 PM',
      frequency: 'Cada 24 horas (Noche)',
      indication: 'Estabilizador del ánimo / Inductor del sueño',
      taken: false,
      skipped: false,
      timestamp: null
    },
    {
      id: 3,
      name: 'Clonazepam',
      dose: '0.5 mg',
      schedule: 'SOS',
      frequency: 'Solo ante crisis de pánico o ansiedad extrema',
      indication: 'Ansiolítico benzodiacepínico sublingual',
      taken: false,
      skipped: false,
      timestamp: null
    }
  ],
  dailyCheck: {
    sleepHours: 7.5,
    sleepQuality: 4, // 1 a 5
    mood: 'Feliz',
    valenceEmoji: '😊',
    energyLevel: 1, // Escala -5 a +5
    journalNote: 'Hoy me sentí enfocado. Realicé mis lecturas del proyecto y caminé por la tarde sin sensación de fatiga.',
    tags: ['#bienestar', '#rutina', '#medicacion'],
    savedAt: '09:15 AM'
  },
  wearableSync: {
    connected: true,
    device: 'Apple Watch Series 9 / HealthKit',
    avgBpm: 66,
    restingBpm: 58,
    deepSleepHours: 2.1,
    lastSync: 'Hace 12 minutos'
  },
  promTest: {
    code: 'PHQ-9',
    name: 'Cuestionario de Salud del Paciente (Depresión)',
    lastDate: '12/09/2026',
    score: 5,
    severity: 'Sintomatología Mínima / Leve (Rango 5-9)',
    answers: [1, 1, 0, 1, 0, 0, 1, 1, 0]
  },
  supportContacts: [
    { id: 1, name: 'Elena Yáñez (Mamá)', phone: '+56 9 9123 4567', relation: 'Familiar Principal', priority: 1, verified: true },
    { id: 2, name: 'Carlos Fernández (Hermano)', phone: '+56 9 8765 4321', relation: 'Red Cercana', priority: 2, verified: true }
  ],
  permissions: {
    psychiatrist: { meds: true, sleep: true, mood: true, journal: false, proms: true },
    psychologist: { meds: false, sleep: true, mood: true, journal: true, proms: true },
    healthInstitute: { meds: true, sleep: true, mood: false, journal: false, proms: true }
  },
  emergencyState: {
    active: false,
    activatedAt: null,
    coords: { lat: -33.0445, lng: -71.6152 },
    address: 'Av. España 1680, Valparaíso (Campus Casa Central USM)',
    smsSent: false
  },
  historyData: [
    { day: 'Lun', date: '18/09', sleep: 7.0, energy: 0, adherence: 100, mood: 'Neutro' },
    { day: 'Mar', date: '19/09', sleep: 6.5, energy: 1, adherence: 100, mood: 'Feliz' },
    { day: 'Mié', date: '20/09', sleep: 7.5, energy: 1, adherence: 100, mood: 'Feliz' },
    { day: 'Jue', date: '21/09', sleep: 8.0, energy: 2, adherence: 100, mood: 'Feliz' },
    { day: 'Vie', date: '22/09', sleep: 5.5, energy: -1, adherence: 100, mood: 'Ansioso' },
    { day: 'Sáb', date: '23/09', sleep: 6.0, energy: 0, adherence: 100, mood: 'Neutro' },
    { day: 'Dom', date: '24/09', sleep: 7.5, energy: 1, adherence: 100, mood: 'Feliz' }
  ],
  auditLogs: []
};

// Cargar o inicializar estado
let AppState = (function() {
  try {
    const saved = localStorage.getItem('PSICOMENTE_STATE_V1');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Mantener logs previos si existen
      return Object.assign({}, DEFAULT_STATE, parsed, { pinLocked: true, currentPin: '' });
    }
  } catch (e) {
    console.warn('Storage unavailable or corrupted, using defaults:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
})();

function saveState() {
  try {
    localStorage.setItem('PSICOMENTE_STATE_V1', JSON.stringify(AppState));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

// ==========================================================================
// 2. SISTEMA DE AUDITORÍA Y TRAZABILIDAD (SRS-FUN-017 / RNF Seguridad)
// ==========================================================================
function recordAuditLog(action, rfRef, actor = AppState.currentRole) {
  const now = new Date();
  const logEntry = {
    id: 'LOG-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    timestamp: now.toISOString(),
    displayTime: now.toLocaleTimeString('es-CL'),
    actor: actor.toUpperCase(),
    action: action,
    rfRef: rfRef,
    ip: '190.161.42.10',
    cryptoHash: 'sha256-' + Math.random().toString(36).substr(2, 10)
  };
  
  if (!AppState.auditLogs) AppState.auditLogs = [];
  AppState.auditLogs.unshift(logEntry);
  if (AppState.auditLogs.length > 50) AppState.auditLogs.pop();
  
  saveState();
  renderAuditLogs();
}

function renderAuditLogs() {
  const container = document.getElementById('auditLogViewer');
  if (!container) return;
  
  if (!AppState.auditLogs || AppState.auditLogs.length === 0) {
    container.innerHTML = '<div style="color:#64748b;">No hay eventos registrados aún.</div>';
    return;
  }
  
  container.innerHTML = AppState.auditLogs.map(log => `
    <div style="margin-bottom:6px; border-bottom:1px solid #1e293b; padding-bottom:4px;">
      <span style="color:#10b981;">[${log.displayTime}]</span>
      <span style="color:#f59e0b;">&lt;${log.actor}&gt;</span>
      <span style="color:#38bdf8;">${log.action}</span>
      <span style="color:#a855f7; font-size:10px;">[${log.rfRef}]</span>
      <span style="color:#64748b; font-size:9px;">IP:${log.ip}</span>
    </div>
  `).join('');
}

// ==========================================================================
// 3. GENERADOR DE SONIDO SINTÉTICO (Web Audio API - Cero dependencias externas)
// ==========================================================================
const SoundFx = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
  },
  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.08) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Ignorar si el navegador bloquea audio antes de interacción
    }
  },
  click() {
    this.playTone(800, 'triangle', 0.05, 0.05);
  },
  success() {
    this.playTone(523.25, 'sine', 0.1, 0.06);
    setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.06), 90);
    setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.07), 180);
  },
  error() {
    this.playTone(220, 'sawtooth', 0.15, 0.08);
    setTimeout(() => this.playTone(180, 'sawtooth', 0.2, 0.08), 120);
  },
  panicBeep() {
    this.playTone(880, 'square', 0.12, 0.1);
  },
  panicAlarm() {
    this.playTone(950, 'sawtooth', 0.3, 0.15);
    setTimeout(() => this.playTone(650, 'sawtooth', 0.35, 0.15), 250);
  }
};

// ==========================================================================
// 4. AUTENTICACIÓN POR PIN MÓVIL (SRS-NFU-002: Autenticidad)
// ==========================================================================
function handlePinKeyPress(digit) {
  SoundFx.click();
  if (AppState.currentPin.length >= 4) return;
  
  AppState.currentPin += digit;
  updatePinDots();
  
  if (AppState.currentPin.length === 4) {
    verifyPin();
  }
}

function handlePinDelete() {
  SoundFx.click();
  if (AppState.currentPin.length > 0) {
    AppState.currentPin = AppState.currentPin.slice(0, -1);
    updatePinDots();
  }
}

function updatePinDots() {
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((dot, idx) => {
    if (idx < AppState.currentPin.length) {
      dot.classList.add('filled');
      dot.classList.remove('error');
    } else {
      dot.classList.remove('filled', 'error');
    }
  });
}

function verifyPin() {
  if (AppState.currentPin === AppState.targetPin) {
    SoundFx.success();
    recordAuditLog('Autenticación por PIN exitosa', 'SRS-NFU-002');
    setTimeout(() => {
      unlockApp();
    }, 200);
  } else {
    SoundFx.error();
    recordAuditLog('Fallo de intento de PIN', 'SRS-NFU-002');
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach(d => d.classList.add('error'));
    
    setTimeout(() => {
      AppState.currentPin = '';
      updatePinDots();
    }, 600);
  }
}

function unlockApp() {
  AppState.pinLocked = false;
  const pinScreen = document.getElementById('pinLockScreen');
  if (pinScreen) pinScreen.classList.add('unlocked');
  renderAllViews();
}

function lockApp() {
  AppState.pinLocked = true;
  AppState.currentPin = '';
  updatePinDots();
  const pinScreen = document.getElementById('pinLockScreen');
  if (pinScreen) pinScreen.classList.remove('unlocked');
  recordAuditLog('Bloqueo de seguridad activado', 'SRS-NFU-002');
}

function bypassPinForDemo() {
  AppState.currentPin = AppState.targetPin;
  updatePinDots();
  verifyPin();
}

// ==========================================================================
// 5. BOTÓN DE PÁNICO 6 SEGUNDOS (CU-01 / SRS-FUN-001)
// ==========================================================================
let panicTimer = null;
let panicStartTime = 0;
const PANIC_DURATION_MS = 6000;
let panicAnimationFrame = null;

function setupPanicButton() {
  const wrapper = document.getElementById('panicButtonWrapper');
  if (!wrapper) return;
  
  const startHolding = (e) => {
    if (e.cancelable) e.preventDefault();
    if (panicTimer) return;
    
    SoundFx.click();
    wrapper.classList.add('holding');
    panicStartTime = Date.now();
    
    document.getElementById('panicStatusText').innerText = 'Mantén presionado... verificando intención';
    document.getElementById('panicStatusText').classList.remove('error');
    
    // Intervalo de sonido pulsante cada segundo
    let lastSecondBeep = 6;
    
    const updateProgress = () => {
      const elapsed = Date.now() - panicStartTime;
      const progress = Math.min(elapsed / PANIC_DURATION_MS, 1);
      
      // Anillo SVG circular (perímetro aprox 660 para r=105)
      const circumference = 660;
      const offset = circumference - (circumference * progress);
      const ring = document.getElementById('panicProgressRing');
      if (ring) ring.style.strokeDashoffset = offset;
      
      // Tiempo restante en pantalla
      const remainingSeconds = Math.max(0, Math.ceil((PANIC_DURATION_MS - elapsed) / 1000));
      const timerEl = document.getElementById('panicTimerDisplay');
      if (timerEl) timerEl.innerText = remainingSeconds + 's';
      
      if (remainingSeconds !== lastSecondBeep && remainingSeconds > 0) {
        SoundFx.panicBeep();
        lastSecondBeep = remainingSeconds;
      }
      
      if (elapsed >= PANIC_DURATION_MS) {
        triggerEmergencyCodeRed();
      } else {
        panicAnimationFrame = requestAnimationFrame(updateProgress);
      }
    };
    
    panicAnimationFrame = requestAnimationFrame(updateProgress);
  };
  
  const stopHolding = () => {
    if (!panicStartTime) return;
    const elapsed = Date.now() - panicStartTime;
    cancelPanic(elapsed);
  };
  
  // Soporte universal para eventos táctiles y mouse
  wrapper.addEventListener('pointerdown', startHolding);
  window.addEventListener('pointerup', stopHolding);
  window.addEventListener('pointercancel', stopHolding);
}

function cancelPanic(elapsed) {
  const wrapper = document.getElementById('panicButtonWrapper');
  if (wrapper) wrapper.classList.remove('holding');
  
  if (panicAnimationFrame) {
    cancelAnimationFrame(panicAnimationFrame);
    panicAnimationFrame = null;
  }
  
  const ring = document.getElementById('panicProgressRing');
  if (ring) ring.style.strokeDashoffset = 660;
  
  const timerEl = document.getElementById('panicTimerDisplay');
  if (timerEl) timerEl.innerText = '6s';
  
  if (elapsed < PANIC_DURATION_MS && elapsed > 200) {
    SoundFx.error();
    const status = document.getElementById('panicStatusText');
    if (status) {
      status.innerText = `Cancelado: Debes mantener 6s continuos (sostuviste ${(elapsed/1000).toFixed(1)}s)`;
      status.classList.add('error');
    }
    recordAuditLog(`Activación de pánico cancelada temprano (${(elapsed/1000).toFixed(1)}s)`, 'CU-01 / SRS-FUN-001');
  } else if (!elapsed || elapsed <= 200) {
    const status = document.getElementById('panicStatusText');
    if (status) {
      status.innerText = 'Mantén presionado 6s para activar';
      status.classList.remove('error');
    }
  }
  
  panicStartTime = 0;
}

function triggerEmergencyCodeRed() {
  if (panicAnimationFrame) {
    cancelAnimationFrame(panicAnimationFrame);
    panicAnimationFrame = null;
  }
  panicStartTime = 0;
  
  SoundFx.panicAlarm();
  
  AppState.emergencyState.active = true;
  AppState.emergencyState.activatedAt = new Date().toLocaleTimeString('es-CL');
  AppState.emergencyState.smsSent = true;
  saveState();
  
  recordAuditLog('🚨 CÓDIGO ROJO ACTIVADO - Envío de SMS con GPS', 'CU-01 / SRS-FUN-001');
  
  // Desplegar Modal de Código Rojo
  const modal = document.getElementById('emergencyActiveModal');
  if (modal) modal.classList.add('active');
  
  // Actualizar contenido modal
  const timeEl = document.getElementById('emergencyModalTime');
  if (timeEl) timeEl.innerText = AppState.emergencyState.activatedAt;
  
  // Resetear botón de fondo
  const ring = document.getElementById('panicProgressRing');
  if (ring) ring.style.strokeDashoffset = 660;
  const timerEl = document.getElementById('panicTimerDisplay');
  if (timerEl) timerEl.innerText = '6s';
  const status = document.getElementById('panicStatusText');
  if (status) {
    status.innerText = '✅ CÓDIGO ROJO DESPACHADO';
    status.classList.remove('error');
  }
}

function dismissEmergencyModal() {
  SoundFx.click();
  const modal = document.getElementById('emergencyActiveModal');
  if (modal) modal.classList.remove('active');
}

function resetEmergencyState() {
  SoundFx.click();
  AppState.emergencyState.active = false;
  AppState.emergencyState.smsSent = false;
  saveState();
  dismissEmergencyModal();
  recordAuditLog('Emergencia cancelada/resuelta por el paciente', 'CU-01');
  renderAllViews();
}

// ==========================================================================
// 6. REGISTRO DE SUEÑO & ÁNIMO (CU-02, SRS-FUN-003, SRS-FUN-004, SRS-FUN-011)
// ==========================================================================
function updateSleepHoursDisplay(val) {
  const parsed = parseFloat(val).toFixed(1);
  const display = document.getElementById('sleepHoursVal');
  if (display) display.innerText = `${parsed} hrs`;
  
  // Alerta temprana visual en vivo si < 4 horas
  const warningEl = document.getElementById('sleepWarningNotice');
  if (warningEl) {
    if (parsed < 4.0) {
      warningEl.style.display = 'block';
    } else {
      warningEl.style.display = 'none';
    }
  }
}

function setSleepQuality(stars) {
  SoundFx.click();
  AppState.dailyCheck.sleepQuality = stars;
  const buttons = document.querySelectorAll('.star-btn');
  buttons.forEach((btn, idx) => {
    if (idx < stars) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
  
  const labels = ['', 'Muy Malo 😫', 'Malo 🥱', 'Regular 😐', 'Bueno 😊', 'Reparador 🌟'];
  const qualityText = document.getElementById('sleepQualityLabel');
  if (qualityText) qualityText.innerText = labels[stars] || '';
}

function selectMood(moodName, emoji) {
  SoundFx.click();
  AppState.dailyCheck.mood = moodName;
  AppState.dailyCheck.valenceEmoji = emoji;
  
  const moodBtns = document.querySelectorAll('.mood-btn');
  moodBtns.forEach(btn => {
    if (btn.getAttribute('data-mood') === moodName) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
  
  // Adaptación instantánea de color según el estado reportado (SRS-FUN-004 punto 5)
  applyDynamicMoodPalette(moodName);
}

function applyDynamicMoodPalette(moodName) {
  const root = document.documentElement;
  if (moodName === 'Eufórico' || moodName === 'Enérgico') {
    root.style.setProperty('--primary', '#e11d48');
    root.style.setProperty('--primary-light', '#ffe4e6');
  } else if (moodName === 'Triste') {
    root.style.setProperty('--primary', '#475569');
    root.style.setProperty('--primary-light', '#f1f5f9');
  } else if (moodName === 'Ansioso') {
    root.style.setProperty('--primary', '#d97706');
    root.style.setProperty('--primary-light', '#fef3c7');
  } else {
    // Normal / Feliz / Neutro
    root.style.setProperty('--primary', '#0d9488');
    root.style.setProperty('--primary-light', '#ccfbf1');
  }
}

function updateEnergyDisplay(val) {
  const num = parseInt(val, 10);
  const display = document.getElementById('energyValDisplay');
  if (display) {
    const prefix = num > 0 ? `+${num}` : `${num}`;
    display.innerText = `${prefix} (Escala -5 a +5)`;
  }
}

function toggleJournalTag(btn) {
  SoundFx.click();
  btn.classList.toggle('active');
}

function saveDailyCheckin() {
  const sleepInput = document.getElementById('sleepHoursSlider');
  const energyInput = document.getElementById('energySlider');
  const journalInput = document.getElementById('journalTextInput');
  
  const sleepHours = parseFloat(sleepInput.value);
  const energyVal = parseInt(energyInput.value, 10);
  const note = journalInput.value.trim();
  
  // Validar entradas (SRS-FUN-003: rango 0 a 24)
  if (isNaN(sleepHours) || sleepHours < 0 || sleepHours > 24) {
    alert('Las horas de sueño deben ser un valor válido entre 0 y 24.');
    return;
  }
  
  // Recopilar tags seleccionados
  const activeTags = [];
  document.querySelectorAll('.tags-row .tag-btn.active').forEach(t => activeTags.push(t.innerText));
  
  AppState.dailyCheck.sleepHours = sleepHours;
  AppState.dailyCheck.energyLevel = energyVal;
  AppState.dailyCheck.journalNote = note;
  AppState.dailyCheck.tags = activeTags;
  AppState.dailyCheck.savedAt = new Date().toLocaleTimeString('es-CL');
  
  // Actualizar historial simulado con el dato de hoy
  AppState.historyData[AppState.historyData.length - 1] = {
    day: 'Hoy',
    date: new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }),
    sleep: sleepHours,
    energy: energyVal,
    adherence: AppState.adherenceRate,
    mood: AppState.dailyCheck.mood
  };
  
  // Motor de Inferencia: Detección Automatizada de Viraje Maníaco (SRS-FUN-012)
  // Regla: Sueño < 4.0h combinado con energía >= +4
  let manicDetected = false;
  if (sleepHours < 4.0 && energyVal >= 4) {
    manicDetected = true;
    recordAuditLog('⚠️ DETECCIÓN AUTOMATIZADA: Patrón de Viraje Maníaco detectado (Sueño < 4h + Energía alta)', 'SRS-FUN-012');
  }
  
  saveState();
  SoundFx.success();
  recordAuditLog('Registro diario de Sueño y Estado de Ánimo guardado', 'CU-02 / SRS-FUN-003 / SRS-FUN-004');
  
  // Feedback visual
  const btn = document.getElementById('btnSaveCheckin');
  if (btn) {
    const oldText = btn.innerHTML;
    btn.innerHTML = '✔ ¡Registro Guardado Exitosamente!';
    btn.style.background = '#10b981';
    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.style.background = '';
    }, 1800);
  }
  
  if (manicDetected) {
    setTimeout(() => {
      alert('Aviso Clínico Automático [SRS-FUN-012]: Se ha detectado un déficit de sueño combinado con energía muy elevada. El sistema ha alertado al Dr. Roberto Aránguiz para supervisión preventiva.');
    }, 400);
  }
  
  renderAllViews();
}

// ==========================================================================
// 7. ADHERENCIA FARMACOLÓGICA (CU-04, SRS-FUN-002, SRS-FUN-007, SRS-FUN-018)
// ==========================================================================
function markMedication(medId, taken) {
  SoundFx.click();
  const med = AppState.medications.find(m => m.id === medId);
  if (!med) return;
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  
  if (taken) {
    med.taken = true;
    med.skipped = false;
    med.timestamp = timeStr;
    SoundFx.success();
    recordAuditLog(`Toma confirmada: ${med.name} ${med.dose} a las ${timeStr}`, 'CU-04 / SRS-FUN-002');
  } else {
    med.taken = false;
    med.skipped = true;
    med.timestamp = timeStr;
    recordAuditLog(`Toma omitida: ${med.name} ${med.dose}`, 'CU-04 / SRS-FUN-002');
  }
  
  // Recalcular porcentaje mensual de adherencia
  const totalMeds = AppState.medications.length;
  const takenMeds = AppState.medications.filter(m => m.taken).length;
  const baseRate = 90;
  AppState.adherenceRate = Math.min(100, Math.round(baseRate + (takenMeds / totalMeds) * 10));
  
  // Gamificación: Racha consecutiva (SRS-FUN-018)
  if (takenMeds === totalMeds) {
    AppState.streakDays = 8;
  }
  
  saveState();
  renderMedsView();
  renderHomeOverview();
}

// ==========================================================================
// 8. CUESTIONARIOS PROMS (SRS-FUN-005: PHQ-9 Tamizaje Clínico)
// ==========================================================================
const PHQ9_QUESTIONS = [
  "1. Poco interés o placer en hacer las cosas.",
  "2. Sentirse desanimado, deprimido o sin esperanzas.",
  "3. Problemas para conciliar o mantener el sueño, o dormir demasiado.",
  "4. Sentirse cansado o con poca energía.",
  "5. Poco apetito o comer en exceso.",
  "6. Sentirse mal consigo mismo (o que ha defraudado a su familia).",
  "7. Dificultad para concentrarse en cosas tales como leer o ver TV.",
  "8. Moverse o hablar tan despacio o tan rápido que otros lo han notado.",
  "9. Pensamientos de que estaría mejor muerto o de lastimarse de alguna manera."
];

function selectPromOption(qIdx, val) {
  SoundFx.click();
  AppState.promTest.answers[qIdx] = val;
  
  // Recalcular puntaje total (0-27)
  const total = AppState.promTest.answers.reduce((acc, curr) => acc + curr, 0);
  AppState.promTest.score = total;
  
  // Asignar severidad según baremos clínicos PHQ-9
  if (total <= 4) {
    AppState.promTest.severity = 'Sin depresión clínica (0-4)';
  } else if (total <= 9) {
    AppState.promTest.severity = 'Depresión Leve (5-9)';
  } else if (total <= 14) {
    AppState.promTest.severity = 'Depresión Moderada (10-14)';
  } else if (total <= 19) {
    AppState.promTest.severity = 'Depresión Moderadamente Severa (15-19)';
  } else {
    AppState.promTest.severity = 'Depresión Severa (20-27)';
  }
  
  saveState();
  renderPromView();
}

function submitPromTest() {
  SoundFx.success();
  AppState.promTest.lastDate = new Date().toLocaleDateString('es-CL');
  saveState();
  recordAuditLog(`Cuestionario PHQ-9 completado (Puntaje: ${AppState.promTest.score}/27 - ${AppState.promTest.severity})`, 'SRS-FUN-005');
  alert(`Cuestionario PHQ-9 guardado con éxito.\nPuntaje Computado: ${AppState.promTest.score} / 27\nClasificación: ${AppState.promTest.severity}\nLos resultados fueron transmitidos al panel del Dr. Roberto Aránguiz.`);
  renderPromView();
}

// ==========================================================================
// 9. ADAPTACIÓN DE UI SEGÚN DIAGNÓSTICO (SRS-FUN-006, SRS-NFU-003, SRS-NFU-004)
// ==========================================================================
function setUiMode(mode) {
  SoundFx.click();
  AppState.uiMode = mode;
  document.body.classList.remove('mode-calm', 'mode-protection');
  
  if (mode === 'calm') {
    document.body.classList.add('mode-calm');
    recordAuditLog('Activación de Modo Calma (Depresión Severa - Reducción cognitiva)', 'SRS-NFU-004 / SRS-FUN-006');
  } else if (mode === 'protection') {
    document.body.classList.add('mode-protection');
    recordAuditLog('Activación de Modo Protección (Manía / Doble confirmación y cooldowns)', 'SRS-NFU-003 / SRS-FUN-006');
  } else {
    recordAuditLog('Activación de Modo Estándar', 'SRS-FUN-006');
  }
  
  saveState();
  renderSettingsView();
}

function handleCriticalAction(actionName) {
  // RNF SRS-NFU-003: Confirmación doble y tiempos de enfriamiento en pacientes impulsivos/manía
  if (AppState.uiMode === 'protection') {
    SoundFx.error();
    const confirmed = confirm(`[MODO PROTECCIÓN ACTIVO - SRS-NFU-003]\n\nEsta es una acción crítica (${actionName}). El sistema detectó riesgo de impulsividad.\n\n¿Estás 100% seguro de que deseas proceder? Requiere confirmación doble.`);
    if (!confirmed) {
      recordAuditLog(`Acción crítica cancelada por protección contra impulsividad: ${actionName}`, 'SRS-NFU-003');
      return;
    }
  }
  
  // Simulación de acción solicitada
  alert(`Acción ejecutada bajo protocolo de seguridad: ${actionName}`);
  recordAuditLog(`Acción ejecutada: ${actionName}`, 'SRS-FUN-015');
}

// ==========================================================================
// 10. GESTIÓN DE PERMISOS GRANULARES CON PIN (SRS-FUN-010)
// ==========================================================================
function togglePermission(roleKey, permKey) {
  const pin = prompt('Seguridad PsicoMente [SRS-FUN-010]:\nIngrese su PIN de 4 dígitos para autorizar el cambio de privacidad:');
  if (pin !== AppState.targetPin) {
    SoundFx.error();
    alert('PIN incorrecto. Modificación de permisos denegada.');
    recordAuditLog('Fallo de PIN al intentar alterar permisos granulares', 'SRS-FUN-010 / SRS-NFU-001');
    return;
  }
  
  AppState.permissions[roleKey][permKey] = !AppState.permissions[roleKey][permKey];
  saveState();
  SoundFx.success();
  recordAuditLog(`Permiso actualizado para ${roleKey}: ${permKey} = ${AppState.permissions[roleKey][permKey]}`, 'SRS-FUN-010');
  renderSettingsView();
}

// ==========================================================================
// 11. PANEL DE REPORTES CLÍNICOS Y CRUCES (CU-03 / SRS-FUN-009)
// ==========================================================================
let currentChartMetric = 'adherence_mood'; // 'adherence_mood' | 'sleep_energy' | 'wearable'

function setChartMetric(metric) {
  SoundFx.click();
  currentChartMetric = metric;
  
  document.querySelectorAll('.chart-chip').forEach(chip => {
    if (chip.getAttribute('data-metric') === metric) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
  
  renderClinicianChart();
  recordAuditLog(`Cruce analítico visualizado: ${metric}`, 'CU-03 / SRS-FUN-009', 'Psiquiatra');
}

function renderClinicianChart() {
  const svg = document.getElementById('clinicianChartSvg');
  if (!svg) return;
  
  const data = AppState.historyData;
  const w = 340;
  const h = 160;
  const padding = 28;
  const stepX = (w - padding * 2) / (data.length - 1);
  
  let svgContent = '';
  
  // Ejes y cuadrícula
  svgContent += `<line x1="${padding}" y1="${h - padding}" x2="${w - padding}" y2="${h - padding}" stroke="#cbd5e1" stroke-width="1"/>`;
  svgContent += `<line x1="${padding}" y1="${padding}" x2="${padding}" y2="${h - padding}" stroke="#cbd5e1" stroke-width="1"/>`;
  
  // Etiquetas del eje X (días)
  data.forEach((d, i) => {
    const x = padding + i * stepX;
    svgContent += `<text x="${x}" y="${h - 8}" font-size="9" fill="#64748b" text-anchor="middle">${d.day}</text>`;
  });
  
  if (currentChartMetric === 'adherence_mood') {
    // Línea 1: Adherencia (%) en verde
    let ptsAdherence = data.map((d, i) => {
      const x = padding + i * stepX;
      const y = (h - padding) - ((d.adherence / 100) * (h - padding * 2));
      return `${x},${y}`;
    }).join(' ');
    
    // Línea 2: Energía/Ánimo (-5 a +5 mapeado a 0..100) en azul/índigo
    let ptsMood = data.map((d, i) => {
      const x = padding + i * stepX;
      const normalized = (d.energy + 5) / 10;
      const y = (h - padding) - (normalized * (h - padding * 2));
      return `${x},${y}`;
    }).join(' ');
    
    svgContent += `<polyline fill="none" stroke="#10b981" stroke-width="2.5" points="${ptsAdherence}"/>`;
    svgContent += `<polyline fill="none" stroke="#6366f1" stroke-width="2.5" stroke-dasharray="4,2" points="${ptsMood}"/>`;
    
    // Puntos
    data.forEach((d, i) => {
      const x = padding + i * stepX;
      const yA = (h - padding) - ((d.adherence / 100) * (h - padding * 2));
      const yM = (h - padding) - (((d.energy + 5) / 10) * (h - padding * 2));
      svgContent += `<circle cx="${x}" cy="${yA}" r="3" fill="#10b981"/>`;
      svgContent += `<circle cx="${x}" cy="${yM}" r="3" fill="#6366f1"/>`;
    });
    
  } else if (currentChartMetric === 'sleep_energy') {
    // Línea 1: Horas de Sueño (0-12h) en teal
    let ptsSleep = data.map((d, i) => {
      const x = padding + i * stepX;
      const y = (h - padding) - ((d.sleep / 12) * (h - padding * 2));
      return `${x},${y}`;
    }).join(' ');
    
    svgContent += `<polyline fill="none" stroke="#0d9488" stroke-width="2.5" points="${ptsSleep}"/>`;
    
    data.forEach((d, i) => {
      const x = padding + i * stepX;
      const yS = (h - padding) - ((d.sleep / 12) * (h - padding * 2));
      svgContent += `<circle cx="${x}" cy="${yS}" r="3" fill="#0d9488"/>`;
      // Alerta si sueño fue menor a 4
      if (d.sleep < 4.0) {
        svgContent += `<circle cx="${x}" cy="${yS}" r="6" fill="none" stroke="#ef4444" stroke-width="2"/>`;
      }
    });
  } else {
    // Wearable BPM (60 a 100)
    const bpmData = [64, 68, 62, 70, 78, 65, 66];
    let ptsBpm = bpmData.map((bpm, i) => {
      const x = padding + i * stepX;
      const y = (h - padding) - (((bpm - 50) / 50) * (h - padding * 2));
      return `${x},${y}`;
    }).join(' ');
    
    svgContent += `<polyline fill="none" stroke="#f43f5e" stroke-width="2.5" points="${ptsBpm}"/>`;
    bpmData.forEach((bpm, i) => {
      const x = padding + i * stepX;
      const y = (h - padding) - (((bpm - 50) / 50) * (h - padding * 2));
      svgContent += `<circle cx="${x}" cy="${y}" r="3" fill="#f43f5e"/>`;
    });
  }
  
  svg.innerHTML = svgContent;
}

function exportEncryptedReport() {
  const password = prompt('SRS-FUN-014: Generación de Resumen Clínico Cifrado (PDF)\nEstablezca una contraseña de protección para el documento (mínimo 8 caracteres):');
  if (!password || password.length < 8) {
    alert('La contraseña debe tener al menos 8 caracteres alfanuméricos.');
    return;
  }
  
  SoundFx.success();
  recordAuditLog(`Informe clínico PDF cifrado generado con clave [AES-128]`, 'SRS-FUN-014', 'Psiquiatra');
  alert(`✅ Documento PDF compilado con éxito:\n- Archivo: PsicoMente_ResumenClinico_${AppState.patient.id}.pdf\n- Cifrado: AES-128 institucional\n- Contraseña asignada: ${password.replace(/./g, '*')}\n\nEl reporte incluye cruces de adherencia, sueño, PROMs PHQ-9 e historial farmacológico.`);
}

function saveClinicianNote() {
  const noteEl = document.getElementById('clinicianNoteInput');
  if (!noteEl || !noteEl.value.trim()) return;
  SoundFx.success();
  recordAuditLog(`Nota clínica agregada a la ficha: "${noteEl.value.trim().substring(0, 30)}..."`, 'CU-03', 'Psiquiatra');
  alert('Nota clínica firmada y guardada en el historial electrónico inmutable.');
  noteEl.value = '';
}

// ==========================================================================
// 12. RENDERIZADO DE VISTAS Y NAVEGACIÓN
// ==========================================================================
function switchTab(tabName) {
  SoundFx.click();
  AppState.activeTab = tabName;
  
  // Ocultar todos los view containers de paciente
  document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
  
  // Mostrar seleccionado
  const target = document.getElementById(`view-${tabName}`);
  if (target) target.classList.add('active');
  
  // Actualizar items de la barra inferior
  document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  recordAuditLog(`Navegación paciente hacia pestaña: ${tabName}`, 'Navegación');
  
  // Re-renderizar si es necesario
  if (tabName === 'meds') renderMedsView();
  if (tabName === 'clinic') renderPromView();
  if (tabName === 'settings') renderSettingsView();
}

function switchRole(role) {
  SoundFx.click();
  AppState.currentRole = role;
  
  document.querySelectorAll('.role-switcher .role-btn').forEach(b => {
    if (b.getAttribute('data-role') === role) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  
  const patientRoot = document.getElementById('patientAppRoot');
  const clinicianRoot = document.getElementById('clinicianAppRoot');
  const supportRoot = document.getElementById('supportAppRoot');
  
  if (role === 'paciente') {
    patientRoot.style.display = 'flex';
    clinicianRoot.style.display = 'none';
    supportRoot.style.display = 'none';
  } else if (role === 'psiquiatra') {
    patientRoot.style.display = 'none';
    clinicianRoot.style.display = 'flex';
    supportRoot.style.display = 'none';
    renderClinicianChart();
  } else if (role === 'red_apoyo') {
    patientRoot.style.display = 'none';
    clinicianRoot.style.display = 'none';
    supportRoot.style.display = 'flex';
    renderSupportView();
  }
  
  recordAuditLog(`Cambio de rol activo a: ${role.toUpperCase()}`, 'Gestión de Sesión', role);
}

function renderHomeOverview() {
  // Actualizar banner de racha
  const streakEl = document.getElementById('streakDaysDisplay');
  if (streakEl) streakEl.innerText = `${AppState.streakDays} días`;
  
  // Actualizar adherencia global
  const adhEl = document.getElementById('adherenceRateDisplay');
  if (adhEl) adhEl.innerText = `${AppState.adherenceRate}%`;
  
  // Próximo medicamento pendiente
  const nextMedEl = document.getElementById('nextMedDisplay');
  if (nextMedEl) {
    const pending = AppState.medications.find(m => !m.taken && !m.skipped);
    if (pending) {
      nextMedEl.innerText = `${pending.name} ${pending.dose} (${pending.schedule})`;
    } else {
      nextMedEl.innerText = '¡Todas las tomas completadas!';
    }
  }
}

function renderMedsView() {
  const container = document.getElementById('medicationsList');
  if (!container) return;
  
  container.innerHTML = AppState.medications.map(m => `
    <div class="med-card">
      <div class="med-header">
        <div class="med-title">
          <h4>${m.name} ${m.dose}</h4>
          <p>${m.indication}</p>
        </div>
        <div class="med-schedule-badge">
          ⏰ ${m.schedule}
        </div>
      </div>
      
      <div class="med-actions">
        <button class="btn-med-take ${m.taken ? 'taken' : ''}" onclick="markMedication(${m.id}, true)">
          ${m.taken ? `✔ Tomada (${m.timestamp})` : 'Marcar como Tomada'}
        </button>
        <button class="btn-med-skip ${m.skipped ? 'skipped' : ''}" onclick="markMedication(${m.id}, false)">
          ${m.skipped ? '✖ Omitida' : 'Omitir'}
        </button>
      </div>
    </div>
  `).join('');
  
  const bar = document.getElementById('adherenceProgressBar');
  if (bar) bar.style.width = `${AppState.adherenceRate}%`;
  
  const num = document.getElementById('adherencePercentText');
  if (num) num.innerText = `${AppState.adherenceRate}%`;
}

function renderPromView() {
  const container = document.getElementById('promQuestionsContainer');
  if (!container) return;
  
  const optionsLabels = ["0: Nunca", "1: Varios días", "2: > mitad", "3: Casi a diario"];
  
  container.innerHTML = PHQ9_QUESTIONS.map((q, idx) => {
    const currVal = AppState.promTest.answers[idx] !== undefined ? AppState.promTest.answers[idx] : 0;
    
    return `
      <div class="prom-question-card">
        <div class="prom-question-text">${q}</div>
        <div class="prom-options">
          ${[0, 1, 2, 3].map(optVal => `
            <button class="prom-opt-btn ${currVal === optVal ? 'active' : ''}" onclick="selectPromOption(${idx}, ${optVal})">
              ${optionsLabels[optVal]}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
  
  const scoreBadge = document.getElementById('promScoreText');
  if (scoreBadge) scoreBadge.innerText = `${AppState.promTest.score} / 27 pts`;
  
  const sevBadge = document.getElementById('promSeverityText');
  if (sevBadge) sevBadge.innerText = AppState.promTest.severity;
}

function renderSettingsView() {
  // Ajustar checks de permisos
  const p = AppState.permissions;
  const setCheck = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  };
  
  setCheck('permDrMeds', p.psychiatrist.meds);
  setCheck('permDrSleep', p.psychiatrist.sleep);
  setCheck('permDrMood', p.psychiatrist.mood);
  setCheck('permDrJournal', p.psychiatrist.journal);
  setCheck('permDrProms', p.psychiatrist.proms);
  
  setCheck('permPsMeds', p.psychologist.meds);
  setCheck('permPsSleep', p.psychologist.sleep);
  setCheck('permPsMood', p.psychologist.mood);
  setCheck('permPsJournal', p.psychologist.journal);
  setCheck('permPsProms', p.psychologist.proms);
}

function renderSupportView() {
  const statusEl = document.getElementById('supportEmergencyStatus');
  const alertBox = document.getElementById('supportSmsAlert');
  
  if (AppState.emergencyState.active) {
    if (statusEl) statusEl.innerHTML = '<span style="color:#ef4444; font-weight:800;">🚨 ALERTA ACTIVA DE CÓDIGO ROJO</span>';
    if (alertBox) alertBox.style.display = 'flex';
  } else {
    if (statusEl) statusEl.innerHTML = '<span style="color:#10b981; font-weight:700;">✅ Sistema en reposo / Normal</span>';
    if (alertBox) alertBox.style.display = 'none';
  }
}

function renderAllViews() {
  renderHomeOverview();
  renderMedsView();
  renderPromView();
  renderSettingsView();
  renderSupportView();
  renderAuditLogs();
}

// ==========================================================================
// 13. MODAL DE RÚBRICA Y AUDITORÍA
// ==========================================================================
function openRubricModal() {
  SoundFx.click();
  const modal = document.getElementById('rubricComplianceModal');
  if (modal) modal.classList.add('active');
  renderAuditLogs();
}

function closeRubricModal() {
  SoundFx.click();
  const modal = document.getElementById('rubricComplianceModal');
  if (modal) modal.classList.remove('active');
}

function toggleFrameMode() {
  SoundFx.click();
  document.body.classList.toggle('fullscreen-mode');
  const btn = document.getElementById('btnToggleFrame');
  if (btn) {
    btn.innerText = document.body.classList.contains('fullscreen-mode') ? '📱 Modo Celular' : '🖥️ Pantalla Completa';
  }
}

// ==========================================================================
// 14. INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupPanicButton();
  renderAllViews();
  
  // Establecer hora actual en notch
  const timeEl = document.getElementById('deviceClock');
  if (timeEl) {
    const updateTime = () => {
      const now = new Date();
      timeEl.innerText = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    };
    updateTime();
    setInterval(updateTime, 30000);
  }
  
  // Registro de evento inicial
  recordAuditLog('Inicialización de Prototipo PsicoMente', 'Arranque del Sistema');
});

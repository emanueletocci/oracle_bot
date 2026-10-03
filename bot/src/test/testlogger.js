// Import the logger
import logger from '../utils/logger.js';

console.log("--- 🚀 AVVIO TEST LOGGER ---");

// 1. INFO level test
// Should appear in Console and in application-DATE.log
logger.info('Test messaggio INFO: Il bot sta funzionando correttamente.');

// 2. WARN level test
// Should appear in Console and in application-DATE.log
logger.warn('Test messaggio WARN: Attenzione, qualcosa non va al 100%.');

// 3. ERROR level test (Simple string)
// Should appear in Console, in application-DATE.log AND in error-DATE.log
logger.error('Test messaggio ERROR: Errore generico rilevato.');

// 4. REAL ERROR test (Crash simulation)
// This is crucial to test if it captures the "stack trace" (the error line)
try {
    // Simulate a non-existent object
    const utente = undefined;
    console.log(utente.id); // This will generate a crash
} catch (error) {
    logger.error(error);
}

console.log("--- ✅ TEST FINITO. CONTROLLA LA CARTELLA LOGS ---");
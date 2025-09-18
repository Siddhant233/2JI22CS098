// Adapter that imports logging middleware from sibling package when available
import { log as lm_log, getLocalLogs as lm_get } from '../../Logging-Middleware/loggingMiddleware.js';

export async function log(stack, level, pkg, message){ try { return await lm_log(stack, level, pkg, message); } catch(e){ return null; } }
export function getLocalLogs(limit=200){ try { return lm_get(limit); } catch(e){ return []; } }
export default { log, getLocalLogs };

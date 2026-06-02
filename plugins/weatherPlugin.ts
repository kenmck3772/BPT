
import { TerminalPlugin, TerminalContext } from '../core/plugins';

export const weatherPlugin: TerminalPlugin = {
  id: 'weather-plugin',
  name: 'Weather Checker',
  description: 'Fetches current weather information for a specified location.',
  commands: [
    {
      name: 'weather',
      description: 'Check weather (e.g., weather Aberdeen)',
      execute: async (args: string[], context: TerminalContext) => {
        const location = args.join(' ') || 'Aberdeen';
        context.addLog(`>>> INITIATING_WEATHER_PROBE: ${location}...`, 'INFO');
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock weather data
          const temp = Math.floor(Math.random() * 15) + 2;
          const conditions = ['Overcast', 'Light Rain', 'Mist', 'Clear Skies', 'Gale Force Winds'][Math.floor(Math.random() * 5)];
          
          context.addLog(`>>> WEATHER_REPORT: ${location}`, 'SUCCESS');
          context.addLog(`    TEMPERATURE: ${temp}°C`, 'PROC');
          context.addLog(`    CONDITIONS: ${conditions}`, 'PROC');
          context.addLog(`    VISIBILITY: ${Math.floor(Math.random() * 10) + 1}km`, 'PROC');
          context.addLog(`>>> PROBE_COMPLETE: ATMOSPHERIC_DATA_SYNCED`, 'SUCCESS');
        } catch (error) {
          context.addLog(`ERR: WEATHER_PROBE_FAILED - ${error}`, 'ERR');
        }
      }
    }
  ]
};

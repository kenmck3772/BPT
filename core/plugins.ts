
export type LogType = 'PROC' | 'REMOTE' | 'ERR' | 'SUCCESS' | 'INPUT' | 'INFO';

export interface TerminalContext {
  addLog: (msg: string, type?: LogType) => void;
  executeCommand: (cmd: string) => Promise<void>;
  // In a real app, this would be a real file system access
  // For this demo, we'll provide a way to "read" mock data or constants
  getMockData: (key: string) => any;
}

export interface PluginCommand {
  name: string;
  description: string;
  execute: (args: string[], context: TerminalContext) => Promise<void>;
}

export interface TerminalPlugin {
  id: string;
  name: string;
  description: string;
  commands: PluginCommand[];
}

export class PluginManager {
  private plugins: Map<string, TerminalPlugin> = new Map();

  register(plugin: TerminalPlugin) {
    this.plugins.set(plugin.id, plugin);
  }

  getCommands(): PluginCommand[] {
    const commands: PluginCommand[] = [];
    this.plugins.forEach(plugin => {
      commands.push(...plugin.commands);
    });
    return commands;
  }

  getPlugin(id: string): TerminalPlugin | undefined {
    return this.plugins.get(id);
  }

  getAllPlugins(): TerminalPlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const globalPluginManager = new PluginManager();

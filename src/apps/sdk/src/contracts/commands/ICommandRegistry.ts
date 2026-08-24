export type CommandHandler = (...args: any[]) => Promise<any> | any

export interface ICommandRegistry {
  register(commandId: string, handler: CommandHandler): void
  unregister(commandId: string): void
  execute(commandId: string, ...args: any[]): Promise<any>
}

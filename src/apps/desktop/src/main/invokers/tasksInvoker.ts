import { ITaskAPI } from '@mr-tick/application'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'

export const tasksInvoker: ITaskAPI = {
  listTasks: () => IpcInvoker.invoke('TASKS_LIST'),
  pull: (payload) => IpcInvoker.invoke('TASKS_PULL', payload),
}

import { IOpenAPI } from '@pandhora/application'

const ipcClient: IOpenAPI = {
  timer: window.api.timer,
  services: window.api.services,
  modules: window.api.modules,
  integrations: window.api.integrations,
  events: window.api.events,
}

export { ipcClient }

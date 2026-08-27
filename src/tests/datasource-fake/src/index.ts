import type {
  AddonContext,
  AddonSettingsGroup,
  AddonSettingsSchema,
  IAddon,
  IDataSource,
} from '@gamhora/sdk'

import { FakeAuthenticationStrategy } from './FakeAuthenticationStrategy'
import { FakeMemberQuery } from './FakeMemberQuery'
import { FakeMetadataQuery } from './FakeMetadataQuery'
import { FakeTaskQuery } from './FakeTaskQuery'
import { FakeTaskRepository } from './FakeTaskRepository'
import { FakeTimeEntryQuery } from './FakeTimeEntryQuery'
import { FakeTimeEntryRepository } from './FakeTimeEntryRepository'

const configFields: {
  credentials: AddonSettingsGroup[]
  configuration: AddonSettingsGroup[]
} = {
  credentials: [
    {
      id: 'credentials_group',
      label: 'Autenticação Simulada (Fake)',
      description:
        'Preencha as credenciais de teste para conectar ao servidor simulado.',
      fields: [
        {
          id: 'serverUrl',
          type: 'text',
          label: 'URL do Servidor',
          placeholder: 'https://fake.gamhora-app.local',
          defaultValue: 'https://fake.gamhora-app.local',
        },
        {
          id: 'username',
          type: 'text',
          label: 'Usuário',
          placeholder: 'Admin',
          defaultValue: 'Admin',
        },
        {
          id: 'password',
          type: 'password',
          label: 'Senha de Acesso',
          placeholder: '123',
          defaultValue: '123',
        },
      ],
    },
  ],
  configuration: [
    {
      id: 'config_group',
      label: 'Parâmetros de Teste',
      description: 'Opções de comportamento da instância fake.',
      fields: [
        {
          id: 'syncInterval',
          type: 'number',
          label: 'Intervalo de Sync (Minutos)',
          placeholder: '5',
          defaultValue: 5,
        },
      ],
    },
  ],
}

export const FakeDataSource: IDataSource = {
  id: 'gamhora-datasource-fake',
  dataSourceType: 'fake',
  displayName: 'DataSource Fake (Testes)',
  configFields,

  getAuthenticationStrategy: () => new FakeAuthenticationStrategy(),
  getTaskQuery: (ctx) => new FakeTaskQuery(ctx),
  getTimeEntryQuery: (ctx) => new FakeTimeEntryQuery(ctx),
  getTimeEntryRepository: () => new FakeTimeEntryRepository(),
  getMemberQuery: (ctx) => new FakeMemberQuery(ctx),
  getTaskRepository: () => new FakeTaskRepository(),
  getMetadataQuery: (ctx) => new FakeMetadataQuery(ctx),
}

export default class FakeDataSourceAddon implements IAddon {
  async getSettingsSchema(): Promise<AddonSettingsSchema> {
    return [
      {
        id: 'general',
        label: 'Geral',
        groups: [...configFields.credentials, ...configFields.configuration],
      },
    ]
  }

  activate(context: AddonContext): void {
    console.log('🟢 [FakeDataSourceAddon] Registrando FakeDataSource...')
    context.dataSources.register(FakeDataSource)
  }

  deactivate(): void {
    console.log('🛑 [FakeDataSourceAddon] Desativado.')
  }
}

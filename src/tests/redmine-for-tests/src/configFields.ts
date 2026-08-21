import { FieldGroup } from '@metric-org/sdk'

export const credentialFieldGroups: FieldGroup[] = [
  {
    id: 'auth-keys',
    label: 'Chaves de Acesso',
    fields: [
      {
        id: 'apiKey',
        label: 'Chave de Acesso à API (REST)',
        type: 'password',
        required: true,
      },
      {
        id: 'atomKey',
        label: 'Chave de Acesso ao Atom (RSS)',
        type: 'password',
        required: true,
      },
    ],
  },
]

export const configurationFieldGroups: FieldGroup[] = [
  {
    id: 'connection',
    label: 'Configuração da Conexão',
    fields: [
      {
        id: 'apiUrl',
        label: 'URL da sua instância Redmine',
        type: 'url',
        required: true,
        placeholder: 'https://redmine.suaempresa.com',
      },
    ],
  },
]

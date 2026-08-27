import {
  AddonContext,
  AddonSettingsSchema,
  formatStoredToken,
  IAddon,
} from '@gamhora/sdk'
import axios from 'axios'
import net from 'net'

interface DiscordIPCUser {
  id: string
  username: string
  global_name?: string
  avatar?: string
  avatarUrl?: string
}

interface DiscordIPCPayload {
  cmd?: string
  evt?: string
  nonce?: string
  data?: {
    user?: DiscordIPCUser
    channel_id?: string | null
    guild_id?: string | null
    code?: number
    message?: string
  }
}

function encodeDiscordFrame(opcode: number, payload: object): Buffer {
  const jsonStr = JSON.stringify(payload)
  const jsonBuf = Buffer.from(jsonStr, 'utf8')
  const header = Buffer.alloc(8)
  header.writeInt32LE(opcode, 0)
  header.writeInt32LE(jsonBuf.length, 4)
  return Buffer.concat([header, jsonBuf])
}

function parseDiscordFrames(buffer: Buffer): {
  frames: { opcode: number; payload: DiscordIPCPayload }[]
  remaining: Buffer
} {
  const frames: { opcode: number; payload: DiscordIPCPayload }[] = []
  let offset = 0

  while (offset + 8 <= buffer.length) {
    const opcode = buffer.readInt32LE(offset)
    const length = buffer.readInt32LE(offset + 4)

    if (offset + 8 + length > buffer.length) {
      break
    }

    const payloadStr = buffer.toString('utf8', offset + 8, offset + 8 + length)
    try {
      const payload = JSON.parse(payloadStr) as DiscordIPCPayload
      frames.push({ opcode, payload })
    } catch {
      // Ignore malformed JSON
    }
    offset += 8 + length
  }

  return { frames, remaining: buffer.subarray(offset) as Buffer }
}

export default class DiscordAddon implements IAddon {
  private context?: AddonContext
  private socket: net.Socket | null = null
  private callStartTime: number | null = null
  private currentChannelId: string | null = null
  private connectedUser: DiscordIPCUser | null = null
  private accessToken: string | null = null

  async activate(context: AddonContext): Promise<void> {
    this.context = context
    console.log(`[DiscordAddon] Ativado: ${context.addonId}`)
    this.connectDiscordIPC()

    context.events.onWorkspaceChange(
      async (evtPayload: {
        currentWorkspaceId: string
        previousWorkspaceId?: string
      }) => {
        const currentWorkspaceId = evtPayload?.currentWorkspaceId || ''
        console.log(
          `[Discord IPC Log] 🔄 Mudança de Workspace detectada! Mudando para: "${currentWorkspaceId}"`,
        )
        this.currentChannelId = null
        this.callStartTime = null
        this.accessToken = null
        this.connectedUser = null

        if (this.socket) {
          this.socket.destroy()
        }

        // Reconnect fresh. The READY handler will auto-authenticate if the new workspace has a token.
        this.connectDiscordIPC()
      },
    )
  }

  async deactivate(): Promise<void> {
    if (this.socket) {
      this.socket.destroy()
      this.socket = null
    }
    this.accessToken = null
    console.log(`[DiscordAddon] Desativado`)
  }

  async getSettingsSchema(): Promise<AddonSettingsSchema> {
    if (this.connectedUser) {
      return [
        {
          id: 'general',
          label: 'Geral',
          groups: [
            {
              id: 'auth',
              label: 'Conta Conectada',
              description: 'Você já está conectado ao Discord.',
              fields: [
                {
                  id: 'account-info',
                  type: 'info-card',
                  label: '',
                  display: {
                    title: 'Autenticado com sucesso!',
                    avatarUrl: this.connectedUser.avatarUrl,
                    data: {
                      Usuário: this.connectedUser.username,
                      'Nome Global':
                        this.connectedUser.global_name ||
                        this.connectedUser.username,
                      'ID Discord': this.connectedUser.id,
                    },
                  },
                },
                {
                  id: 'disconnect',
                  type: 'button',
                  label: 'Desconectar conta',
                  variant: 'destructive',
                  actionId: 'disconnect',
                },
              ],
            },
          ],
        },
      ]
    }

    return [
      {
        id: 'general',
        label: 'Geral',
        groups: [
          {
            id: 'auth',
            label: 'Autenticação',
            description:
              'Conecte sua conta do Discord para monitorar a atividade.',
            fields: [
              {
                id: 'login',
                type: 'button',
                label: 'Conectar ao Discord via OAuth',
                actionId: 'login',
              },
            ],
          },
        ],
      },
    ]
  }

  async executeAction(actionId: string, payload?: unknown): Promise<unknown> {
    if (actionId === 'login') {
      return this.handleDiscordLogin()
    }
    if (actionId === 'disconnect') {
      return this.handleDiscordDisconnect(payload)
    }
    return null
  }

  private async handleDiscordDisconnect(_payload?: unknown): Promise<unknown> {
    this.accessToken = null
    this.connectedUser = null
    if (this.socket) {
      this.socket.destroy()
      this.socket = null
    }
    if (this.context) {
      await this.context.storage.delete('accessToken')
      await this.context.storage.delete('tokenData')
      await this.context.storage.delete('discordUser')
      this.context.notifications.info(
        'Conta do Discord desconectada neste workspace.',
        'Discord Desconectado',
      )
    }
    this.connectDiscordIPC()
    return { isSuccess: true }
  }

  private connectDiscordIPC(pipeIndex = 0): void {
    if (pipeIndex > 9 || this.socket) return

    const pipePath =
      process.platform === 'win32'
        ? `\\\\.\\pipe\\discord-ipc-${pipeIndex}`
        : `/tmp/discord-ipc-${pipeIndex}`

    const socket = net.connect(pipePath, () => {
      console.log(`🟢 [DiscordAddon] Conectado ao IPC Pipe Real: ${pipePath}`)
      this.socket = socket

      // Send Handshake
      const handshake = encodeDiscordFrame(0, {
        v: 1,
        client_id: '1372352088457220126',
      })
      socket.write(handshake)
    })

    let rxBuffer = Buffer.alloc(0)

    socket.on('data', (chunk) => {
      rxBuffer = Buffer.concat([rxBuffer, chunk])
      const result = parseDiscordFrames(rxBuffer)
      rxBuffer = Buffer.from(result.remaining)
      result.frames.forEach(({ payload }) => this.handleIPCPayload(payload))
    })

    socket.on('error', () => {
      this.socket = null
      this.connectDiscordIPC(pipeIndex + 1)
    })

    socket.on('close', () => {
      if (this.socket === socket) {
        this.socket = null
      }
    })
  }

  private handleIPCPayload(payload: DiscordIPCPayload): void {
    console.log(
      `[Discord IPC Log] Received payload -> cmd: "${payload.cmd || 'N/A'}", evt: "${payload.evt || 'N/A'}", nonce: "${payload.nonce || 'N/A'}"`,
    )

    // 1. Ready event (handshake response with real Discord desktop user)
    if (payload.evt === 'READY' && payload.data?.user) {
      const user = payload.data.user
      const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
        : undefined

      console.log(
        `[Discord IPC Log] Handshake OK! Usuário desktop reconhecido: @${user.username}`,
      )

      if (this.context) {
        Promise.all([
          this.context.storage.get('tokenData'),
          this.context.storage.get('accessToken'),
        ]).then(([storedTokenData, storedAccessToken]) => {
          let token = this.accessToken
          if (!token && storedTokenData) {
            try {
              const parsed = JSON.parse(storedTokenData)
              token = parsed.accessToken
            } catch {
              // ignore
            }
          }
          if (!token) {
            token = storedAccessToken
          }
          if (token) {
            this.connectedUser = { ...user, avatarUrl }
            this.context!.storage.set(
              'discordUser',
              JSON.stringify(this.connectedUser),
            )
            this.context!.notifications.success(
              `Conectado ao aplicativo Discord Desktop como @${user.username}`,
              'Discord Real IPC',
            )

            this.accessToken = token
            console.log(
              '[Discord IPC Log] 🔑 Access Token de sessão recuperado com sucesso! Autenticando IPC automaticamente...',
            )
            const authFrame = encodeDiscordFrame(1, {
              cmd: 'AUTHENTICATE',
              args: { access_token: token },
              nonce: 'auth_auto',
            })
            this.socket?.write(authFrame)
          } else {
            this.connectedUser = null
            console.log(
              '[Discord IPC Log] Nenhum token de sessão encontrado. Aguardando login OAuth pelo painel de Configurações.',
            )
          }
        })
      }
      return
    }

    // Handle authentication error (e.g. 4009 invalid token)
    if (payload.evt === 'ERROR' && payload.cmd === 'AUTHENTICATE') {
      console.error(
        '[Discord IPC Log] ❌ Erro de Autenticação IPC:',
        payload.data?.message || payload.data,
      )
      this.accessToken = null
      this.connectedUser = null
      if (this.context) {
        this.context.storage.delete('accessToken')
        this.context.storage.delete('discordUser')
        this.context.notifications.error(
          'Sessão expirada. Por favor, clique em "Conectar ao Discord via OAuth" nas Configurações.',
          'Discord Desconectado',
        )
      }
      return
    }

    // Handle authentication response
    if (payload.cmd === 'AUTHENTICATE' && payload.evt !== 'ERROR') {
      console.log(
        '[Discord IPC Log] ✅ IPC Autenticado com sucesso! Enviando SUBSCRIBE para VOICE_CHANNEL_SELECT...',
      )
      const subscribeFrame = encodeDiscordFrame(1, {
        cmd: 'SUBSCRIBE',
        evt: 'VOICE_CHANNEL_SELECT',
        nonce: 'sub_voice',
      })
      this.socket?.write(subscribeFrame)
      return
    }

    // Handle subscribe confirmation or error
    if (payload.cmd === 'SUBSCRIBE') {
      if (payload.evt === 'ERROR') {
        console.error(
          '[Discord IPC Log] ❌ Falha ao assinar eventos de voz:',
          payload.data?.message || payload.data,
        )
      } else {
        console.log(
          '[Discord IPC Log] 🎧 Inscrição em VOICE_CHANNEL_SELECT confirmada pelo Discord! Aguardando chamadas...',
        )
      }
      return
    }

    // 2. Real Voice Channel Events
    if (payload.evt === 'VOICE_CHANNEL_SELECT') {
      const channelId = payload.data?.channel_id
      console.log(
        `[Discord IPC Log] 🔔 EVENTO DE VOZ DETECTADO! Channel ID: ${channelId || 'Nenhum (Desconectado)'}`,
      )

      // User entered a real voice channel
      if (channelId && !this.currentChannelId) {
        this.context?.storage.get('accessToken').then((token) => {
          if (!token) {
            console.log(
              '[Discord IPC Log] ⚠️ Entrada em canal de voz ignorada: Workspace ativo não possui autenticação no Discord.',
            )
            return
          }

          this.currentChannelId = channelId
          this.callStartTime = Date.now()
          console.log(
            `[Discord IPC Log] 🎙️ Entrada registrada em canal de voz: ${channelId}`,
          )

          if (this.context) {
            this.context.notifications.info(
              `🎧 [Discord Real] Entrada detectada em canal de voz no app Desktop!`,
              'Captura de Atividade Real',
            )
          }
        })
        return
      }

      // User left the voice channel
      if (!channelId && this.currentChannelId) {
        const durationSeconds = this.callStartTime
          ? Math.max(1, Math.round((Date.now() - this.callStartTime) / 1000))
          : 0

        const minutes = Math.max(1, Math.round(durationSeconds / 60))

        const startChannelId = this.currentChannelId
        this.currentChannelId = null
        this.callStartTime = null

        this.context?.storage.get('accessToken').then((token) => {
          if (!token) {
            console.log(
              `[Discord IPC Log] ⚠️ Saída do canal ${startChannelId} ignorada: Workspace ativo não possui autenticação no Discord.`,
            )
            return
          }

          console.log(
            `[Discord IPC Log] 🛑 Saída registrada. Duração: ${durationSeconds}s (${minutes} min)`,
          )

          if (this.context) {
            this.context.notifications.success(
              `🎉 [Discord Real] Chamada de voz encerrada (${minutes} min). Sugestão de apontamento registrada!`,
              'Sugestão Automática de Tempo',
            )

            if (this.context.timeEntries?.createSuggestion) {
              this.context.timeEntries.createSuggestion({
                taskId: '',
                comments: 'Reunião Discord (Real IPC)',
                timeSpentSeconds: durationSeconds,
                source: 'ai_suggestion',
              })
            }
          }
        })
      }
    }
  }

  private async handleDiscordLogin(): Promise<unknown> {
    if (!this.context) {
      return { isSuccess: false, error: 'Contexto de addon não inicializado.' }
    }

    try {
      const { codeVerifier, codeChallenge } = this.context.oauth.generatePKCE()
      const state = this.context.oauth.generateState('discord')

      const CLIENT_ID = '1372352088457220126'
      const REDIRECT_URI =
        process.env.GAMHORA_OAUTH_REDIRECT_URI ||
        'http://localhost:3000/oauth/callback'

      const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI,
      )}&response_type=code&scope=identify%20rpc&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}`

      console.log(
        '[DiscordAddon] 🚀 Iniciando fluxo OAuth PKCE via Landing Page. Aguardando Deep Link...',
      )

      const result = await this.context.oauth.authorize({
        authUrl,
        state,
        timeoutMs: 120000,
      })

      if (!result.code) {
        return {
          isSuccess: false,
          error: 'Código de autorização não recebido.',
        }
      }

      console.log(
        '[DiscordAddon] 🔑 Código OAuth recebido via Deep Link! Trocando via PKCE...',
      )

      const { user: discordUser, storedToken } =
        await this.exchangeCodeAndGetUser(
          result.code,
          codeVerifier,
          REDIRECT_URI,
        )

      const { id, avatar } = discordUser
      if (!id) {
        return { isSuccess: false, error: 'ID do usuário não recebido.' }
      }

      const avatarUrl = avatar
        ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=128`
        : undefined

      this.accessToken = storedToken.accessToken
      this.connectedUser = { ...discordUser, avatarUrl }

      await this.context.storage.set('accessToken', storedToken.accessToken)
      await this.context.storage.set('tokenData', JSON.stringify(storedToken))
      await this.context.storage.set(
        'discordUser',
        JSON.stringify(this.connectedUser),
      )

      // Send AUTHENTICATE frame to IPC socket with the new token
      if (this.socket && !this.socket.destroyed) {
        console.log(
          '[Discord IPC Log] 🔐 Token recebido via OAuth PKCE! Enviando AUTHENTICATE para o IPC Socket...',
        )
        const authFrame = encodeDiscordFrame(1, {
          cmd: 'AUTHENTICATE',
          args: { access_token: this.accessToken },
          nonce: 'auth_from_login',
        })
        this.socket.write(authFrame)
      } else {
        console.log(
          '[Discord IPC Log] 🔐 Token recebido via OAuth PKCE! Conectando Socket IPC...',
        )
        this.connectDiscordIPC()
      }

      return {
        isSuccess: true,
        display: {
          title: 'Autenticado com sucesso!',
          message: 'Sua conta do Discord foi vinculada ao Gamhora.',
          avatarUrl,
          data: {
            Usuário: discordUser.username,
            'Nome Global': discordUser.global_name || discordUser.username,
            'ID Discord': id,
          },
        },
        data: this.connectedUser, // keep original data if needed
      }
    } catch (error) {
      console.error('[DiscordAddon] Erro no fluxo OAuth PKCE:', error)
      return { isSuccess: false, error: (error as Error).message }
    }
  }

  private async exchangeCodeAndGetUser(
    code: string,
    codeVerifier: string,
    redirectUri: string,
  ) {
    const CLIENT_ID = '1372352088457220126'

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    })

    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        validateStatus: () => true,
      },
    )

    if (tokenResponse.status < 200 || tokenResponse.status >= 300) {
      const errDetail =
        tokenResponse.data?.error_description ||
        tokenResponse.data?.error ||
        `HTTP ${tokenResponse.status}`
      throw new Error(`Falha ao obter token OAuth: ${errDetail}`)
    }

    const storedToken = formatStoredToken(tokenResponse.data)

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${storedToken.accessToken}` },
      validateStatus: () => true,
    })

    if (userResponse.status < 200 || userResponse.status >= 300) {
      throw new Error(
        `Falha ao obter dados do usuário: HTTP ${userResponse.status}`,
      )
    }

    return { user: userResponse.data, storedToken }
  }
}

import { CeramicApi } from '@ceramicnetwork/ceramic-common'
import Ceramic from '@ceramicnetwork/ceramic-http-client'
import { AuthenticateOptions, IDX, IDXOptions } from '@ceramicstudio/idx'
// @ts-ignore
import { EthereumAuthProvider, ThreeIdConnect } from '3id-connect'

const DEFAULT_CERAMIC_URL = 'https://ceramic.3boxlabs.com'

export interface IDXWebOptions extends Omit<IDXOptions, 'ceramic'> {
  ceramic?: CeramicApi | string
  connect?: ThreeIdConnect | string
}

export interface EthereumProviderOptions {
  address: string
  provider: unknown
}

export interface WebAuthenticateOptions extends AuthenticateOptions {
  authProvider?: EthereumAuthProvider
  ethereum?: EthereumProviderOptions
}

export class IDXWeb extends IDX {
  _connect: ThreeIdConnect

  constructor({ ceramic, connect, ...options }: IDXWebOptions = {}) {
    super({
      ...options,
      ceramic:
        typeof ceramic === 'string'
          ? new Ceramic(ceramic)
          : ceramic == null
          ? new Ceramic(DEFAULT_CERAMIC_URL)
          : ceramic
    })

    this._connect =
      connect == null || typeof connect === 'string' ? new ThreeIdConnect(connect) : connect
  }

  async authenticate(options: WebAuthenticateOptions = {}): Promise<void> {
    let provider = options.provider
    if (provider == null) {
      let authProvider = options.authProvider
      if (authProvider == null && options.ethereum != null) {
        authProvider = new EthereumAuthProvider(options.ethereum.provider, options.ethereum.address)
      }
      if (authProvider != null) {
        await this._connect.connect(authProvider)
        provider = await this._connect.getDidProvider()
      }
    }
    await super.authenticate({ provider, paths: options.paths })
  }
}

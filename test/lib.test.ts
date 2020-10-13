import Ceramic from '@ceramicnetwork/ceramic-http-client'
import { IDX } from '@ceramicstudio/idx'
// @ts-ignore
import { EthereumAuthProvider, ThreeIdConnect } from '3id-connect'

import { IDXWeb } from '../src'

jest.mock('@ceramicnetwork/ceramic-http-client')
jest.mock('3id-connect')

describe('lib', () => {
  beforeEach(() => {
    ;(Ceramic as jest.Mock<Ceramic>).mockClear()
    ;(EthereumAuthProvider as jest.Mock<EthereumAuthProvider>).mockClear()
    ;(ThreeIdConnect as jest.Mock<ThreeIdConnect>).mockClear()
  })

  it('extends the IDX class', () => {
    const idx = new IDXWeb()
    expect(idx).toBeInstanceOf(IDX)
  })

  describe('constructor', () => {
    it('uses the default Ceramic API URL if not provided', () => {
      new IDXWeb()
      expect(Ceramic).toBeCalledWith('https://ceramic.3boxlabs.com')
    })

    it('uses the provided Ceramic API URL', () => {
      new IDXWeb({ ceramic: 'https://localhost' })
      expect(Ceramic).toBeCalledWith('https://localhost')
    })

    it('uses the provided Ceramic instance', () => {
      const ceramic = new Ceramic()
      const idx = new IDXWeb({ ceramic })
      expect(idx._ceramic).toBe(ceramic)
    })

    it('creates the ThreeIdConnect instance', () => {
      const idx = new IDXWeb()
      expect(idx._connect).toBeInstanceOf(ThreeIdConnect)
    })

    it('uses the provided ThreeIdConnect URL', () => {
      new IDXWeb({ connect: 'https://localhost' })
      expect(ThreeIdConnect).toBeCalledWith('https://localhost')
    })

    it('uses the provided ThreeIdConnect instance', () => {
      const connect = new ThreeIdConnect()
      const idx = new IDXWeb({ connect })
      expect(idx._connect).toBe(connect)
    })
  })

  describe('authenticate', () => {
    it('uses the given provider', async () => {
      const spy = jest.spyOn(IDX.prototype, 'authenticate')
      const provider = {} as any
      const idx = new IDXWeb()
      await idx.authenticate({ provider, paths: ['test'] })
      expect(spy).toHaveBeenCalledWith({ provider, paths: ['test'] })
    })

    it('connects and uses the given authProvider', async () => {
      const spy = jest.spyOn(IDX.prototype, 'authenticate')
      const provider = {} as any
      ;(ThreeIdConnect.prototype.getDidProvider as jest.Mock).mockResolvedValue(provider)

      const idx = new IDXWeb()
      const authProvider = {} as any
      await idx.authenticate({ authProvider })

      expect(idx._connect.connect).toBeCalledWith(authProvider)
      expect(spy).toHaveBeenCalledWith({ provider })
    })

    it('uses the ethereum options to create the provider', async () => {
      const spy = jest.spyOn(IDX.prototype, 'authenticate')
      const provider = {} as any
      ;(ThreeIdConnect.prototype.getDidProvider as jest.Mock).mockResolvedValue(provider)

      const idx = new IDXWeb()
      const ethereum = { provider: {}, address: '0x1234' }
      await idx.authenticate({ ethereum })

      expect(EthereumAuthProvider).toBeCalledWith(ethereum.provider, ethereum.address)
      expect(idx._connect.connect).toBeCalledWith(expect.any(EthereumAuthProvider))
      expect(spy).toHaveBeenCalledWith({ provider, paths: ['test'] })
    })
  })
})

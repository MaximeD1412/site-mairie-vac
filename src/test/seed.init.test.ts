import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { runSeedInit } from '../seed.init.lib'

function makePayload({
  pagesCount = 0,
  navCount = 0,
  usersCount = 0,
}: { pagesCount?: number; navCount?: number; usersCount?: number } = {}) {
  return {
    find: vi.fn().mockImplementation(({ collection }: { collection: string }) => {
      if (collection === 'pages') return Promise.resolve({ totalDocs: pagesCount })
      if (collection === 'navigation') return Promise.resolve({ totalDocs: navCount })
      if (collection === 'users') return Promise.resolve({ totalDocs: usersCount })
      return Promise.resolve({ totalDocs: 0 })
    }),
    create: vi.fn().mockResolvedValue({}),
    updateGlobal: vi.fn().mockResolvedValue({}),
  }
}

describe('runSeedInit', () => {
  let exitSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called')
    }) as never)
    process.env.SEED_ADMIN_EMAIL = 'admin@example.com'
    process.env.SEED_ADMIN_PASSWORD = 'secret123'
  })

  afterEach(() => {
    exitSpy.mockRestore()
    delete process.env.SEED_ADMIN_EMAIL
    delete process.env.SEED_ADMIN_PASSWORD
  })

  describe('guard', () => {
    it('refuses and exits 1 when pages already exist', async () => {
      const payload = makePayload({ pagesCount: 1 })
      await expect(runSeedInit(payload as any)).rejects.toThrow('process.exit called')
      expect(exitSpy).toHaveBeenCalledWith(1)
    })

    it('refuses and exits 1 when navigation already exists', async () => {
      const payload = makePayload({ navCount: 1 })
      await expect(runSeedInit(payload as any)).rejects.toThrow('process.exit called')
      expect(exitSpy).toHaveBeenCalledWith(1)
    })

    it('refuses and exits 1 when users already exist', async () => {
      const payload = makePayload({ usersCount: 1 })
      await expect(runSeedInit(payload as any)).rejects.toThrow('process.exit called')
      expect(exitSpy).toHaveBeenCalledWith(1)
    })

    it('does not call create when guard triggers', async () => {
      const payload = makePayload({ pagesCount: 3 })
      await expect(runSeedInit(payload as any)).rejects.toThrow()
      expect(payload.create).not.toHaveBeenCalled()
    })
  })

  describe('happy path (empty DB)', () => {
    it('creates homepage with slug "/" and title "Accueil"', async () => {
      const payload = makePayload()
      await runSeedInit(payload as any)
      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'pages',
          data: expect.objectContaining({ slug: '/', title: 'Accueil' }),
        }),
      )
    })

    it('creates main navigation with empty items', async () => {
      const payload = makePayload()
      await runSeedInit(payload as any)
      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'navigation',
          data: expect.objectContaining({ location: 'main', items: [] }),
        }),
      )
    })

    it('creates footer navigation with empty items', async () => {
      const payload = makePayload()
      await runSeedInit(payload as any)
      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'navigation',
          data: expect.objectContaining({ location: 'footer', items: [] }),
        }),
      )
    })

    it('creates admin user from env vars', async () => {
      const payload = makePayload()
      await runSeedInit(payload as any)
      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'users',
          data: expect.objectContaining({
            email: 'admin@example.com',
            password: 'secret123',
            role: 'admin',
          }),
        }),
      )
    })

    it('updates mairie-info global', async () => {
      const payload = makePayload()
      await runSeedInit(payload as any)
      expect(payload.updateGlobal).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'mairie-info' }),
      )
    })

    it('updates site-settings global', async () => {
      const payload = makePayload()
      await runSeedInit(payload as any)
      expect(payload.updateGlobal).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'site-settings' }),
      )
    })

    it('updates homepage-settings global', async () => {
      const payload = makePayload()
      await runSeedInit(payload as any)
      expect(payload.updateGlobal).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'homepage-settings' }),
      )
    })
  })
})

import { describe, it, expect } from 'vitest'
import { WorkingCopies } from '../WorkingCopies'
import type { Access } from 'payload'

function makeReq(user: { id: number; role: string } | null) {
  return { user } as Parameters<Access>[0]['req']
}

const access = WorkingCopies.access!

describe('WorkingCopies access control', () => {
  describe('read', () => {
    it('returns false for unauthenticated requests', () => {
      const result = (access.read as Access)({ req: makeReq(null) } as any)
      expect(result).toBe(false)
    })

    it('returns an owner where-clause for authenticated users', () => {
      const result = (access.read as Access)({ req: makeReq({ id: 42, role: 'agent' }) } as any)
      expect(result).toEqual({ author: { equals: 42 } })
    })

    it('different users get different where-clauses', () => {
      const r1 = (access.read as Access)({ req: makeReq({ id: 1, role: 'agent' }) } as any)
      const r2 = (access.read as Access)({ req: makeReq({ id: 2, role: 'agent' }) } as any)
      expect(r1).toEqual({ author: { equals: 1 } })
      expect(r2).toEqual({ author: { equals: 2 } })
    })
  })

  describe('create', () => {
    it('denies unauthenticated users', () => {
      const result = (access.create as Access)({ req: makeReq(null) } as any)
      expect(result).toBe(false)
    })

    it('allows authenticated users', () => {
      const result = (access.create as Access)({ req: makeReq({ id: 1, role: 'agent' }) } as any)
      expect(result).toBe(true)
    })
  })

  describe('update', () => {
    it('returns false for unauthenticated requests', () => {
      const result = (access.update as Access)({ req: makeReq(null) } as any)
      expect(result).toBe(false)
    })

    it('returns owner where-clause so another user cannot update', () => {
      const result = (access.update as Access)({ req: makeReq({ id: 7, role: 'agent' }) } as any)
      expect(result).toEqual({ author: { equals: 7 } })
    })
  })

  describe('delete', () => {
    it('returns false for unauthenticated requests', () => {
      const result = (access.delete as Access)({ req: makeReq(null) } as any)
      expect(result).toBe(false)
    })

    it('returns owner where-clause so another user cannot delete', () => {
      const result = (access.delete as Access)({ req: makeReq({ id: 99, role: 'agent' }) } as any)
      expect(result).toEqual({ author: { equals: 99 } })
    })
  })

  describe('admin visibility', () => {
    it('is hidden from the admin panel', () => {
      expect(WorkingCopies.admin?.hidden).toBe(true)
    })
  })
})

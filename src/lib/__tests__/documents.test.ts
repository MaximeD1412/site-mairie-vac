import { describe, it, expect } from 'vitest'
import { getAvailableTabs, getCategoryLabel, DOCUMENT_CATEGORIES } from '../documents'

const doc = (category: string) => ({ category, title: '', date: null, file: null })

describe('DOCUMENT_CATEGORIES', () => {
  it('contient les 9 catégories', () => {
    expect(DOCUMENT_CATEGORIES).toHaveLength(9)
  })

  it('chaque entrée a un label et une valeur', () => {
    for (const c of DOCUMENT_CATEGORIES) {
      expect(typeof c.label).toBe('string')
      expect(typeof c.value).toBe('string')
      expect(c.label.length).toBeGreaterThan(0)
      expect(c.value.length).toBeGreaterThan(0)
    }
  })
})

describe('getAvailableTabs', () => {
  it('retourne vide si aucun document', () => {
    expect(getAvailableTabs([])).toEqual([])
  })

  it('retourne uniquement les catégories présentes dans les documents', () => {
    const docs = [doc('bulletin-municipal'), doc('bulletin-municipal'), doc('formulaire')]
    const tabs = getAvailableTabs(docs)
    expect(tabs.map(t => t.value)).toEqual(['bulletin-municipal', 'formulaire'])
  })

  it('respecte l\'ordre de DOCUMENT_CATEGORIES, pas celui des docs', () => {
    const docs = [doc('formulaire'), doc('bulletin-municipal')]
    const tabs = getAvailableTabs(docs)
    expect(tabs[0].value).toBe('bulletin-municipal')
    expect(tabs[1].value).toBe('formulaire')
  })

  it('ignore les catégories inconnues', () => {
    const tabs = getAvailableTabs([doc('catégorie-inexistante')])
    expect(tabs).toHaveLength(0)
  })

  it('retourne les objets {label, value} complets', () => {
    const tabs = getAvailableTabs([doc('pv-conseil')])
    expect(tabs[0]).toEqual({ label: 'PV du conseil municipal', value: 'pv-conseil' })
  })
})

describe('getCategoryLabel', () => {
  it('retourne le label pour une valeur connue', () => {
    expect(getCategoryLabel('bulletin-municipal')).toBe('Bulletin municipal')
    expect(getCategoryLabel('arrete')).toBe('Arrêté')
    expect(getCategoryLabel('autre')).toBe('Autre')
  })

  it('retourne la valeur brute si inconnue', () => {
    expect(getCategoryLabel('inconnue')).toBe('inconnue')
  })
})

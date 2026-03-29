import { describe, it, expect } from 'vitest'
import {
  selectTemplate,
  generateTargetFromTemplate,
  generateRandomTarget,
} from '../logic'
import { targetTemplates } from '../targets'
import type { TargetTemplate } from '../types'

describe('selectTemplate', () => {
  it('テンプレート配列からテンプレートを1つ返す', () => {
    const template = selectTemplate()
    expect(template).toBeDefined()
    expect(targetTemplates).toContain(template)
  })

  it('重みに応じた確率で選択される（統計的テスト）', () => {
    const counts = new Map<string, number>()
    const iterations = 10000

    for (let i = 0; i < iterations; i++) {
      const t = selectTemplate()
      counts.set(t.name, (counts.get(t.name) || 0) + 1)
    }

    const totalWeight = targetTemplates.reduce((s, t) => s + t.weight, 0)

    for (const template of targetTemplates) {
      const expected = template.weight / totalWeight
      const actual = (counts.get(template.name) || 0) / iterations
      // 5%の許容誤差
      expect(actual).toBeCloseTo(expected, 1)
    }
  })

  it('ドライバーの出現頻度が20%以下である', () => {
    const totalWeight = targetTemplates.reduce((s, t) => s + t.weight, 0)
    const driverTemplate = targetTemplates.find((t) =>
      t.name.includes('ドライバー'),
    )
    expect(driverTemplate).toBeDefined()
    const driverRatio = driverTemplate!.weight / totalWeight
    expect(driverRatio).toBeLessThanOrEqual(0.2)
  })
})

describe('generateTargetFromTemplate', () => {
  const template: TargetTemplate = {
    name: 'テスト ティーショット',
    distanceMin: 100,
    distanceMax: 200,
    depthOk: 15,
    widthOk: 20,
    obLeftChance: 0.5,
    obRightChance: 0.5,
    weight: 10,
  }

  it('テンプレートに基づいてターゲットを生成する', () => {
    const target = generateTargetFromTemplate(template)
    expect(target.name).toBe('テスト ティーショット')
    expect(target.distance).toBeGreaterThanOrEqual(100)
    expect(target.distance).toBeLessThanOrEqual(200)
    expect(target.depthOk).toBe(15)
    expect(target.widthOk).toBe(20)
    expect(typeof target.obLeft).toBe('boolean')
    expect(typeof target.obRight).toBe('boolean')
  })

  it('距離が10ヤード刻みで生成される', () => {
    for (let i = 0; i < 100; i++) {
      const target = generateTargetFromTemplate(template)
      expect(target.distance % 10).toBe(0)
    }
  })

  it('距離が最大250yを超えない（ドライバー）', () => {
    const driverTemplate = targetTemplates.find((t) =>
      t.name.includes('ドライバー'),
    )
    expect(driverTemplate).toBeDefined()
    expect(driverTemplate!.distanceMax).toBeLessThanOrEqual(250)

    for (let i = 0; i < 100; i++) {
      const target = generateTargetFromTemplate(driverTemplate!)
      expect(target.distance).toBeLessThanOrEqual(250)
    }
  })

  it('OBがない場合はobLeftとobRightがfalse', () => {
    const noObTemplate: TargetTemplate = {
      ...template,
      obLeftChance: 0,
      obRightChance: 0,
    }

    for (let i = 0; i < 50; i++) {
      const target = generateTargetFromTemplate(noObTemplate)
      expect(target.obLeft).toBe(false)
      expect(target.obRight).toBe(false)
    }
  })

  it('OBが常にある場合はobLeftとobRightがtrue', () => {
    const alwaysObTemplate: TargetTemplate = {
      ...template,
      obLeftChance: 1,
      obRightChance: 1,
    }

    for (let i = 0; i < 50; i++) {
      const target = generateTargetFromTemplate(alwaysObTemplate)
      expect(target.obLeft).toBe(true)
      expect(target.obRight).toBe(true)
    }
  })
})

describe('generateRandomTarget', () => {
  it('有効なターゲットを返す', () => {
    const target = generateRandomTarget()

    expect(target).toBeDefined()
    expect(target.name).toBeTruthy()
    expect(target.distance).toBeGreaterThan(0)
    expect(target.depthOk).toBeGreaterThan(0)
    expect(target.widthOk).toBeGreaterThan(0)
    expect(typeof target.obLeft).toBe('boolean')
    expect(typeof target.obRight).toBe('boolean')
  })

  it('距離が250yを超えない', () => {
    for (let i = 0; i < 500; i++) {
      const target = generateRandomTarget()
      expect(target.distance).toBeLessThanOrEqual(250)
    }
  })
})

describe('targetTemplates', () => {
  it('すべてのテンプレートが正の重みを持つ', () => {
    for (const template of targetTemplates) {
      expect(template.weight).toBeGreaterThan(0)
    }
  })

  it('すべてのテンプレートの距離範囲が有効', () => {
    for (const template of targetTemplates) {
      expect(template.distanceMin).toBeLessThanOrEqual(template.distanceMax)
      expect(template.distanceMin).toBeGreaterThan(0)
    }
  })

  it('OB確率が0-1の範囲内', () => {
    for (const template of targetTemplates) {
      expect(template.obLeftChance).toBeGreaterThanOrEqual(0)
      expect(template.obLeftChance).toBeLessThanOrEqual(1)
      expect(template.obRightChance).toBeGreaterThanOrEqual(0)
      expect(template.obRightChance).toBeLessThanOrEqual(1)
    }
  })

  it('最大距離が250yを超えるテンプレートがない', () => {
    for (const template of targetTemplates) {
      expect(template.distanceMax).toBeLessThanOrEqual(250)
    }
  })
})

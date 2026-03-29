import { describe, it, expect } from 'vitest'
import {
  selectTemplate,
  generateTargetFromTemplate,
  generateRandomTarget,
  getTargetCategory,
  computeStats,
  getScaledDistanceRanges,
} from '../logic'
import { targetTemplates } from '../targets'
import type { TargetTemplate, ShotResult } from '../types'

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

  it('ロングショットの出現頻度が20%以下である', () => {
    const totalWeight = targetTemplates.reduce((s, t) => s + t.weight, 0)
    const longTemplate = targetTemplates.find((t) =>
      t.name.includes('ロングショット'),
    )
    expect(longTemplate).toBeDefined()
    const longRatio = longTemplate!.weight / totalWeight
    expect(longRatio).toBeLessThanOrEqual(0.2)
  })

  it('アプローチの出現頻度が20%以上である', () => {
    const totalWeight = targetTemplates.reduce((s, t) => s + t.weight, 0)
    const approachWeight = targetTemplates
      .filter((t) => t.name.includes('アプローチ'))
      .reduce((s, t) => s + t.weight, 0)
    const approachRatio = approachWeight / totalWeight
    expect(approachRatio).toBeGreaterThanOrEqual(0.2)
  })
})

describe('generateTargetFromTemplate', () => {
  const template: TargetTemplate = {
    name: 'テスト ティーショット',
    distanceMin: 100,
    distanceMax: 200,
    depthOk: 15,
    widthOk: 20,
    weight: 10,
  }

  it('テンプレートに基づいてターゲットを生成する', () => {
    const target = generateTargetFromTemplate(template)
    expect(target.name).toBe('テスト ティーショット')
    expect(target.distance).toBeGreaterThanOrEqual(100)
    expect(target.distance).toBeLessThanOrEqual(200)
    expect(target.depthOk).toBe(15)
    expect(target.widthOk).toBe(20)
  })

  it('距離が10ヤード刻みで生成される', () => {
    for (let i = 0; i < 100; i++) {
      const target = generateTargetFromTemplate(template)
      expect(target.distance % 10).toBe(0)
    }
  })

  it('距離が最大250yを超えない（ロングショット）', () => {
    const longTemplate = targetTemplates.find((t) =>
      t.name.includes('ロングショット'),
    )
    expect(longTemplate).toBeDefined()
    expect(longTemplate!.distanceMax).toBeLessThanOrEqual(250)

    for (let i = 0; i < 100; i++) {
      const target = generateTargetFromTemplate(longTemplate!)
      expect(target.distance).toBeLessThanOrEqual(250)
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
  })

  it('距離が250yを超えない', () => {
    for (let i = 0; i < 500; i++) {
      const target = generateRandomTarget()
      expect(target.distance).toBeLessThanOrEqual(250)
    }
  })

  it('アプローチショットが出現する（統計的テスト）', () => {
    let approachCount = 0
    const iterations = 1000

    for (let i = 0; i < iterations; i++) {
      const target = generateRandomTarget()
      if (target.name.includes('アプローチ')) {
        approachCount++
      }
    }

    // アプローチが少なくとも15%は出現する
    expect(approachCount / iterations).toBeGreaterThan(0.15)
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

  it('ハザード確率が0-1の範囲内', () => {
    // ハザード機能削除済み - テスト不要
  })

  it('最大距離が250yを超えるテンプレートがない', () => {
    for (const template of targetTemplates) {
      expect(template.distanceMax).toBeLessThanOrEqual(250)
    }
  })

  it('ヒント確率が0-1の範囲内で合計が1以下', () => {
    // ヒント機能削除済み - テスト不要
  })

  it('アプローチショットのテンプレートが存在する', () => {
    const approachTemplates = targetTemplates.filter((t) =>
      t.name.includes('アプローチ'),
    )
    expect(approachTemplates.length).toBeGreaterThanOrEqual(2)
  })

  it('アプローチに30yd以下のテンプレートが含まれる', () => {
    const shortApproach = targetTemplates.find(
      (t) => t.name.includes('アプローチ') && t.distanceMax <= 30,
    )
    expect(shortApproach).toBeDefined()
  })
})

describe('generateTargetFromTemplate with maxDistance', () => {
  const template: TargetTemplate = {
    name: 'テスト ティーショット',
    distanceMin: 200,
    distanceMax: 250,
    depthOk: 30,
    widthOk: 30,
    weight: 10,
  }

  it('maxDistance=250でデフォルトと同じ距離範囲', () => {
    for (let i = 0; i < 100; i++) {
      const target = generateTargetFromTemplate(template, 250)
      expect(target.distance).toBeGreaterThanOrEqual(200)
      expect(target.distance).toBeLessThanOrEqual(250)
    }
  })

  it('maxDistance=180で距離がスケールされる', () => {
    // 200-250 scaled by 180/250 = 0.72 → 144-180 → rounded to 10s: 140-180
    for (let i = 0; i < 100; i++) {
      const target = generateTargetFromTemplate(template, 180)
      expect(target.distance).toBeGreaterThanOrEqual(140)
      expect(target.distance).toBeLessThanOrEqual(180)
      expect(target.distance % 10).toBe(0)
    }
  })

  it('maxDistance=100で距離がスケールされる', () => {
    // 200-250 scaled by 100/250 = 0.4 → 80-100 → rounded to 10s: 80-100
    for (let i = 0; i < 100; i++) {
      const target = generateTargetFromTemplate(template, 100)
      expect(target.distance).toBeGreaterThanOrEqual(80)
      expect(target.distance).toBeLessThanOrEqual(100)
      expect(target.distance % 10).toBe(0)
    }
  })
})

describe('generateRandomTarget with maxDistance', () => {
  it('maxDistance=180で距離が180を超えない', () => {
    for (let i = 0; i < 500; i++) {
      const target = generateRandomTarget(180)
      expect(target.distance).toBeLessThanOrEqual(180)
    }
  })

  it('maxDistance=250でデフォルトと同じ振る舞い', () => {
    for (let i = 0; i < 500; i++) {
      const target = generateRandomTarget(250)
      expect(target.distance).toBeLessThanOrEqual(250)
    }
  })
})

describe('computeStats', () => {
  it('空の結果で正しい統計を返す', () => {
    const stats = computeStats([])
    expect(stats.totalShots).toBe(0)
    expect(stats.totalSuccess).toBe(0)
    expect(stats.totalMiss).toBe(0)
    expect(stats.scenarioStats).toHaveLength(0)
  })

  it('全成功の結果で正しい統計を返す', () => {
    const results: ShotResult[] = [
      { targetName: 'ドライバー', result: 'success' },
      { targetName: 'ドライバー', result: 'success' },
      { targetName: 'アプローチ', result: 'success' },
    ]
    const stats = computeStats(results)
    expect(stats.totalShots).toBe(3)
    expect(stats.totalSuccess).toBe(3)
    expect(stats.totalMiss).toBe(0)
    expect(stats.scenarioStats).toHaveLength(2)
  })

  it('混合結果で正しい統計を返す', () => {
    const results: ShotResult[] = [
      { targetName: 'ドライバー', result: 'success' },
      { targetName: 'ドライバー', result: 'miss' },
      { targetName: 'アプローチ', result: 'success' },
      { targetName: 'アプローチ', result: 'miss' },
      { targetName: 'アプローチ', result: 'success' },
    ]
    const stats = computeStats(results)
    expect(stats.totalShots).toBe(5)
    expect(stats.totalSuccess).toBe(3)
    expect(stats.totalMiss).toBe(2)

    const driverStat = stats.scenarioStats.find((s) => s.name === 'ドライバー')
    expect(driverStat).toBeDefined()
    expect(driverStat!.successCount).toBe(1)
    expect(driverStat!.missCount).toBe(1)
    expect(driverStat!.totalCount).toBe(2)

    const approachStat = stats.scenarioStats.find((s) => s.name === 'アプローチ')
    expect(approachStat).toBeDefined()
    expect(approachStat!.successCount).toBe(2)
    expect(approachStat!.missCount).toBe(1)
    expect(approachStat!.totalCount).toBe(3)
  })

  it('場面ごとの統計が結果の順序を保持する', () => {
    const results: ShotResult[] = [
      { targetName: 'アプローチ', result: 'success' },
      { targetName: 'ドライバー', result: 'miss' },
    ]
    const stats = computeStats(results)
    expect(stats.scenarioStats[0].name).toBe('アプローチ')
    expect(stats.scenarioStats[1].name).toBe('ドライバー')
  })
})

describe('getTargetCategory', () => {
  it('ロングショットをlong カテゴリと判定する', () => {
    expect(getTargetCategory('ロングショット')).toBe('long')
  })

  it('アプローチをapproach カテゴリと判定する', () => {
    expect(getTargetCategory('アプローチ（ピッチ）')).toBe('approach')
    expect(getTargetCategory('アプローチ（チップ&ラン）')).toBe('approach')
  })

  it('その他をother カテゴリと判定する', () => {
    expect(getTargetCategory('ミドルショット（長）')).toBe('other')
    expect(getTargetCategory('ハーフショット')).toBe('other')
  })
})

describe('generateTargetFromTemplate with strictness', () => {
  const template: TargetTemplate = {
    name: 'テスト ティーショット',
    distanceMin: 100,
    distanceMax: 200,
    depthOk: 20,
    widthOk: 20,
    weight: 10,
  }

  it('strictness=normalで元の値が維持される', () => {
    const target = generateTargetFromTemplate(template, 250, 'normal')
    expect(target.depthOk).toBe(20)
    expect(target.widthOk).toBe(20)
  })

  it('strictness=easyでOKゾーンが広がる', () => {
    const target = generateTargetFromTemplate(template, 250, 'easy')
    expect(target.depthOk).toBe(30)  // 20 * 1.5 = 30
    expect(target.widthOk).toBe(30)
  })

  it('strictness=strictでOKゾーンが狭まる', () => {
    const target = generateTargetFromTemplate(template, 250, 'strict')
    expect(target.depthOk).toBe(15)  // 20 * 0.75 = 15
    expect(target.widthOk).toBe(15)
  })

  it('strictness=veryStrictでOKゾーンがさらに狭まる', () => {
    const target = generateTargetFromTemplate(template, 250, 'veryStrict')
    expect(target.depthOk).toBe(10)  // 20 * 0.5 = 10
    expect(target.widthOk).toBe(10)
  })

  it('OKゾーンが最小1ydを保つ', () => {
    const smallTemplate: TargetTemplate = {
      ...template,
      depthOk: 1,
      widthOk: 1,
    }
    const target = generateTargetFromTemplate(smallTemplate, 250, 'veryStrict')
    expect(target.depthOk).toBeGreaterThanOrEqual(1)
    expect(target.widthOk).toBeGreaterThanOrEqual(1)
  })
})

describe('generateRandomTarget with consecutive prevention', () => {
  it('ロングショット連続を防ぐ（統計的テスト）', () => {
    let consecutiveCount = 0
    const iterations = 500

    for (let i = 0; i < iterations; i++) {
      const target = generateRandomTarget(250, 'normal', 'ロングショット')
      if (getTargetCategory(target.name) === 'long') {
        consecutiveCount++
      }
    }

    // 連続防止が機能していれば、ロングショットはほぼ出ない
    expect(consecutiveCount / iterations).toBeLessThan(0.05)
  })

  it('アプローチ連続を防ぐ（統計的テスト）', () => {
    let consecutiveCount = 0
    const iterations = 500

    for (let i = 0; i < iterations; i++) {
      const target = generateRandomTarget(250, 'normal', 'アプローチ（ピッチ）')
      if (getTargetCategory(target.name) === 'approach') {
        consecutiveCount++
      }
    }

    expect(consecutiveCount / iterations).toBeLessThan(0.05)
  })

  it('otherカテゴリは連続防止の対象外', () => {
    let otherCount = 0
    const iterations = 500

    for (let i = 0; i < iterations; i++) {
      const target = generateRandomTarget(250, 'normal', 'ミドルショット（長）')
      if (getTargetCategory(target.name) === 'other') {
        otherCount++
      }
    }

    // otherカテゴリは連続防止の対象外なので出現する
    expect(otherCount / iterations).toBeGreaterThan(0.1)
  })

  it('previousTargetNameが未指定でも正常に動作する', () => {
    const target = generateRandomTarget(250, 'normal')
    expect(target).toBeDefined()
    expect(target.name).toBeTruthy()
  })
})

describe('getScaledDistanceRanges', () => {
  it('デフォルト(250yd)でスケールなし', () => {
    const ranges = getScaledDistanceRanges(250)
    const longShot = ranges.find((r) => r.name === 'ロングショット')
    expect(longShot).toBeDefined()
    expect(longShot!.distanceMin).toBe(200)
    expect(longShot!.distanceMax).toBe(250)
  })

  it('180ydでスケールされる', () => {
    const ranges = getScaledDistanceRanges(180)
    const longShot = ranges.find((r) => r.name === 'ロングショット')
    expect(longShot).toBeDefined()
    // 200 * 180/250 = 144 → 140, 250 * 180/250 = 180
    expect(longShot!.distanceMin).toBe(140)
    expect(longShot!.distanceMax).toBe(180)
  })

  it('全テンプレートの距離帯を返す', () => {
    const ranges = getScaledDistanceRanges()
    expect(ranges).toHaveLength(targetTemplates.length)
  })

  it('出現率の合計が100%前後になる', () => {
    const ranges = getScaledDistanceRanges()
    const totalPercentage = ranges.reduce((s, r) => s + r.percentage, 0)
    expect(totalPercentage).toBeGreaterThanOrEqual(98)
    expect(totalPercentage).toBeLessThanOrEqual(102)
  })

  it('距離が最小10ydを保つ', () => {
    const ranges = getScaledDistanceRanges(50)
    for (const r of ranges) {
      expect(r.distanceMin).toBeGreaterThanOrEqual(10)
      expect(r.distanceMax).toBeGreaterThanOrEqual(10)
    }
  })
})

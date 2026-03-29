import { describe, it, expect } from 'vitest'
import {
  selectTemplate,
  buildTemplates,
  generateTargetFromTemplate,
  generateRandomTarget,
  getTargetCategory,
  getProfile,
  getDistanceRangeInfo,
  computeStats,
} from '../logic'
import { baseTemplates, distanceProfiles } from '../targets'
import type { TargetTemplate, ShotResult } from '../types'

const defaultProfile = getProfile('d210')
const defaultTemplates = buildTemplates(defaultProfile)

describe('selectTemplate', () => {
  it('テンプレート配列からテンプレートを1つ返す', () => {
    const template = selectTemplate(defaultTemplates)
    expect(template).toBeDefined()
    expect(defaultTemplates).toContain(template)
  })

  it('重みに応じた確率で選択される（統計的テスト）', () => {
    const counts = new Map<string, number>()
    const iterations = 10000

    for (let i = 0; i < iterations; i++) {
      const t = selectTemplate(defaultTemplates)
      counts.set(t.name, (counts.get(t.name) || 0) + 1)
    }

    const totalWeight = defaultTemplates.reduce((s, t) => s + t.weight, 0)

    for (const template of defaultTemplates) {
      const expected = template.weight / totalWeight
      const actual = (counts.get(template.name) || 0) / iterations
      expect(actual).toBeCloseTo(expected, 1)
    }
  })

  it('ロングショットの出現頻度が30%以下である', () => {
    const totalWeight = defaultTemplates.reduce((s, t) => s + t.weight, 0)
    const longTemplate = defaultTemplates.find((t) =>
      t.name.includes('ロングショット'),
    )
    expect(longTemplate).toBeDefined()
    const longRatio = longTemplate!.weight / totalWeight
    expect(longRatio).toBeLessThanOrEqual(0.3)
  })

  it('アプローチの出現頻度が25%以上である', () => {
    const totalWeight = defaultTemplates.reduce((s, t) => s + t.weight, 0)
    const approachWeight = defaultTemplates
      .filter((t) => t.name.includes('アプローチ'))
      .reduce((s, t) => s + t.weight, 0)
    const approachRatio = approachWeight / totalWeight
    expect(approachRatio).toBeGreaterThanOrEqual(0.25)
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
    const target = generateTargetFromTemplate(template, 250)
    expect(target.name).toBe('テスト ティーショット')
    expect(target.distance).toBeGreaterThanOrEqual(100)
    expect(target.distance).toBeLessThanOrEqual(200)
    expect(target.depthOk).toBe(15)
    expect(target.widthOk).toBe(20)
  })

  it('距離が10ヤード刻みで生成される', () => {
    for (let i = 0; i < 100; i++) {
      const target = generateTargetFromTemplate(template, 250)
      expect(target.distance % 10).toBe(0)
    }
  })

  it('距離が最大250yを超えない（ロングショット）', () => {
    const longTemplate = defaultTemplates.find((t) =>
      t.name.includes('ロングショット'),
    )
    expect(longTemplate).toBeDefined()
    expect(longTemplate!.distanceMax).toBeLessThanOrEqual(250)

    for (let i = 0; i < 100; i++) {
      const target = generateTargetFromTemplate(longTemplate!, 250)
      expect(target.distance).toBeLessThanOrEqual(250)
    }
  })
})

describe('generateRandomTarget', () => {
  it('有効なターゲットを返す', () => {
    const target = generateRandomTarget(defaultProfile)

    expect(target).toBeDefined()
    expect(target.name).toBeTruthy()
    expect(target.distance).toBeGreaterThan(0)
    expect(target.depthOk).toBeGreaterThan(0)
    expect(target.widthOk).toBeGreaterThan(0)
  })

  it('プロフィールのmaxDistanceを超えない', () => {
    for (const profile of distanceProfiles) {
      for (let i = 0; i < 200; i++) {
        const target = generateRandomTarget(profile)
        expect(target.distance).toBeLessThanOrEqual(profile.maxDistance)
      }
    }
  })

  it('アプローチショットが出現する（統計的テスト）', () => {
    let approachCount = 0
    const iterations = 1000

    for (let i = 0; i < iterations; i++) {
      const target = generateRandomTarget(defaultProfile)
      if (target.name.includes('アプローチ')) {
        approachCount++
      }
    }

    expect(approachCount / iterations).toBeGreaterThan(0.15)
  })
})

describe('baseTemplates', () => {
  it('すべてのテンプレートの距離範囲が有効', () => {
    for (const template of baseTemplates) {
      expect(template.distanceMin).toBeLessThanOrEqual(template.distanceMax)
      expect(template.distanceMin).toBeGreaterThan(0)
    }
  })

  it('最大距離が250yを超えるテンプレートがない', () => {
    for (const template of baseTemplates) {
      expect(template.distanceMax).toBeLessThanOrEqual(250)
    }
  })

  it('アプローチショットのテンプレートが存在する', () => {
    const approachTemplates = baseTemplates.filter((t) =>
      t.name.includes('アプローチ'),
    )
    expect(approachTemplates.length).toBeGreaterThanOrEqual(2)
  })

  it('アプローチに30yd以下のテンプレートが含まれる', () => {
    const shortApproach = baseTemplates.find(
      (t) => t.name.includes('アプローチ') && t.distanceMax <= 30,
    )
    expect(shortApproach).toBeDefined()
  })
})

describe('distanceProfiles', () => {
  it('6つのプロフィールが定義されている', () => {
    expect(distanceProfiles).toHaveLength(6)
  })

  it('すべてのプロフィールのweightsがbaseTemplatesと同じ長さ', () => {
    for (const profile of distanceProfiles) {
      expect(profile.weights).toHaveLength(baseTemplates.length)
    }
  })

  it('すべてのプロフィールの重みが正の数', () => {
    for (const profile of distanceProfiles) {
      for (const w of profile.weights) {
        expect(w).toBeGreaterThan(0)
      }
    }
  })

  it('飛距離の昇順で並んでいる', () => {
    for (let i = 1; i < distanceProfiles.length; i++) {
      expect(distanceProfiles[i].maxDistance).toBeGreaterThan(distanceProfiles[i - 1].maxDistance)
    }
  })

  it('ロングヒッターほどショートゲームの割合が高い', () => {
    const first = distanceProfiles[0]
    const last = distanceProfiles[distanceProfiles.length - 1]
    const shortGameFirst = first.weights[4] + first.weights[5]
    const shortGameLast = last.weights[4] + last.weights[5]
    const totalFirst = first.weights.reduce((s, w) => s + w, 0)
    const totalLast = last.weights.reduce((s, w) => s + w, 0)
    expect(shortGameLast / totalLast).toBeGreaterThan(shortGameFirst / totalFirst)
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
    for (let i = 0; i < 100; i++) {
      const target = generateTargetFromTemplate(template, 180)
      expect(target.distance).toBeGreaterThanOrEqual(140)
      expect(target.distance).toBeLessThanOrEqual(180)
      expect(target.distance % 10).toBe(0)
    }
  })

  it('maxDistance=100で距離がスケールされる', () => {
    for (let i = 0; i < 100; i++) {
      const target = generateTargetFromTemplate(template, 100)
      expect(target.distance).toBeGreaterThanOrEqual(80)
      expect(target.distance).toBeLessThanOrEqual(100)
      expect(target.distance % 10).toBe(0)
    }
  })
})

describe('generateRandomTarget with different profiles', () => {
  it('180ydプロフィールで距離が180を超えない', () => {
    const profile = getProfile('d180')
    for (let i = 0; i < 500; i++) {
      const target = generateRandomTarget(profile)
      expect(target.distance).toBeLessThanOrEqual(180)
    }
  })

  it('300ydプロフィールで距離が300を超えない', () => {
    const profile = getProfile('d300')
    for (let i = 0; i < 500; i++) {
      const target = generateRandomTarget(profile)
      expect(target.distance).toBeLessThanOrEqual(300)
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
      { targetName: 'ロングショット', result: 'success' },
      { targetName: 'ロングショット', result: 'success' },
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
      { targetName: 'ロングショット', result: 'success' },
      { targetName: 'ロングショット', result: 'miss' },
      { targetName: 'アプローチ', result: 'success' },
      { targetName: 'アプローチ', result: 'miss' },
      { targetName: 'アプローチ', result: 'success' },
    ]
    const stats = computeStats(results)
    expect(stats.totalShots).toBe(5)
    expect(stats.totalSuccess).toBe(3)
    expect(stats.totalMiss).toBe(2)

    const longStat = stats.scenarioStats.find((s) => s.name === 'ロングショット')
    expect(longStat).toBeDefined()
    expect(longStat!.successCount).toBe(1)
    expect(longStat!.missCount).toBe(1)
    expect(longStat!.totalCount).toBe(2)

    const approachStat = stats.scenarioStats.find((s) => s.name === 'アプローチ')
    expect(approachStat).toBeDefined()
    expect(approachStat!.successCount).toBe(2)
    expect(approachStat!.missCount).toBe(1)
    expect(approachStat!.totalCount).toBe(3)
  })

  it('場面ごとの統計が結果の順序を保持する', () => {
    const results: ShotResult[] = [
      { targetName: 'アプローチ', result: 'success' },
      { targetName: 'ロングショット', result: 'miss' },
    ]
    const stats = computeStats(results)
    expect(stats.scenarioStats[0].name).toBe('アプローチ')
    expect(stats.scenarioStats[1].name).toBe('ロングショット')
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
    expect(target.depthOk).toBe(30)
    expect(target.widthOk).toBe(30)
  })

  it('strictness=strictでOKゾーンが狭まる', () => {
    const target = generateTargetFromTemplate(template, 250, 'strict')
    expect(target.depthOk).toBe(15)
    expect(target.widthOk).toBe(15)
  })

  it('strictness=veryStrictでOKゾーンがさらに狭まる', () => {
    const target = generateTargetFromTemplate(template, 250, 'veryStrict')
    expect(target.depthOk).toBe(10)
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
      const target = generateRandomTarget(defaultProfile, 'normal', 'ロングショット')
      if (getTargetCategory(target.name) === 'long') {
        consecutiveCount++
      }
    }

    expect(consecutiveCount / iterations).toBeLessThan(0.05)
  })

  it('アプローチ連続を防ぐ（統計的テスト）', () => {
    let consecutiveCount = 0
    const iterations = 500

    for (let i = 0; i < iterations; i++) {
      const target = generateRandomTarget(defaultProfile, 'normal', 'アプローチ（ピッチ）')
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
      const target = generateRandomTarget(defaultProfile, 'normal', 'ミドルショット（長）')
      if (getTargetCategory(target.name) === 'other') {
        otherCount++
      }
    }

    expect(otherCount / iterations).toBeGreaterThan(0.1)
  })

  it('previousTargetNameが未指定でも正常に動作する', () => {
    const target = generateRandomTarget(defaultProfile, 'normal')
    expect(target).toBeDefined()
    expect(target.name).toBeTruthy()
  })
})

describe('getProfile', () => {
  it('有効なIDでプロフィールを取得できる', () => {
    const profile = getProfile('d150')
    expect(profile.id).toBe('d150')
    expect(profile.maxDistance).toBe(150)
  })

  it('デフォルトでd210プロフィールを返す', () => {
    const profile = getProfile()
    expect(profile.id).toBe('d210')
  })
})

describe('getDistanceRangeInfo', () => {
  it('プロフィールのmaxDistanceに基づいてスケールされる', () => {
    const profile240 = getProfile('d240')
    const ranges = getDistanceRangeInfo(profile240)
    const longShot = ranges.find((r) => r.name === 'ロングショット')
    expect(longShot).toBeDefined()
    expect(longShot!.distanceMax).toBe(240)
  })

  it('全テンプレートの距離帯を返す', () => {
    const ranges = getDistanceRangeInfo(defaultProfile)
    expect(ranges).toHaveLength(baseTemplates.length)
  })

  it('出現率の合計が100%前後になる', () => {
    const ranges = getDistanceRangeInfo(defaultProfile)
    const totalPercentage = ranges.reduce((s, r) => s + r.percentage, 0)
    expect(totalPercentage).toBeGreaterThanOrEqual(98)
    expect(totalPercentage).toBeLessThanOrEqual(102)
  })

  it('距離が最小10ydを保つ', () => {
    const profile = getProfile('d150')
    const ranges = getDistanceRangeInfo(profile)
    for (const r of ranges) {
      expect(r.distanceMin).toBeGreaterThanOrEqual(10)
      expect(r.distanceMax).toBeGreaterThanOrEqual(10)
    }
  })
})

import type { DepthHint, Target, TargetTemplate, ShotResult, SessionStats } from './types'
import { DEFAULT_MAX_DISTANCE } from './types'
import { targetTemplates } from './targets'

/**
 * 指定範囲のランダムな整数を返す（min, max を含む）
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 重み付きランダム選択でターゲットテンプレートを選ぶ
 */
export function selectTemplate(
  templates: TargetTemplate[] = targetTemplates,
): TargetTemplate {
  const totalWeight = templates.reduce((sum, t) => sum + t.weight, 0)
  let rand = Math.random() * totalWeight
  for (const template of templates) {
    rand -= template.weight
    if (rand <= 0) {
      return template
    }
  }
  // フォールバック（浮動小数点の丸め誤差対策）
  return templates[templates.length - 1]
}

/**
 * テンプレートの確率に基づいて前後の攻め方ヒントを生成する
 */
export function generateDepthHint(template: TargetTemplate): DepthHint {
  const rand = Math.random()
  if (rand < template.shortSideHintChance) {
    return 'short'
  }
  if (rand < template.shortSideHintChance + template.longSideHintChance) {
    return 'long'
  }
  return null
}

/**
 * ターゲットテンプレートから具体的なターゲットを生成する
 */
export function generateTargetFromTemplate(
  template: TargetTemplate,
  maxDistance: number = DEFAULT_MAX_DISTANCE,
): Target {
  const scale = maxDistance / DEFAULT_MAX_DISTANCE
  // 距離は10ヤード刻みでランダムに生成（スケールを適用）
  const scaledMin = Math.max(10, Math.round((template.distanceMin * scale) / 10) * 10)
  const scaledMax = Math.max(10, Math.round((template.distanceMax * scale) / 10) * 10)
  const distanceRaw = randomInt(scaledMin, scaledMax)
  const distance = Math.round(distanceRaw / 10) * 10

  return {
    name: template.name,
    distance,
    depthOk: template.depthOk,
    widthOk: template.widthOk,
    obLeft: Math.random() < template.obLeftChance,
    obRight: Math.random() < template.obRightChance,
    depthHint: generateDepthHint(template),
  }
}

/**
 * ランダムなターゲットを1つ生成する
 */
export function generateRandomTarget(maxDistance: number = DEFAULT_MAX_DISTANCE): Target {
  const template = selectTemplate()
  return generateTargetFromTemplate(template, maxDistance)
}

/**
 * ショット結果からセッション統計を計算する
 */
export function computeStats(results: ShotResult[]): SessionStats {
  const totalShots = results.length
  const totalSuccess = results.filter((r) => r.success).length

  const scenarioMap = new Map<string, { successCount: number; totalCount: number }>()
  for (const result of results) {
    const existing = scenarioMap.get(result.targetName)
    if (existing) {
      existing.totalCount++
      if (result.success) existing.successCount++
    } else {
      scenarioMap.set(result.targetName, {
        successCount: result.success ? 1 : 0,
        totalCount: 1,
      })
    }
  }

  const scenarioStats = Array.from(scenarioMap.entries()).map(([name, stat]) => ({
    name,
    successCount: stat.successCount,
    totalCount: stat.totalCount,
  }))

  return { totalSuccess, totalShots, scenarioStats }
}

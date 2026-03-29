import type { DepthHint, Target, TargetTemplate, TargetCategory, HazardDirection, ShotResult, SessionStats } from './types'
import { DEFAULT_MAX_DISTANCE, STRICTNESS_MULTIPLIERS } from './types'
import type { StrictnessLevel } from './types'
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
 * ターゲット名からカテゴリを判定する（連続防止用）
 */
export function getTargetCategory(name: string): TargetCategory {
  if (name.includes('ドライバー')) return 'driver'
  if (name.includes('ロングアイアン')) return 'long-iron'
  if (name.includes('アプローチ')) return 'approach'
  return 'other'
}

/**
 * テンプレートの確率に基づいてハザード方向を生成する（最大2つ）
 */
export function generateHazards(template: TargetTemplate): HazardDirection[] {
  const candidates: { direction: HazardDirection; chance: number }[] = [
    { direction: 'left', chance: template.hazardLeftChance },
    { direction: 'right', chance: template.hazardRightChance },
    { direction: 'long', chance: template.hazardLongChance },
    { direction: 'short', chance: template.hazardShortChance },
  ]

  const hazards: HazardDirection[] = []
  for (const { direction, chance } of candidates) {
    if (Math.random() < chance) {
      hazards.push(direction)
    }
  }

  // 最大2つまでに制限（ランダムに選択）
  while (hazards.length > 2) {
    const removeIndex = Math.floor(Math.random() * hazards.length)
    hazards.splice(removeIndex, 1)
  }

  return hazards
}

/**
 * ターゲットテンプレートから具体的なターゲットを生成する
 */
export function generateTargetFromTemplate(
  template: TargetTemplate,
  maxDistance: number = DEFAULT_MAX_DISTANCE,
  strictness: StrictnessLevel = 'normal',
): Target {
  const scale = maxDistance / DEFAULT_MAX_DISTANCE
  const strictnessMultiplier = STRICTNESS_MULTIPLIERS[strictness]
  // 距離は10ヤード刻みでランダムに生成（スケールを適用）
  const scaledMin = Math.max(10, Math.round((template.distanceMin * scale) / 10) * 10)
  const scaledMax = Math.max(10, Math.round((template.distanceMax * scale) / 10) * 10)
  const distanceRaw = randomInt(scaledMin, scaledMax)
  const distance = Math.round(distanceRaw / 10) * 10

  return {
    name: template.name,
    distance,
    depthOk: Math.max(1, Math.round(template.depthOk * strictnessMultiplier)),
    widthOk: Math.max(1, Math.round(template.widthOk * strictnessMultiplier)),
    hazards: generateHazards(template),
    depthHint: generateDepthHint(template),
  }
}

/**
 * ランダムなターゲットを1つ生成する
 * previousTargetName を渡すと、同一カテゴリ（ドライバー/ロングアイアン/アプローチ）の
 * 連続出現を防ぐ
 */
export function generateRandomTarget(
  maxDistance: number = DEFAULT_MAX_DISTANCE,
  strictness: StrictnessLevel = 'normal',
  previousTargetName?: string,
): Target {
  const previousCategory = previousTargetName ? getTargetCategory(previousTargetName) : null
  let template: TargetTemplate
  let attempts = 0
  const maxAttempts = 20

  do {
    template = selectTemplate()
    attempts++
  } while (
    previousCategory !== null &&
    previousCategory !== 'other' &&
    getTargetCategory(template.name) === previousCategory &&
    attempts < maxAttempts
  )

  return generateTargetFromTemplate(template, maxDistance, strictness)
}

/**
 * ショット結果からセッション統計を計算する
 */
export function computeStats(results: ShotResult[]): SessionStats {
  const totalShots = results.length
  const totalSuccess = results.filter((r) => r.result === 'success').length
  const totalMiss = results.filter((r) => r.result === 'miss').length
  const totalHazard = results.filter((r) => r.result === 'hazard').length

  const scenarioMap = new Map<string, { successCount: number; missCount: number; hazardCount: number; totalCount: number }>()
  for (const result of results) {
    const existing = scenarioMap.get(result.targetName)
    if (existing) {
      existing.totalCount++
      if (result.result === 'success') existing.successCount++
      else if (result.result === 'miss') existing.missCount++
      else existing.hazardCount++
    } else {
      scenarioMap.set(result.targetName, {
        successCount: result.result === 'success' ? 1 : 0,
        missCount: result.result === 'miss' ? 1 : 0,
        hazardCount: result.result === 'hazard' ? 1 : 0,
        totalCount: 1,
      })
    }
  }

  const scenarioStats = Array.from(scenarioMap.entries()).map(([name, stat]) => ({
    name,
    successCount: stat.successCount,
    missCount: stat.missCount,
    hazardCount: stat.hazardCount,
    totalCount: stat.totalCount,
  }))

  return { totalSuccess, totalMiss, totalHazard, totalShots, scenarioStats }
}

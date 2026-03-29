import type { Target, TargetTemplate, TargetCategory, ShotResult, SessionStats, DistanceRangeInfo, DistanceProfileId, DistanceProfile } from './types'
import { DEFAULT_PROFILE_ID, STRICTNESS_OFFSETS } from './types'
import type { StrictnessLevel } from './types'
import { baseTemplates, distanceProfiles } from './targets'

/** ベーステンプレートの基準最大距離（250yd） */
const BASE_MAX_DISTANCE = 250

/**
 * プロフィールIDからプロフィールを取得する
 */
export function getProfile(profileId: DistanceProfileId = DEFAULT_PROFILE_ID): DistanceProfile {
  return distanceProfiles.find((p) => p.id === profileId) ?? distanceProfiles.find((p) => p.id === DEFAULT_PROFILE_ID)!
}

/**
 * プロフィールに基づいて TargetTemplate[] を生成する
 */
export function buildTemplates(profile: DistanceProfile): TargetTemplate[] {
  return baseTemplates.map((base, i) => ({
    ...base,
    weight: profile.weights[i],
  }))
}

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
  templates: TargetTemplate[],
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
 * ターゲット名からカテゴリを判定する（連続防止用）
 */
export function getTargetCategory(name: string): TargetCategory {
  if (name.includes('ロングショット')) return 'long'
  if (name.includes('アプローチ')) return 'approach'
  return 'other'
}

/**
 * テンプレート名から baseTemplates 内のインデックスを返す
 */
function getTemplateIndex(name: string): number {
  return baseTemplates.findIndex((t) => t.name === name)
}

/**
 * 前のショットに対して次のショットが許可されるかを判定する
 *
 * ゴルフの本番に近いショット順序を再現する:
 * - 同じショットの連続は不可
 * - ホール内ではグリーンに近づく方向（インデックス増加）のみ許可
 * - ミドルショット（短）以降は新しいホール（ロングショット）に戻れる
 * - アプローチ後は任意のショット（新ホール開始）が可能
 */
export function isAllowedTransition(prevName: string, nextName: string): boolean {
  const prevIdx = getTemplateIndex(prevName)
  const nextIdx = getTemplateIndex(nextName)

  // 未知のテンプレート名はフォールバックとして許可
  if (prevIdx === -1 || nextIdx === -1) return true

  // 同じテンプレートの連続は不可
  if (prevIdx === nextIdx) return false

  // アプローチ後（index 4, 5）は任意の異なるテンプレートOK（新ホール）
  if (prevIdx >= 4) return true

  // グリーンに近づく方向（前進）は常にOK
  if (nextIdx > prevIdx) return true

  // ミドルショット（短）以降（index >= 2）からロングショットへ戻るのはOK（新ホール）
  if (nextIdx === 0 && prevIdx >= 2) return true

  return false
}

/**
 * プロフィールの距離帯情報を計算する（プレビュー表示用）
 */
export function getDistanceRangeInfo(profile: DistanceProfile, strictness: StrictnessLevel = 'normal'): DistanceRangeInfo[] {
  const scale = profile.maxDistance / BASE_MAX_DISTANCE
  const offset = STRICTNESS_OFFSETS[strictness]
  const totalWeight = profile.weights.reduce((sum, w) => sum + w, 0)
  return baseTemplates.map((t, i) => ({
    name: t.name,
    distanceMin: Math.max(10, Math.round((t.distanceMin * scale) / 10) * 10),
    distanceMax: Math.max(10, Math.round((t.distanceMax * scale) / 10) * 10),
    weight: profile.weights[i],
    percentage: Math.round((profile.weights[i] / totalWeight) * 100),
    depthRatio: Math.max(0.01, t.depthRatio + offset),
    widthRatio: Math.max(0.01, t.widthRatio + offset),
  }))
}

/**
 * ターゲットテンプレートから具体的なターゲットを生成する
 */
export function generateTargetFromTemplate(
  template: TargetTemplate,
  maxDistance: number,
  strictness: StrictnessLevel = 'normal',
): Target {
  const scale = maxDistance / BASE_MAX_DISTANCE
  const offset = STRICTNESS_OFFSETS[strictness]
  // 距離は10ヤード刻みでランダムに生成（スケールを適用）
  const scaledMin = Math.max(10, Math.round((template.distanceMin * scale) / 10) * 10)
  const scaledMax = Math.max(10, Math.round((template.distanceMax * scale) / 10) * 10)
  const distanceRaw = randomInt(scaledMin, scaledMax)
  const distance = Math.round(distanceRaw / 10) * 10

  return {
    name: template.name,
    distance,
    depthOk: Math.max(1, Math.ceil(distance * Math.max(0.01, template.depthRatio + offset))),
    widthOk: Math.max(1, Math.ceil(distance * Math.max(0.01, template.widthRatio + offset))),
  }
}

/**
 * ランダムなターゲットを1つ生成する
 * previousTargetName を渡すと、本番に近いショット順序を維持する
 */
export function generateRandomTarget(
  profile: DistanceProfile,
  strictness: StrictnessLevel = 'normal',
  previousTargetName?: string,
): Target {
  const allTemplates = buildTemplates(profile)

  let templates = allTemplates
  if (previousTargetName) {
    const filtered = allTemplates.filter((t) => isAllowedTransition(previousTargetName, t.name))
    if (filtered.length > 0) {
      templates = filtered
    }
  }

  const template = selectTemplate(templates)
  return generateTargetFromTemplate(template, profile.maxDistance, strictness)
}

/**
 * ショット結果からセッション統計を計算する
 */
export function computeStats(results: ShotResult[]): SessionStats {
  const totalShots = results.length
  const totalSuccess = results.filter((r) => r.result === 'success').length
  const totalMiss = results.filter((r) => r.result === 'miss').length

  const scenarioMap = new Map<string, { successCount: number; missCount: number; totalCount: number }>()
  for (const result of results) {
    const existing = scenarioMap.get(result.targetName)
    if (existing) {
      existing.totalCount++
      if (result.result === 'success') existing.successCount++
      else existing.missCount++
    } else {
      scenarioMap.set(result.targetName, {
        successCount: result.result === 'success' ? 1 : 0,
        missCount: result.result === 'miss' ? 1 : 0,
        totalCount: 1,
      })
    }
  }

  const scenarioStats = baseTemplates.map((t) => {
    const stat = scenarioMap.get(t.name)
    return {
      name: t.name,
      successCount: stat?.successCount ?? 0,
      missCount: stat?.missCount ?? 0,
      totalCount: stat?.totalCount ?? 0,
    }
  })

  return { totalSuccess, totalMiss, totalShots, scenarioStats }
}

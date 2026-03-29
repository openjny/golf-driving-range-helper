/** ターゲットの定義 */
export interface Target {
  /** ターゲット名（例：ドライバー ティーショット） */
  name: string
  /** 狙いの距離（ヤード） */
  distance: number
  /** OK楕円の縦半径（ヤード） */
  depthOk: number
  /** OK楕円の横半径（ヤード） */
  widthOk: number
}

/** ベーステンプレートの定義（距離範囲のみ、weightなし） */
export interface BaseTemplate {
  /** ターゲット名 */
  name: string
  /** 距離の最小値（ヤード） */
  distanceMin: number
  /** 距離の最大値（ヤード） */
  distanceMax: number
  /** OK楕円の縦半径比率（距離に対する割合） */
  depthRatio: number
  /** OK楕円の横半径比率（距離に対する割合） */
  widthRatio: number
}

/** ターゲットテンプレートの定義（距離範囲を持つ） */
export interface TargetTemplate extends BaseTemplate {
  /** 出現重み（全テンプレートの重みの合計に対する比率で出現頻度が決まる） */
  weight: number
}

/** 飛距離プロフィールID */
export type DistanceProfileId = 'd150' | 'd180' | 'd210' | 'd240' | 'd270' | 'd300'

/** 飛距離プロフィール定義 */
export interface DistanceProfile {
  /** プロフィールID */
  id: DistanceProfileId
  /** 表示名 */
  label: string
  /** 説明 */
  description: string
  /** 最大飛距離（ヤード） */
  maxDistance: number
  /** 各テンプレートの出現重み（baseTemplatesと同じ順） */
  weights: number[]
}

/** ショットの結果種別 */
export type ShotOutcome = 'success' | 'miss'

/** ショットの結果記録 */
export interface ShotResult {
  /** ターゲット名 */
  targetName: string
  /** ショットの結果 */
  result: ShotOutcome
}

/** 場面ごとの統計 */
export interface ScenarioStat {
  /** ターゲット名 */
  name: string
  /** 成功数 */
  successCount: number
  /** ミス数（ゾーン外） */
  missCount: number
  /** 合計数 */
  totalCount: number
}

/** セッション統計 */
export interface SessionStats {
  /** 全体の成功数 */
  totalSuccess: number
  /** 全体のミス数 */
  totalMiss: number
  /** 全体のショット数 */
  totalShots: number
  /** 場面ごとの統計 */
  scenarioStats: ScenarioStat[]
}

/** デフォルトのプロフィールID */
export const DEFAULT_PROFILE_ID: DistanceProfileId = 'd210'

/** シビアさのレベル */
export type StrictnessLevel = 'easy' | 'normal' | 'strict'

/** シビアさレベルごとの比率オフセット（ポイント加減算） */
export const STRICTNESS_OFFSETS: Record<StrictnessLevel, number> = {
  easy: 0.02,
  normal: 0,
  strict: -0.02,
}

/** シビアさレベルの表示名 */
export const STRICTNESS_LABELS: Record<StrictnessLevel, string> = {
  easy: 'ゆるめ',
  normal: 'ふつう',
  strict: 'シビア',
}

/** シビアさレベルの説明 */
export const STRICTNESS_DESCRIPTIONS: Record<StrictnessLevel, string> = {
  easy: 'OKゾーン広め',
  normal: '標準',
  strict: 'OKゾーン狭め',
}

/** ターゲットカテゴリ（連続防止用） */
export type TargetCategory = 'long' | 'approach' | 'other'

/** 距離帯情報（プレビュー表示用） */
export interface DistanceRangeInfo {
  name: string
  distanceMin: number
  distanceMax: number
  weight: number
  percentage: number
  depthRatio: number
  widthRatio: number
}

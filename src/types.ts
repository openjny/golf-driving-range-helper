/** ターゲットの定義 */
export interface Target {
  /** ターゲット名（例：ドライバー ティーショット） */
  name: string
  /** 狙いの距離（ヤード） */
  distance: number
  /** OKな縦幅（ヤード） - 前後の許容範囲 */
  depthOk: number
  /** OKな横幅（ヤード） - 左右の許容範囲 */
  widthOk: number
}

/** ターゲットテンプレートの定義（距離範囲を持つ） */
export interface TargetTemplate {
  /** ターゲット名 */
  name: string
  /** 距離の最小値（ヤード） */
  distanceMin: number
  /** 距離の最大値（ヤード） */
  distanceMax: number
  /** OKな縦幅（ヤード） */
  depthOk: number
  /** OKな横幅（ヤード） */
  widthOk: number
  /** 出現重み（全テンプレートの重みの合計に対する比率で出現頻度が決まる） */
  weight: number
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

/** デフォルトの最大飛距離（ヤード） */
export const DEFAULT_MAX_DISTANCE = 250

/** シビアさのレベル */
export type StrictnessLevel = 'easy' | 'normal' | 'strict' | 'veryStrict'

/** シビアさレベルごとの倍率 */
export const STRICTNESS_MULTIPLIERS: Record<StrictnessLevel, number> = {
  easy: 1.5,
  normal: 1.0,
  strict: 0.75,
  veryStrict: 0.5,
}

/** シビアさレベルの表示名 */
export const STRICTNESS_LABELS: Record<StrictnessLevel, string> = {
  easy: 'ゆるい',
  normal: 'ふつう',
  strict: 'シビア',
  veryStrict: 'とてもシビア',
}

/** ターゲットカテゴリ（連続防止用） */
export type TargetCategory = 'driver' | 'long-iron' | 'approach' | 'other'

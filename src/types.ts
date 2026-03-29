/** 前後の攻め方ヒント */
export type DepthHint = 'short' | 'long' | null

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
  /** 左側のOB有無 */
  obLeft: boolean
  /** 右側のOB有無 */
  obRight: boolean
  /** 前後の攻め方ヒント（アイアン・アプローチ向け） */
  depthHint: DepthHint
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
  /** 左OBの発生確率 (0-1) */
  obLeftChance: number
  /** 右OBの発生確率 (0-1) */
  obRightChance: number
  /** 「手前から攻める」ヒントの発生確率 (0-1) */
  shortSideHintChance: number
  /** 「奥でもOK」ヒントの発生確率 (0-1) */
  longSideHintChance: number
  /** 出現重み（全テンプレートの重みの合計に対する比率で出現頻度が決まる） */
  weight: number
}

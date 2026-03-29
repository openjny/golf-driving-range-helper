import type { TargetTemplate } from './types'

/**
 * ターゲットテンプレート一覧（距離帯ベース）
 *
 * 距離帯: 10→30→50→100→150→200→250yd（MECE・隙間なし・重複なし）
 * MAX飛距離設定に応じて比例スケールされる。
 */
export const targetTemplates: TargetTemplate[] = [
  {
    name: 'ロングショット',
    distanceMin: 200,
    distanceMax: 250,
    depthOk: 30,
    widthOk: 30,
    weight: 20,
  },
  {
    name: 'ミドルショット（長）',
    distanceMin: 150,
    distanceMax: 200,
    depthOk: 18,
    widthOk: 20,
    weight: 25,
  },
  {
    name: 'ミドルショット（短）',
    distanceMin: 100,
    distanceMax: 150,
    depthOk: 12,
    widthOk: 15,
    weight: 20,
  },
  {
    name: 'ハーフショット',
    distanceMin: 50,
    distanceMax: 100,
    depthOk: 8,
    widthOk: 10,
    weight: 15,
  },
  {
    name: 'アプローチ（ピッチ）',
    distanceMin: 30,
    distanceMax: 50,
    depthOk: 5,
    widthOk: 8,
    weight: 10,
  },
  {
    name: 'アプローチ（チップ&ラン）',
    distanceMin: 10,
    distanceMax: 30,
    depthOk: 3,
    widthOk: 5,
    weight: 10,
  },
]

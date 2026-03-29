import type { TargetTemplate } from './types'

/**
 * ターゲットテンプレート一覧
 *
 * 出現頻度は実際のラウンド（Par72: Par3×4, Par4×10, Par5×4）での
 * ショット配分に近づけている。
 *
 * 18ホールでの概算ショット数（フルスイング）:
 * - ドライバー ティーショット: ~10回（Par4+Par5の一部） → 約18%
 * - フェアウェイウッド ティーショット: ~4回 → 約7%
 * - ロングアイアン Par3: ~2回 → 約4%
 * - ミドルアイアン Par3: ~2回 → 約4%
 * - ショートアイアン Par3: ~2回（短いPar3 + レイアップ） → 約4%
 * - セカンドショット（ロング）: ~6回 → 約11%
 * - セカンドショット（ミドル）: ~12回 → 約22%
 * - セカンドショット（ショート）: ~10回 → 約18%
 * - サードショット（Par5）: ~4回 → 約7%
 * - レイアップショット: ~3回 → 約5%
 * 合計: ~55回
 */
export const targetTemplates: TargetTemplate[] = [
  {
    name: 'ドライバー ティーショット',
    distanceMin: 200,
    distanceMax: 250,
    depthOk: 30,
    widthOk: 30,
    obLeftChance: 0.4,
    obRightChance: 0.4,
    weight: 18,
  },
  {
    name: 'フェアウェイウッド ティーショット',
    distanceMin: 180,
    distanceMax: 220,
    depthOk: 25,
    widthOk: 25,
    obLeftChance: 0.3,
    obRightChance: 0.3,
    weight: 7,
  },
  {
    name: 'ロングアイアン Par3 ティーショット',
    distanceMin: 170,
    distanceMax: 200,
    depthOk: 15,
    widthOk: 20,
    obLeftChance: 0.2,
    obRightChance: 0.2,
    weight: 4,
  },
  {
    name: 'ミドルアイアン Par3 ティーショット',
    distanceMin: 140,
    distanceMax: 170,
    depthOk: 12,
    widthOk: 18,
    obLeftChance: 0.2,
    obRightChance: 0.2,
    weight: 4,
  },
  {
    name: 'ショートアイアン Par3 ティーショット',
    distanceMin: 100,
    distanceMax: 140,
    depthOk: 10,
    widthOk: 15,
    obLeftChance: 0.15,
    obRightChance: 0.15,
    weight: 4,
  },
  {
    name: 'セカンドショット（ロング）',
    distanceMin: 150,
    distanceMax: 200,
    depthOk: 20,
    widthOk: 20,
    obLeftChance: 0.1,
    obRightChance: 0.1,
    weight: 11,
  },
  {
    name: 'セカンドショット（ミドル）',
    distanceMin: 100,
    distanceMax: 150,
    depthOk: 14,
    widthOk: 14,
    obLeftChance: 0.05,
    obRightChance: 0.05,
    weight: 22,
  },
  {
    name: 'セカンドショット（ショート）',
    distanceMin: 50,
    distanceMax: 100,
    depthOk: 10,
    widthOk: 10,
    obLeftChance: 0.0,
    obRightChance: 0.0,
    weight: 18,
  },
  {
    name: 'サードショット（Par5）',
    distanceMin: 80,
    distanceMax: 140,
    depthOk: 12,
    widthOk: 12,
    obLeftChance: 0.05,
    obRightChance: 0.05,
    weight: 7,
  },
  {
    name: 'レイアップショット',
    distanceMin: 100,
    distanceMax: 180,
    depthOk: 20,
    widthOk: 25,
    obLeftChance: 0.1,
    obRightChance: 0.1,
    weight: 5,
  },
]

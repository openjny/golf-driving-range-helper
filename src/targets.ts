import type { TargetTemplate } from './types'

/**
 * ターゲットテンプレート一覧
 *
 * 出現頻度は実際のラウンド（Par72: Par3×4, Par4×10, Par5×4）での
 * ショット配分に近づけている。
 *
 * 18ホールでの概算ショット数:
 * - ドライバー ティーショット: ~10回 → 約14%
 * - フェアウェイウッド ティーショット: ~4回 → 約6%
 * - ロングアイアン Par3: ~2回 → 約3%
 * - ミドルアイアン Par3: ~2回 → 約3%
 * - ショートアイアン Par3: ~2回 → 約3%
 * - セカンドショット（ロング）: ~6回 → 約9%
 * - セカンドショット（ミドル）: ~10回 → 約14%
 * - セカンドショット（ショート）: ~8回 → 約11%
 * - サードショット（Par5）: ~3回 → 約4%
 * - レイアップショット: ~3回 → 約4%
 * - アプローチ（ピッチショット）: ~8回 → 約11%
 * - アプローチ（チップショット）: ~8回 → 約11%
 * - アプローチ（ランニング）: ~5回 → 約7%
 * 合計: ~71回
 */
export const targetTemplates: TargetTemplate[] = [
  {
    name: 'ドライバー ティーショット',
    distanceMin: 200,
    distanceMax: 250,
    depthOk: 30,
    widthOk: 30,
    shortSideHintChance: 0,
    longSideHintChance: 0,
    weight: 14,
  },
  {
    name: 'フェアウェイウッド ティーショット',
    distanceMin: 180,
    distanceMax: 220,
    depthOk: 25,
    widthOk: 25,
    shortSideHintChance: 0,
    longSideHintChance: 0,
    weight: 6,
  },
  {
    name: 'ロングアイアン Par3 ティーショット',
    distanceMin: 170,
    distanceMax: 200,
    depthOk: 15,
    widthOk: 20,
    shortSideHintChance: 0.4,
    longSideHintChance: 0.2,
    weight: 3,
  },
  {
    name: 'ミドルアイアン Par3 ティーショット',
    distanceMin: 140,
    distanceMax: 170,
    depthOk: 12,
    widthOk: 18,
    shortSideHintChance: 0.4,
    longSideHintChance: 0.2,
    weight: 3,
  },
  {
    name: 'ショートアイアン Par3 ティーショット',
    distanceMin: 100,
    distanceMax: 140,
    depthOk: 10,
    widthOk: 15,
    shortSideHintChance: 0.5,
    longSideHintChance: 0.2,
    weight: 3,
  },
  {
    name: 'セカンドショット（ロング）',
    distanceMin: 150,
    distanceMax: 200,
    depthOk: 20,
    widthOk: 20,
    shortSideHintChance: 0.3,
    longSideHintChance: 0.2,
    weight: 9,
  },
  {
    name: 'セカンドショット（ミドル）',
    distanceMin: 100,
    distanceMax: 150,
    depthOk: 14,
    widthOk: 14,
    shortSideHintChance: 0.4,
    longSideHintChance: 0.2,
    weight: 14,
  },
  {
    name: 'セカンドショット（ショート）',
    distanceMin: 50,
    distanceMax: 100,
    depthOk: 10,
    widthOk: 10,
    shortSideHintChance: 0.5,
    longSideHintChance: 0.2,
    weight: 11,
  },
  {
    name: 'サードショット（Par5）',
    distanceMin: 80,
    distanceMax: 140,
    depthOk: 12,
    widthOk: 12,
    shortSideHintChance: 0.4,
    longSideHintChance: 0.2,
    weight: 4,
  },
  {
    name: 'レイアップショット',
    distanceMin: 100,
    distanceMax: 180,
    depthOk: 20,
    widthOk: 25,
    shortSideHintChance: 0,
    longSideHintChance: 0,
    weight: 4,
  },
  {
    name: 'アプローチ（ピッチショット）',
    distanceMin: 30,
    distanceMax: 60,
    depthOk: 5,
    widthOk: 8,
    shortSideHintChance: 0.5,
    longSideHintChance: 0.15,
    weight: 11,
  },
  {
    name: 'アプローチ（チップショット）',
    distanceMin: 10,
    distanceMax: 30,
    depthOk: 3,
    widthOk: 5,
    shortSideHintChance: 0.5,
    longSideHintChance: 0.1,
    weight: 11,
  },
  {
    name: 'アプローチ（ランニング）',
    distanceMin: 10,
    distanceMax: 20,
    depthOk: 3,
    widthOk: 5,
    shortSideHintChance: 0.4,
    longSideHintChance: 0.1,
    weight: 7,
  },
]

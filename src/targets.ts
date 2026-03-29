import type { BaseTemplate, DistanceProfile } from './types'

/**
 * ベーステンプレート一覧（距離帯ベース、weight なし）
 *
 * 距離帯: 10→30→50→100→150→200→250yd（MECE・隙間なし・重複なし）
 * 各プロフィールの maxDistance に応じて比例スケールされる。
 */
export const baseTemplates: BaseTemplate[] = [
  {
    name: 'ロングショット',
    distanceMin: 200,
    distanceMax: 250,
    depthOk: 30,
    widthOk: 30,
  },
  {
    name: 'ミドルショット（長）',
    distanceMin: 150,
    distanceMax: 200,
    depthOk: 18,
    widthOk: 20,
  },
  {
    name: 'ミドルショット（短）',
    distanceMin: 100,
    distanceMax: 150,
    depthOk: 12,
    widthOk: 15,
  },
  {
    name: 'ハーフショット',
    distanceMin: 50,
    distanceMax: 100,
    depthOk: 8,
    widthOk: 10,
  },
  {
    name: 'アプローチ（ピッチ）',
    distanceMin: 30,
    distanceMax: 50,
    depthOk: 5,
    widthOk: 8,
  },
  {
    name: 'アプローチ（チップ&ラン）',
    distanceMin: 10,
    distanceMax: 30,
    depthOk: 3,
    widthOk: 5,
  },
]

/**
 * 飛距離プロフィール一覧
 *
 * weights は baseTemplates と同じ順序。
 *
 * weight の根拠（パット除外の実ラウンド推定）:
 *   - 90打ゴルファーの典型的な内訳: ドライバー14打, アプローチ14打,
 *     チップ&ピッチ20打, パット36打 (パット除外で54打)
 *     出典: joinstriveon.com "Golf Evaluation Form"
 *   - 90打ゴルファーは平均5ホールGIR → 13回のチッピング機会
 *     出典: danielrgray.com "Numbers talk on short game"
 *   - Shot Scope 2億+ショットDB: GIR率や飛距離によるショット分布データ
 *     出典: shotscope.com "The Ultimate Golfer's Guide"
 *
 * 傾向: 飛距離が伸びるほどアプローチ到達前の中間ショットが減り、
 *        ショートゲーム（50yd以内）の割合が増加する。
 *        ティーショット（ロングショット）は14打/ラウンド固定のため比率は横ばい。
 */
export const distanceProfiles: DistanceProfile[] = [
  {
    id: 'd150',
    label: '150yd',
    description: 'ビギナー・女性',
    maxDistance: 150,
    //                ロング  ミドル長 ミドル短 ハーフ  ピッチ  チップ
    weights:        [  26,     18,      18,     12,     13,     13 ],
  },
  {
    id: 'd180',
    label: '180yd',
    description: 'ショートヒッター',
    maxDistance: 180,
    weights:        [  26,     16,      18,     11,     14,     15 ],
  },
  {
    id: 'd210',
    label: '210yd',
    description: 'アベレージ',
    maxDistance: 210,
    weights:        [  26,     14,      17,     10,     15,     18 ],
  },
  {
    id: 'd240',
    label: '240yd',
    description: 'ミドルヒッター',
    maxDistance: 240,
    weights:        [  26,     13,      17,      9,     15,     20 ],
  },
  {
    id: 'd270',
    label: '270yd',
    description: 'ロングヒッター',
    maxDistance: 270,
    weights:        [  26,     11,      15,     11,     16,     21 ],
  },
  {
    id: 'd300',
    label: '300yd',
    description: 'アスリート',
    maxDistance: 300,
    weights:        [  26,      8,      14,     14,     17,     21 ],
  },
]

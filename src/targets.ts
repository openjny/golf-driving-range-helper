import type { BaseTemplate, DistanceProfile } from './types'

/**
 * ベーステンプレート一覧（距離帯ベース、weight なし）
 *
 * 距離帯: 10→30→50→100→150→200→250yd（MECE・隙間なし・重複なし）
 * 各プロフィールの maxDistance に応じて比例スケールされる。
 *
 * depthRatio / widthRatio（OKゾーン楕円半径の距離比率）の根拠:
 *
 * 出典:
 *   - practical-golf.com "Driver Dispersion Test"
 *       スクラッチプレーヤー実測:
 *       SW ~107yd → 縦幅全幅20yd (±9.3%), 8i 160yd → 縦23yd (±7.2%) / 横24yd (±7.5%),
 *       5i 195yd → 縦23yd (±5.9%) / 横31yd (±7.9%), Driver ~270yd → 横68yd (±12.6%)
 *   - golfwrx.com "Pros v Amateurs: 100 & 150 yards" (Trackman実測)
 *       14HC: 140yd → 縦幅33yd (±11.8%), 160yd → 縦幅24yd (±7.5%)
 *   - upyourclub.com "7 Iron Distance Chart" (Trackman)
 *       7i典型的アマ: キャリー散布 9-14yd (±3.2-5%)
 *   - thebluemountains.ca "Amateur Driving Distance" (Trackman radar)
 *       アマ多数のドライバー横散布 IQR: -20〜+40yd ≈ ±16%
 *
 * 傾向: ウェッジ(短距離)は縦散布が大きく横は小さい、
 *        ドライバー(長距離)は縦が小さく横が大きい（フェース角増幅）。
 *        アイアン(中距離)は縦横ともに中程度。
 */
export const baseTemplates: BaseTemplate[] = [
  {
    name: 'ロングショット',
    distanceMin: 200,
    distanceMax: 250,
    depthRatio: 0.06,   // Driver/3W: 縦距離は安定（±5.9% @ 195yd）
    widthRatio: 0.10,   // フェース角が距離で増幅され横に散る（±12.6% @ 270yd）
  },
  {
    name: 'ミドルショット（長）',
    distanceMin: 150,
    distanceMax: 200,
    depthRatio: 0.07,   // ロングアイアン/ハイブリッド（±7.2% @ 160yd）
    widthRatio: 0.08,   // 中程度の横散布（±7.5-7.9% @ 160-195yd）
  },
  {
    name: 'ミドルショット（短）',
    distanceMin: 100,
    distanceMax: 150,
    depthRatio: 0.08,   // ミドルアイアン（±7.5% @ 140yd, 典型的アマ ±3.2-5%）
    widthRatio: 0.07,   // フルスイングで比較的安定
  },
  {
    name: 'ハーフショット',
    distanceMin: 50,
    distanceMax: 100,
    depthRatio: 0.10,   // ウェッジのパーシャルスイング（±9.3% @ 107yd）
    widthRatio: 0.07,   // 短い分だけ横ブレは小さい
  },
  {
    name: 'アプローチ（ピッチ）',
    distanceMin: 30,
    distanceMax: 50,
    depthRatio: 0.12,   // コントロールショット: スピン・打ち出し角のバラつき大
    widthRatio: 0.08,   // 横は比較的安定
  },
  {
    name: 'アプローチ（チップ&ラン）',
    distanceMin: 10,
    distanceMax: 30,
    depthRatio: 0.15,   // 極短距離ではインパクトの微差が縦方向に直結
    widthRatio: 0.10,   // チップでもフェース向きのブレで左右に散る
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

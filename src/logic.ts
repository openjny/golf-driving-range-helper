import type { Target, TargetTemplate } from './types'
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
 * ターゲットテンプレートから具体的なターゲットを生成する
 */
export function generateTargetFromTemplate(template: TargetTemplate): Target {
  // 距離は10ヤード刻みでランダムに生成
  const distanceRaw = randomInt(template.distanceMin, template.distanceMax)
  const distance = Math.round(distanceRaw / 10) * 10

  return {
    name: template.name,
    distance,
    depthOk: template.depthOk,
    widthOk: template.widthOk,
    obLeft: Math.random() < template.obLeftChance,
    obRight: Math.random() < template.obRightChance,
  }
}

/**
 * ランダムなターゲットを1つ生成する
 */
export function generateRandomTarget(): Target {
  const template = selectTemplate()
  return generateTargetFromTemplate(template)
}

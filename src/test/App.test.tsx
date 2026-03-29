import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('初期画面にスタートボタンが表示される', () => {
    render(<App />)
    expect(screen.getByTestId('next-button')).toHaveTextContent('スタート')
  })

  it('初期画面にドライバー飛距離ラベルが表示される', () => {
    render(<App />)
    expect(screen.getByText(/ドライバー飛距離/)).toBeInTheDocument()
  })

  it('スタートボタンを押すとターゲットカードが表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))

    expect(screen.getByTestId('target-card')).toBeInTheDocument()
    expect(screen.getByTestId('target-name')).toBeInTheDocument()
    expect(screen.getByTestId('target-distance')).toBeInTheDocument()
    expect(screen.getByTestId('target-depth')).toBeInTheDocument()
    expect(screen.getByTestId('target-width')).toBeInTheDocument()
  })

  it('ターゲット表示後に成功/失敗/スキップボタンが表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    expect(screen.getByTestId('ok-button')).toBeInTheDocument()
    expect(screen.getByTestId('ng-button')).toBeInTheDocument()
    expect(screen.getByTestId('skip-button')).toBeInTheDocument()
  })

  it('成功/失敗ボタンで次のターゲットに進める', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    expect(screen.getByText('1球目')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('ok-button'))
    expect(screen.getByText('2球目')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('ng-button'))
    expect(screen.getByText('3球目')).toBeInTheDocument()
  })

  it('終わるボタンで最後のショット確認が表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    fireEvent.click(screen.getByTestId('ok-button'))
    fireEvent.click(screen.getByTestId('finish-button'))

    expect(screen.getByTestId('last-shot-prompt')).toBeInTheDocument()
    expect(screen.getByText('最後のショットの結果は？')).toBeInTheDocument()
  })

  it('最後のショット確認に成功/失敗ボタンが表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    fireEvent.click(screen.getByTestId('ok-button'))
    fireEvent.click(screen.getByTestId('finish-button'))

    expect(screen.getByTestId('last-ok-button')).toBeInTheDocument()
    expect(screen.getByTestId('last-ng-button')).toBeInTheDocument()
  })

  it('最後のショットでOKを選ぶと統計が表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    fireEvent.click(screen.getByTestId('ok-button'))
    fireEvent.click(screen.getByTestId('finish-button'))
    fireEvent.click(screen.getByTestId('last-ok-button'))

    expect(screen.getByTestId('stats-card')).toBeInTheDocument()
    expect(screen.getByTestId('stats-success-rate')).toBeInTheDocument()
  })

  it('統計画面で成功率が正しく表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    fireEvent.click(screen.getByTestId('ok-button'))
    fireEvent.click(screen.getByTestId('ng-button'))
    fireEvent.click(screen.getByTestId('finish-button'))
    fireEvent.click(screen.getByTestId('last-ok-button'))

    // 3 shots: OK, NG, OK → 2/3 = 67%
    expect(screen.getByTestId('stats-success-rate')).toHaveTextContent('67%')
    expect(screen.getByTestId('stats-scenarios')).toBeInTheDocument()
  })

  it('スキップボタンで集計せずに次のターゲットに進める', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    expect(screen.getByText('1球目')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('skip-button'))
    expect(screen.getByText('2球目')).toBeInTheDocument()

    // 成功を1つ記録して終了
    fireEvent.click(screen.getByTestId('ok-button'))
    fireEvent.click(screen.getByTestId('finish-button'))
    fireEvent.click(screen.getByTestId('last-skip-button'))

    // スキップはカウントされないので1球中1成功 = 100%
    expect(screen.getByTestId('stats-success-rate')).toHaveTextContent('100%')
  })

  it('統計画面で2種別の内訳が表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    fireEvent.click(screen.getByTestId('ok-button'))
    fireEvent.click(screen.getByTestId('ng-button'))
    fireEvent.click(screen.getByTestId('finish-button'))
    fireEvent.click(screen.getByTestId('last-ng-button'))

    expect(screen.getByTestId('stats-breakdown')).toBeInTheDocument()
  })

  it('打っていないを選ぶと最後のショットがカウントされない', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    fireEvent.click(screen.getByTestId('ok-button'))
    fireEvent.click(screen.getByTestId('finish-button'))
    fireEvent.click(screen.getByTestId('last-skip-button'))

    // Only 1 shot recorded (OK)
    expect(screen.getByTestId('stats-success-rate')).toHaveTextContent('100%')
  })

  it('もう一度ボタンでリセットできる', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    fireEvent.click(screen.getByTestId('ok-button'))
    fireEvent.click(screen.getByTestId('finish-button'))
    fireEvent.click(screen.getByTestId('last-ok-button'))

    expect(screen.getByTestId('reset-button')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('reset-button'))

    expect(screen.getByTestId('next-button')).toHaveTextContent('スタート')
    expect(screen.queryByTestId('target-card')).not.toBeInTheDocument()
    expect(screen.queryByTestId('stats-card')).not.toBeInTheDocument()
  })

  it('距離がyd単位で表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    expect(screen.getByText('yd')).toBeInTheDocument()
  })

  it('ターゲットゾーンが視覚的に表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    expect(screen.getByTestId('target-zone')).toBeInTheDocument()
    expect(screen.getByText('↔')).toBeInTheDocument()
    expect(screen.getByText('↕')).toBeInTheDocument()
  })

  it('初期画面に設定パネルが常時表示される', () => {
    render(<App />)

    expect(screen.getByTestId('settings-panel')).toBeInTheDocument()
    expect(screen.getByTestId('profile-select')).toBeInTheDocument()
  })

  it('プロフィールを選択できる', () => {
    render(<App />)

    const profileBtn = screen.getByTestId('profile-d180')
    fireEvent.click(profileBtn)
    expect(profileBtn.classList.contains('profile-card--active')).toBe(true)
  })

  it('シビアさの設定が表示される', () => {
    render(<App />)

    expect(screen.getByTestId('strictness-select')).toBeInTheDocument()
    expect(screen.getByText('ゆるい')).toBeInTheDocument()
    expect(screen.getByText('ふつう')).toBeInTheDocument()
    expect(screen.getByText('シビア')).toBeInTheDocument()
    expect(screen.getByText('とてもシビア')).toBeInTheDocument()
  })

  it('シビアさの設定を変更できる', () => {
    render(<App />)

    const select = screen.getByTestId('strictness-select') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'easy' } })
    expect(select.value).toBe('easy')
  })

  it('設定画面に距離帯プレビューが表示される', () => {
    render(<App />)

    expect(screen.getByTestId('distance-preview')).toBeInTheDocument()
    expect(screen.getByText('ロングショット')).toBeInTheDocument()
  })

  it('ターゲット表示中にヘルプボタンが表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))

    expect(screen.getByTestId('help-button')).toBeInTheDocument()
  })

  it('ヘルプボタンでモーダルが表示・非表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    fireEvent.click(screen.getByTestId('help-button'))

    expect(screen.getByTestId('help-modal')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('help-close-button'))
    expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument()
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('初期画面にスタートボタンが表示される', () => {
    render(<App />)
    expect(screen.getByTestId('next-button')).toHaveTextContent('スタート')
  })

  it('ウェルカムメッセージが表示される', () => {
    render(<App />)
    expect(screen.getByText(/ボタンを押してターゲットを表示しましょう/)).toBeInTheDocument()
  })

  it('スタートボタンを押すとターゲットカードが表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))

    expect(screen.getByTestId('target-card')).toBeInTheDocument()
    expect(screen.getByTestId('target-name')).toBeInTheDocument()
    expect(screen.getByTestId('target-distance')).toBeInTheDocument()
    expect(screen.getByTestId('target-depth')).toBeInTheDocument()
    expect(screen.getByTestId('target-width')).toBeInTheDocument()
    expect(screen.getByTestId('ob-indicators')).toBeInTheDocument()
  })

  it('ターゲット表示後にOK/NGボタンが表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    expect(screen.getByTestId('ok-button')).toBeInTheDocument()
    expect(screen.getByTestId('ng-button')).toBeInTheDocument()
  })

  it('OK/NGボタンで次のターゲットに進める', () => {
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
    expect(screen.getByText('⇔')).toBeInTheDocument()
    expect(screen.getByText('↕')).toBeInTheDocument()
  })

  it('設定ボタンを押すと設定パネルが表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('settings-button'))

    expect(screen.getByTestId('settings-panel')).toBeInTheDocument()
    expect(screen.getByTestId('max-distance-input')).toBeInTheDocument()
  })

  it('最大飛距離の設定が変更できる', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('settings-button'))

    const input = screen.getByTestId('max-distance-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: '180' } })
    expect(input.value).toBe('180')
  })

  it('シビアさの設定が表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('settings-button'))

    expect(screen.getByTestId('strictness-select')).toBeInTheDocument()
    expect(screen.getByText('ゆるい')).toBeInTheDocument()
    expect(screen.getByText('ふつう')).toBeInTheDocument()
    expect(screen.getByText('シビア')).toBeInTheDocument()
    expect(screen.getByText('とてもシビア')).toBeInTheDocument()
  })

  it('シビアさの設定を変更できる', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('settings-button'))

    const select = screen.getByTestId('strictness-select') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'easy' } })
    expect(select.value).toBe('easy')
  })
})

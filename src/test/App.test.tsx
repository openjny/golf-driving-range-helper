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

  it('ターゲット表示後にボタンが「次のターゲット」に変わる', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    expect(screen.getByTestId('next-button')).toHaveTextContent('次のターゲット')
  })

  it('リセットボタンが表示されリセットできる', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))

    expect(screen.getByTestId('reset-button')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('reset-button'))

    expect(screen.getByTestId('next-button')).toHaveTextContent('スタート')
    expect(screen.queryByTestId('target-card')).not.toBeInTheDocument()
  })

  it('球数カウンターが正しくインクリメントされる', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    expect(screen.getByText('1球目')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('next-button'))
    expect(screen.getByText('2球目')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('next-button'))
    expect(screen.getByText('3球目')).toBeInTheDocument()
  })

  it('距離がyd単位で表示される', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('next-button'))
    expect(screen.getByText('yd')).toBeInTheDocument()
  })
})

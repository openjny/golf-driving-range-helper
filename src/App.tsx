import { useState } from 'react'
import type { Target } from './types'
import { generateRandomTarget } from './logic'
import './App.css'

function App() {
  const [target, setTarget] = useState<Target | null>(null)
  const [shotCount, setShotCount] = useState(0)

  const handleNextTarget = () => {
    setTarget(generateRandomTarget())
    setShotCount((c) => c + 1)
  }

  const handleReset = () => {
    setTarget(null)
    setShotCount(0)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>⛳ ターゲット練習</h1>
        <p className="subtitle">ランダムターゲットで実戦的な練習を</p>
      </header>

      <main className="app-main">
        {target ? (
          <div className="target-card" data-testid="target-card">
            <div className="shot-counter">
              {shotCount}球目
            </div>

            <h2 className="target-name" data-testid="target-name">
              {target.name}
            </h2>

            <div className="target-distance" data-testid="target-distance">
              <span className="distance-value">{target.distance}</span>
              <span className="distance-unit">yd</span>
            </div>

            <div className="target-details">
              <div className="detail-row">
                <span className="detail-label">OK縦幅</span>
                <span className="detail-value" data-testid="target-depth">
                  ±{target.depthOk}yd
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">OK横幅</span>
                <span className="detail-value" data-testid="target-width">
                  ±{target.widthOk / 2}yd
                </span>
              </div>
            </div>

            <div className="ob-indicators" data-testid="ob-indicators">
              <div className={`ob-zone ob-left ${target.obLeft ? 'ob-active' : 'ob-safe'}`}>
                <span className="ob-label">左</span>
                <span className="ob-status">
                  {target.obLeft ? 'OB' : 'セーフ'}
                </span>
              </div>
              <div className="ob-zone ob-center">
                <span className="ob-label">🎯</span>
              </div>
              <div className={`ob-zone ob-right ${target.obRight ? 'ob-active' : 'ob-safe'}`}>
                <span className="ob-label">右</span>
                <span className="ob-status">
                  {target.obRight ? 'OB' : 'セーフ'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="welcome-card">
            <p className="welcome-message">
              ボタンを押してターゲットを表示しましょう。<br />
              1球ごとにターゲットを変えて、<br />
              実戦に近い練習をしましょう。
            </p>
          </div>
        )}

        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={handleNextTarget}
            data-testid="next-button"
          >
            {target ? '次のターゲット' : 'スタート'}
          </button>
          {target && (
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              data-testid="reset-button"
            >
              リセット
            </button>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>練習は量より質。1球1球、ターゲットを意識して。</p>
      </footer>
    </div>
  )
}

export default App

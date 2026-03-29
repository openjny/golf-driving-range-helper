import { useState } from 'react'
import type { Target, ShotResult, ShotOutcome, SessionStats, StrictnessLevel } from './types'
import { DEFAULT_MAX_DISTANCE, STRICTNESS_LABELS } from './types'
import { generateRandomTarget, computeStats } from './logic'
import './App.css'

type AppView = 'welcome' | 'target' | 'last-shot-prompt' | 'stats'

/** ハザード方向の表示ラベル */
const HAZARD_LABELS: Record<string, string> = {
  left: '左',
  right: '右',
  long: '奥',
  short: '手前',
}

function App() {
  const [view, setView] = useState<AppView>('welcome')
  const [target, setTarget] = useState<Target | null>(null)
  const [shotCount, setShotCount] = useState(0)
  const [shotResults, setShotResults] = useState<ShotResult[]>([])
  const [maxDistance, setMaxDistance] = useState(DEFAULT_MAX_DISTANCE)
  const [strictness, setStrictness] = useState<StrictnessLevel>('normal')
  const [showSettings, setShowSettings] = useState(false)
  const [stats, setStats] = useState<SessionStats | null>(null)

  const handleStart = () => {
    setTarget(generateRandomTarget(maxDistance, strictness))
    setShotCount(1)
    setView('target')
  }

  const handleShotResult = (result: ShotOutcome) => {
    if (target) {
      setShotResults((prev) => [...prev, { targetName: target.name, result }])
    }
    setTarget(generateRandomTarget(maxDistance, strictness, target?.name))
    setShotCount((c) => c + 1)
  }

  const handleFinish = () => {
    setView('last-shot-prompt')
  }

  const handleLastShotResult = (result: ShotOutcome | null) => {
    let allResults = shotResults
    if (result !== null && target) {
      allResults = [...shotResults, { targetName: target.name, result }]
      setShotResults(allResults)
    }
    setStats(computeStats(allResults))
    setView('stats')
  }

  const handleReset = () => {
    setTarget(null)
    setShotCount(0)
    setShotResults([])
    setStats(null)
    setView('welcome')
  }

  const handleMaxDistanceChange = (value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 50 && num <= 400) {
      setMaxDistance(Math.round(num / 10) * 10)
    }
  }

  const hasHazard = (direction: string) =>
    target?.hazards.includes(direction as 'left' | 'right' | 'long' | 'short') ?? false

  return (
    <div className="app">
      <header className="app-header">
        <h1>⛳ ターゲット練習</h1>
        <p className="subtitle">ランダムターゲットで実戦的な練習を</p>
      </header>

      <main className="app-main">
        {view === 'target' && target && (
          <div className="target-card" data-testid="target-card">
            <div className="shot-counter">
              {shotCount}球目
            </div>

            <h2 className="target-name" data-testid="target-name">
              {target.name}
            </h2>

            <div className="hazard-layout" data-testid="hazard-indicators">
              <div className="hazard-row hazard-row-top">
                <div className={`hazard-zone ${hasHazard('long') ? 'hazard-active' : 'hazard-safe'}`}>
                  <span className="hazard-label">{HAZARD_LABELS.long}</span>
                  <span className="hazard-status">
                    {hasHazard('long') ? '⚠ ハザード' : 'セーフ'}
                  </span>
                </div>
              </div>

              <div className="hazard-row hazard-row-middle">
                <div className={`hazard-zone hazard-zone-side ${hasHazard('left') ? 'hazard-active' : 'hazard-safe'}`}>
                  <span className="hazard-label">{HAZARD_LABELS.left}</span>
                  <span className="hazard-status">
                    {hasHazard('left') ? '⚠ ハザード' : 'セーフ'}
                  </span>
                </div>

                <div className="target-zone" data-testid="target-zone">
                  <div className="target-zone-main">
                    <div className="target-zone-box">
                      <div className="target-distance" data-testid="target-distance">
                        <span className="distance-value">{target.distance}</span>
                        <span className="distance-unit">yd</span>
                      </div>
                    </div>
                    <div className="target-zone-depth" data-testid="target-depth">
                      <span className="zone-arrow zone-arrow-depth">↕</span>
                      <span className="zone-value">±{target.depthOk}yd</span>
                    </div>
                  </div>
                  <div className="target-zone-width" data-testid="target-width">
                    <span className="zone-arrow zone-arrow-width">↔</span>
                    <span className="zone-value">±{target.widthOk / 2}yd</span>
                  </div>
                </div>

                <div className={`hazard-zone hazard-zone-side ${hasHazard('right') ? 'hazard-active' : 'hazard-safe'}`}>
                  <span className="hazard-label">{HAZARD_LABELS.right}</span>
                  <span className="hazard-status">
                    {hasHazard('right') ? '⚠ ハザード' : 'セーフ'}
                  </span>
                </div>
              </div>

              <div className="hazard-row hazard-row-bottom">
                <div className={`hazard-zone ${hasHazard('short') ? 'hazard-active' : 'hazard-safe'}`}>
                  <span className="hazard-label">{HAZARD_LABELS.short}</span>
                  <span className="hazard-status">
                    {hasHazard('short') ? '⚠ ハザード' : 'セーフ'}
                  </span>
                </div>
              </div>
            </div>

            {target.depthHint && (
              <div className="depth-hint" data-testid="depth-hint">
                <span className="depth-hint-icon">💡</span>
                <span className="depth-hint-text">
                  {target.depthHint === 'short'
                    ? '手前から攻める（奥は危険）'
                    : '奥でもOK（手前に罠あり）'}
                </span>
              </div>
            )}
          </div>
        )}

        {view === 'last-shot-prompt' && (
          <div className="prompt-card" data-testid="last-shot-prompt">
            <h2 className="prompt-title">最後のショットの結果は？</h2>
            <div className="result-buttons">
              <button
                className="btn btn-ok"
                onClick={() => handleLastShotResult('success')}
                data-testid="last-ok-button"
              >
                ⭕ OK
              </button>
              <button
                className="btn btn-ng"
                onClick={() => handleLastShotResult('miss')}
                data-testid="last-ng-button"
              >
                ❌ NG
              </button>
              <button
                className="btn btn-hazard"
                onClick={() => handleLastShotResult('hazard')}
                data-testid="last-hazard-button"
              >
                ⚠ ハザード
              </button>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => handleLastShotResult(null)}
              data-testid="last-skip-button"
            >
              打っていない
            </button>
          </div>
        )}

        {view === 'stats' && stats && (
          <div className="stats-card" data-testid="stats-card">
            <h2 className="stats-title">📊 練習結果</h2>

            <div className="stats-overall">
              <div className="stats-total-shots">{stats.totalShots}球</div>
              <div className="stats-success-rate" data-testid="stats-success-rate">
                成功率 {stats.totalShots > 0 ? Math.round((stats.totalSuccess / stats.totalShots) * 100) : 0}%
              </div>
              <div className="stats-breakdown" data-testid="stats-breakdown">
                <span className="stats-breakdown-item stats-breakdown-ok">
                  ⭕ {stats.totalSuccess}
                </span>
                <span className="stats-breakdown-item stats-breakdown-ng">
                  ❌ {stats.totalMiss}
                </span>
                <span className="stats-breakdown-item stats-breakdown-hazard">
                  ⚠ {stats.totalHazard}
                </span>
              </div>
            </div>

            {stats.scenarioStats.length > 0 && (
              <div className="stats-scenarios" data-testid="stats-scenarios">
                <h3 className="stats-scenario-title">場面別</h3>
                {stats.scenarioStats.map((scenario) => (
                  <div key={scenario.name} className="stats-scenario-row">
                    <span className="stats-scenario-name">{scenario.name}</span>
                    <span className="stats-scenario-result">
                      {Math.round((scenario.successCount / scenario.totalCount) * 100)}%
                      <span className="stats-scenario-detail">
                        ({scenario.successCount}/{scenario.totalCount})
                      </span>
                      {scenario.hazardCount > 0 && (
                        <span className="stats-scenario-hazard">
                          ⚠{scenario.hazardCount}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'welcome' && (
          <div className="welcome-card">
            <p className="welcome-message">
              ボタンを押してターゲットを表示しましょう。<br />
              1球ごとにターゲットを変えて、<br />
              実戦に近い練習をしましょう。
            </p>
          </div>
        )}

        <div className="button-group">
          {view === 'welcome' && (
            <>
              <button
                className="btn btn-primary"
                onClick={handleStart}
                data-testid="next-button"
              >
                スタート
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowSettings(!showSettings)}
                data-testid="settings-button"
              >
                ⚙️ 設定
              </button>
            </>
          )}
          {view === 'target' && (
            <>
              <div className="result-buttons" data-testid="result-buttons">
                <button
                  className="btn btn-ok"
                  onClick={() => handleShotResult('success')}
                  data-testid="ok-button"
                >
                  ⭕ OK
                </button>
                <button
                  className="btn btn-ng"
                  onClick={() => handleShotResult('miss')}
                  data-testid="ng-button"
                >
                  ❌ NG
                </button>
                <button
                  className="btn btn-hazard"
                  onClick={() => handleShotResult('hazard')}
                  data-testid="hazard-button"
                >
                  ⚠ ハザード
                </button>
              </div>
              <button
                className="btn btn-finish"
                onClick={handleFinish}
                data-testid="finish-button"
              >
                終わる
              </button>
            </>
          )}
          {view === 'stats' && (
            <button
              className="btn btn-primary"
              onClick={handleReset}
              data-testid="reset-button"
            >
              もう一度
            </button>
          )}
        </div>

        {showSettings && view === 'welcome' && (
          <div className="settings-panel" data-testid="settings-panel">
            <h3 className="settings-title">⚙️ 設定</h3>
            <div className="settings-row">
              <label className="settings-label" htmlFor="max-distance">
                最大飛距離（yd）
              </label>
              <input
                id="max-distance"
                className="settings-input"
                type="number"
                min={50}
                max={400}
                step={10}
                value={maxDistance}
                onChange={(e) => handleMaxDistanceChange(e.target.value)}
                data-testid="max-distance-input"
              />
            </div>
            <p className="settings-hint">
              ドライバーの最大飛距離を設定すると、すべてのターゲット距離が調整されます。
            </p>
            <div className="settings-row">
              <label className="settings-label" htmlFor="strictness">
                シビアさ
              </label>
              <select
                id="strictness"
                className="settings-select"
                value={strictness}
                onChange={(e) => setStrictness(e.target.value as StrictnessLevel)}
                data-testid="strictness-select"
              >
                {(Object.entries(STRICTNESS_LABELS) as [StrictnessLevel, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>
            <p className="settings-hint">
              OKゾーンの広さを調整します。「ゆるい」で広く、「とてもシビア」で狭くなります。
            </p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>練習は量より質。1球1球、ターゲットを意識して。</p>
      </footer>
    </div>
  )
}

export default App

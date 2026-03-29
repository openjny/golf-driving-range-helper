import { useState } from 'react'
import type { Target, ShotResult, ShotOutcome, SessionStats, StrictnessLevel, DistanceProfileId } from './types'
import { DEFAULT_PROFILE_ID, STRICTNESS_LABELS, STRICTNESS_DESCRIPTIONS } from './types'
import { distanceProfiles } from './targets'
import { generateRandomTarget, getProfile, getDistanceRangeInfo, computeStats } from './logic'
import './App.css'

type AppView = 'welcome' | 'target' | 'last-shot-prompt' | 'stats'

function App() {
  const [view, setView] = useState<AppView>('welcome')
  const [target, setTarget] = useState<Target | null>(null)
  const [shotCount, setShotCount] = useState(0)
  const [shotResults, setShotResults] = useState<ShotResult[]>([])
  const [profileId, setProfileId] = useState<DistanceProfileId>(DEFAULT_PROFILE_ID)
  const [strictness, setStrictness] = useState<StrictnessLevel>('normal')
  const [showHelp, setShowHelp] = useState(false)
  const [stats, setStats] = useState<SessionStats | null>(null)

  const profile = getProfile(profileId)

  const handleStart = () => {
    setTarget(generateRandomTarget(profile, strictness))
    setShotCount(1)
    setView('target')
  }

  const handleShotResult = (result: ShotOutcome) => {
    if (target) {
      setShotResults((prev) => [...prev, { targetName: target.name, result }])
    }
    setTarget(generateRandomTarget(profile, strictness, target?.name))
    setShotCount((c) => c + 1)
  }

  const handleSkip = () => {
    setTarget(generateRandomTarget(profile, strictness, target?.name))
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>⛳ ターゲット練習</h1>
        <p className="subtitle">ランダムなターゲット距離とゾーンにキャリーさせよう</p>
      </header>

      <main className="app-main">
        {view === 'target' && target && (
          <>
          <button
            className="btn btn-finish"
            onClick={handleFinish}
            data-testid="finish-button"
          >
            練習を終わる
          </button>
          <div className="target-card" data-testid="target-card">
            <div className="target-card-header">
              <div className="shot-counter">
                {shotCount}球目
              </div>
              <h2 className="target-name" data-testid="target-name">
                {target.name}
              </h2>
              <button
                className="btn-help"
                onClick={() => setShowHelp(true)}
                data-testid="help-button"
                aria-label="ヘルプ"
              >
                ❓
              </button>
            </div>

            <div className="target-zone" data-testid="target-zone">
              <div className="ellipse-far" data-testid="target-depth">
                {target.distance + target.depthOk} yd
              </div>
              <div className="ellipse-shape" style={{
                aspectRatio: `${target.widthOk} / ${target.depthOk}`,
              }}>
                <div className="ellipse-axis-h" data-testid="target-width">
                  <span className="axis-label">{target.widthOk} yd</span>
                  <div className="target-distance" data-testid="target-distance">
                    <span className="distance-value">{target.distance}</span>
                    <span className="distance-unit">yd</span>
                  </div>
                  <span className="axis-label">{target.widthOk} yd</span>
                </div>
                <div className="ellipse-axis-v">
                  <span className="axis-label-v">{target.depthOk} yd</span>
                  <span className="axis-label-v">{target.depthOk} yd</span>
                </div>
              </div>
              <div className="ellipse-near">
                {target.distance - target.depthOk} yd
              </div>
            </div>
          </div>
          </>
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
                ⭕ 成功
              </button>
              <button
                className="btn btn-ng"
                onClick={() => handleLastShotResult('miss')}
                data-testid="last-ng-button"
              >
                ❌ 失敗
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
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'welcome' && (
          <div className="settings-panel" data-testid="settings-panel">
            <div className="settings-section">
              <label className="settings-label">ドライバー飛距離</label>
              <div className="profile-cards" data-testid="profile-select">
                {distanceProfiles.map((p) => (
                  <button
                    key={p.id}
                    className={`profile-card${p.id === profileId ? ' profile-card--active' : ''}`}
                    onClick={() => setProfileId(p.id)}
                    data-testid={`profile-${p.id}`}
                  >
                    <span className="profile-card-distance">{p.maxDistance} yd</span>
                    <span className="profile-card-desc">{p.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <label className="settings-label">シビアさ</label>
              <div className="strictness-cards" data-testid="strictness-select">
                {(Object.entries(STRICTNESS_LABELS) as [StrictnessLevel, string][]).map(
                  ([value, label]) => (
                    <button
                      key={value}
                      className={`strictness-card${value === strictness ? ' strictness-card--active' : ''}`}
                      onClick={() => setStrictness(value)}
                      data-testid={`strictness-${value}`}
                    >
                      <span className="strictness-card-label">{label}</span>
                      <span className="strictness-card-desc">{STRICTNESS_DESCRIPTIONS[value]}</span>
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="settings-distance-preview" data-testid="distance-preview">
              <h4 className="settings-subtitle">距離帯プレビュー</h4>
              <table className="distance-table">
                <thead>
                  <tr>
                    <th>ターゲット</th>
                    <th>距離</th>
                    <th>縦</th>
                    <th>横</th>
                    <th>頻度</th>
                  </tr>
                </thead>
                <tbody>
                  {getDistanceRangeInfo(profile, strictness).map((range) => (
                    <tr key={range.name}>
                      <td>{range.name}</td>
                      <td>{range.distanceMin}-{range.distanceMax}yd</td>
                      <td>{Math.round(range.depthRatio * 100)}%</td>
                      <td>{Math.round(range.widthRatio * 100)}%</td>
                      <td>{range.distanceMin}-{range.distanceMax} yd</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="button-group">
          {view === 'welcome' && (
            <button
              className="btn btn-primary"
              onClick={handleStart}
              data-testid="next-button"
            >
              スタート
            </button>
          )}
          {view === 'target' && (
              <div className="result-buttons" data-testid="result-buttons">
                <button
                  className="btn btn-ok"
                  onClick={() => handleShotResult('success')}
                  data-testid="ok-button"
                >
                  ⭕ 成功
                </button>
                <button
                  className="btn btn-ng"
                  onClick={() => handleShotResult('miss')}
                  data-testid="ng-button"
                >
                  ❌ 失敗
                </button>
                <button
                  className="btn btn-skip"
                  onClick={handleSkip}
                  data-testid="skip-button"
                >
                  スキップ
                </button>
              </div>
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

        {showHelp && (
          <div className="modal-overlay" data-testid="help-modal" onClick={() => setShowHelp(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">📋 ターゲット一覧</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowHelp(false)}
                  data-testid="help-close-button"
                  aria-label="閉じる"
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-settings-info">
                  <span>プロフィール: <strong>{profile.maxDistance} yd ({profile.description})</strong></span>
                  <span>シビアさ: <strong>{STRICTNESS_LABELS[strictness]}</strong></span>
                </div>
                <table className="distance-table">
                  <thead>
                    <tr>
                      <th>ターゲット</th>
                      <th>距離</th>
                      <th>縦</th>
                      <th>横</th>
                      <th>頻度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDistanceRangeInfo(profile, strictness).map((range) => (
                      <tr key={range.name}>
                        <td>{range.name}</td>
                        <td>{range.distanceMin}-{range.distanceMax} yd</td>
                        <td>{Math.round(range.depthRatio * 100)}%</td>
                        <td>{Math.round(range.widthRatio * 100)}%</td>
                        <td>{range.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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

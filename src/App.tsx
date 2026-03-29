import { useState } from 'react'
import type { Target, ShotResult, ShotOutcome, SessionStats, StrictnessLevel, DistanceProfileId } from './types'
import { DEFAULT_PROFILE_ID, STRICTNESS_LABELS, STRICTNESS_DESCRIPTIONS } from './types'
import { distanceProfiles } from './targets'
import { generateRandomTarget, getProfile, getDistanceRangeInfo, computeStats } from './logic'
import './App.css'

type AppView = 'welcome' | 'target' | 'last-shot-prompt' | 'stats'

const IconOk = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ verticalAlign: 'middle' }}>
    <circle cx="9" cy="9" r="7" stroke={color} strokeWidth="2.5" fill="none" />
  </svg>
)

const IconNg = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ verticalAlign: 'middle' }}>
    <line x1="4" y1="4" x2="14" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="14" y1="4" x2="4" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

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
        <p className="subtitle">ランダムに設定される距離（ゾーン）にキャリーさせよう</p>
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
              <div className="ellipse-shape">
                <div className="ellipse-axis-h" data-testid="target-width">
                  <span className="axis-label"><span className="axis-num">{target.widthOk}</span> yd</span>
                  <div className="target-distance" data-testid="target-distance">
                    <span className="distance-value">{target.distance}<span className="distance-unit">yd</span></span>
                  </div>
                  <span className="axis-label"><span className="axis-num">{target.widthOk}</span> yd</span>
                </div>
                <div className="ellipse-axis-v">
                  <span className="axis-label-v"><span className="axis-num">{target.depthOk}</span> yd</span>
                  <span className="axis-label-v"><span className="axis-num">{target.depthOk}</span> yd</span>
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
                <IconOk color="#fff" /> 成功
              </button>
              <button
                className="btn btn-ng"
                onClick={() => handleLastShotResult('miss')}
                data-testid="last-ng-button"
              >
                <IconNg color="#fff" /> 失敗
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
                  <IconOk color="var(--green-dark)" /> {stats.totalSuccess}
                </span>
                <span className="stats-breakdown-item stats-breakdown-ng">
                  <IconNg color="#c62828" /> {stats.totalMiss}
                </span>
              </div>
            </div>

            {stats.scenarioStats.length > 0 && (
              <div className="stats-scenarios" data-testid="stats-scenarios">
                <table className="stats-scenario-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>ショット</th>
                      <th>距離</th>
                      <th>成功率</th>
                    </tr>
                  </thead>
                  <tbody>
                {(() => {
                  const rangeInfo = getDistanceRangeInfo(profile, strictness)
                  return stats.scenarioStats.map((scenario) => {
                  const practiced = scenario.totalCount > 0
                  const pct = practiced ? Math.round((scenario.successCount / scenario.totalCount) * 100) : -1
                  const resultClass = !practiced ? '' : pct >= 70 ? 'result-good' : pct >= 40 ? 'result-ok' : 'result-poor'
                  const range = rangeInfo.find((r) => r.name === scenario.name)
                  return (
                  <tr key={scenario.name} className={resultClass}>
                    <td className="stats-scenario-emoji">{!practiced ? '' : pct >= 70 ? '🎯' : pct >= 40 ? '' : '⚠️'}</td>
                    <td>{scenario.name}</td>
                    <td>{range ? `${range.distanceMin}-${range.distanceMax} yd` : ''}</td>
                    <td>
                      {practiced ? (
                        <>{pct}% <span className="stats-scenario-detail">({scenario.successCount}/{scenario.totalCount})</span></>
                      ) : (
                        <span className="stats-scenario-na">N/A</span>
                      )}
                    </td>
                  </tr>
                  )
                })})()}
                  </tbody>
                </table>
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
                      <td>{range.percentage}%</td>
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
                  <IconOk color="#fff" /> 成功
                </button>
                <button
                  className="btn btn-ng"
                  onClick={() => handleShotResult('miss')}
                  data-testid="ng-button"
                >
                  <IconNg color="#fff" /> 失敗
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

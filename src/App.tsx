import { useState, useEffect } from 'react'
import './App.css'

interface Upgrade {
  id: string
  name: string
  cost: number
  cookiesPerSecond: number
  owned: number
}

function App() {
  const [cookies, setCookies] = useState(0)
  const [cookiesPerSecond, setCookiesPerSecond] = useState(0)
  const [cookiesPerClick] = useState(1)

  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    { id: 'cursor', name: 'Cursor', cost: 15, cookiesPerSecond: 0.1, owned: 0 },
    { id: 'grandma', name: 'Grandma', cost: 100, cookiesPerSecond: 1, owned: 0 },
    { id: 'farm', name: 'Farm', cost: 1100, cookiesPerSecond: 8, owned: 0 },
    { id: 'mine', name: 'Mine', cost: 12000, cookiesPerSecond: 47, owned: 0 },
  ])

  useEffect(() => {
    if (cookiesPerSecond > 0) {
      const interval = setInterval(() => {
        setCookies(prev => prev + cookiesPerSecond / 10)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [cookiesPerSecond])

  const handleCookieClick = () => {
    setCookies(prev => prev + cookiesPerClick)
  }

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId)
    if (!upgrade || cookies < upgrade.cost) return

    setCookies(prev => prev - upgrade.cost)
    setCookiesPerSecond(prev => prev + upgrade.cookiesPerSecond)
    
    setUpgrades(prev => prev.map(u => 
      u.id === upgradeId 
        ? { ...u, owned: u.owned + 1, cost: Math.floor(u.cost * 1.15) }
        : u
    ))
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return Math.floor(num).toString()
  }

  return (
    <div className="cookie-clicker">
      <header className="game-header">
        <h1>🍪 Cookie Clicker</h1>
        <div className="stats">
          <div className="cookie-count">{formatNumber(cookies)} cookies</div>
          <div className="cookies-per-second">
            per second: {cookiesPerSecond.toFixed(1)}
          </div>
        </div>
      </header>

      <main className="game-main">
        <div className="cookie-section">
          <button className="cookie-button" onClick={handleCookieClick}>
            <span className="cookie-emoji">🍪</span>
          </button>
          <p>Click the cookie!</p>
        </div>

        <div className="upgrades-section">
          <h2>Upgrades</h2>
          <div className="upgrades-list">
            {upgrades.map(upgrade => (
              <div key={upgrade.id} className="upgrade-item">
                <div className="upgrade-info">
                  <div className="upgrade-name">{upgrade.name}</div>
                  <div className="upgrade-stats">
                    {upgrade.cookiesPerSecond}/sec | Owned: {upgrade.owned}
                  </div>
                </div>
                <button 
                  className={`upgrade-buy ${cookies >= upgrade.cost ? 'affordable' : 'expensive'}`}
                  onClick={() => buyUpgrade(upgrade.id)}
                  disabled={cookies < upgrade.cost}
                >
                  {formatNumber(upgrade.cost)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

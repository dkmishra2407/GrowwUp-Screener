import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import StockDetail from './pages/StockDetail'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stock/:symbol" element={<StockDetail />} />
      </Routes>
    </div>
  )
}

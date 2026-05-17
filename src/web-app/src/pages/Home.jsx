import { useState, useEffect } from 'react'
import { roomApi } from '../services/api'
import RoomCard from '../components/RoomCard'
import './Home.css'

export default function Home() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('ALL') // ALL | AVAILABLE | BOOKED

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const res = await roomApi.getAll()
      setRooms(res.data)
    } catch (err) {
      setError('Không thể tải danh sách phòng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRooms() }, [])

  // When a room is booked, update its status locally (optimistic update)
  const handleRoomBooked = (roomId) => {
    setRooms(prev =>
      prev.map(r => r.id === roomId ? { ...r, status: 'BOOKED' } : r)
    )
  }

  const filtered = rooms.filter(r =>
    filter === 'ALL' ? true : r.status === filter
  )

  const available = rooms.filter(r => r.status === 'AVAILABLE').length
  const booked = rooms.filter(r => r.status === 'BOOKED').length

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="container">
          <div className="hero-content">
            <p className="hero-eyebrow">Khách sạn 5 sao · Trung tâm thành phố</p>
            <h1 className="hero-title">
              Trải Nghiệm <br />
              <span className="hero-title-accent">Đẳng Cấp</span>
            </h1>
            <p className="hero-subtitle">
              Lựa chọn từ bộ sưu tập phòng nghỉ được thiết kế thủ công,
              mỗi căn phòng là một tác phẩm nghệ thuật sống.
            </p>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{rooms.length}</span>
              <span className="stat-label">Tổng phòng</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number text-gold">{available}</span>
              <span className="stat-label">Còn trống</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number text-muted">{booked}</span>
              <span className="stat-label">Đã đặt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="filter-bar">
        <div className="container filter-bar-inner">
          <div className="filter-tabs">
            {[
              { key: 'ALL', label: 'Tất Cả' },
              { key: 'AVAILABLE', label: 'Còn Trống' },
              { key: 'BOOKED', label: 'Đã Đặt' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
                <span className="filter-count">
                  {tab.key === 'ALL' ? rooms.length : tab.key === 'AVAILABLE' ? available : booked}
                </span>
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchRooms} disabled={loading}>
            ↻ Làm mới
          </button>
        </div>
      </section>

      {/* Room grid */}
      <section className="rooms-section">
        <div className="container">
          {loading ? (
            <div className="page-loader">
              <div className="spinner" style={{ width: 32, height: 32 }}></div>
              <p>Đang tải phòng...</p>
            </div>
          ) : error ? (
            <div className="rooms-error">
              <div className="alert alert-error">{error}</div>
              <button className="btn btn-outline" onClick={fetchRooms}>Thử Lại</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rooms-empty">
              <p className="text-muted">Không có phòng nào trong danh mục này.</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {filtered.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onBooked={handleRoomBooked}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

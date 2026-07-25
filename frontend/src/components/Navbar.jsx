import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">Healthcare Backend</div>
      {isAuthenticated && (
        <div className="navbar-links">
          <Link to="/patients">Patients</Link>
          <Link to="/doctors">Doctors</Link>
          <Link to="/mappings">Mappings</Link>
          <span className="navbar-user">{user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  )
}

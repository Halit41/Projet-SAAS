import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL

// Page publique : /u/:slug
function UserLinksPage() {
  const { slug } = useParams()
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPublicLinks = async () => {
      try {
        const res = await axios.get(`${API_URL}/public/${slug}`)
        setLinks(res.data.links)
      } catch (err) {
        console.error("Erreur chargement liens publics", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPublicLinks()
  }, [slug])

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">Liens de {slug}</h1>
      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : links.length === 0 ? (
        <p className="text-center text-gray-500">Aucun lien trouvé.</p>
      ) : (
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded text-center"
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Dashboard privé
function Dashboard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [links, setLinks] = useState([])
  const [slug, setSlug] = useState('')
  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      setMessage("Inscription en cours...")
      await axios.post(`${API_URL}/auth/register`, { email, password })
      setMessage("✅ Inscription réussie. Vous pouvez maintenant vous connecter.")
      setEmail('')
      setPassword('')
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.error || "Erreur à l'inscription"
      setMessage(`❌ ${msg}`)
    }
  }

  const handleLogin = async () => {
    try {
      setMessage("Connexion en cours...")
      const res = await axios.post(`${API_URL}/auth/login`, { email, password })
      setToken(res.data.token)
      setMessage("Connexion réussie ✅")
      fetchLinks(res.data.token)
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.error || "Erreur à la connexion"
      setMessage(`❌ ${msg}`)
    }
  }

  const handleCreateLink = async () => {
    try {
      await axios.post(
        `${API_URL}/links/create`,
        { title, url },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTitle('')
      setUrl('')
      fetchLinks(token)
    } catch (err) {
      console.error(err)
      setMessage("❌ Erreur lors de la création du lien")
    }
  }

  const fetchLinks = async (currentToken) => {
    try {
      const res = await axios.get(`${API_URL}/links/my-links`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      })
      setLinks(res.data.links || [])
      setSlug(res.data.slug || '')
    } catch (err) {
      console.error("Erreur chargement liens", err)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">SmartLinks 🎯</h1>

      {!token && (
        <>
          <input
            type="email"
            placeholder="Email"
            className="border p-2 w-full mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="border p-2 w-full mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2 mb-4">
            <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded w-full">
              Se connecter
            </button>
            <button onClick={handleRegister} className="bg-gray-600 text-white p-2 rounded w-full">
              S'inscrire
            </button>
          </div>
        </>
      )}

      {message && <p className="text-center text-sm text-red-600 mb-4">{message}</p>}

      {token && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Créer un lien</h2>
          <input
            type="text"
            placeholder="Titre (ex: Instagram)"
            className="border p-2 w-full mb-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="URL (ex: https://...)"
            className="border p-2 w-full mb-2"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={handleCreateLink}
            className="bg-green-600 text-white p-2 rounded w-full mb-4"
          >
            Ajouter le lien
          </button>

          <h2 className="text-xl font-semibold mt-6 mb-2">Mes liens</h2>
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded text-center"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>

          {slug && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">🔗 Page publique :</p>
              <Link
                to={`/u/${slug}`}
                className="text-blue-600 underline hover:text-blue-800"
              >
                /u/{slug}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/u/:slug" element={<UserLinksPage />} />
      </Routes>
    </Router>
  )
}

export default App

import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [links, setLinks] = useState([])

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, { email, password })
      setMessage("Inscription réussie. Vous pouvez maintenant vous connecter.")
    } catch (err) {
      setMessage(err.response?.data?.error || "Erreur à l'inscription")
    }
  }

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password })
      setToken(res.data.token)
      setMessage("Connexion réussie ✅")
    } catch (err) {
      setMessage(err.response?.data?.error || "Erreur à la connexion")
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
      fetchLinks()
    } catch (err) {
      setMessage("Erreur lors de la création du lien")
    }
  }

  const fetchLinks = async () => {
    try {
      const res = await axios.get(`${API_URL}/links/my-links`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setLinks(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (token) {
      fetchLinks()
    }
  }, [token])

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
            <button onClick={handleRegister} className="bg-gray-500 text-white p-2 rounded w-full">
              S'inscrire
            </button>
          </div>
        </>
      )}

      {message && <p className="text-center text-sm text-gray-700">{message}</p>}

      {token && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Créer un lien</h2>
          <input
            type="text"
            placeholder="Titre (ex: Mon Instagram)"
            className="border p-2 w-full mb-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="URL (ex: https://instagram.com/...)"
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
        </div>
      )}
    </div>
  )
}

export default App

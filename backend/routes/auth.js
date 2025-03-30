const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const pool = require("../db")

router.post("/register", async (req, res) => {
  const { email, password } = req.body
  console.log("📥 Données reçues :", email, password)

  if (!email || !password) {
    console.log("⛔ Champs manquants")
    return res.status(400).json({ error: "Email et mot de passe requis" })
  }

  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (existing.rows.length > 0) {
      console.log("⚠️ Email déjà utilisé :", email)
      return res.status(400).json({ error: "Email déjà utilisé" })
    }

    const hashed = await bcrypt.hash(password, 10)
    await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [
      email,
      hashed,
    ])

    console.log("✅ Utilisateur enregistré :", email)
    res.status(200).json({ message: "Inscription réussie" })
  } catch (err) {
    console.error("❌ Erreur SQL :", err.message)
    res.status(500).json({ error: "Erreur serveur" })
  }
})

module.exports = router

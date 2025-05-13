const express = require('express')
const cors = require('cors')
const {Sequelize, DataTypes } = require('sequelize')

const app = express()
app.use(cors())
app.use(express.json())

const sequelize = new Sequelize('filmfeltolto', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
  })
  

const Film = sequelize.define('Film', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  time: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  }
})

sequelize.sync()

app.get('/films', async (req, res) => {
  const films = await Film.findAll()
  res.json(films)
})

app.post('/films', async (req, res) => {
  try {
    const film = await Film.create(req.body)
    res.status(201).json(film)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: 'Hibás adatküldés' })
  }
})

app.delete('/films/:id', async (req, res) => {
  const deleted = await Film.destroy({ where: { id: req.params.id } })
  res.json({ success: !!deleted })
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Backend fut: http://localhost:${PORT}`)
})

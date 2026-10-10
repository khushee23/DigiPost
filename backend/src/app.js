import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

//import routes
import adminRoutes from './routes/admin.routes.js'
import complaintsRoutes from './routes/complaints.route.js'
import notificationsRoutes from './routes/notifications.route.js'

const app=express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())

//routes
app.use('/api', adminRoutes)
app.use('/api', complaintsRoutes)
app.use('/api', notificationsRoutes)


app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Post Office Automation API is running'
  })
})

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

export default app
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

//import routes
import authRoutes from './routes/auth.route.js'
import adminRoutes from './routes/admin.routes.js'
import complaintsRoutes from './routes/complaints.route.js'
import deliveryRoutes from './routes/delivery.route.js'
import notificationsRoutes from './routes/notifications.route.js'
import parcelRoutes from './routes/parcel.route.js'
import userRoutes from './routes/user.route.js'

const app=express()

// Only the React app may call this API (set CLIENT_URL in .env, comma-separated for several)
app.use(cors({
  origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','),
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

//routes
// FIX: delivery and parcel routes existed but were never mounted (every call returned 404),
// and there was no auth route at all.
app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', adminRoutes)
app.use('/api', parcelRoutes)
app.use('/api', deliveryRoutes)
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

// Last-resort error handler (e.g. malformed JSON body)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' })
  }
  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

export default app

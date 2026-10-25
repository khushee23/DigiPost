// dotenv must be loaded before anything else reads process.env
import 'dotenv/config'
import app from './app.js'
import store from './services/store.js'

if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET in backend/.env')
    process.exit(1)
}

const PORT = process.env.PORT || 5000

try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be configured with at least 32 characters.')
    }
    await store.ready
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`)
    })
} catch (error) {
    console.error(`Server startup failed: ${error.message}`)
    process.exitCode = 1
}

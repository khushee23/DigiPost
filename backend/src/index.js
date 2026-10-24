// dotenv must be loaded before anything else reads process.env
import 'dotenv/config'
import app from './app.js'

if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET in backend/.env')
    process.exit(1)
}

const PORT = process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})

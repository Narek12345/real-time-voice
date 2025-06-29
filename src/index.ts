import 'dotenv/config'
import * as express from 'express'
import * as cors from 'cors'
import * as http from 'http'
import * as path from 'path'
import { Server } from 'socket.io'
import { RoutesSocket } from './socket'

const port = process.env.PORT
const host = process.env.HOST

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

new RoutesSocket(io)

server.listen(port, () => {
  console.info(
    `🚀 Server (HTTP + WebSocket) is running at http://${host}:${port}/`
  )
})

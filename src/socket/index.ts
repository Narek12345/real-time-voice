/* eslint-disable @typescript-eslint/no-unused-vars */
import { Socket, Server } from 'socket.io'
import axios from 'axios'

export class RoutesSocket {
  constructor(io: Server) {
    this.registerRoutes(io)
  }

  registerRoutes(io: Server) {
    io.on('connection', (socket: Socket) => {
      console.log('✅ WebSocket connected:', socket.id)

      const chatHistory: { role: string; content: string }[] = []

      socket.on('user_message', async (userInput: string) => {
        console.log('👤 User:', userInput)
        chatHistory.push({ role: 'user', content: userInput })

        try {
          const aiReply = await this.getAIReply(chatHistory)

          const turns = aiReply.simulated_conversation || []
          const lastTurn = [...turns].reverse().find((t) => t.role === 'agent')

          if (!lastTurn) {
            socket.emit('bot_message', '❗️ AI не ответил')
            return
          }

          const aiMessage = lastTurn.message
          chatHistory.push({ role: 'user', content: aiMessage })

          socket.emit('bot_message', aiMessage)

          const audio = await this.textToSpeech(aiMessage)
          socket.emit('bot_audio', audio)
        } catch (err: any) {
          console.error('❗️ Error:', err)
          socket.emit(
            'bot_message',
            `❗️ Ошибка: ${err.message || 'Unknown error'}`
          )
        }
      })

      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id)
      })
    })
  }

  async getAIReply(messages: any[]) {
    const url = `https://api.elevenlabs.io/v1/convai/agents/${process.env.AGENT_ID}/simulate-conversation`

    const headers = {
      'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
      'Content-Type': 'application/json'
    }

    const data = {
      simulation_specification: {
        model_id: process.env.MODEL_ID,
        messages,
        max_turns: 1,
        simulated_user_config: { response_delay: 0.5 }
      }
    }

    const response = await axios.post(url, data, { headers, timeout: 90000 })
    return response.data
  }

  // test content
  // async getAIReply(messages: any[]) {
  //   const url = `https://api.elevenlabs.io/v1/convai/agents/${process.env.AGENT_ID}/simulate-conversation`

  //   const headers = {
  //     'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
  //     'Content-Type': 'application/json'
  //   }

  //   const data = {
  //     simulation_specification: {
  //       model_id: process.env.MODEL_ID,
  //       messages: [{ role: 'user', content: 'Hello' }],
  //       max_turns: 1,
  //       simulated_user_config: { response_delay: 0.5 }
  //     }
  //   }

  //   try {
  //     const response = await axios.post(url, data, {
  //       headers,
  //       timeout: 1200000
  //     })
  //     return response.data
  //   } catch (e) {
  //     console.error('Ошибка API:', e)
  //     throw e
  //   }
  // }

  async textToSpeech(text: string): Promise<Buffer> {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}/stream`

    const payload = {
      text,
      model_id: process.env.MODEL_ID,
      output_format: process.env.OUTPUT_FORMAT,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    }

    const headers = {
      'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
      'Content-Type': 'application/json'
    }

    const response = await axios.post(url, payload, {
      headers,
      responseType: 'arraybuffer',
      timeout: 30_000
    })

    return response.data
  }
}

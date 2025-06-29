curl -X POST https://api.elevenlabs.io/v1/convai/agents/agent_01jyk4vvzaf3sb5vxj3arxzq36/simulate-conversation \
 -H "xi-api-key: sk_f72e32da40906b6f3d6c313bc98d107e9b13c2b972c76408" \
 -H "Content-Type: application/json" \
 -d '{
"simulation_specification": {
"simulated_user_config": {},
"model_id": "eleven_multilingual_v2",
"messages": [{ "role": "user", "content": "Hello" }],
"max_turns": 1,
"simulated_user_config": { "response_delay": 0.5 }
}
}'

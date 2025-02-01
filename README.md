# Open LLaMA with TTS in a Webfrontend

*Run on MAC with M1-Chip*


## Init llama
- Install Olama: [https://ollama.com/download](https://ollama.com/download)
- run `ollama run llama3.2` to download the model
- get bearer (later `BEARER_TOKEN`) for use in curl requests



## List available models (test)
```
curl -H "Authorization: Bearer BEARER_TOKEN" http://localhost:3000/api/models
```

## Get completion from model `llama3.2:latest` (test)
```
curl -X POST http://localhost:3000/api/chat/completions \
-H "Authorization: Bearer BEARER_TOKEN" \
-H "Content-Type: application/json" \
-d '{
      "model": "llama3.2:latest",
      "messages": [
        {
          "role": "user",
          "content": "Why is the sky blue?"
        }
      ]
    }'

```


## Install speech
```
mkdir Speech
cd Speech
git clone https://github.com/matatonic/openedai-speech.git
cd openedai-speech
```

## Config speech
```
cp sample.env speech.env

# deutsche sprache siehe https://github.com/matatonic/openedai-speech?tab=readme-ov-file#custom-voices-howto
# download deutsche onnx & onnx.json in vocies: https://rhasspy.github.io/piper-samples/
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/eva_k/x_low/de_DE-eva_k-x_low.onnx?download=true
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/eva_k/x_low/de_DE-eva_k-x_low.onnx.json?download=true
cp *.onnx* voices/.

# eintrag hinzfügen unter tts-1 config/voice_to_speaker.yaml:
# eva:
#    model: voices/de_DE-eva_k-x_low.onnx
#    speaker: # default speaker

# benötigt?
bash download_voices_tts-1.sh de_DE-eva_k-x_low

```

## Start TTS-Server
```
# CPU only:
docker compose -f docker-compose.min.yml up

# nvidia (cuda): docker compose up
# AMD: docker compose -f docker-compose.rocm.yml up
```

## Run TTS
```
curl http://localhost:8000/v1/audio/speech -H "Content-Type: application/json" -d '{
    "model": "tts-1",
    "input": "Hallo. Dies ist ein Test.",
    "voice": "alloy",
    "response_format": "mp3",
    "speed": 1.0
  }' > speech.mp3
```

## Run webserver on port `8080`
*Directory `web` contains the frontend code and will be the webroot.*
```
docker run -it --rm -d -p 8080:80 --name web -v ./web:/usr/share/nginx/html nginx
```


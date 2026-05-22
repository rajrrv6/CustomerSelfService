import json

path = "/Users/sudhir88/.gemini/antigravity/brain/10de4e54-8492-48ab-8f1e-dfea70c6101e/.system_generated/logs/transcript.jsonl"

with open(path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get("type") == "USER_INPUT":
            print("--- SUBAGENT 1 USER INPUT ---")
            print(data.get("content", ""))
            break

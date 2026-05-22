import json
import re

path = "/Users/sudhir88/.gemini/antigravity/brain/10de4e54-8492-48ab-8f1e-dfea70c6101e/.system_generated/logs/transcript.jsonl"

with open(path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        data = json.loads(line)
        content = data.get("content", "")
        # If content contains "chatHistory" or "accessibility" or "callback" or "ar.ts"
        if "chatHistory" in content or "accessibility" in content or "ar.ts" in content:
            print(f"Match on line {idx} (type: {data.get('type')}, source: {data.get('source')}):")
            # print first 1000 characters and last 1000 characters if it is long
            if len(content) > 2000:
                print(content[:1500])
                print("\n... [MIDDLE TRUNCATED] ...\n")
                print(content[-1500:])
            else:
                print(content)
            print("====================================")

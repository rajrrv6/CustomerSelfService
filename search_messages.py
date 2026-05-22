import os
import json

msg_dir = "/Users/sudhir88/.gemini/antigravity/brain/908ce585-3bea-4f13-9253-8f2f5a5ed377/.system_generated/messages"

for filename in os.listdir(msg_dir):
    if filename.endswith(".json"):
        path = os.path.join(msg_dir, filename)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                content = json.dumps(data, ensure_ascii=False)
                if "chatHistory:" in content or "سجل المحادثات" in content:
                    print(f"Match in {filename}:")
                    print(content[:1000])
                    print("...")
        except Exception as e:
            pass

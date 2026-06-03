log_path = "/Users/sudhir88/.gemini/antigravity/brain/908ce585-3bea-4f13-9253-8f2f5a5ed377/.system_generated/logs/transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        if 1360 <= idx <= 1365:
            print(f"Line {idx}:")
            print(line[:1000])
            print("...")

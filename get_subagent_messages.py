import json

path = "/Users/sudhir88/.gemini/antigravity/brain/908ce585-3bea-4f13-9253-8f2f5a5ed377/.system_generated/logs/transcript.jsonl"
sub1 = "10de4e54-8492-48ab-8f1e-dfea70c6101e"

with open(path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        if sub1 in line:
            data = json.loads(line)
            # Check if this line has a message content or is from this subagent
            if data.get("type") in ["GENERIC", "SYSTEM_MESSAGE", "PLANNER_RESPONSE"] or "sender" in line:
                print(f"Line {idx} type: {data.get('type')}")
                content = data.get("content", "")
                if len(content) > 500:
                    print(content[:500])
                    print("...")
                else:
                    print(content)
                print("---")

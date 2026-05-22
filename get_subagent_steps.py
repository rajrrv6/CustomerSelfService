import json

path = "/Users/sudhir88/.gemini/antigravity/brain/10de4e54-8492-48ab-8f1e-dfea70c6101e/.system_generated/logs/transcript.jsonl"

with open(path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        data = json.loads(line)
        print(f"Step {idx}: type={data.get('type')}, source={data.get('source')}, status={data.get('status')}")
        if data.get("type") in ["PLANNER_RESPONSE", "GENERIC"]:
            content = data.get("content", "")
            # Print any summary or message
            if "i18n" in content or "translation" in content:
                print(f"  Snippet: {content[:300]}...")
        # Check tool calls
        if "tool_calls" in data:
            for tc in data["tool_calls"]:
                print(f"  Tool Call: {tc['name']}")
                if tc['name'] == 'write_to_file':
                    print(f"    Target: {tc['args'].get('TargetFile')}")

import json

transcript_path = "/Users/sudhir88/.gemini/antigravity/brain/05015aea-102a-42cf-aacb-4a32bcf59822/.system_generated/logs/transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            step = json.loads(line)
            step_idx = step.get("step_index")
            step_type = step.get("type")
            content = step.get("content", "")
            
            if step_type == "RUN_COMMAND" and ("git add" in content or "git commit" in content):
                print(f"Step {step_idx}: RUN_COMMAND content={content[:200]}")
        except Exception as e:
            pass

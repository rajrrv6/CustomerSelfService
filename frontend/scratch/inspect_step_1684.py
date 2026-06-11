import json

transcript_path = "/Users/sudhir88/.gemini/antigravity/brain/05015aea-102a-42cf-aacb-4a32bcf59822/.system_generated/logs/transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            step = json.loads(line)
            step_idx = step.get("step_index")
            if step_idx == 1684:
                print("--- Step 1684 details ---")
                tool_calls = step.get("tool_calls", [])
                for call in tool_calls:
                    print("Tool Name:", call.get("name"))
                    args = call.get("args", {})
                    print("TargetFile:", args.get("TargetFile"))
                    print("IsArtifact:", args.get("IsArtifact"))
                    # Print length and snippet of CodeContent
                    code_content = args.get("CodeContent", "")
                    print("CodeContent length:", len(code_content))
                    print("CodeContent starts with:")
                    print(code_content[:200])
                    print("CodeContent ends with:")
                    print(code_content[-200:])
        except Exception as e:
            pass

import json

transcript_path = "/Users/sudhir88/.gemini/antigravity/brain/05015aea-102a-42cf-aacb-4a32bcf59822/.system_generated/logs/transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            step = json.loads(line)
            step_idx = step.get("step_index")
            tool_calls = step.get("tool_calls", [])
            for call in tool_calls:
                name = call.get("name")
                args = call.get("args", {})
                if name == "write_to_file" and "CustomerPortalLayout.tsx" in str(args.get("TargetFile", "")):
                    code_content = args.get("CodeContent", "")
                    print(f"Step {step_idx}: write_to_file TargetFile={args.get('TargetFile')} CodeContent length={len(code_content)}")
        except Exception as e:
            pass

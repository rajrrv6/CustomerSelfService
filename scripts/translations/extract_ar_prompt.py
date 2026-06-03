import json

log_path = "/Users/sudhir88/.gemini/antigravity/brain/908ce585-3bea-4f13-9253-8f2f5a5ed377/.system_generated/logs/transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        if idx == 1362:
            data = json.loads(line)
            # The tool calls contains 'invoke_subagent'
            for tc in data.get("tool_calls", []):
                if tc.get("name") == "invoke_subagent":
                    subagents = tc["args"]["Subagents"]
                    # Let's write this subagents string directly to a file
                    with open("/Users/sudhir88/Desktop/CustomerSelfService/subagents_args.txt", "w", encoding="utf-8") as out:
                        out.write(subagents)
                    print("Successfully wrote subagents_args.txt")
                    
                    # Also let's try to load the subagents string as JSON
                    try:
                        subagents_list = json.loads(subagents)
                        for s_idx, sa in enumerate(subagents_list):
                            prompt_content = sa.get("Prompt", "")
                            with open(f"/Users/sudhir88/Desktop/CustomerSelfService/subagent_{s_idx}_prompt.txt", "w", encoding="utf-8") as p_out:
                                p_out.write(prompt_content)
                            print(f"Wrote subagent_{s_idx}_prompt.txt")
                    except Exception as e:
                        print("Could not parse subagents as JSON:", e)

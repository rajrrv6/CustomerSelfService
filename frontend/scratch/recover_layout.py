import json
import ast

transcript_path = "/Users/sudhir88/.gemini/antigravity/brain/05015aea-102a-42cf-aacb-4a32bcf59822/.system_generated/logs/transcript.jsonl"
target_file = "/Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx"

recovered_code = None

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            step = json.loads(line)
            if step.get("step_index") == 1684:
                tool_calls = step.get("tool_calls", [])
                for tc in tool_calls:
                    if tc.get("name") == "write_to_file":
                        args = tc.get("args", {})
                        if isinstance(args, str):
                            args = json.loads(args)
                        recovered_code = args.get("CodeContent")
                        break
        except Exception as e:
            pass

if recovered_code:
    # Use ast.literal_eval to parse the string literal
    try:
        recovered_code = ast.literal_eval(recovered_code)
    except Exception as e:
        print("literal_eval failed, falling back to manual replacement:", e)
        if recovered_code.startswith("'") and recovered_code.endswith("'"):
            recovered_code = recovered_code[1:-1]
        elif recovered_code.startswith('"') and recovered_code.endswith('"'):
            recovered_code = recovered_code[1:-1]
        recovered_code = recovered_code.replace('\\n', '\n').replace('\\"', '"').replace("\\'", "'").replace('\\\\', '\\')
            
    with open(target_file, "w", encoding="utf-8") as f:
        f.write(recovered_code)
    print("Successfully recovered CustomerPortalLayout.tsx!")
    print("Preview:\n", recovered_code[:200])
else:
    print("Could not find step 1684 in transcript.jsonl")

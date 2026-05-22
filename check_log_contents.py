import os
import json

p = "/Users/sudhir88/.gemini/antigravity/brain/10de4e54-8492-48ab-8f1e-dfea70c6101e/.system_generated/logs/transcript.jsonl"

if os.path.exists(p):
    print("Log size:", os.path.getsize(p))
    with open(p, 'r', encoding='utf-8') as f:
        # Search for any line containing Arabic letters or "initialPrompt"
        for idx, line in enumerate(f):
            if "initialPrompt" in line:
                print(f"Match for initialPrompt on line {idx}:")
                print(line[:2000])
                print("...")
            # Also search for "otpCodeInstructions" or "refundEligible"
            if "otpCodeInstructions" in line or "refundEligible" in line:
                print(f"Match for key on line {idx}:")
                print(line[:2000])
                print("...")
else:
    print("Log path does not exist")

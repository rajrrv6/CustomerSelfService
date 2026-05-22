import os

subagents = [
    "10de4e54-8492-48ab-8f1e-dfea70c6101e",
    "a1892251-c290-4c98-9483-d1741c1ae3fb"
]

for sa in subagents:
    sa_dir = f"/Users/sudhir88/.gemini/antigravity/brain/{sa}"
    if os.path.exists(sa_dir):
        print(f"\n--- Directory: {sa_dir} ---")
        for root, dirs, files in os.walk(sa_dir):
            # Skip .system_generated/worktrees or other huge dirs if any
            if "worktrees" in root:
                continue
            for file in files:
                path = os.path.join(root, file)
                print(f"File: {os.path.relpath(path, sa_dir)} (size: {os.path.getsize(path)})")
    else:
        print(f"Dir not found: {sa_dir}")

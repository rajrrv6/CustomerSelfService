import shutil
import os

src = "/Users/sudhir88/.gemini/antigravity/brain/a1892251-c290-4c98-9483-d1741c1ae3fb/translations_complete.ts"
dst = "/Users/sudhir88/Desktop/CustomerSelfService/translations_complete_from_subagent.ts"

if os.path.exists(src):
    shutil.copy(src, dst)
    print(f"Copied to {dst}")
else:
    print(f"File not found: {src}")

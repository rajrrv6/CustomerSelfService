import re

chunk_path = "/Users/sudhir88/Desktop/CustomerSelfService/frontend/.next/dev/server/chunks/ssr/0amv_CustomerSelfService_frontend_src_components_customer-portal_shared_07vzeq5._.js"

print("Reading transpiled chunk...")

try:
    with open(chunk_path, "r", encoding="utf-8") as f:
        content = f.read()
    print(f"Chunk file loaded successfully. Size: {len(content)} bytes.")
    
    # Search for "CustomerPortalLayout" in the chunk file
    # Let's print occurrences and line numbers
    lines = content.splitlines()
    matches = []
    for idx, line in enumerate(lines):
        if "function CustomerPortalLayout" in line or "const CustomerPortalLayout" in line or "CustomerPortalLayout = function" in line:
            print(f"Found match at line {idx+1}: {line[:100]}")
            matches.append(idx)
            
    # Also search for "Compliance Snapshots" or "SSO Connection & Federation"
    for idx, line in enumerate(lines):
        if "SSO Connection & Federation" in line:
            print(f"Found SSO Connection string at line {idx+1}: {line[:100]}")
            matches.append(idx)
            
except Exception as e:
    print(f"Error: {e}")

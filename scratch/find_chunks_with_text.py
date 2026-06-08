import os

def search_text(directory, term):
    results = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.js') or file.endswith('.json'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        for line_no, line in enumerate(f, 1):
                            if term in line:
                                results.append((path, line_no, line.strip()[:150]))
                                # Only get first few matches per file
                                if len([r for r in results if r[0] == path]) >= 5:
                                    break
                except Exception:
                    pass
    return results

terms = ["SessionTimeoutModal", "SessionTimeout", "current_tenant_id", "tnt-acme"]
for t in terms:
    print(f"\nSearching for '{t}'...")
    res = search_text("/Users/sudhir88/Desktop/CustomerSelfService/frontend/.next", t)
    print(f"Found {len(res)} matches:")
    for path, line_no, snippet in res[:10]:
        print(f"  {path}:{line_no} -> {snippet}")

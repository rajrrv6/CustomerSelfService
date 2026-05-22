with open("/Users/sudhir88/Desktop/CustomerSelfService/src/i18n/en.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()

in_portal = False
portal_lines = []
brace_count = 0

for line in lines:
    if "portal: {" in line:
        in_portal = True
    if in_portal:
        portal_lines.append(line)
        brace_count += line.count("{")
        brace_count -= line.count("}")
        if brace_count == 0 and len(portal_lines) > 1:
            break

with open("/Users/sudhir88/Desktop/CustomerSelfService/en_portal.txt", "w", encoding="utf-8") as out:
    out.writelines(portal_lines)

print("Wrote en_portal.txt")

import json
from difflib import get_close_matches

RED = "\033[91m"
RESET = "\033[0m"

with open("data-files/ending-j.json") as f:
    data = json.load(f)

replacements = []

for word, entry in data.items():
    for defn in entry["definitions"]:
        text = defn["definition"]
        tokens = text.split()
        matches = [t for t in tokens if get_close_matches(word, [t], n=1, cutoff=0.6)]
        if matches:
            highlighted = text
            for m in matches:
                highlighted = highlighted.replace(m, f"{RED}{m}{RESET}", 1)
            print(f"{word}\t{highlighted}")
            for m in matches:
                try:
                    user_in = input(f"  \"{m}\" -> Enter to skip, or replacement: ").strip()
                except (EOFError, KeyboardInterrupt):
                    print()
                    user_in = ""
                if user_in:
                    replacements.append((defn, m, user_in))

if replacements:
    for defn, old, new in replacements:
        defn["definition"] = defn["definition"].replace(old, new, 1)

    with open("data-files/ending-j-new.json", "w") as f:
        json.dump(data, f, indent=4)
    print(f"Wrote ending-j-new.json with {len(replacements)} replacement(s)")
else:
    print("No changes made.")

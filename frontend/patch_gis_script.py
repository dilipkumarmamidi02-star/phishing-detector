path = "index.html"
with open(path) as f:
    content = f.read()

old = '''    <title>frontend</title>
  </head>'''
new = '''    <title>frontend</title>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
  </head>'''

if old in content:
    content = content.replace(old, new)
    print("index.html: GIS script tag added")
else:
    print("WARNING: index.html anchor not found")

with open(path, "w") as f:
    f.write(content)

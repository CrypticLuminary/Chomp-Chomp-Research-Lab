"""E003: direct upstream parser reproduction; stdlib Python.
Usage: python this_file.py /path/to/chapter-llama/src/test/utils_chapters.py
Fetch pinned d19a77efcf583f63771de052267fdeea016510e9 file separately.
"""
import hashlib, importlib.util, json, sys
from pathlib import Path
p=Path(sys.argv[1])
data=p.read_bytes()
assert hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()=="752f70be64c38b4fb7a33715cde16e565a085898"
spec=importlib.util.spec_from_file_location("upstream_parser",p)
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
cases=[("singleton","00:00:00 - Ordinary recording","00:10:00"),("duplicate","00:00:00 - Start\n00:00:00 - Replacement\n00:01:00 - Next","00:10:00"),("outside without duration","00:00:00 - Start\n09:00:00 - Outside",None),("exact end","00:00:00 - Start\n00:10:00 - End","00:10:00"),("unordered with duration","00:02:00 - Later\n00:01:00 - Earlier","00:10:00"),("unanchored prose","We might start at 00:01:00 - Topic","00:10:00"),("unordered without duration","00:02:00 - Later\n00:01:00 - Earlier",None),("outside with duration","00:01:00 - Valid\n09:00:00 - Outside","00:10:00")]
for name,s,d in cases:
    print(json.dumps({"case":name,"output":module.filter_chapters(module.extract_chapters(s),d)}))


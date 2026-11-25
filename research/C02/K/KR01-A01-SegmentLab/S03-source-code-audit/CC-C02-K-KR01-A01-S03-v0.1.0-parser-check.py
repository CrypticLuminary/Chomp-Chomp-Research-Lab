"""KR01 E001: faithful standalone reconstruction of inspected parser logic.
Python 3.13.5. Does not import upstream or run model. Run: python <this-file>.
Source: lucas-ventura/chapter-llama d19a77efcf583f63771de052267fdeea016510e9
src/test/utils_chapters.py lines 4-62.
"""
import re,json
def extract_chapters(output):
    pattern=r'(\d{2}:[0-5]\d:[0-5]\d)\b'
    chapters={}
    if isinstance(output,str): output=output.split('\n')
    for line in output:
        if len(line)==0: continue
        match=re.search(pattern,line)
        if match:
            time=match.group(1)
            title=re.sub(pattern,'',line).strip().lstrip(' -:').strip()
            if len(title)>0: chapters[time]=title
    return chapters
def filter_chapters(chapters,vid_duration=None):
    if vid_duration:
        filtered={}
        for k,v in sorted(chapters.items()):
            if k>vid_duration: break
            filtered[k]=v
        chapters=filtered
    times=list(chapters.keys())
    for i in range(1,len(times)):
        if times[i]<times[i-1]: return {}
    chapters={k:v for k,v in chapters.items() if len(v)>0}
    if len(chapters)==1 and list(chapters.keys())[0]=='00:00:00': return {}
    return chapters
cases=[('single valid chapter','00:00:00 - Ordinary recording','00:10:00'),('duplicate','00:00:00 - Start\n00:00:00 - Replacement\n00:01:00 - Next','00:10:00'),('outside no duration','00:00:00 - Start\n09:00:00 - Outside',None),('exact end','00:00:00 - Start\n00:10:00 - End','00:10:00'),('out of order','00:02:00 - Later\n00:01:00 - Earlier','00:10:00'),('unanchored prose','We might start at 00:01:00 - Topic','00:10:00')]
if __name__=='__main__':
    for name,s,d in cases: print(json.dumps({'case':name,'output':filter_chapters(extract_chapters(s),d)}))


# E001: transcribed equivalent operations, not direct upstream import.
import numpy as np
def graph_to_indices(graph,max_n_gt,threshold):
    graph=graph.copy(); graph[0]=graph[1]
    indices=np.nonzero(graph>threshold)[0]
    return indices[np.argsort(graph[indices])[::-1]][:max_n_gt].tolist()
def ap(gt,pred):
    if len(gt)==0:return 1 if len(pred)==0 else 0
    a=0; hits=0
    for i,p in enumerate(pred):
        if p in gt:
            hits+=1; a+=hits/(i+1)
    return a/len(gt)
print("numpy",np.__version__)
print("intro-only",graph_to_indices(np.array([1.,.1,.1]),20,.5))
print("threshold equality",graph_to_indices(np.array([0.,.5,.6]),20,.5))
print("duplicated AP",ap([3],[3,3]))
print("empty correct",ap([],[]),"empty false",ap([],[2]))
for n in [1,2,4]:
    print("one active of",n,"support+diversity+boundary",round(.30/n+.25/4+.20/n,4))

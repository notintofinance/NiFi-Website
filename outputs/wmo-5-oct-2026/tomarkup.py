"""Dump Key Highlights paragraphs of a slide as *italic* / **bold** markup, plus run-property variety."""
import sys
from lxml import etree
A='{http://schemas.openxmlformats.org/drawingml/2006/main}'
P='{http://schemas.openxmlformats.org/presentationml/2006/main}'
def kh_paras(tree):
    for sp in tree.iter(P+'sp'):
        nm=sp.find('.//'+P+'cNvPr').get('name')
        txt=''.join(t.text or '' for t in sp.iter(A+'t'))
        if txt.startswith('Key Highlights'):
            return sp, [p for p in sp.iter(A+'p')]
def markup(p):
    out=[]; props=set()
    for r in p.findall(A+'r'):
        rpr=r.find(A+'rPr'); t=r.find(A+'t').text or ''
        b=rpr is not None and rpr.get('b')=='1'; i=rpr is not None and rpr.get('i')=='1'
        if rpr is not None:
            props.add(tuple(sorted((k,v) for k,v in rpr.attrib.items() if k not in('b','i','dirty','err'))) + tuple(etree.QName(c).localname+':'+(c[0].get('val','') if len(c) else '') for c in rpr))
        mk='***' if b and i else '**' if b else '*' if i else ''
        out.append((mk,t))
    # merge adjacent same-format runs
    merged=[]
    for mk,t in out:
        if merged and merged[-1][0]==mk: merged[-1]=(mk,merged[-1][1]+t)
        else: merged.append((mk,t))
    s=''
    for mk,t in merged:
        if mk and t.strip():
            lead=t[:len(t)-len(t.lstrip())]; trail=t[len(t.rstrip()):]
            s+=lead+mk+t.strip()+mk+trail
        else: s+=t
    return s, props
if __name__=='__main__':
    t=etree.parse(sys.argv[1])
    sp,ps=kh_paras(t)
    for k,p in enumerate(ps):
        s,props=markup(p)
        print(f'[{k}]',repr(s)); print('   props:',props)

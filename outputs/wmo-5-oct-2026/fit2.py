import pymupdf, sys
d=pymupdf.open(sys.argv[1])
for pn in (0,1,2):
    pg=d[pn]; body=[]; ex_top=99
    for b in pg.get_text('dict')['blocks']:
        lines=b.get('lines',[])
        if not lines: continue
        first=''.join(s['text'] for s in lines[0]['spans'])
        if first.startswith('Exhibit'):
            ex_top=min(ex_top,lines[0]['bbox'][1]/72); continue
        for l in lines:
            t=''.join(s['text'] for s in l['spans']); y0,y1=l['bbox'][1]/72,l['bbox'][3]/72
            sz=max(s['size'] for s in l['spans'])
            if 3.0<y0<8.2 and abs(sz-11)<0.3 and l['bbox'][0]/72<1.2 and t.strip() not in('1.','2.','3.'): body.append((round(y0,2),round(y1,2),len(t),t[:45]))
    body.sort()
    print(f'page {pn+1}: lines={len(body)} last bottom={body[-1][1]} exhibit top={ex_top:.2f} gap={ex_top-body[-1][1]:.2f} short={[x[3] for x in body if x[2]<30]}')
    if '-v' in sys.argv:
        for x in body: print('    ',x)

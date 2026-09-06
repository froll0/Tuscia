# -*- coding: utf-8 -*-
"""Convertitore markdown -> HTML su misura per i fascicoli della Tuscia."""
import re, html

def esc(s):
    return html.escape(s, quote=False)

def inline(s):
    s = esc(s)
    s = s.replace(r'\+', '+')
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'(?<!\*)\*([^*\n]+)\*(?!\*)', r'<em>\1</em>', s)
    s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'\1', s)
    def fill(m):
        w = min(len(m.group(0)) * 0.40, 26)
        return '<span class="fill" style="min-width:%.1fem"></span>' % w
    s = re.sub(r'_{3,}', fill, s)
    return s

def cells(line):
    line = line.strip()
    if line.startswith('|'): line = line[1:]
    if line.endswith('|'): line = line[:-1]
    return [c.strip() for c in line.split('|')]

HEAD_NUM = re.compile(r'^([0-9]{1,2}|[A-Z])\.\s+(.*)$')

def convert(md, level_shift=1):
    lines = md.split('\n')
    out = []
    i = 0
    n = len(lines)

    def flush_para(buf):
        if buf:
            out.append('<p>' + inline(' '.join(buf)) + '</p>')
        return []

    para = []
    while i < n:
        ln = lines[i]
        st = ln.strip()

        # riga vuota
        if not st:
            para = flush_para(para)
            i += 1
            continue

        # regola orizzontale
        if re.fullmatch(r'-{3,}', st):
            para = flush_para(para)
            out.append('<hr>')
            i += 1
            continue

        # titoli
        m = re.match(r'^(#{1,6})\s+(.*)$', st)
        if m:
            para = flush_para(para)
            lvl = min(len(m.group(1)) + level_shift, 6)
            txt = m.group(2).strip()
            mark = ''
            hm = HEAD_NUM.match(txt)
            if hm and lvl <= 3:
                mark = hm.group(1)
                txt = hm.group(2)
            attr = ' data-mark="%s"' % esc(mark) if mark else ''
            out.append('<h%d%s>%s</h%d>' % (lvl, attr, inline(txt), lvl))
            i += 1
            continue

        # tabella
        if st.startswith('|') and i + 1 < n and re.fullmatch(r'\|[\s:|-]+\|', lines[i+1].strip()):
            para = flush_para(para)
            head = cells(ln)
            i += 2
            body = []
            while i < n and lines[i].strip().startswith('|'):
                body.append(cells(lines[i]))
                i += 1
            t = ['<div class="tabella"><table><thead><tr>']
            for c in head:
                t.append('<th%s>%s</th>' % ('' if c else ' class="vuota"', inline(c)))
            t.append('</tr></thead><tbody>')
            for row in body:
                t.append('<tr>')
                for c in row:
                    t.append('<td%s>%s</td>' % ('' if c else ' class="vuota"', inline(c)))
                t.append('</tr>')
            t.append('</tbody></table></div>')
            out.append(''.join(t))
            continue

        # citazione
        if st.startswith('>'):
            para = flush_para(para)
            block = []
            while i < n and lines[i].strip().startswith('>'):
                block.append(re.sub(r'^\s*>\s?', '', lines[i]).rstrip())
                i += 1
            paras, cur = [], []
            for b in block:
                if b.strip():
                    cur.append(b.strip())
                else:
                    if cur: paras.append(cur); cur = []
            if cur: paras.append(cur)
            testo = '\n'.join(block)
            klass = 'epigrafe' if '«' in testo else 'regola'
            t = ['<blockquote class="%s">' % klass]
            for pr in paras:
                cite = ''
                if len(pr) > 1 and pr[-1].startswith('—'):
                    cite = pr[-1]
                    pr = pr[:-1]
                if pr:
                    brk = all(x.startswith('**') for x in pr) or all(len(x) < 64 for x in pr)
                    joiner = '<br>' if (brk and len(pr) > 1) else ' '
                    # si unisce prima, poi si formatta: il grassetto puo' scavalcare l'a capo
                    grezzo = '\x00'.join(pr)
                    t.append('<p>' + inline(grezzo).replace('\x00', joiner) + '</p>')
                if cite:
                    t.append('<p class="fonte">' + inline(cite) + '</p>')
            t.append('</blockquote>')
            out.append(''.join(t))
            continue

        # liste
        if re.match(r'^\s*(?:[-*]\s+|\d+\.\s+)', ln):
            para = flush_para(para)
            out.append(parse_list(lines, i)[0])
            i = parse_list(lines, i)[1]
            continue

        para.append(st)
        i += 1

    flush_para(para)
    return '\n'.join(out)

def parse_list(lines, i):
    n = len(lines)
    base_indent = len(lines[i]) - len(lines[i].lstrip())
    ordered = bool(re.match(r'^\s*\d+\.\s+', lines[i]))
    items = []
    cur = None
    while i < n:
        ln = lines[i]
        if not ln.strip():
            # una riga vuota chiude la lista solo se la successiva non e' rientrata
            if i + 1 < n and lines[i+1].strip() and (len(lines[i+1]) - len(lines[i+1].lstrip())) > base_indent:
                i += 1
                continue
            break
        ind = len(ln) - len(ln.lstrip())
        m = re.match(r'^\s*(?:[-*]|\d+\.)\s+(.*)$', ln)
        if m and ind == base_indent:
            if cur is not None: items.append(cur)
            cur = {'testo': [m.group(1).strip()], 'sotto': []}
            i += 1
            continue
        if ind > base_indent:
            sm = re.match(r'^\s*(?:[-*]|\d+\.)\s+(.*)$', ln)
            if sm and cur is not None:
                sub, i = parse_list(lines, i)
                cur['sotto'].append(sub)
                continue
            if cur is not None:
                cur['testo'].append(ln.strip())
                i += 1
                continue
        break
    if cur is not None: items.append(cur)
    tag = 'ol' if ordered else 'ul'
    t = ['<%s>' % tag]
    for it in items:
        t.append('<li>' + inline(' '.join(it['testo'])) + ''.join(it['sotto']) + '</li>')
    t.append('</%s>' % tag)
    return ''.join(t), i

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { marked, type Token } from 'marked';

type Style = { bold?: boolean; italic?: boolean; mono?: boolean };
type Run = { text: string } & Style;
type Atom =
  | { type: 'nl' }
  | { type: 'sp' }
  | { type: 'word'; text: string; style: Style };

const stripInline = (s: string) =>
  s.replace(/\*\*/g, '').replace(/(^|[^*])\*(?!\*)/g, '$1').replace(/`/g, '');

/**
 * Build a text-based PDF document from Markdown.
 * Avoids html2canvas (and therefore the project's oklch colors) entirely,
 * producing selectable text, real tables, and proper pagination.
 * Exported (separately from saving) so the layout can be unit-tested.
 */
export function renderMarkdownToDoc(markdown: string, existingDoc?: jsPDF): jsPDF {
  const doc = existingDoc ?? new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  const bodySize = 10.5;
  const bodyLine = 15;

  let y = margin + 14;

  const ensure = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin + 14;
    }
  };

  const setFont = (style: Style) => {
    const family = style.mono ? 'courier' : 'helvetica';
    const fs =
      style.bold && style.italic
        ? 'bolditalic'
        : style.bold
        ? 'bold'
        : style.italic
        ? 'italic'
        : 'normal';
    doc.setFont(family, fs);
  };

  const flatten = (tokens: Token[] | undefined, style: Style = {}, out: Run[] = []): Run[] => {
    for (const t of tokens ?? []) {
      const tok = t as any;
      switch (tok.type) {
        case 'strong':
          flatten(tok.tokens, { ...style, bold: true }, out);
          break;
        case 'em':
          flatten(tok.tokens, { ...style, italic: true }, out);
          break;
        case 'codespan':
          out.push({ text: tok.text, ...style, mono: true });
          break;
        case 'link':
        case 'del':
          flatten(tok.tokens, style, out);
          break;
        case 'br':
          out.push({ text: '\n', ...style });
          break;
        case 'paragraph':
        case 'text':
          if (tok.tokens) flatten(tok.tokens, style, out);
          else out.push({ text: tok.text, ...style });
          break;
        case 'list':
          // Nested lists are handled separately by renderList; skip here.
          break;
        default:
          if (tok.text) out.push({ text: tok.text, ...style });
      }
    }
    return out;
  };

  const toAtoms = (runs: Run[]): Atom[] => {
    const atoms: Atom[] = [];
    for (const r of runs) {
      for (const p of r.text.split(/(\s+)/)) {
        if (p === '') continue;
        if (/\n/.test(p)) atoms.push({ type: 'nl' });
        else if (/^\s+$/.test(p)) atoms.push({ type: 'sp' });
        else atoms.push({ type: 'word', text: p, style: r });
      }
    }
    return atoms;
  };

  const drawRich = (
    tokens: Token[],
    opts: {
      x?: number;
      width?: number;
      fontSize?: number;
      lineHeight?: number;
      color?: [number, number, number];
      indent?: number;
      base?: Style;
    } = {}
  ) => {
    const {
      x = margin,
      width = contentW,
      fontSize = bodySize,
      lineHeight = bodyLine,
      color = [33, 37, 41],
      indent = 0,
      base = {},
    } = opts;

    const atoms = toAtoms(flatten(tokens));
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const left = x + indent;
    const right = x + width;
    let cx = left;
    ensure(lineHeight);

    const newLine = () => {
      cx = left;
      y += lineHeight;
      ensure(lineHeight);
    };

    for (const a of atoms) {
      if (a.type === 'nl') {
        newLine();
        continue;
      }
      if (a.type === 'sp') {
        setFont(base);
        doc.setFontSize(fontSize);
        if (cx > left) cx += doc.getTextWidth(' ');
        continue;
      }
      const style = { ...a.style, ...base };
      setFont(style);
      doc.setFontSize(fontSize);
      const w = doc.getTextWidth(a.text);
      if (cx + w > right && cx > left) newLine();
      doc.text(a.text, cx, y);
      cx += w;
    }

    // Advance the cursor below the last rendered line so the next block
    // (or list item) doesn't draw on top of this one.
    y += lineHeight;
  };

  const gap = (n: number) => {
    y += n;
  };

  const renderList = (listTok: any, level: number) => {
    const ordered = !!listTok.ordered;
    const start = typeof listTok.start === 'number' ? listTok.start : 1;
    const x = margin + level * 16;
    (listTok.items as any[]).forEach((item, i) => {
      const marker = ordered ? `${start + i}.` : level === 0 ? '•' : '-';
      const blocks = (item.tokens ?? []) as any[];
      const inlineBlocks = blocks.filter((b) => b.type !== 'list');
      const nestedLists = blocks.filter((b) => b.type === 'list');

      ensure(bodyLine);
      setFont({});
      doc.setFontSize(bodySize);
      doc.setTextColor(33, 37, 41);
      doc.text(marker, x + (ordered ? 0 : 2), y);
      drawRich(inlineBlocks, { x, indent: 16, width: contentW - level * 16 });

      for (const nested of nestedLists) renderList(nested, level + 1);
      gap(2);
    });
  };

  const tokens = marked.lexer(markdown);

  for (const token of tokens) {
    const t = token as any;
    switch (t.type) {
      case 'heading': {
        const depth = t.depth as number;
        const sizes: Record<number, number> = { 1: 20, 2: 16, 3: 13, 4: 11, 5: 10.5, 6: 10.5 };
        const size = sizes[depth] ?? 11;
        gap(depth <= 2 ? 10 : 6);
        ensure(size + 6);
        drawRich(t.tokens ?? [{ type: 'text', text: t.text }], {
          fontSize: size,
          lineHeight: size + 4,
          color: [17, 24, 39],
          base: { bold: true },
        });
        if (depth === 2) {
          gap(2);
          ensure(8);
          doc.setDrawColor(222, 226, 230);
          doc.setLineWidth(0.75);
          doc.line(margin, y, pageW - margin, y);
        }
        gap(6);
        break;
      }
      case 'paragraph': {
        drawRich(t.tokens, {});
        gap(4);
        break;
      }
      case 'list': {
        renderList(t, 0);
        gap(6);
        break;
      }
      case 'table': {
        const head = [(t.header as any[]).map((c) => stripInline(c.text))];
        const body = (t.rows as any[][]).map((r) => r.map((c) => stripInline(c.text)));
        autoTable(doc, {
          head,
          body,
          startY: y + 2,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 4,
            lineColor: [222, 226, 230],
            lineWidth: 0.5,
            textColor: [33, 37, 41],
          },
          headStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold' },
        });
        y = (doc as any).lastAutoTable.finalY + 14;
        break;
      }
      case 'hr': {
        gap(6);
        ensure(10);
        doc.setDrawColor(222, 226, 230);
        doc.setLineWidth(0.75);
        doc.line(margin, y, pageW - margin, y);
        gap(12);
        break;
      }
      case 'blockquote': {
        drawRich(t.tokens ?? [], {
          indent: 14,
          color: [107, 114, 128],
          base: { italic: true },
        });
        gap(4);
        break;
      }
      case 'code': {
        const lines = String(t.text).split('\n');
        doc.setFont('courier', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(33, 37, 41);
        for (const line of lines) {
          ensure(13);
          doc.text(line, margin + 4, y);
          y += 13;
        }
        gap(8);
        break;
      }
      case 'space':
        gap(6);
        break;
      default:
        if (t.text) {
          drawRich([{ type: 'text', text: t.text } as any], {});
          gap(4);
        }
    }
  }

  return doc;
}

/** Render Markdown to a PDF and trigger a browser download. */
export function downloadMarkdownAsPdf(markdown: string, title: string) {
  const doc = renderMarkdownToDoc(markdown);
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

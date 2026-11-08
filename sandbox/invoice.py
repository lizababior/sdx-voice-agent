"""Builds the invoice PDF. Runs in the Daytona sandbox.

ARGS (env): {"workOrder": {...}, "notes": [{id, text, category, item_code?, quantity?}]}
Prints JSON: {invoiceNumber, lineItems, subtotal, tax, total, pdfBase64, unpricedNotes}
Prices come only from price-book.csv. A note with an unknown item_code is not billed;
it is listed in unpricedNotes so the agent can say so.
"""
import base64
import csv
import io
import json
import os
import re
from datetime import date

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

SHOP = "Coastal Comfort HVAC"
TAX_RATE = 0.0775
HERE = os.path.dirname(os.path.abspath(__file__))


def price_book():
    with open(os.path.join(HERE, "price-book.csv")) as f:
        return {r["item_code"]: r for r in csv.DictReader(f)}


def money(x):
    return f"${x:,.2f}"


def work_performed(notes):
    """A short English paragraph from the notes, in the order the technician said them."""
    sentences = [n["text"].strip().rstrip(".") + "." for n in notes if n.get("text")]
    return " ".join(sentences) or "No work notes were logged."


def build(work_order, notes):
    book = price_book()
    line_items, unpriced = [], []
    for n in notes:
        code = (n.get("item_code") or "").strip().upper()
        if not code:
            continue
        item = book.get(code)
        if not item:
            unpriced.append({"note_id": n.get("id"), "item_code": code, "text": n.get("text", "")})
            continue
        qty = float(n.get("quantity") or 1)
        unit_price = float(item["price"])
        line_items.append({
            "item_code": code, "name": item["name"], "quantity": qty, "unit": item["unit"],
            "unit_price": unit_price, "amount": round(qty * unit_price, 2),
        })

    subtotal = round(sum(li["amount"] for li in line_items), 2)
    tax = round(subtotal * TAX_RATE, 2)
    total = round(subtotal + tax, 2)
    today = date.today()
    job_digits = re.sub(r"\D", "", str(work_order.get("job_id", ""))) or "0"
    invoice_number = f"INV-{job_digits}-{today:%Y%m%d}"
    summary = work_performed(notes)

    return {
        "invoiceNumber": invoice_number,
        "lineItems": line_items,
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "pdfBase64": pdf(work_order, invoice_number, today, line_items, subtotal, tax, total, summary),
        "unpricedNotes": unpriced,
    }


def pdf(wo, number, today, line_items, subtotal, tax, total, summary):
    styles = getSampleStyleSheet()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, leftMargin=0.75 * inch, rightMargin=0.75 * inch,
                            topMargin=0.75 * inch, bottomMargin=0.75 * inch, title=f"Invoice {number}")
    p = lambda text, style="Normal": Paragraph(text, styles[style])  # noqa: E731

    header = Table([[p(f"<b>{SHOP}</b>", "Title"), p(f"<b>Invoice {number}</b><br/>{today:%B %d, %Y}")]],
                   colWidths=[4 * inch, 3 * inch])
    info = Table([
        [p("<b>Customer</b>"), p(f"{wo.get('customer_name', '')}<br/>{wo.get('address', '')}")],
        [p("<b>Equipment</b>"), p(f"{wo.get('model') or wo.get('equipment', '')}, {wo.get('refrigerant', '')}")],
        [p("<b>Technician</b>"), p(wo.get("technician", ""))],
        [p("<b>Job</b>"), p(str(wo.get("job_id", "")))],
    ], colWidths=[1.3 * inch, 5.7 * inch])
    info.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))

    rows = [["Item", "Qty", "Unit price", "Amount"]]
    rows += [[p(li["name"]), f"{li['quantity']:g} {li['unit'] if li['unit'] == 'lb' else ''}".strip(),
              money(li["unit_price"]), money(li["amount"])] for li in line_items]
    rows += [["", "", "Subtotal", money(subtotal)],
             ["", "", f"Tax ({TAX_RATE * 100:g}%)", money(tax)],
             ["", "", "Total", money(total)]]
    n = len(line_items)
    items = Table(rows, colWidths=[3.8 * inch, 0.8 * inch, 1.2 * inch, 1.2 * inch])
    items.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("LINEBELOW", (0, 0), (-1, 0), 1, colors.black),
        ("LINEBELOW", (0, 1), (-1, n), 0.25, colors.lightgrey),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("FONTNAME", (2, -1), (-1, -1), "Helvetica-Bold"),
        ("LINEABOVE", (2, -1), (-1, -1), 1, colors.black),
    ]))

    doc.build([
        header, Spacer(1, 12), info, Spacer(1, 18), items, Spacer(1, 18),
        p("<b>Work performed</b>"), p(summary), Spacer(1, 18),
        p("<i>Status: Sent to office for review</i>"),
    ])
    return base64.b64encode(buf.getvalue()).decode()


if __name__ == "__main__":
    args = json.loads(os.environ.get("ARGS", "{}"))
    print(json.dumps(build(args.get("workOrder", {}), args.get("notes", []))))

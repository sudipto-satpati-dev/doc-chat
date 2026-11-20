import os
from pypdf import PdfWriter
from pypdf.annotations import FreeText

# Create raw_pdfs folder
raw_dir = os.path.join(os.path.dirname(__file__), "..", "data", "raw_pdfs")
os.makedirs(raw_dir, exist_ok=True)

# Using pypdf to generate a clean PDF with text stream
def create_pdf(filepath, pages_text):
    writer = PdfWriter()
    for page_num, text in enumerate(pages_text, 1):
        page = writer.add_blank_page(width=612, height=792)
        annotation = FreeText(
            text=text,
            rect=(50, 50, 550, 740),
            font="Helvetica",
            bold=True,
            font_size="12pt",
            font_color="000000",
            border_color="FFFFFF",
            background_color="FFFFFF",
        )
        writer.add_annotation(page_number=page_num-1, annotation=annotation)
    
    with open(filepath, "wb") as f:
        writer.write(f)

# Better: Write straightforward text via reportlab if available, or generate standard PDF binary
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

    def make_pdf_reportlab(filepath, pages_data):
        c = canvas.Canvas(filepath, pagesize=letter)
        for p_idx, text_lines in enumerate(pages_data, 1):
            c.setFont("Helvetica-Bold", 16)
            c.drawString(50, 750, f"Document: {os.path.basename(filepath)} - Page {p_idx}")
            c.setFont("Helvetica", 11)
            y = 710
            for line in text_lines:
                c.drawString(50, y, line)
                y -= 20
                if y < 50:
                    c.showPage()
                    c.setFont("Helvetica", 11)
                    y = 750
            c.showPage()
        c.save()

    doc1_pages = [
        [
            "Enterprise SaaS Master Service Agreement 2024",
            "--------------------------------------------------------------------------------",
            "1. Overview & Scope of Services",
            "This Agreement governs the provision of cloud infrastructure services to Enterprise Customers.",
            "2. Subscription Fees & Payment Terms",
            "All invoices are due net 30 days from receipt.",
            "3. Service Level Agreement (SLA) & Uptime",
            "Provider guarantees 99.99% monthly uptime. SLA breaches permit immediate termination with full credit back.",
        ],
        [
            "4. Term, Termination & Refund Policy",
            "Section 4.1 Initial Term: The minimum initial contract period for Enterprise tier is 12 calendar months.",
            "Section 4.2 Cancellation, Termination & Refund Policy:",
            "If Customer terminates an active Enterprise Subscription prior to expiration of the committed Minimum Initial Term:",
            "- Termination within the first 30 days: Customer is eligible for a 100% prorated refund of unused prepaid platform fees.",
            "- Termination after 30 days: Fees are non-refundable for committed annual tiers, though unused credits may transfer.",
            "- SLA breaches: Service Level Agreement breaches permit immediate termination with full credit back.",
            "5. Data Protection & Security (GDPR & SOC2)",
            "Provider maintains SOC2 Type II compliance and ISO27001 certification."
        ]
    ]

    doc2_pages = [
        [
            "Product Onboarding & Quickstart Guide",
            "--------------------------------------------------------------------------------",
            "Welcome to the Enterprise Platform!",
            "1. Getting Started - 30-60-90 Day Trajectory",
            "Milestone 1 (Days 1-30): Workspace Scaffolding & Vector Indexing Setup.",
            "Milestone 2 (Days 31-60): SSO Integration & Team Role Management.",
            "Milestone 3 (Days 61-90): Advanced Retrieval Fine-Tuning & Custom Grounding Rules.",
            "2. Document Indexing Best Practices",
            "Ensure PDFs are text-searchable. Scanned image PDFs require optical character recognition (OCR).",
            "Recommended chunk size is 700 tokens with 100 token overlap."
        ]
    ]

    make_pdf_reportlab(os.path.join(raw_dir, "Enterprise_SaaS_Master_Agreement.pdf"), doc1_pages)
    make_pdf_reportlab(os.path.join(raw_dir, "Product_Onboarding_Guide.pdf"), doc2_pages)
    print("Created sample PDFs via reportlab.")

except ImportError:
    print("ReportLab not installed, creating dummy text files or standard PDF writer.")

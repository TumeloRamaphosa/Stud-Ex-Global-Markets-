#!/usr/bin/env python3
"""Generate a professional PDF market audit report for Studex Meat using ReportLab."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)

OUTPUT = "/home/user/Stud-Ex-Global-Markets-/Market-Audit-StudexMeat-Rump-Steak.pdf"
W, H = A4

# Colors
DARK = HexColor("#1e1e1e")
MID = HexColor("#3c3c3c")
GRAY = HexColor("#606060")
LIGHT_GRAY = HexColor("#a0a0a0")
BLUE = HexColor("#0078c8")
GREEN = HexColor("#2ea043")
AMBER = HexColor("#e6a01e")
RED = HexColor("#dc3c3c")
BG_LIGHT = HexColor("#f5f5fa")
BG_HEADER = HexColor("#28282f")


def build():
    doc = SimpleDocTemplate(
        OUTPUT, pagesize=A4,
        leftMargin=18*mm, rightMargin=18*mm,
        topMargin=20*mm, bottomMargin=20*mm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    s_cover_title = ParagraphStyle("CoverTitle", parent=styles["Title"],
        fontSize=28, leading=34, textColor=DARK, alignment=TA_CENTER, spaceAfter=12)
    s_cover_sub = ParagraphStyle("CoverSub", parent=styles["Normal"],
        fontSize=16, leading=20, textColor=GRAY, alignment=TA_CENTER, spaceAfter=8)
    s_cover_meta = ParagraphStyle("CoverMeta", parent=styles["Normal"],
        fontSize=11, leading=14, textColor=LIGHT_GRAY, alignment=TA_CENTER, spaceAfter=6)
    s_score_big = ParagraphStyle("ScoreBig", parent=styles["Title"],
        fontSize=48, leading=52, textColor=AMBER, alignment=TA_CENTER, spaceAfter=4)
    s_score_label = ParagraphStyle("ScoreLabel", parent=styles["Normal"],
        fontSize=12, leading=14, textColor=LIGHT_GRAY, alignment=TA_CENTER, spaceAfter=20)

    s_section = ParagraphStyle("Section", parent=styles["Heading1"],
        fontSize=15, leading=18, textColor=DARK, spaceBefore=16, spaceAfter=6,
        borderColor=BLUE, borderWidth=2, borderPadding=(0,0,4,0))
    s_sub = ParagraphStyle("Sub", parent=styles["Heading2"],
        fontSize=12, leading=15, textColor=MID, spaceBefore=10, spaceAfter=4)
    s_body = ParagraphStyle("Body", parent=styles["Normal"],
        fontSize=10, leading=14, textColor=GRAY, spaceAfter=4)
    s_bold = ParagraphStyle("Bold", parent=s_body, fontName="Helvetica-Bold")
    s_bullet = ParagraphStyle("Bullet", parent=s_body,
        leftIndent=14, bulletIndent=4, bulletFontSize=10)
    s_small = ParagraphStyle("Small", parent=styles["Normal"],
        fontSize=9, leading=12, textColor=LIGHT_GRAY, alignment=TA_CENTER)
    s_tbl_h = ParagraphStyle("TblH", parent=styles["Normal"],
        fontSize=9, leading=11, textColor=white, fontName="Helvetica-Bold")
    s_tbl = ParagraphStyle("Tbl", parent=styles["Normal"],
        fontSize=9, leading=12, textColor=GRAY)

    story = []

    def sec(t): story.append(Paragraph(t, s_section))
    def sub(t): story.append(Paragraph(t, s_sub))
    def body(t): story.append(Paragraph(t, s_body))
    def bold(t): story.append(Paragraph(t, s_bold))
    def bullet(t): story.append(Paragraph(t, s_bullet, bulletText="\u2022"))
    def sp(n=6): story.append(Spacer(1, n))
    def hr(): story.append(HRFlowable(width="40%", thickness=1, color=BLUE, spaceAfter=10, spaceBefore=10))

    def make_table(headers, rows, widths=None):
        tw = 174*mm
        if widths is None:
            widths = [tw / len(headers)] * len(headers)
        else:
            total = sum(widths)
            widths = [w/total * tw for w in widths]
        data = [[Paragraph(h, s_tbl_h) for h in headers]]
        for row in rows:
            data.append([Paragraph(c, s_tbl) for c in row])
        t = Table(data, colWidths=widths, repeatRows=1)
        style_cmds = [
            ("BACKGROUND", (0,0), (-1,0), BG_HEADER),
            ("TEXTCOLOR", (0,0), (-1,0), white),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE", (0,0), (-1,0), 9),
            ("BOTTOMPADDING", (0,0), (-1,0), 6),
            ("TOPPADDING", (0,0), (-1,0), 6),
            ("GRID", (0,0), (-1,-1), 0.5, HexColor("#cccccc")),
            ("VALIGN", (0,0), (-1,-1), "TOP"),
            ("LEFTPADDING", (0,0), (-1,-1), 6),
            ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ]
        for i in range(1, len(data)):
            if i % 2 == 0:
                style_cmds.append(("BACKGROUND", (0,i), (-1,i), BG_LIGHT))
        t.setStyle(TableStyle(style_cmds))
        story.append(t)
        sp(8)

    # ========== COVER PAGE ==========
    sp(50)
    story.append(Paragraph("Market Audit Report", s_cover_title))
    story.append(Paragraph("Studex Meat — Wagyu Rump Steak", s_cover_sub))
    hr()
    story.append(Paragraph("URL: https://studexmeat.com/products/rump-steak", s_cover_meta))
    story.append(Paragraph("Date: April 2026", s_cover_meta))
    story.append(Paragraph("Audit Type: Full Marketing &amp; Conversion Audit", s_cover_meta))
    sp(30)
    story.append(Paragraph("62 / 100", s_score_big))
    story.append(Paragraph("Overall Score", s_score_label))
    sp(30)
    story.append(Paragraph("Generated by Studex Global Markets AI Marketing Audit Engine", s_small))
    story.append(PageBreak())

    # ========== 1. EXECUTIVE SUMMARY ==========
    sec("1. EXECUTIVE SUMMARY")
    body(
        "Studex Meat is a premium South African Halal-certified Wagyu beef e-commerce brand built on Shopify. "
        "The <b>Wagyu Rump Steak</b> product page is well-designed with strong luxury positioning, but has "
        "<b>critical conversion gaps</b> that are likely leaving revenue on the table — particularly in social proof, "
        "content depth, and urgency mechanics. This audit identifies <b>23 actionable fixes</b> across 7 categories."
    )
    sp(8)
    sub("Category Scores")
    make_table(
        ["Category", "Score", "Priority"],
        [
            ["Brand &amp; Positioning", "8 / 10", "Solid"],
            ["Product Page UX", "6 / 10", "Needs Work"],
            ["Social Proof &amp; Trust", "4 / 10", "CRITICAL"],
            ["SEO &amp; Discoverability", "5 / 10", "Needs Work"],
            ["Conversion Mechanics", "5 / 10", "CRITICAL"],
            ["Content &amp; Storytelling", "5 / 10", "Needs Work"],
            ["Competitive Position", "7 / 10", "Solid"],
        ],
        widths=[3, 1.5, 1.5]
    )
    story.append(PageBreak())

    # ========== 2. PRODUCT PAGE BREAKDOWN ==========
    sec("2. PRODUCT PAGE BREAKDOWN")
    sub("What's on the Page")
    bold("Product: Wagyu Rump Steak")
    body("Pricing:")
    bullet("1kg: <b>R850</b> (was R1,189 — 28% off)")
    bullet("500g: <b>R450</b> (was R68.90 — pricing error likely)")
    sp(4)
    body("Images: 6 product photos (packaged shots, raw cuts, branded merch)")
    body("CTAs: 'Add to Cart' (x2), 'View Full Details', quantity selector")
    body("Certifications: Halal Certified")
    body("Claims: 'No fillers, no artificial binders, no added MSG, 100% Wagyu beef'")
    body("Reviews: 5.0 stars (1 review only)")
    body("Shipping: 3–7 business days, international available")
    story.append(PageBreak())

    # ========== 3. CRITICAL ISSUES ==========
    sec("3. CRITICAL ISSUES (Fix Immediately)")

    sub("3.1  Pricing Error on 500g Variant")
    body(
        "The 500g variant shows a 'regular' price of <b>R68.90</b> crossed out with a sale price of <b>R450</b>. "
        "This is clearly inverted — the sale price is higher than the regular price. "
        "This <b>destroys trust instantly</b> and signals carelessness to premium buyers."
    )
    bold("Fix: Correct the 500g regular price (likely ~R629 to maintain the ~28% discount structure).")
    sp(6)

    sub("3.2  Only 1 Review = Zero Social Proof")
    body(
        "A single 5-star review on a premium product (R450–R850) is worse than no reviews at all. "
        "Premium buyers need validation before spending."
    )
    bold("Fix:")
    bullet("Launch a post-purchase email sequence requesting reviews (offer 10% off next order)")
    bullet("Add photo reviews (Judge.me, Loox, or Stamped.io for Shopify)")
    bullet("Display review count prominently — aim for 15+ reviews within 60 days")
    bullet("Add a 'Customer Photos' section below the product")
    sp(6)

    sub("3.3  No Cooking / Preparation Guidance")
    body(
        "You're selling a premium cut that many buyers may not know how to prepare properly. "
        "A bad cooking experience = no repeat purchase."
    )
    bold("Fix:")
    bullet("Add 'How to Cook Wagyu Rump Steak' tab with temps, methods, resting time")
    bullet("Include pan-sear vs. braai instructions")
    bullet("Embed a short (60–90s) cooking video")
    story.append(PageBreak())

    # ========== 4. CONVERSION OPTIMIZATION ==========
    sec("4. CONVERSION OPTIMIZATION (High Impact)")

    sub("4.1  No Real Urgency Mechanics")
    body("The page says 'limited time offer' but has no countdown timer, no stock indicator, and no deadline.")
    bold("Fix:")
    bullet("Add a countdown timer to the sale")
    bullet("Show 'Only X left in stock' inventory indicator")
    bullet("Add 'X people are viewing this right now' (social proof + urgency)")
    sp(6)

    sub("4.2  Missing Nutritional Information")
    body("Health-conscious premium buyers want macros — protein, fat, calories. Table stakes for premium meat e-commerce.")
    bold("Fix: Add a nutritional info tab with per-100g macros. Highlight protein content.")
    sp(6)

    sub("4.3  Weak Product Description")
    body("Current copy is generic luxury language ('savory journey'). It tells the buyer nothing specific about THIS cut.")
    bold("Fix — Rewrite to include:")
    bullet("Marble score / grade")
    bullet("Farm origin (Phala Phala farm — mentioned on homepage)")
    bullet("Aging method (wet-aged, dry-aged?)")
    bullet("Feed program (grass-fed, grain-finished?)")
    bullet("Exact cut thickness and weight tolerance")
    bullet("Best use case (braai, pan-sear, oven roast)")
    sp(6)

    sub("4.4  No Cross-Sell / Bundle Offer")
    bold("Fix:")
    bullet("Add 'Complete Your Braai' bundle (rump + sides + seasoning)")
    bullet("Show 'Customers Also Bought' carousel")
    bullet("Offer 'Subscribe &amp; Save 15%' for repeat buyers")
    bullet("Promote the Easy Wagyu Box as an upsell")
    sp(6)

    sub("4.5  No Abandoned Cart Recovery")
    bold("Fix:")
    bullet("Add exit-intent popup with 5% off or free shipping threshold")
    bullet("Set up 3-email abandoned cart sequence (1hr, 24hr, 72hr)")
    bullet("Include product image + review snippet in abandonment emails")
    story.append(PageBreak())

    # ========== 5. SEO ==========
    sec("5. SEO &amp; DISCOVERABILITY")
    sub("Current State")
    bullet("Title Tag: 'Wagyu Rump Steak – Studex Meat' (decent but not optimized)")
    bullet("Structured Data: Product schema present (good)")
    bullet("Alt Text: Present on images (good)")
    sp(6)
    sub("Improvements Needed")
    make_table(
        ["Issue", "Fix"],
        [
            ["Title tag too short", "Change to: 'Premium Wagyu Rump Steak | Halal Certified | Studex Meat SA'"],
            ["No meta description", "Add: 'Order premium SA Wagyu Rump Steak. Halal certified, no fillers. From R850.'"],
            ["No blog content for SEO", "Write: 'How to Cook Wagyu Rump,' 'Wagyu vs Regular Beef,' 'Best Braai Cuts'"],
            ["Missing FAQ schema", "Add FAQ structured data for delivery questions"],
            ["No internal linking", "Link from Carnivore Connoisseur blog to product pages"],
        ],
        widths=[2, 4]
    )
    story.append(PageBreak())

    # ========== 6. COMPETITIVE LANDSCAPE ==========
    sec("6. COMPETITIVE LANDSCAPE")
    sub("Direct Competitors in South Africa")
    make_table(
        ["Competitor", "Strengths", "Weaknesses"],
        [
            ["Zuney Wagyu", "Eastern Cape heritage, restaurant partnerships", "Limited online presence"],
            ["Rusticana Farm", "Strong farm-to-table story, Highveld sourcing", "Smaller product range"],
            ["Silent Valley Wagyu", "National production network, bespoke positioning", "Premium pricing, less accessible"],
            ["Block Men Beef", "Halal certified, dry-aged options", "Less polished branding"],
            ["L.A. Farms", "Wagyu Society certified, established credibility", "Limited e-commerce experience"],
        ],
        widths=[2, 3, 3]
    )
    sub("Studex Meat's Competitive Advantages")
    bullet("<b>Halal + Premium</b> — Few competitors own both positions")
    bullet("<b>Shopify infrastructure</b> — Better e-commerce UX than most competitors")
    bullet("<b>Product range</b> — Wagyu + Ankole + Coffee + Biltong = higher AOV potential")
    bullet("<b>Content engine</b> — Carnivore Connoisseur blog exists (needs activation)")
    bullet("<b>International shipping</b> — Most competitors are SA-only")
    sp(6)
    sub("Competitive Gaps to Close")
    bullet("Farm story is buried — competitors lead with origin stories")
    bullet("No marble score / grading system displayed (Zuney and L.A. Farms do this)")
    bullet("No subscription model (Block Men Beef offers this)")
    story.append(PageBreak())

    # ========== 7. CONTENT STRATEGY ==========
    sec("7. CONTENT &amp; SOCIAL MEDIA STRATEGY")
    sub("Recommended Content Pillars")
    make_table(
        ["Pillar", "Content Ideas", "Platform"],
        [
            ["Education", "How to cook Wagyu rump / What marble score means", "TikTok, IG Reels"],
            ["Behind the Scenes", "Farm visits, butchery process, quality checks", "IG Stories, TikTok"],
            ["Social Proof", "Customer unboxing, cooking results, testimonials", "IG Feed, TikTok"],
            ["Urgency / FOMO", "'Only 50 packs this week' / flash sale countdowns", "IG Stories"],
            ["Lifestyle", "Braai setups, dinner party hosting, pairing guides", "IG Feed, Pinterest"],
        ],
        widths=[2, 4, 2]
    )
    sub("Hook Ideas for Short-Form Video (TikTok / Reels)")
    bullet("'This R850 steak changed how I braai forever'")
    bullet("'I tested R850 Wagyu vs R150 rump steak — here's what happened'")
    bullet("'The one thing 90% of people get wrong cooking Wagyu'")
    bullet("'POV: You just opened a Studex Meat delivery box'")
    bullet("'Why this South African farm produces some of the best beef in Africa'")
    sp(8)

    # ========== 8. EMAIL MARKETING ==========
    sec("8. EMAIL MARKETING RECOMMENDATIONS")
    sub("Flows to Implement")
    bullet("<b>Welcome Series</b> (3 emails): Brand story > Best sellers > 10% off first order")
    bullet("<b>Abandoned Cart</b> (3 emails): 1hr reminder > 24hr social proof > 72hr last chance")
    bullet("<b>Post-Purchase</b> (3 emails): Cooking guide > Review request > Cross-sell related cuts")
    bullet("<b>Win-Back</b> (2 emails): 30-day 'We miss you' > 60-day exclusive offer")
    bullet("<b>VIP / Repeat Buyer</b> (monthly): Early access to new cuts, exclusive bundles")
    story.append(PageBreak())

    # ========== 9. 30-DAY ACTION PLAN ==========
    sec("9. QUICK WINS — 30-DAY ACTION PLAN")

    sub("Week 1: Fix the Foundations")
    bullet("Fix 500g pricing error immediately")
    bullet("Add nutritional information")
    bullet("Write proper product description with farm origin, marble score, aging method")
    bullet("Add cooking instructions tab")
    sp(6)

    sub("Week 2: Build Trust")
    bullet("Install review app (Judge.me or Loox)")
    bullet("Send review request to all past buyers")
    bullet("Add 'Halal Certified' badge as a visible icon (not just text)")
    bullet("Add farm origin story section to product page")
    sp(6)

    sub("Week 3: Optimize for Conversion")
    bullet("Add countdown timer to sale")
    bullet("Add stock quantity indicator")
    bullet("Create 'Complete Your Braai' bundle")
    bullet("Set up abandoned cart email flow")
    bullet("Add exit-intent popup")
    sp(6)

    sub("Week 4: Scale with Content")
    bullet("Publish 2 blog posts targeting 'Wagyu rump steak' keywords")
    bullet("Create 4 TikTok/Reels (1 per hook idea)")
    bullet("Launch post-purchase review email sequence")
    bullet("Set up 'Subscribe &amp; Save' for repeat buyers")
    sp(8)

    # ========== 10. PROJECTED IMPACT ==========
    sec("10. PROJECTED IMPACT")
    make_table(
        ["Optimization", "Est. Conversion Lift", "Revenue Impact"],
        [
            ["Fix pricing error", "+5–10% trust recovery", "Prevents bounce"],
            ["Add 15+ reviews", "+15–20% conversion", "High"],
            ["Cooking guide content", "+5–8% conversion", "Medium"],
            ["Abandoned cart emails", "+10–15% recovery", "High"],
            ["Urgency mechanics", "+8–12% conversion", "Medium"],
            ["Bundle / cross-sell", "+20–30% AOV increase", "High"],
            ["SEO content", "+30–50% organic traffic (90d)", "Long-term"],
        ],
        widths=[3, 3, 2]
    )
    sp(4)
    bold(
        "Conservative estimate: Implementing all fixes could increase product page conversion rate "
        "by 35–50% and average order value by 20–30% within 90 days."
    )
    story.append(PageBreak())

    # ========== SOURCES ==========
    sec("SOURCES")
    sources = [
        "Zuney Wagyu — https://zuneywagyu.com/",
        "Rusticana Wagyu and Lamb — https://www.shop.rusticanafarm.com/",
        "Silent Valley Wagyu — https://www.silentvalleywagyu.com/",
        "Block Men Beef — https://www.blockmenbeef.co.za/",
        "L.A. Farms Wagyu — https://lafarms.co.za/collections/la-wagyu",
        "Wagyu South Africa — https://wagyu.org.za/",
        "SmartBug Email Marketing Case Study",
        "Vermont Wagyu $1M Online Sales — Good Roots",
        "EssFeed Wagyu Marketing Strategies",
        "Ecorn Conversion Rate Optimization Best Practices",
        "Toast Butcher Shop Marketing Ideas",
    ]
    for s in sources:
        bullet(s)
    sp(20)
    story.append(Paragraph("Report generated by Studex Global Markets AI Marketing Audit Engine", s_small))

    doc.build(story)
    print(f"PDF saved to: {OUTPUT}")


if __name__ == "__main__":
    build()

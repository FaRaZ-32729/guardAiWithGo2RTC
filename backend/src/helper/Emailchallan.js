function emailRow(label, val, highlight = false) {
  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:3px 0;border-bottom:1px dashed #f3f4f6;gap:8px;">
      <span style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;white-space:nowrap;padding-right:10px">${label}</span>
      <span style="font-size:10px;font-weight:700;text-align:right;color:${highlight ? "#dc2626" : "#111827"};word-break:break-all;">${val}</span>
    </div>`;
}

function numberToWordsEmail(n) {
  if (!n || n === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const toW = (x) => {
    if (x === 0) return "";
    if (x < 20) return ones[x];
    if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
    if (x < 1000) return ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + toW(x % 100) : "");
    if (x < 100000) return toW(Math.floor(x / 1000)) + " Thousand" + (x % 1000 ? " " + toW(x % 1000) : "");
    return toW(Math.floor(x / 100000)) + " Lakh" + (x % 100000 ? " " + toW(x % 100000) : "");
  };
  return toW(Math.floor(n));
}

/**
 * Generates the HTML string for the violation fine challan email.
 *
 * @param {Object} params
 * @param {Object} params.student     
 * @param {Object} params.challan      
 * @param {Object} params.geminiResult   
 * @param {number} params.previousBalance
 * @param {number} params.violationAmount  
 * @param {Date}   params.issueDate      
 * @param {Date}   params.dueDate         
 * @returns {string} HTML string ready to pass to sendEmail()
 */
const generateChallanEmail = ({
  student,
  challan,
  geminiResult,
  previousBalance,
  violationAmount,
  issueDate,
  dueDate,
}) => {

  const challanNo = challan.challanId;
  const issueDateStr = issueDate instanceof Date
    ? issueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    : issueDate;
  const dueDateStr = dueDate instanceof Date
    ? dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    : dueDate;

  // <!-- Copy bar -->
    // <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 16px;background:#f3f4f6;border-bottom:1px solid #d1d5db;">
    //   <span style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;color:#4b5563;">[STUDENT COPY — EMAIL]</span>
    //   <span style="font-size:9px;font-weight:700;color:#6b7280;font-family:monospace;">#${challanNo}</span>
    // </div>

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Violation Fine Challan</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Courier New',Courier,monospace;">

  <div style="max-width:680px;margin:24px auto;background:#ffffff;border:1px solid #d1d5db;border-radius:8px;overflow:hidden;">

    <!-- Top accent bar -->
    <div style="height:6px;background:linear-gradient(to right,#0d1117,#0891b2,#0d1117);"></div>

    <!-- Header -->
    <div style="text-align:center;padding:20px 16px 12px;border-bottom:1px solid #d1d5db;">
      <img src="https://ilmauniversity.edu.pk/images/logo-wide@2x.png"
           alt="ILMA University"
           style="height:44px;object-fit:contain;max-width:100%;margin-bottom:6px;" />
      <p style="margin:0;font-size:10px;color:#6b7280;letter-spacing:0.05em;">
        Disciplinary Committee &middot; Campus Security Division
      </p>
      <div style="margin-top:6px;font-size:9px;color:#374151;line-height:1.6;">
        Pay Order in favor of: <strong style="color:#111827;">ILMA UNIVERSITY</strong>
        &nbsp;&middot;&nbsp;
        NTN: <strong style="color:#111827;">#2840979-9</strong>
      </div>
      <div style="display:inline-block;margin-top:8px;padding:2px 14px;border:1px solid #6b7280;font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#374151;">
        VIOLATION FINE CHALLAN
      </div>
    </div>

    <!-- Copy bar -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;border-bottom:1px solid #d1d5db;">
      <tr>
        <td style="padding:6px 16px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;color:#4b5563;">[STUDENT COPY — EMAIL]</td>
        <td style="padding:6px 16px;font-size:9px;font-weight:700;color:#6b7280;font-family:monospace;text-align:right;">#${challanNo}</td>
      </tr>
    </table>

    <!-- Dates & Violation -->
    <div style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
      ${emailRow("Issue Date", issueDateStr)}
      ${emailRow("Due Date", dueDateStr, true)}
      ${emailRow("Violation", (geminiResult.action || "N/A").toUpperCase())}
      ${emailRow("Status", "UNPAID")}
    </div>

    <!-- Student Info -->
    <div style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
      <p style="margin:0 0 12px;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;color:#9ca3af;">Student Information</p>
      ${emailRow("Name", student.name || "N/A")}
      ${emailRow("Father's Name", student.fatherName || "N/A")}
      ${emailRow("Roll No.", student.studentRollNumber || "N/A")}
      ${emailRow("Department", student.department || "N/A")}
      ${emailRow("Email", student.email || "N/A")}
      ${emailRow("Phone", student.parentsPhone || "N/A")}
    </div>

    <!-- Fee Breakdown -->
    <div style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
      <p style="margin:0 0 12px;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;color:#9ca3af;">Fee Breakdown</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px dashed #d1d5db;">
        <tr>
          <td style="padding:9px 0;font-size:11px;color:#6b7280;width:60%;">Previous Balance</td>
          <td style="padding:9px 0;font-size:11px;font-weight:700;font-family:monospace;text-align:right;">PKR ${Number(previousBalance).toLocaleString()}</td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px dashed #d1d5db;">
        <tr>
          <td style="padding:9px 0;font-size:11px;color:#6b7280;text-transform:capitalize;width:60%;">${geminiResult.action} Fine (Current)</td>
          <td style="padding:9px 0;font-size:11px;font-weight:700;font-family:monospace;text-align:right;">PKR ${Number(violationAmount).toLocaleString()}</td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:10px 0 4px;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;width:60%;">Total Payable</td>
          <td style="padding:10px 0 4px;font-size:13px;font-weight:900;font-family:monospace;text-align:right;text-decoration:underline;">PKR ${Number(challan.payableAmount).toLocaleString()}</td>
        </tr>
      </table>
      <p style="margin:4px 0 0;font-size:9px;color:#6b7280;">(${numberToWordsEmail(Number(challan.payableAmount))} Rupees Only)</p>
    </div>

    <!-- Signature row -->
    <div style="display:flex;justify-content:space-between;padding:28px 32px 16px;">
      <div style="text-align:center;">
        <div style="width:110px;border-top:1px solid #9ca3af;padding-top:6px;"></div>
        <span style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Student Signature</span>
      </div>
      <div style="text-align:center;">
        <div style="width:110px;border-top:1px solid #9ca3af;padding-top:6px;"></div>
        <span style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Authorized Officer</span>
      </div>
    </div>

    <!-- Stamp -->
    <div style="text-align:center;padding:8px 0 20px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:50%;border:1px dashed #d1d5db;font-size:8px;color:#d1d5db;text-transform:uppercase;letter-spacing:0.05em;text-align:center;line-height:1.5;">
        Official<br/>Stamp
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:14px 20px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
      <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:6px;">
        <span style="font-size:10px;color:#6b7280;">Powered by</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span style="font-size:9px;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;color:#6b7280;">Campus-Guard AI</span>
      </div>
      <p style="margin:0;font-size:9px;color:#9ca3af;line-height:1.8;">
        System-generated challan &middot; Valid 7 days from issue date<br/>
        &copy; ${new Date().getFullYear()} ILMA University &mdash; All Rights Reserved
      </p>
    </div>

    <!-- Bottom accent bar -->
    <div style="height:4px;background:linear-gradient(to right,#0d1117,#0891b2,#0d1117);"></div>

  </div>
</body>
</html>`;
}


module.exports = generateChallanEmail





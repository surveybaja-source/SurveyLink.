export const sendEmail = async (to, subject, html) => {
  try {
    const testEmail = 'survey.baja@gmail.com'
    const response = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: testEmail, subject, html }),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Email error:', error)
  }
}

export const emailTemplates = {
  newQuoteReceived: (missionRef, surveyorName, amount) => ({
    subject: `SurveyLink — New quote received for ${missionRef}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:32px;">
        <div style="background:#182e44;padding:20px 24px;border-radius:8px 8px 0 0;display:flex;align-items:center;gap:12px;">
          <span style="color:#fff;font-size:20px;font-weight:900;">Survey<span style="color:#dd2e1e;">Link</span></span>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
          <h2 style="color:#182e44;margin:0 0 16px;">New Quote Received</h2>
          <p style="color:#555;line-height:1.6;">You have received a new quote for mission <strong>${missionRef}</strong>.</p>
          <div style="background:#f8f9fa;border-left:4px solid #dd2e1e;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;">
            <p style="margin:0;color:#333;"><strong>Surveyor:</strong> ${surveyorName}</p>
            <p style="margin:8px 0 0;color:#333;"><strong>Quoted Amount:</strong> EUR ${amount?.toLocaleString()}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL||'https://svlt-theta.vercel.app'}/dashboard" 
            style="display:inline-block;background:#dd2e1e;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;margin-top:8px;">
            Review Quote
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px;">SurveyLink — Marine Cargo Survey Platform</p>
        </div>
      </div>
    `
  }),

  quoteAccepted: (missionRef, cargoType, location) => ({
    subject: `SurveyLink — Your quote has been accepted for ${missionRef}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:32px;">
        <div style="background:#182e44;padding:20px 24px;border-radius:8px 8px 0 0;">
          <span style="color:#fff;font-size:20px;font-weight:900;">Survey<span style="color:#dd2e1e;">Link</span></span>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
          <h2 style="color:#2e7d32;margin:0 0 16px;">Your Quote Has Been Accepted</h2>
          <p style="color:#555;line-height:1.6;">Congratulations! Your quote for mission <strong>${missionRef}</strong> has been accepted.</p>
          <div style="background:#f1f8f1;border-left:4px solid #2e7d32;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;">
            <p style="margin:0;color:#333;"><strong>Cargo:</strong> ${cargoType}</p>
            <p style="margin:8px 0 0;color:#333;"><strong>Location:</strong> ${location}</p>
          </div>
          <p style="color:#555;">Please log in to access the full mission details including the exact address and on-site contact.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL||'https://svlt-theta.vercel.app'}/dashboard" 
            style="display:inline-block;background:#2e7d32;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;margin-top:8px;">
            View Mission Details
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px;">SurveyLink — Marine Cargo Survey Platform</p>
        </div>
      </div>
    `
  }),

  quoteDeclined: (missionRef, reason) => ({
    subject: `SurveyLink — Your quote was declined for ${missionRef}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:32px;">
        <div style="background:#182e44;padding:20px 24px;border-radius:8px 8px 0 0;">
          <span style="color:#fff;font-size:20px;font-weight:900;">Survey<span style="color:#dd2e1e;">Link</span></span>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
          <h2 style="color:#dd2e1e;margin:0 0 16px;">Quote Declined</h2>
          <p style="color:#555;line-height:1.6;">Your quote for mission <strong>${missionRef}</strong> has been declined.</p>
          <div style="background:#fff5f5;border-left:4px solid #dd2e1e;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;">
            <p style="margin:0;color:#333;"><strong>Reason:</strong> ${reason}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL||'https://svlt-theta.vercel.app'}/dashboard" 
            style="display:inline-block;background:#182e44;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;margin-top:8px;">
            View Dashboard
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px;">SurveyLink — Marine Cargo Survey Platform</p>
        </div>
      </div>
    `
  }),

  counterProposal: (missionRef, counterText, originalAmount) => ({
    subject: `SurveyLink — Counter-proposal received for ${missionRef}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:32px;">
        <div style="background:#182e44;padding:20px 24px;border-radius:8px 8px 0 0;">
          <span style="color:#fff;font-size:20px;font-weight:900;">Survey<span style="color:#dd2e1e;">Link</span></span>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
          <h2 style="color:#f0a500;margin:0 0 16px;">Counter-Proposal Received</h2>
          <p style="color:#555;line-height:1.6;">The insurer has sent a counter-proposal for mission <strong>${missionRef}</strong>.</p>
          <div style="background:#fffbf0;border-left:4px solid #f0a500;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;">
            <p style="margin:0;color:#333;"><strong>Your original quote:</strong> EUR ${originalAmount?.toLocaleString()}</p>
            <p style="margin:12px 0 0;color:#333;"><strong>Counter-proposal:</strong> ${counterText}</p>
          </div>
          <p style="color:#555;">Please log in to accept or decline this counter-proposal.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL||'https://svlt-theta.vercel.app'}/dashboard" 
            style="display:inline-block;background:#f0a500;color:#000;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;margin-top:8px;">
            Respond to Counter-Proposal
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px;">SurveyLink — Marine Cargo Survey Platform</p>
        </div>
      </div>
    `
  }),

  newMissionAvailable: (missionRef, cargoType, location, urgency) => ({
    subject: `SurveyLink — New survey request available: ${cargoType}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:32px;">
        <div style="background:#182e44;padding:20px 24px;border-radius:8px 8px 0 0;">
          <span style="color:#fff;font-size:20px;font-weight:900;">Survey<span style="color:#dd2e1e;">Link</span></span>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
          <h2 style="color:#182e44;margin:0 0 16px;">New Survey Request Available</h2>
          <p style="color:#555;line-height:1.6;">A new survey request matching your expertise is available.</p>
          <div style="background:#f8f9fa;border-left:4px solid #182e44;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;">
            <p style="margin:0;color:#333;"><strong>Reference:</strong> ${missionRef}</p>
            <p style="margin:8px 0 0;color:#333;"><strong>Cargo:</strong> ${cargoType}</p>
            <p style="margin:8px 0 0;color:#333;"><strong>Location:</strong> ${location?.split(',')[0]}</p>
            <p style="margin:8px 0 0;color:#333;"><strong>Urgency:</strong> ${urgency?.toUpperCase()}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL||'https://svlt-theta.vercel.app'}/dashboard" 
            style="display:inline-block;background:#dd2e1e;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;margin-top:8px;">
            View & Submit Quote
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px;">SurveyLink — Marine Cargo Survey Platform</p>
        </div>
      </div>
    `
  }),
  reportUploaded: (missionRef, reportType, surveyorName) => ({
    subject: `SurveyLink — New ${reportType} report uploaded for ${missionRef}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:32px;">
        <div style="background:#182e44;padding:20px 24px;border-radius:8px 8px 0 0;">
          <span style="color:#fff;font-size:20px;font-weight:900;">Survey<span style="color:#dd2e1e;">Link</span></span>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
          <h2 style="color:#182e44;margin:0 0 16px;">New Report Available</h2>
          <p style="color:#555;line-height:1.6;">A new report has been uploaded for mission <strong>${missionRef}</strong>.</p>
          <div style="background:#f8f9fa;border-left:4px solid #182e44;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;">
            <p style="margin:0;color:#333;"><strong>Report Type:</strong> ${reportType}</p>
            <p style="margin:8px 0 0;color:#333;"><strong>Uploaded by:</strong> ${surveyorName}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL||'https://svlt-theta.vercel.app'}/dashboard"
            style="display:inline-block;background:#182e44;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;margin-top:8px;">
            View Report
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px;">SurveyLink — Marine Cargo Survey Platform</p>
        </div>
      </div>
    `
  }),

  finalReportUploaded: (missionRef, surveyorName) => ({
    subject: `SurveyLink — Mission ${missionRef} completed — Final report available`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:32px;">
        <div style="background:#182e44;padding:20px 24px;border-radius:8px 8px 0 0;">
          <span style="color:#fff;font-size:20px;font-weight:900;">Survey<span style="color:#dd2e1e;">Link</span></span>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
          <h2 style="color:#2e7d32;margin:0 0 16px;">Mission Completed</h2>
          <p style="color:#555;line-height:1.6;">The final report for mission <strong>${missionRef}</strong> has been uploaded. The mission is now complete.</p>
          <div style="background:#f1f8f1;border-left:4px solid #2e7d32;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;">
            <p style="margin:0;color:#333;"><strong>Mission:</strong> ${missionRef}</p>
            <p style="margin:8px 0 0;color:#333;"><strong>Surveyor:</strong> ${surveyorName}</p>
            <p style="margin:8px 0 0;color:#2e7d32;font-weight:700;">Status: COMPLETED</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL||'https://svlt-theta.vercel.app'}/dashboard"
            style="display:inline-block;background:#2e7d32;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;margin-top:8px;">
            View Final Report
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px;">SurveyLink — Marine Cargo Survey Platform</p>
        </div>
      </div>
    `
  }),
  convocation: (data) => ({
    subject: `NOTIFICATION TO SURVEY MEETING — ${data.reference}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:32px;background:#fff;color:#333;">
        
        <h2 style="text-align:center;font-size:18px;font-weight:900;letter-spacing:0.05em;border-bottom:2px solid #333;padding-bottom:12px;margin-bottom:24px;">
          NOTIFICATION TO SURVEY MEETING
        </h2>

        <table style="width:100%;margin-bottom:20px;font-size:13px;">
          <tr>
            <td style="width:50%;vertical-align:top;padding-right:20px;">
              <p style="margin:0 0 8px;"><strong>Date:</strong> ${data.date}</p>
              <p style="margin:0 0 8px;"><strong>Case:</strong> ${data.caseDescription}</p>
              <p style="margin:0 0 8px;"><strong>Goods:</strong> ${data.goodsDescription}</p>
              <p style="margin:0 0 8px;"><strong>Surveyor:</strong> ${data.surveyorName}</p>
              <p style="margin:0 0 8px;"><strong>Reference:</strong> ${data.reference}</p>
            </td>
            <td style="width:50%;vertical-align:top;">
              <p style="margin:0 0 8px;">&nbsp;</p>
              <p style="margin:0 0 8px;">&nbsp;</p>
              <p style="margin:0 0 8px;">&nbsp;</p>
              <p style="margin:0 0 8px;"><strong>Email:</strong> ${data.surveyorEmail}</p>
              <p style="margin:0 0 8px;"><strong>Tel:</strong> ${data.surveyorPhone}</p>
            </td>
          </tr>
        </table>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="border:1px solid #ccc;padding:8px;text-align:left;width:80px;"></th>
              <th style="border:1px solid #ccc;padding:8px;text-align:left;">Company</th>
              <th style="border:1px solid #ccc;padding:8px;text-align:left;">Contact</th>
              <th style="border:1px solid #ccc;padding:8px;text-align:left;">E-mail</th>
              <th style="border:1px solid #ccc;padding:8px;text-align:left;">Reference</th>
            </tr>
          </thead>
          <tbody>
            ${data.recipients.map((r,i) => `
              <tr>
                <td style="border:1px solid #ccc;padding:8px;font-weight:700;">${i===0?'To':''}</td>
                <td style="border:1px solid #ccc;padding:8px;">${r.company||''}</td>
                <td style="border:1px solid #ccc;padding:8px;">${r.contact||''}</td>
                <td style="border:1px solid #ccc;padding:8px;">${r.email||''}</td>
                <td style="border:1px solid #ccc;padding:8px;">${r.reference||''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="font-size:13px;line-height:1.8;">
          <p>Dear Sirs,</p>
          <p>Following the above-mentioned case, we inform you that we have been appointed, without prejudice to the right of the parties, on the request of the company <strong>${data.clientName}</strong> and their insurer.</p>
          <p>We inform you that we will proceed to survey operations, on:</p>
          <p style="text-align:center;font-weight:700;font-size:15px;margin:16px 0;">${data.surveyDateFormatted}</p>
          <p>In the premises of the company:</p>
          <p style="text-align:center;font-weight:700;font-size:15px;margin:16px 0;">${data.surveyLocation}</p>
          <p>We invite you to be present and/or represented to this survey and to convoke to this meeting your subcontractors or any other third party implied. Failing that, the conclusions of the survey will be considered as effective against parties.</p>
          <br/>
          <p>Kind regards.</p>
          <p><em>Issued without prejudice to the right of the parties.</em></p>
          <br/>
          <p style="font-weight:700;">${data.surveyorName}</p>
          <p style="color:#666;">${data.surveyorCompany}</p>
        </div>
      </div>
    `
  }),

}

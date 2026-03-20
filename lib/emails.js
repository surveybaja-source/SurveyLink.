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
          <span style="color:#dd2e1e;font-size:24px;">⚓</span>
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
}

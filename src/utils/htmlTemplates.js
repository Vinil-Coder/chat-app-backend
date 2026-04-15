
const generateInviteHtmlTemplate = (inviterName, inviteLink) => {
    const inviteHtml = 
        `
        <div style="font-family: Arial, sans-serif; background:#f6f9fc; padding:40px 0;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05);">

            <!-- Header -->
            <div style="background:#4CAF50; padding:20px; text-align:center; color:#fff;">
            <h1 style="margin:0;">Chat App 💬</h1>
            <p style="margin:5px 0 0;">Collaborate in real-time</p>
            </div>

            <!-- Body -->
            <div style="padding:30px; color:#333;">
            <h2 style="margin-top:0;">You're invited 🎉</h2>
            
            <p style="font-size:16px;">
                Hello 👋,
            </p>

            <p style="font-size:16px;">
                ${inviterName} has invited you to join</strong>.
            </p>

            <p style="font-size:15px; color:#555;">
                Collaborate with your team, chat in real-time, manage groups, and stay productive — all in one place.
            </p>

            <!-- CTA Button -->
            <div style="text-align:center; margin:30px 0;">
                <a href="${inviteLink}" 
                style="display:inline-block; padding:14px 28px; background:#4CAF50; color:#fff; text-decoration:none; font-size:16px; border-radius:6px;">
                Accept Invitation
                </a>
            </div>

            <!-- Fallback -->
            <p style="font-size:13px; color:#888;">
                If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="word-break:break-all; font-size:13px; color:#4CAF50;">
                ${inviteLink}
            </p>

            <p style="font-size:13px; color:#999;">
                ⏳ This invitation will expire in 24 hours.
            </p>
            </div>

            <!-- Footer -->
            <div style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#777;">
            <p style="margin:0;">© ${new Date().getFullYear()} Chat App. All rights reserved.</p>
            </div>

        </div>
        </div>
        `;
    return inviteHtml;
}

module.exports = generateInviteHtmlTemplate;
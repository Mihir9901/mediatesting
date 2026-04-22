const axios = require("axios");

// BREVO CONFIG
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;


//   BREVO CLIENT


const brevoClient = axios.create({
  baseURL: "https://api.brevo.com/v3",
  headers: {
    "api-key": BREVO_API_KEY,
    "Content-Type": "application/json"
  }
});


  // GENERIC EMAIL SENDER


const sendEmail = async ({ to, subject, html }) => {
  try {
    await brevoClient.post("/smtp/email", {
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL
      },
      to: [
        {
          email: to
        }
      ],
      subject: subject,
      htmlContent: html
    });

    return true;
  } catch (error) {
    console.error(
      "❌ Email sending failed:",
      error.response?.data || error.message
    );
    throw error; // Rethrow so caller knows it failed
  }
};


//   MEDIA ATTENDANCE EMAIL


const sendAttendanceEmail = async ({
  employeeEmail,
  employeeName,
  status,
  date,
  managerName,
  department,
  taskDescription
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Media Attendance Notification</title>
  </head>

  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial">

    <table width="100%" style="padding:30px">
      <tr>
        <td align="center">

          <table width="600" style="background:white;border-radius:12px;overflow:hidden">

            <tr>
              <td style="background:#3b120e;color:white;padding:25px;text-align:center">
                <h1 style="margin:0">Media Attendance</h1>
                <p style="margin:5px 0 0;color:#d6b15c">Graphura</p>
              </td>
            </tr>

            <tr>
              <td style="padding:35px">

                <h2 style="color:#74271E">Your Media Attendance Has Been Recorded</h2>

                <p>Hello <b>${employeeName}</b>,</p>

                <p>Your media attendance for <b>${formattedDate}</b> has been marked and locked by <b>${managerName}</b>.</p>

                <div style="background:#f9f0e3;padding:20px;border-radius:8px">

                  <p><b>Date:</b> ${formattedDate}</p>

                  <p><b>Status:</b> <span style="color: ${status === 'Present' ? '#16a34a' : '#dc2626'}">${status}</span></p>

                  <p><b>Department:</b> ${department || 'N/A'}</p>

                  ${taskDescription ? `<p><b>Task Description:</b> ${taskDescription}</p>` : ''}

                </div>

                <p style="font-size:13px;margin-top:25px">
                  If this information is incorrect please contact the administration.
                </p>

              </td>
            </tr>

            <tr>
              <td style="background:#2a0b08;color:#e6d0bd;text-align:center;padding:15px;font-size:12px">
                Automated message from Graphura Media. Please do not reply to this email.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;

  await sendEmail({
    to: employeeEmail,
    subject: `Media Attendance: ${status} - ${formattedDate}`,
    html
  });
};


//   INCOMPLETE TASK EMAIL


const sendIncompleteTaskEmail = async ({
  employeeEmail,
  employeeName,
  date,
  managerName,
  department
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Media Attendance Reminder</title>
  </head>

  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial">

    <table width="100%" style="padding:30px">
      <tr>
        <td align="center">

          <table width="600" style="background:white;border-radius:12px;overflow:hidden">

            <tr>
              <td style="background:#3b120e;color:white;padding:25px;text-align:center">
                <h1 style="margin:0">Media Attendance</h1>
                <p style="margin:5px 0 0;color:#d6b15c">Graphura</p>
              </td>
            </tr>

            <tr>
              <td style="padding:35px">

                <h2 style="color:#dc2626">Action Required: Task Not Completed</h2>

                <p>Hello <b>${employeeName}</b>,</p>

                <p>This is a reminder that your media attendance for <b>${formattedDate}</b> has not been marked as completed.</p>

                <div style="background:#fee2e2;padding:20px;border-radius:8px">

                  <p><b>Date:</b> ${formattedDate}</p>

                  <p><b>Status:</b> <span style="color:#dc2626">Not Completed</span></p>

                  <p><b>Department:</b> ${department || 'N/A'}</p>

                  <p><b>Message:</b> Please complete your task and report to your manager.</p>

                </div>

                <p style="font-size:13px;margin-top:25px">
                  Please contact your manager <b>${managerName}</b> to mark your attendance as completed.
                </p>

              </td>
            </tr>

            <tr>
              <td style="background:#2a0b08;color:#e6d0bd;text-align:center;padding:15px;font-size:12px">
                Automated message from Graphura Media. Please do not reply to this email.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;

  await sendEmail({
    to: employeeEmail,
    subject: `Reminder: Media Attendance Not Completed - ${formattedDate}`,
    html
  });
};


  // RESET PASSWORD EMAIL


const sendResetPasswordEmail = async ({
  userEmail,
  userName,
  resetLink
}) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Password Reset - Graphura</title>
  </head>

  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial">

    <table width="100%" style="padding:30px">
      <tr>
        <td align="center">

          <table width="600" style="background:white;border-radius:12px;overflow:hidden">

            <tr>
              <td style="background:#3b120e;color:white;padding:25px;text-align:center">
                <h1 style="margin:0">Graphura</h1>
                <p style="margin:5px 0 0;color:#d6b15c">Media Attendance System</p>
              </td>
            </tr>

            <tr>
              <td style="padding:35px">

                <h2 style="color:#74271E">Reset Your Password</h2>

                <p>Hello <b>${userName}</b>,</p>

                <p>We received a request to reset your password. Click the button below to create a new password:</p>

                <div style="text-align:center;margin:30px 0">
                  <a href="${resetLink}" style="display:inline-block;background:linear-gradient(to right, #2563eb, #4f46e5);color:white;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:bold;">
                    Reset Password
                  </a>
                </div>

                <div style="background:#f9f0e3;padding:20px;border-radius:8px">
                  <p style="margin:0"><b>Link:</b> <a href="${resetLink}" style="color:#2563eb">${resetLink}</a></p>
                </div>

                <p style="font-size:13px;margin-top:25px;color:#666">
                  <b>Note:</b> This link will expire in 15 minutes for security purposes.
                </p>

                <p style="font-size:13px;margin-top:15px;color:#666">
                  If you didn't request a password reset, please ignore this email or contact the administrator.
                </p>

              </td>
            </tr>

            <tr>
              <td style="background:#2a0b08;color:#e6d0bd;text-align:center;padding:15px;font-size:12px">
                Automated message from Graphura Media. Please do not reply to this email.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: 'Password Reset - Graphura Media Attendance',
    html
  });
};

module.exports = {
  sendAttendanceEmail,
  sendIncompleteTaskEmail,
  sendResetPasswordEmail
};

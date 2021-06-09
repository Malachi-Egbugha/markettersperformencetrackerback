let nodemailer = require("nodemailer");
exports.mail = async function mail(to, subject, textmessage) {
  const transporter = nodemailer.createTransport({
    port: 465, // true for 465, false for other ports
    host: "smtp.gmail.com",
    auth: {
      user: "noreply@enugudisco.com",
      pass: "Enugudisco@123",
    },
    secure: true,
  });
  const mailData = {
    from: '"From MPT APP" <noreply@enugudisco.com>', // sender address
    to: `${to}`, // list of receivers
    subject: `${subject}`,
    text: `${textmessage}`,
  };
  let info = await transporter.sendMail(mailData, function (err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
};

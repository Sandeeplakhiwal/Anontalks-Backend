import nodeMailer from "nodemailer";

const sendEmail = async(options) => {
    
    // const transporter = nodemailer.createTransport({
    //     host: process.env.SMPT_HOST,
    //     port: process.env.SMPT_PORT,
    //     auth: {
    //         user: process.env.SMPT_MAIL,
    //         pass: process.env.SMPT_PASSWORD
    //     },
    //     service: process.env.SMPT_SERVICE
    // });

    var transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: "c607d2a114d76e",
        pass: "2afbd595d833d0"
      }
    });

    // const mailOptions = {
    //     from: process.env.SMTP_MAIL,
    //     to: options.email,
    //     subject: options.subject,
    //     text: options.message
    // }

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: options.email,
      subject: options.subject,
      // text: `Dear User,\n\nYou have requested to reset your password. Please click on the following link to reset your password:\n\n${resetLink}\n\nThank you,\nYour Name`
      text: options.message
    };

    await transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ');
      }
    });

};

export { sendEmail };
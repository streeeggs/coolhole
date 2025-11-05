class EmailController {
  constructor(mailer, config) {
    this.mailer = mailer;
    this.config = config;
  }

  async sendPasswordReset(params = {}) {
    const { address, username, url } = params;

    const resetConfig = this.config.getPasswordReset();
    const emailType = this.config.getType();

    const html = resetConfig
      .getHTML()
      .replace(/\$user\$/g, username)
      .replace(/\$url\$/g, url);
    const text = resetConfig
      .getText()
      .replace(/\$user\$/g, username)
      .replace(/\$url\$/g, url);

    switch (emailType) {
      case "mailgun":
        const mailgunUser = this.config.getApiUser().getMailgun();
        return await this.mailer.messages.create(mailgunUser, {
          from: resetConfig.getFrom(),
          to: `${username} <${address}>`,
          subject: resetConfig.getSubject(),
          html,
          text,
        });
      case "smtp":
      default:
        return await this.mailer.sendMail({
          from: resetConfig.getFrom(),
          to: `${username} <${address}>`,
          subject: resetConfig.getSubject(),
          html,
          text,
        });
    }
  }

  async sendAccountDeletion(params = {}) {
    const { address, username } = params;

    const deleteConfig = this.config.getDeleteAccount();
    const emailType = this.config.getType();

    const html = deleteConfig.getHTML().replace(/\$user\$/g, username);
    const text = deleteConfig.getText().replace(/\$user\$/g, username);

    switch (emailType) {
      case "mailgun":
        const mailgunUser = this.config.getApiUser().getMailgun();
        return await this.mailer.messages.create(mailgunUser, {
          from: deleteConfig.getFrom(),
          to: `${username} <${address}>`,
          subject: deleteConfig.getSubject(),
          html,
          text,
        });
      case "smtp":
      default:
        return await this.mailer.sendMail({
          from: deleteConfig.getFrom(),
          to: `${username} <${address}>`,
          subject: deleteConfig.getSubject(),
          html,
          text,
        });
    }
  }
}

export { EmailController };

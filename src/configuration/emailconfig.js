class EmailConfig {
    constructor(config = { 'password-reset': { enabled: false }, smtp: {} }) {
        this.config = config;

        this._type = config['email-type'] || { 'email-type': 'smtp' };

        const smtp = config.smtp;
        this._smtp = {
            getHost() {
                return smtp.host;
            },

            getPort() {
                return smtp.port;
            },

            isSecure() {
                return smtp.secure;
            },

            getUser() {
                return smtp.user;
            },

            getPassword() {
                return smtp.password;
            }
        };

        const reset = config['password-reset'];
        this._reset = {
            isEnabled() {
                return reset.enabled;
            },

            getHTML() {
                return reset['html-template'];
            },

            getText() {
                return reset['text-template'];
            },

            getFrom() {
                return reset.from;
            },

            getSubject() {
                return reset.subject;
            }
        };

        const deleteAccount = config['delete-account'];
        this._delete = {
            isEnabled() {
                return deleteAccount != null && deleteAccount.enabled;
            },

            getHTML() {
                return deleteAccount['html-template'];
            },

            getText() {
                return deleteAccount['text-template'];
            },

            getFrom() {
                return deleteAccount.from;
            },

            getSubject() {
                return deleteAccount.subject;
            }
        };

        const apiKey = config['api-key'];
        this._apiKey = {
            getMailgun() {
                return apiKey.mailgun;
            }
        };

        const apiUser = config['api-user'];
        this._apiUser = {
            getMailgun() {
                return apiUser.mailgun;
            }
        };
    }

    getType() {
        return this._type['email-type'];
    }

    getApiKey() {
        return this._apiKey;
    }

    getApiUser() {
        return this._apiUser;
    }
    
    getSmtp() {
        return this._smtp;
    }

    getPasswordReset() {
        return this._reset;
    }

    getDeleteAccount() {
        return this._delete;
    }
}

export { EmailConfig };

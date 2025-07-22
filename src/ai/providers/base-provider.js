class BaseProvider {
    constructor(config = {}) {
        this.config = config;
        this.validateConfig();
    }

    validateConfig() {
        if (!this.config.apiKey) {
            throw new Error('API key is required');
        }
    }

    getEndpoint(operation) {
        throw new Error('getEndpoint must be implemented by provider');
    }

    getHeaders() {
        throw new Error('getHeaders must be implemented by provider');
    }

    formatRequest(text, operation) {
        throw new Error('formatRequest must be implemented by provider');
    }

    parseResponse(data) {
        throw new Error('parseResponse must be implemented by provider');
    }

    getDefaultModel() {
        throw new Error('getDefaultModel must be implemented by provider');
    }
}

module.exports = BaseProvider;
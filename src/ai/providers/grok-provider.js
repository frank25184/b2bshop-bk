const BaseProvider = require('./base-provider');

class GrokProvider extends BaseProvider {
    constructor(config = {}) {
        super(config);
        this.endpoint = 'https://api.x.ai/v1/chat/completions';
    }

    getEndpoint() {
        return this.endpoint;
    }

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    formatRequest(text, operation) {
        return {
            model: this.getDefaultModel(),
            messages: [
                {
                    role: 'user',
                    content: text
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        };
    }

    parseResponse(data) {
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from Grok API');
        }
        return data.choices[0].message.content;
    }

    getDefaultModel() {
        return this.config.model || 'grok-2';
    }
}

module.exports = GrokProvider;
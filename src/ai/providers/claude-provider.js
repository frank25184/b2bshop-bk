const BaseProvider = require('./base-provider');

class ClaudeProvider extends BaseProvider {
    constructor(config = {}) {
        super(config);
    }

    getEndpoint(operation) {
        return 'https://api.anthropic.com/v1/messages';
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey
        };
    }

    formatRequest(text, operation) {
        const systemPrompts = {
            summarize: 'Please provide a concise summary of the following text.',
            rephrase: 'Please rephrase the following text while maintaining its meaning.'
        };

        return {
            model: this.config.model || this.getDefaultModel(),
            messages: [{
                role: 'user',
                content: `${systemPrompts[operation]}\n${text}`
            }]
        };
    }

    parseResponse(data) {
        return data.content[0].text;
    }

    getDefaultModel() {
        return 'claude-2';
    }
}

module.exports = ClaudeProvider;
const BaseProvider = require('./base-provider');

class OpenAIProvider extends BaseProvider {
    constructor(config = {}) {
        super(config);
    }

    getEndpoint(operation) {
        return 'https://api.openai.com/v1/chat/completions';
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
        };
    }

    formatRequest(text, operation) {
        const systemPrompts = {
            summarize: 'Please provide a concise summary of the following text.',
            rephrase: 'Please rephrase the following text while maintaining its meaning.'
        };

        return {
            model: this.config.model || this.getDefaultModel(),
            messages: [
                { role: 'system', content: systemPrompts[operation] },
                { role: 'user', content: text }
            ]
        };
    }

    parseResponse(data) {
        return data.choices[0].message.content;
    }

    getDefaultModel() {
        return 'gpt-3.5-turbo';
    }
}

module.exports = OpenAIProvider;
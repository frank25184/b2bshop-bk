const axios = require('axios');
const ProviderFactory = require('./providers/provider-factory');

/** usage:
 * const summarizer = new TextSummarizer('deepseek', { apiKey: 'sk-zaurpzyzapjkkoysojvxwvmokwwkxdcpyldgcgbavvucpijc' });
   const summary = await summarizer.summarize('your text here');// return data.choices[0].message.content;
   const rephrased = await summarizer.rephrase('your text here');
 */
class TextSummarizer {
    constructor(providerName, config = {}) {
        this.provider = ProviderFactory.createProvider(providerName, config);
    }

    async summarize(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid input: text must be a non-empty string');
        }

        try {
            const response = await axios.post(
                this.provider.getEndpoint('summarize'),
                this.provider.formatRequest(text, 'summarize'),
                { headers: this.provider.getHeaders() }
            );

            return this.provider.parseResponse(response.data);
        } catch (error) {
            throw new Error(`Summarization failed: ${error.message}`);
        }
    }

    async rephrase(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid input: text must be a non-empty string');
        }

        try {
            const response = await axios.post(
                this.provider.getEndpoint('rephrase'),
                this.provider.formatRequest(text, 'rephrase'),
                { headers: this.provider.getHeaders() }
            );

            return this.provider.parseResponse(response.data);
        } catch (error) {
            throw new Error(`Rephrasing failed: ${error.message}`);
        }
    }

    static getSupportedProviders() {
        return ProviderFactory.getSupportedProviders();
    }
}

module.exports = TextSummarizer;
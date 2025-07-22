const OpenAIProvider = require('./openai-provider');
const ClaudeProvider = require('./claude-provider');
const DeepSeekProvider = require('./deepseek-provider');
const GrokProvider = require('./grok-provider');
class ProviderFactory {
    static createProvider(providerName, config = {}) {
        const providers = {
            openai: OpenAIProvider,
            claude: ClaudeProvider,
            deepseek: DeepSeekProvider,
            grok: GrokProvider
        };

        const Provider = providers[providerName.toLowerCase()];
        if (!Provider) {
            throw new Error(`Unsupported provider: ${providerName}`);
        }

        return new Provider(config);
    }

    static getSupportedProviders() {
        return ['openai', 'claude', 'deepseek','grok'];
    }
}

module.exports = ProviderFactory;
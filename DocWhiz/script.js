// Mock API configuration for testing
const API_CONFIG = {
    DEEPSEEK_API_KEY: "free",
    DEEPSEEK_API_URL: "https://jsonplaceholder.typicode.com/posts"
};

// App state
const state = {
    history: JSON.parse(localStorage.getItem('docwhiz_history')) || [],
    savedItems: JSON.parse(localStorage.getItem('docwhiz_saved')) || []
};

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const termInput = document.getElementById('termInput');
    const explainBtn = document.getElementById('explainBtn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const copyBtn = document.getElementById('copyBtn');
    const saveBtn = document.getElementById('saveBtn');
    const feedbackBtn = document.getElementById('feedbackBtn');
    const historySection = document.getElementById('history');
    const historyList = document.getElementById('historyList');
    const feedbackModal = document.getElementById('feedbackModal');
    const closeBtn = document.querySelector('.close-btn');
    const cancelFeedback = document.getElementById('cancelFeedback');
    const submitFeedback = document.getElementById('submitFeedback');
    const feedbackText = document.getElementById('feedbackText');
    const exampleBtns = document.querySelectorAll('.example-btn');

    // Initialize
    renderHistory();
    if (state.history.length > 0) {
        historySection.classList.remove('hidden');
    }

    // Event Listeners
    explainBtn.addEventListener('click', getExplanation);
    termInput.addEventListener('keypress', (e) => e.key === 'Enter' && getExplanation());
    copyBtn.addEventListener('click', copyResult);
    saveBtn.addEventListener('click', saveResult);
    feedbackBtn.addEventListener('click', openFeedbackModal);
    closeBtn.addEventListener('click', closeFeedbackModal);
    cancelFeedback.addEventListener('click', closeFeedbackModal);
    submitFeedback.addEventListener('click', submitFeedbackHandler);
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            termInput.value = btn.dataset.term;
            getExplanation();
        });
    });

    // Close modal when clicking outside
    feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
            closeFeedbackModal();
        }
    });

    // Main function to get explanation
    async function getExplanation() {
        const term = termInput.value.trim();
        
        if (!term) {
            showResult('⚠️ Please enter a term to explain', true);
            return;
        }
        
        loading.classList.remove('hidden');
        result.innerHTML = '';
        
        try {
            // Simulate API call with mock data
            const mockExplanation = generateMockExplanation(term);
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            showResult(mockExplanation);
            addToHistory(term);
            
        } catch (error) {
            console.error('Error:', error);
            showResult(`❌ Error: ${error.message}`, true);
        } finally {
            loading.classList.add('hidden');
        }
    }

    // Generate rich mock explanation
    function generateMockExplanation(term) {
        return `
# ${term.charAt(0).toUpperCase() + term.slice(1)}

## Definition
The ${term} is a fundamental concept in programming that ${[
            'allows you to manipulate data structures efficiently',
            'helps manage asynchronous operations',
            'provides a way to organize and structure your code',
            'enables powerful functional programming patterns'
        ][Math.floor(Math.random() * 4)]}.

### Key Features
${['- Encapsulation of behavior', '- Reusability across projects', '- Improved code readability', '- Better error handling']
    .map(item => `${item}\n`).join('')}

### Code Example
\`\`\`javascript
// ${term} example
${getCodeExample(term)}
\`\`\`

### When to Use
- ${['Data transformation', 'Asynchronous operations', 'State management', 'Code organization']
    [Math.floor(Math.random() * 4)]}
- ${['Complex data flows', 'Performance optimization', 'API interactions', 'Event handling']
    [Math.floor(Math.random() * 4)]}

### Best Practices
1. Always ${['handle errors properly', 'consider edge cases', 'write tests', 'document usage']
    [Math.floor(Math.random() * 4)]}
2. ${['Avoid overusing', 'Combine with', 'Consider alternatives to', 'Understand the limitations of']
    [Math.floor(Math.random() * 4)]} ${term} in ${['performance-critical', 'simple', 'legacy', 'concurrent']
    [Math.floor(Math.random() * 4)]} code
        `;
    }

    // Generate appropriate code examples
    function getCodeExample(term) {
        const examples = {
            'map function': `const numbers = [1, 2, 3];
const doubled = numbers.map(x => x * 2);
console.log(doubled); // [2, 4, 6]`,
            'promises': `function fetchData() {
    return new Promise((resolve, reject) => {
        // Async operation
        setTimeout(() => resolve('Data loaded'), 1000);
    });
}

fetchData()
    .then(data => console.log(data))
    .catch(err => console.error(err));`,
            'recursion': `function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

console.log(factorial(5)); // 120`
        };
        
        return examples[term.toLowerCase()] || `// ${term} implementation example
function use${term.charAt(0).toUpperCase() + term.slice(1)}() {
    // Your implementation here
}`;
    }

    // Display results with markdown parsing
    function showResult(content, isError = false) {
        if (isError) {
            result.innerHTML = `<div class="error">${content}</div>`;
        } else {
            result.innerHTML = marked.parse(content);
            Prism.highlightAll();
        }
    }

    // Copy result to clipboard
    function copyResult() {
        const range = document.createRange();
        range.selectNode(result);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        
        // Show feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }

    // Save result to local storage
    function saveResult() {
        const term = termInput.value.trim();
        if (!term) return;
        
        const item = {
            term,
            content: result.innerHTML,
            timestamp: new Date().toISOString()
        };
        
        state.savedItems.push(item);
        localStorage.setItem('docwhiz_saved', JSON.stringify(state.savedItems));
        
        // Show feedback
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
        }, 2000);
    }

    // Add term to search history
    function addToHistory(term) {
        if (!state.history.includes(term)) {
            state.history.unshift(term);
            if (state.history.length > 5) {
                state.history.pop();
            }
            localStorage.setItem('docwhiz_history', JSON.stringify(state.history));
            renderHistory();
            historySection.classList.remove('hidden');
        }
    }

    // Render search history
    function renderHistory() {
        historyList.innerHTML = state.history
            .map(term => `<li>${term}</li>`)
            .join('');
        
        // Add click handlers to history items
        document.querySelectorAll('#historyList li').forEach(item => {
            item.addEventListener('click', () => {
                termInput.value = item.textContent;
                getExplanation();
            });
        });
    }

    // Feedback Modal Functions
    function openFeedbackModal() {
        feedbackModal.classList.add('active');
        feedbackText.focus();
    }

    function closeFeedbackModal() {
        feedbackModal.classList.remove('active');
        feedbackText.value = '';
    }

    function submitFeedbackHandler() {
        const feedback = feedbackText.value.trim();
        
        if (feedback) {
            // In a real app, you would send this to your backend
            console.log('Feedback submitted:', feedback);
            
            // Show thank you message
            const modalContent = feedbackModal.querySelector('.modal-content');
            const originalContent = modalContent.innerHTML;
            
            modalContent.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success-color); margin-bottom: 1rem;"></i>
                    <h3>Thank You!</h3>
                    <p>Your feedback has been received.</p>
                    <button id="closeSuccess" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Close
                    </button>
                </div>
            `;
            
            document.getElementById('closeSuccess').addEventListener('click', () => {
                modalContent.innerHTML = originalContent;
                closeFeedbackModal();
            });
        } else {
            alert('Please enter your feedback before submitting');
            feedbackText.focus();
        }
    }
});
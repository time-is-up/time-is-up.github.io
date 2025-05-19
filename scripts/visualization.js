class Visualizer {
    constructor() {
        // 初始化
        this.setupMathJax();
    }
    
    // 设置MathJax配置
    setupMathJax() {
        if (typeof window.MathJax === 'undefined') {
            console.warn('MathJax not found. Attempting to load it dynamically.');
            // 动态加载MathJax
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
            script.async = true;
            document.head.appendChild(script);
            
            // 配置MathJax
            window.MathJax = {
                tex: {
                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                    displayMath: [['$$', '$$'], ['\\[', '\\]']],
                    processEscapes: true,
                    processEnvironments: true
                },
                options: {
                    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
                    ignoreHtmlClass: 'tex2jax_ignore',
                    processHtmlClass: 'tex2jax_process'
                },
                startup: {
                    pageReady: () => {
                        console.log('MathJax is ready');
                    }
                }
            };
        }
    }

    
    showProblemComparison(problemId, dataLoader) {
        // 清空现有内容
        document.getElementById('original-problem').innerHTML = '';
        document.getElementById('standard-solution').innerHTML = '';
        document.getElementById('standard-answer').innerHTML = '';
        document.getElementById('dataset-info').innerHTML = '';
        
        // 获取问题数据
        const problemData = dataLoader.getProblemData(problemId);
        const modelAData = dataLoader.getModelAData(problemId);
        const modelBData = dataLoader.getModelBData(problemId);
        
        if (!problemData) {
            console.error('Failed to load problem data.');
            return;
        }
        
        // 显示原始问题和标准答案
        this.showOriginalProblem(problemData);
        
        // 显示模型A的解答
        if (modelAData) {
            this.showModelSolution('a', modelAData);
        } else {
            this.clearModelSolution('a');
        }
        
        // 显示模型B的解答
        if (modelBData) {
            this.showModelSolution('b', modelBData);
        } else {
            this.clearModelSolution('b');
        }
    }
    
    // 显示原始问题和标准答案
    showOriginalProblem(problemData) {
        const originalProblemEl = document.getElementById('original-problem');
        const standardSolutionEl = document.getElementById('standard-solution');
        const standardAnswerEl = document.getElementById('standard-answer');
        
        // 更新数据集和问题ID显示
        document.getElementById('dataset-name').textContent = problemData.dataset || 'N/A';
        document.getElementById('problem-id').textContent = problemData.problem_id || 'N/A';
        
        // 显示问题，保持原始格式
        originalProblemEl.innerHTML = this.formatMathContent(problemData.question) || 'Question not available';
        
        // 显示标准解答
        standardSolutionEl.innerHTML = this.formatMathContent(problemData.solution) || 'Standard solution not available';
        
        // 显示标准答案，使用boxed形式并添加行内公式环境
        let standardAnswer = 'Standard answer not available';
        if (problemData.answer) {
            const answerText = problemData.answer.trim();
            // 直接添加boxed和行内公式环境，不进行检查
            standardAnswer = this.formatMathContent(`\\(\\boxed{${answerText}}\\)`);
        }
        standardAnswerEl.innerHTML = standardAnswer;

        // 渲染数学公式
        this.renderMath();
    }
    
    // 显示模型解答
    showModelSolution(modelKey, modelData) {
        // 清空现有内容
        document.getElementById(`model-${modelKey}-prompt`).innerHTML = '';
        document.getElementById(`model-${modelKey}-solution`).innerHTML = '';
        document.getElementById(`model-${modelKey}-answer`).innerHTML = '';
        document.getElementById(`model-${modelKey}-status`).className = 'answer-status';
        
        const promptEl = document.getElementById(`model-${modelKey}-prompt`);
        const solutionEl = document.getElementById(`model-${modelKey}-solution`);
        const answerEl = document.getElementById(`model-${modelKey}-answer`);
        const statusEl = document.getElementById(`model-${modelKey}-status`);
        const promptTypeEl = document.getElementById(`model-${modelKey}-prompt-type`);
        const tokenBudgetEl = document.getElementById(`model-${modelKey}-token-budget`);
        
        // 显示模型信息
        promptTypeEl.textContent = modelData.prompt_type || 'N/A';
        tokenBudgetEl.textContent = modelData.token_budget || 'N/A';
        
        // 显示模型提示
        promptEl.innerHTML = this.formatMathContent(modelData.prompt) || 'Model prompt not available';
    
        // 显示模型解答
        solutionEl.innerHTML = this.formatMathContent(modelData.solution) || 'Model solution not available';
        
        // 显示模型答案，使用boxed形式并添加行内公式环境
        let answer = 'N/A';
        if (modelData.answer && modelData.answer.trim()) {
            const answerText = modelData.answer.trim();
            // 直接添加boxed和行内公式环境，不进行检查
            answer = this.formatMathContent(`\\(\\boxed{${answerText}}\\)`);
        }
        answerEl.innerHTML = answer;

        // 显示答案状态
        if (modelData.correct === true) {
            statusEl.innerHTML = '✓ Correct';
            statusEl.className = 'answer-status answer-correct';
        } else if (modelData.correct === false) {
            statusEl.innerHTML = '✗ Wrong';
            statusEl.className = 'answer-status answer-incorrect';
        } else {
            statusEl.innerHTML = '? Unknown';
            statusEl.className = 'answer-status';
        }

        // 渲染数学公式
        this.renderMath();
    }
    
    // 清除模型解答
    clearModelSolution(modelKey) {
        const promptEl = document.getElementById(`model-${modelKey}-prompt`);
        const solutionEl = document.getElementById(`model-${modelKey}-solution`);
        const answerEl = document.getElementById(`model-${modelKey}-answer`);
        const statusEl = document.getElementById(`model-${modelKey}-status`);
        
        promptEl.innerHTML = 'No data available';
        solutionEl.innerHTML = 'No data available';
        answerEl.innerHTML = 'No data available';
        statusEl.innerHTML = '';
        statusEl.className = 'answer-status';
    }
    
    // 格式化数学内容
    formatMathContent(content) {
        if (!content) return null;

        // 对于Mistral系列模型，只处理<s>标签，将其转义为&lt;s&gt;以原样显示
        content = content.replace(/<s>/g, '&lt;s&gt;').replace(/<\/s>/g, '&lt;/s&gt;');

        // 对于Gemma系列模型，处理模型格式中的特殊标签
        content = content.replace(/<bos>/g, '&lt;bos&gt;');
        content = content.replace(/<start_of_turn>/g, '&lt;start_of_turn&gt;');
        content = content.replace(/<end_of_turn>/g, '&lt;end_of_turn&gt;');
        content = content.replace(/<\/start_of_turn>/g, '&lt;/start_of_turn&gt;');
        content = content.replace(/<\/end_of_turn>/g, '&lt;/end_of_turn&gt;');
        // 替换双反斜杠，但有条件：
        // 1. 如果后面是\n，保持原样
        // 2. 如果前后都是空格，保持原样
        // 3. 否则，替换为带空格的双反斜杠
        content = content.replace(/\\\\\n|(\s)\\\\(\s)|\\\\(?!\n)/g, function(match, p1, p2) {
            // 情况1：\\\\\n - 保持原样
            if (match === '\\\\\n') return match;
            
            // 情况2：空格\\\\空格 - 保持原样
            if (p1 && p2) return match;
            
            // 情况3：其他情况的\\\\ - 添加空格
            return ' \\';
        });
        
        // 换行符替换为<br>标签用于HTML渲染
        content = content.replace(/\n/g, '<br>');

        return content;
    }

    // 渲染数学公式
    renderMath() {
        if (typeof window.MathJax !== 'undefined') {
            // 使用MathJax渲染页面上的所有数学公式
            if (typeof window.MathJax.typesetPromise === 'function') {
                // MathJax 3
                window.MathJax.typesetPromise()
                    .then(() => console.log('Math rendering complete'))
                    .catch((err) => console.error('Error rendering math:', err));
            } else if (typeof window.MathJax.Hub !== 'undefined') {
                // 兼容MathJax 2
                window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]);
            }
        } else {
            console.error('MathJax library not available');
        }
    }
}
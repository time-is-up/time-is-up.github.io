class Visualizer {
    constructor() {
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
        // 获取问题数据
        const problemData = dataLoader.getProblemData(problemId);
        const modelAData = dataLoader.getModelAData(problemId);
        const modelBData = dataLoader.getModelBData(problemId);
        
        if (!problemData) {
            console.error('Failed to load problem data.');
            return;
        }
        
        // 更新数据集和问题ID显示
        document.getElementById('dataset-name').textContent = problemData.dataset || 'N/A';
        document.getElementById('problem-id').textContent = problemData.problem_id || 'N/A';
        
        // 显示问题内容
        document.getElementById('original-problem').innerHTML = this.formatMathContent(problemData.question) || 'Question not available';
        document.getElementById('standard-solution').innerHTML = this.formatMathContent(problemData.solution) || 'Standard solution not available';
        
        // 显示标准答案
        let standardAnswer = problemData.answer ? 
            this.formatAnswer(problemData.answer) : 
            'Standard answer not available';
        document.getElementById('standard-answer').innerHTML = standardAnswer;
        
        // 统一显示模型结果
        this.displayModelResult('a', modelAData, problemData.answer);
        this.displayModelResult('b', modelBData, problemData.answer);
        
        // 渲染数学公式
        this.renderMath();
    }
    
    // 统一显示模型结果的函数
    displayModelResult(modelKey, modelData, standardAnswer) {
        if (!modelData) return;
        
        // 更新模型基本信息
        document.getElementById(`model-${modelKey}-name`).textContent = modelData.model_name || 'N/A';
        document.getElementById(`model-${modelKey}-prompt-type`).textContent = modelData.prompt_type || 'N/A';
        document.getElementById(`model-${modelKey}-method`).textContent = modelData.method || 'N/A';
        document.getElementById(`model-${modelKey}-token-budget`).textContent = modelData.token_budget || 'N/A';
        
        // 更新模型输出内容 - 将prompt改为input
        document.getElementById(`model-${modelKey}-prompt`).innerHTML = this.formatMathContent(modelData.prompt) || 'Model input not available';
        document.getElementById(`model-${modelKey}-solution`).innerHTML = this.formatMathContent(modelData.solution) || 'Model solution not available';
        document.getElementById(`model-${modelKey}-answer`).innerHTML = this.formatAnswer(modelData.answer);
        
        // 更新答案状态
        const statusEl = document.getElementById(`model-${modelKey}-status`);
        if (modelData.answer && standardAnswer) {
            const isCorrect = modelData.answer.trim() === standardAnswer.trim();
            statusEl.innerHTML = isCorrect ? '✓ Correct' : '✗ Wrong';
            statusEl.className = `answer-status answer-${isCorrect ? 'correct' : 'incorrect'}`;
        } else {
            statusEl.innerHTML = '? Unknown';
            statusEl.className = 'answer-status';
        }
    }
    
    // 格式化答案显示
    formatAnswer(answer) {
        if (!answer) return 'N/A';
        return this.formatMathContent(`\\(\\boxed{${answer.trim()}}\\)`);
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
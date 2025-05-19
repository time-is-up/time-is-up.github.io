/**
 * 辅助函数集合
 */

// 截断长文本显示
function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// 安全解析JSON字符串
function safeJsonParse(jsonString, defaultValue = null) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('JSON解析错误:', error);
        return defaultValue;
    }
}

// 格式化LaTeX文本，确保LaTeX公式可以正确渲染
function formatLatexText(text) {
    if (!text) return '';
    
    // 替换双美元符号为LaTeX展示模式
    text = text.replace(/\$\$(.*?)\$\$/g, '\\[$1\\]');
    
    // 替换单美元符号为LaTeX行内模式
    text = text.replace(/\$(.*?)\$/g, '\\($1\\)');
    
    return text;
}

// 检查字符串是否包含LaTeX公式
function containsLatex(text) {
    if (!text) return false;
    return /\$\$|\$|\\begin\{|\\end\{|\\[|\\(|\\)|\\]/.test(text);
}

// 通过比较生成差异高亮HTML
function generateDiff(textA, textB) {
    // 这里可以使用一个差异比较库，如diff
    // 简单实现仅作示例
    if (textA === textB) return textA;
    
    return `<div class="diff-container">
        <div class="diff-item">${textA}</div>
        <div class="diff-item">${textB}</div>
    </div>`;
}

// 检查浏览器是否支持所需的API
function checkBrowserCompatibility() {
    const features = {
        fetch: typeof fetch !== 'undefined',
        promises: typeof Promise !== 'undefined',
        localStorage: typeof localStorage !== 'undefined'
    };
    
    const incompatibleFeatures = Object.keys(features).filter(key => !features[key]);
    
    if (incompatibleFeatures.length > 0) {
        alert(`您的浏览器不支持以下功能：${incompatibleFeatures.join(', ')}。请使用更现代的浏览器。`);
        return false;
    }
    
    return true;
}

// 搜索问题
function searchProblems(problems, searchTerm) {
    if (!searchTerm) return problems;
    
    searchTerm = searchTerm.toLowerCase();
    return problems.filter(problem => {
        // 在问题文本中搜索
        if (problem.problem && problem.problem.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // 在答案中搜索
        if (problem.reference_answer && problem.reference_answer.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        return false;
    });
}

// 保存用户选择到本地存储
function saveUserPreferences(preferences) {
    try {
        localStorage.setItem('math_comparison_preferences', JSON.stringify(preferences));
    } catch (error) {
        console.error('保存用户偏好失败:', error);
    }
}

// 从本地存储获取用户选择
function loadUserPreferences() {
    try {
        const prefString = localStorage.getItem('math_comparison_preferences');
        return prefString ? JSON.parse(prefString) : null;
    } catch (error) {
        console.error('读取用户偏好失败:', error);
        return null;
    }
}

// 导出数据到CSV文件
function exportToCSV(data, filename = 'export.csv') {
    // 将数据转换为CSV格式
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // 假设data是对象数组，提取表头
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    csvContent += headers.join(',') + '\n';
    
    // 添加每一行数据
    data.forEach(item => {
        const row = headers.map(header => {
            // 确保CSV单元格格式正确，特别是包含逗号的文本
            let cell = item[header] || '';
            cell = String(cell).replace(/"/g, '""');
            return `"${cell}"`;
        });
        csvContent += row.join(',') + '\n';
    });
    
    // 创建下载链接
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// 全局变量
const dataLoader = new DataLoader();
const visualizer = new Visualizer();
let currentProblemId = 1;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 只初始化基础UI和事件监听器
        initializeFindingSelect();
        setupEventListeners();
    } catch (error) {
        console.error('初始化失败:', error);
        hideLoading();
    }
});

// 初始化界面
async function initializeInterface() {
    // 移除加载配置的代码，只保留基础UI初始化
    initializeFindingSelect();
}

// 初始化Finding选择器
function initializeFindingSelect() {
    const findingSelect = document.getElementById('finding-select');
    
    // 已在HTML中静态设置了选项，这里不需要动态添加
    
    // 默认选择Finding 1
    findingSelect.value = "1";
}

// 设置事件监听器
function setupEventListeners() {
    // Setup按钮点击事件
    document.getElementById('setup-btn').addEventListener('click', handleSetup);
    
    // 比较按钮点击事件
    document.getElementById('compare-problem-btn').addEventListener('click', handleCompare);
    
    // 问题输入框变化事件
    document.getElementById('problem-select').addEventListener('change', validateProblemId);
}

// 处理Setup按钮点击
async function handleSetup() {
    showLoading();
    
    try {
        // 获取当前选择的Finding ID
        const findingId = document.getElementById('finding-select').value;
        
        // 加载Finding数据
        await dataLoader.loadFindingData(findingId);
        
        // 更新Finding描述
        document.getElementById('finding-description-text').textContent = dataLoader.getFindingDescription();
        
        // 更新问题总数
        const problemCount = dataLoader.getProblemCount();
        document.getElementById('problem-total-count').textContent = `/ ${problemCount}`;
        
        // 重置当前问题ID
        currentProblemId = 1;
        document.getElementById('problem-select').value = currentProblemId;
        
        // 显示第一个问题
        visualizer.showProblemComparison(currentProblemId, dataLoader);
        
        hideLoading();
    } catch (error) {
        console.error('设置失败:', error);
        hideLoading();
    }
}

// 处理比较按钮点击
async function handleCompare() {
    // 获取当前问题ID
    const problemId = parseInt(document.getElementById('problem-select').value);
    
    // 验证问题ID
    if (isNaN(problemId) || problemId < 1 || problemId > dataLoader.getProblemCount()) {
        alert(`请输入有效的问题ID (1-${dataLoader.getProblemCount()})`);
        return;
    }
    
    // 更新当前问题ID
    currentProblemId = problemId;
    
    // 添加加载状态
    showLoading();
    
    try {
        // 显示问题比较
        await visualizer.showProblemComparison(currentProblemId, dataLoader);
        
        // 完成后隐藏加载状态
        hideLoading();
    } catch (error) {
        console.error('比较失败:', error);
        hideLoading();
    }
}

// 验证问题ID
function validateProblemId() {
    const problemSelect = document.getElementById('problem-select');
    const problemId = parseInt(problemSelect.value);
    const maxProblemId = dataLoader.getProblemCount();
    
    if (isNaN(problemId) || problemId < 1) {
        problemSelect.value = 1;
    } else if (maxProblemId > 0 && problemId > maxProblemId) {
        problemSelect.value = maxProblemId;
    }
}

// 显示加载状态
function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

// 隐藏加载状态
function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}
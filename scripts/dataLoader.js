class DataLoader {
    constructor() {
        this.config = null;
        this.findingData = null;
        this.currentFinding = null;
    }
    
    // 加载配置文件
    async loadConfig() {
        try {
            const response = await fetch('data/config.json');
            if (!response.ok) {
                console.warn('Config file not found or not accessible');
                return null;
            }
            this.config = await response.json();
            return this.config;
        } catch (error) {
            console.warn('Failed to load config file:', error);
            return null;
        }
    }
    
    // 获取配置
    getConfig() {
        return this.config;
    }
    
    // 加载Finding数据
    async loadFindingData(findingId) {
        try {
            this.currentFinding = findingId;
            const response = await fetch(`data/finding${findingId}.json`);
            
            if (!response.ok) {
                console.warn(`Finding ${findingId} data not found or not accessible`);
                return null;
            }
            
            this.findingData = await response.json();
            console.log(`Finding ${findingId} data loaded:`, this.findingData);
            return this.findingData;
        } catch (error) {
            console.warn(`Failed to load finding ${findingId} data:`, error);
            return null;
        }
    }
    
    // 获取Finding描述
    getFindingDescription() {
        if (!this.findingData || !this.findingData.description) {
            return "No description available for this finding.";
        }
        return this.findingData.description;
    }
    
    // 获取问题数量
    getProblemCount() {
        if (!this.findingData || !this.findingData.examples) {
            return 0;
        }
        return this.findingData.examples.length;
    }
    
    // 获取指定题号的问题数据
    getProblemData(problemId) {
        if (!this.findingData || !this.findingData.examples || 
            problemId < 1 || problemId > this.findingData.examples.length) {
            console.error("Problem data not found or invalid problem ID.");
            return null;
        }
        
        // 问题ID从1开始，数组索引从0开始
        return this.findingData.examples[problemId - 1];
    }
    
    // 获取模型A的数据
    getModelAData(problemId) {
        const problem = this.getProblemData(problemId);
        if (!problem || !problem.model_a) {
            return null;
        }
        return problem.model_a;
    }
    
    // 获取模型B的数据
    getModelBData(problemId) {
        const problem = this.getProblemData(problemId);
        if (!problem || !problem.model_b) {
            return null;
        }
        return problem.model_b;
    }
}
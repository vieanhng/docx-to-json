document.addEventListener('DOMContentLoaded', function () {
    // Thêm các macro toán học vào cấu hình MathJax
    if (window.MathJax && window.MathJax.tex) {
        window.MathJax.tex.macros = window.MathJax.tex.macros || {};
        Object.assign(window.MathJax.tex.macros, {
            SO: '{\\overrightarrow{SO}}',
            OM: '{\\overrightarrow{OM}}',
            SM: '{\\overrightarrow{SM}}',
            begin: '{\\begin}',
            end: '{\\end}',
            frac: '{\\frac}',
            sqrt: '{\\sqrt}',
            right: '{\\right}',
            left: '{\\left}',
            rightarrow: '{\\rightarrow}',
            overrightarrow: '{\\overrightarrow}',
            align: '{\\begin{aligned}}',
            endalign: '{\\end{aligned}}',
            'align*': '{\\begin{aligned}}',
            'endalign*': '{\\end{aligned}}',
            cases: '{\\begin{cases}}',
            endcases: '{\\end{cases}}',
            algin: '{\\begin{aligned}}',
            endalgin: '{\\end{aligned}}',
            'algin*': '{\\begin{aligned}}',
            'endalgin*': '{\\end{aligned}}'
        });
    }

    // ============================================
    // CONFIGURATION - CẤU HÌNH API
    // ============================================
    // Tất cả các URL API được quản lý tập trung tại đây
    // Để thay đổi API endpoint, chỉ cần cập nhật giá trị tương ứng bên dưới

    const CONFIG = {
        // ========================================
        // API chính - Xử lý file DOCX và AI Recognition
        // ========================================
        // API endpoint cho việc upload và xử lý file DOCX
        // Endpoints có sẵn:
        //   - POST /upload: Upload và convert file DOCX sang JSON
        //   - POST /recognize-image: Nhận diện câu hỏi từ ảnh
        //   - POST /recognize-text: Nhận diện câu hỏi từ văn bản
        API_URL: 'https://docx-to-json.nport.link',

        // ========================================
        // Google Apps Script APIs
        // ========================================
        GOOGLE_SCRIPT: {
            // API lấy danh sách kỹ năng (skills)
            // Query params: ?action=get-skills
            GET_SKILLS: 'https://script.google.com/macros/s/AKfycbwqUpCtNPJ9sC7jiXQr5_S1l4ZtKjkkrhZCLQuqdTCAZpnwjLDepexUGgtBsEwsM9dK/exec',

            // API lấy danh sách động từ hành động (action words)
            // Query params: ?action=get-dongtu
            GET_ACTION_WORDS: 'https://script.google.com/macros/s/AKfycbwqUpCtNPJ9sC7jiXQr5_S1l4ZtKjkkrhZCLQuqdTCAZpnwjLDepexUGgtBsEwsM9dK/exec',

            // API tạo gợi ý (hints) cho câu hỏi
            // POST body: { question_content: string }
            GEN_HINTS: 'https://script.google.com/macros/s/AKfycbyKeC02IbZk2t-qG5-3qTkFkcSyYj1Xamo0lqZTt9RU_Or9C_xWrO3KhE55HxhpMg3csA/exec',

            // API tạo động từ hành động cho câu hỏi
            // POST body: { content: string, level: string, solution: string }
            GEN_ACTION_WORD: 'https://script.google.com/macros/s/AKfycbwDt4hWU_3XM7ovCyEPvsFvRJp3klDGOuqB2NldgPXqkjNam20ufPRfpyGrHuajKsjU/exec',

            // API tạo tags cho câu hỏi
            // POST body: { content: string, level: string, solution: string }
            GEN_TAGS: 'https://script.google.com/macros/s/AKfycbzO8jbMsnqaqKULmC42IW-Mc_vMwrQYegQI9p0crXzImohVL97NBWob7WyoeYfkEYmcQQ/exec'
        },

        // ========================================
        // N8N Webhook APIs (Legacy - Không sử dụng)
        // ========================================
        // Các endpoint này được giữ lại để tương thích ngược
        // Hiện tại đang sử dụng Google Apps Script thay thế
        ENDPOINTS: {
            SKILLS: 'https://free-n8n.taikhoanai.store/webhook/get-skills',
            ACTION_WORDS: 'https://free-n8n.taikhoanai.store/webhook/get-dongtu',
            GEN_HINTS: 'https://free-n8n.taikhoanai.store/webhook/gen-hints',
            GEN_ACTION_WORD: 'https://free-n8n.taikhoanai.store/webhook/gen-dongtu',
            GEN_TAGS: 'https://free-n8n.taikhoanai.store/webhook/gen-the'
        }
    };

    // ========================================
    // Backward Compatibility
    // ========================================
    // Biến này được giữ lại để đảm bảo code cũ vẫn hoạt động
    let = CONFIG.API_URL;

    const HEADER_REFERENCE = {
        QUESTION: 'Câu',
        TYPE: 'Loại',
        LEVEL: 'Mức độ',
        KNOWLEDGE_CODE: 'Mã',
        CONTENT: 'Nội dung',
        ANSWER: 'Đáp án',
        EXPLANATION: 'Lời giải chi tiết'
    };

    const jsonEditor = document.getElementById('jsonEditor');
    const previewContainer = document.getElementById('previewContainer');
    const formatBtn = document.getElementById('formatBtn');
    const applyBtn = document.getElementById('applyBtn');
    const checkDuplicatesBtn = document.getElementById('checkDuplicatesBtn');
    const mathToggle = document.getElementById('mathToggle');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const toggleEditorBtn = document.getElementById('toggleEditorBtn');
    const questionCount = document.getElementById('questionCount');
    const mcCount = document.getElementById('mcCount');
    const tfCount = document.getElementById('tfCount');
    const fillCount = document.getElementById('fillCount');
    const warningContainer = document.getElementById('warningContainer');
    const warningList = document.getElementById('warningList');
    const errorContainer = document.getElementById('errorContainer');
    const errorList = document.getElementById('errorList');
    const successContainer = document.getElementById('successContainer');
    const successMessage = document.getElementById('successMessage');
    const progressContainerWrapper = document.getElementById('progressContainerWrapper');

    // File upload elements
    const fileInput = document.getElementById('fileInput');
    const fileUploadContainer = document.getElementById('fileUploadContainer');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');

    // Batch action buttons
    const batchGenerateSolutionBtn = document.getElementById('batchGenerateSolutionBtn');
    const batchGenerateHintBtn = document.getElementById('batchGenerateHintBtn');
    const batchGenerateActionWordsBtn = document.getElementById('batchGenerateActionWordsBtn');
    const batchGenerateTagsBtn = document.getElementById('batchGenerateTagsBtn');
    const batchAddTagsBtn = document.getElementById('batchAddTagsBtn');

    // Modal elements
    const editModal = document.getElementById('editModal');
    const editType = document.getElementById('editType');
    const editQuestion = document.getElementById('editQuestion');
    const mcOptionsContainer = document.getElementById('mcOptionsContainer');
    const tfStatementsContainer = document.getElementById('tfStatementsContainer');
    const fillAnswerContainer = document.getElementById('fillAnswerContainer');
    const mpMatchingContainer = document.getElementById('mpMatchingContainer');
    const mddmDragDropContainer = document.getElementById('mddmDragDropContainer');
    const mroReorderingContainer = document.getElementById('mroReorderingContainer');
    const optionsContainer = document.getElementById('optionsContainer');
    const statementsContainer = document.getElementById('statementsContainer');
    const leftItemsContainer = document.getElementById('leftItemsContainer');
    const rightItemsContainer = document.getElementById('rightItemsContainer');
    const dragDropOptionsContainer = document.getElementById('dragDropOptionsContainer');
    const reorderItemsContainer = document.getElementById('reorderItemsContainer');
    const correctAnswersContainer = document.getElementById('correctAnswersContainer');
    const correctAnswersContainerTF = document.getElementById('correctAnswersContainerTF');
    const editAnswer = document.getElementById('editAnswer');
    const editCorrectAnswerMDDM = document.getElementById('editCorrectAnswerMDDM');
    const editDifficultLevel = document.getElementById('editDifficultLevel');
    const editSolution = document.getElementById('editSolution');
    const editHint = document.getElementById('editHint');
    const editTags = document.getElementById('editTags');
    const addOptionBtn = document.getElementById('addOptionBtn');
    const addStatementBtn = document.getElementById('addStatementBtn');
    const addLeftItemBtn = document.getElementById('addLeftItemBtn');
    const addRightItemBtn = document.getElementById('addRightItemBtn');
    const addDragDropOptionBtn = document.getElementById('addDragDropOptionBtn');
    const addReorderItemBtn = document.getElementById('addReorderItemBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveEditBtn = document.getElementById('saveEditBtn');

    // AI generation buttons
    const generateSolutionBtn = document.getElementById('generateSolutionBtn');
    const generateHintBtn = document.getElementById('generateHintBtn');
    const generateActionWordsBtn = document.getElementById('generateActionWordsBtn');
    const generateTagsBtn = document.getElementById('generateTagsBtn');

    // Multi-select elements
    const skillsMultiSelect = document.getElementById('skillsMultiSelect');
    const skillsTrigger = skillsMultiSelect.querySelector('.multi-select-trigger');
    const skillsDropdown = skillsMultiSelect.querySelector('.multi-select-dropdown');
    const skillsTags = skillsMultiSelect.querySelector('.multi-select-tags');
    const skillsOptions = skillsMultiSelect.querySelector('.multi-select-options');

    const actionWordsMultiSelect = document.getElementById('actionWordsMultiSelect');
    const actionWordsTrigger = actionWordsMultiSelect.querySelector('.multi-select-trigger');
    const actionWordsDropdown = actionWordsMultiSelect.querySelector('.multi-select-dropdown');
    const actionWordsTags = actionWordsMultiSelect.querySelector('.multi-select-tags');
    const actionWordsOptions = actionWordsMultiSelect.querySelector('.multi-select-options');

    // Settings Modal elements
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const settingsModalClose = document.getElementById('settingsModalClose');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');

    // Settings input fields
    const settingsApiUrl = document.getElementById('settingsApiUrl');
    const settingsGetSkills = document.getElementById('settingsGetSkills');
    const settingsGetActionWords = document.getElementById('settingsGetActionWords');
    const settingsGenHints = document.getElementById('settingsGenHints');
    const settingsGenActionWord = document.getElementById('settingsGenActionWord');
    const settingsGenTags = document.getElementById('settingsGenTags');

    // State variables
    let currentEditIndex = -1;
    let selectedSkills = [];
    let selectedActionWords = [];
    let skillsData = [];
    let actionWordsData = [];

    // ============================================
    // SETTINGS MANAGEMENT
    // ============================================

    // Default configuration values
    const DEFAULT_CONFIG = {
        API_URL: 'https://docx-to-json.nport.link',
        GOOGLE_SCRIPT: {
            GET_SKILLS: 'https://script.google.com/macros/s/AKfycbwqUpCtNPJ9sC7jiXQr5_S1l4ZtKjkkrhZCLQuqdTCAZpnwjLDepexUGgtBsEwsM9dK/exec',
            GET_ACTION_WORDS: 'https://script.google.com/macros/s/AKfycbwqUpCtNPJ9sC7jiXQr5_S1l4ZtKjkkrhZCLQuqdTCAZpnwjLDepexUGgtBsEwsM9dK/exec',
            GEN_HINTS: 'https://script.google.com/macros/s/AKfycbyKeC02IbZk2t-qG5-3qTkFkcSyYj1Xamo0lqZTt9RU_Or9C_xWrO3KhE55HxhpMg3csA/exec',
            GEN_ACTION_WORD: 'https://script.google.com/macros/s/AKfycbwDt4hWU_3XM7ovCyEPvsFvRJp3klDGOuqB2NldgPXqkjNam20ufPRfpyGrHuajKsjU/exec',
            GEN_TAGS: 'https://script.google.com/macros/s/AKfycbzO8jbMsnqaqKULmC42IW-Mc_vMwrQYegQI9p0crXzImohVL97NBWob7WyoeYfkEYmcQQ/exec'
        }
    };

    // Load settings from localStorage or use defaults
    function loadSettings() {
        const savedSettings = localStorage.getItem('apiSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                // Update CONFIG object
                CONFIG.API_URL = settings.API_URL || DEFAULT_CONFIG.API_URL;
                CONFIG.GOOGLE_SCRIPT.GET_SKILLS = settings.GOOGLE_SCRIPT?.GET_SKILLS || DEFAULT_CONFIG.GOOGLE_SCRIPT.GET_SKILLS;
                CONFIG.GOOGLE_SCRIPT.GET_ACTION_WORDS = settings.GOOGLE_SCRIPT?.GET_ACTION_WORDS || DEFAULT_CONFIG.GOOGLE_SCRIPT.GET_ACTION_WORDS;
                CONFIG.GOOGLE_SCRIPT.GEN_HINTS = settings.GOOGLE_SCRIPT?.GEN_HINTS || DEFAULT_CONFIG.GOOGLE_SCRIPT.GEN_HINTS;
                CONFIG.GOOGLE_SCRIPT.GEN_ACTION_WORD = settings.GOOGLE_SCRIPT?.GEN_ACTION_WORD || DEFAULT_CONFIG.GOOGLE_SCRIPT.GEN_ACTION_WORD;
                CONFIG.GOOGLE_SCRIPT.GEN_TAGS = settings.GOOGLE_SCRIPT?.GEN_TAGS || DEFAULT_CONFIG.GOOGLE_SCRIPT.GEN_TAGS;
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }

    // Save settings to localStorage
    function saveSettings() {
        const settings = {
            API_URL: CONFIG.API_URL,
            GOOGLE_SCRIPT: {
                GET_SKILLS: CONFIG.GOOGLE_SCRIPT.GET_SKILLS,
                GET_ACTION_WORDS: CONFIG.GOOGLE_SCRIPT.GET_ACTION_WORDS,
                GEN_HINTS: CONFIG.GOOGLE_SCRIPT.GEN_HINTS,
                GEN_ACTION_WORD: CONFIG.GOOGLE_SCRIPT.GEN_ACTION_WORD,
                GEN_TAGS: CONFIG.GOOGLE_SCRIPT.GEN_TAGS
            }
        };
        localStorage.setItem('apiSettings', JSON.stringify(settings));
    }

    // Populate settings modal with current values
    function populateSettingsModal() {
        settingsApiUrl.value = CONFIG.API_URL;
        settingsGetSkills.value = CONFIG.GOOGLE_SCRIPT.GET_SKILLS;
        settingsGetActionWords.value = CONFIG.GOOGLE_SCRIPT.GET_ACTION_WORDS;
        settingsGenHints.value = CONFIG.GOOGLE_SCRIPT.GEN_HINTS;
        settingsGenActionWord.value = CONFIG.GOOGLE_SCRIPT.GEN_ACTION_WORD;
        settingsGenTags.value = CONFIG.GOOGLE_SCRIPT.GEN_TAGS;
    }

    // Open settings modal
    settingsBtn.addEventListener('click', () => {
        populateSettingsModal();
        settingsModal.style.display = 'flex';
    });

    // Close settings modal
    function closeSettingsModal() {
        settingsModal.style.display = 'none';
    }

    settingsModalClose.addEventListener('click', closeSettingsModal);
    cancelSettingsBtn.addEventListener('click', closeSettingsModal);

    // Save settings
    saveSettingsBtn.addEventListener('click', () => {
        // Update CONFIG object
        CONFIG.API_URL = settingsApiUrl.value.trim() || DEFAULT_CONFIG.API_URL;
        CONFIG.GOOGLE_SCRIPT.GET_SKILLS = settingsGetSkills.value.trim() || DEFAULT_CONFIG.GOOGLE_SCRIPT.GET_SKILLS;
        CONFIG.GOOGLE_SCRIPT.GET_ACTION_WORDS = settingsGetActionWords.value.trim() || DEFAULT_CONFIG.GOOGLE_SCRIPT.GET_ACTION_WORDS;
        CONFIG.GOOGLE_SCRIPT.GEN_HINTS = settingsGenHints.value.trim() || DEFAULT_CONFIG.GOOGLE_SCRIPT.GEN_HINTS;
        CONFIG.GOOGLE_SCRIPT.GEN_ACTION_WORD = settingsGenActionWord.value.trim() || DEFAULT_CONFIG.GOOGLE_SCRIPT.GEN_ACTION_WORD;
        CONFIG.GOOGLE_SCRIPT.GEN_TAGS = settingsGenTags.value.trim() || DEFAULT_CONFIG.GOOGLE_SCRIPT.GEN_TAGS;

        // Save to localStorage
        saveSettings();

        // Show success message
        showSuccess('Đã lưu cấu hình thành công! Các API mới sẽ được sử dụng ngay lập tức.');

        // Close modal
        closeSettingsModal();
    });

    // Reset to default settings
    resetSettingsBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn khôi phục cấu hình mặc định? Tất cả các thay đổi sẽ bị mất.')) {
            // Reset CONFIG to defaults
            CONFIG.API_URL = DEFAULT_CONFIG.API_URL;
            CONFIG.GOOGLE_SCRIPT.GET_SKILLS = DEFAULT_CONFIG.GOOGLE_SCRIPT.GET_SKILLS;
            CONFIG.GOOGLE_SCRIPT.GET_ACTION_WORDS = DEFAULT_CONFIG.GOOGLE_SCRIPT.GET_ACTION_WORDS;
            CONFIG.GOOGLE_SCRIPT.GEN_HINTS = DEFAULT_CONFIG.GOOGLE_SCRIPT.GEN_HINTS;
            CONFIG.GOOGLE_SCRIPT.GEN_ACTION_WORD = DEFAULT_CONFIG.GOOGLE_SCRIPT.GEN_ACTION_WORD;
            CONFIG.GOOGLE_SCRIPT.GEN_TAGS = DEFAULT_CONFIG.GOOGLE_SCRIPT.GEN_TAGS;

            // Remove from localStorage
            localStorage.removeItem('apiSettings');

            // Update modal fields
            populateSettingsModal();

            // Show success message
            showSuccess('Đã khôi phục cấu hình mặc định!');
        }
    });

    // Close modal when clicking outside
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettingsModal();
        }
    });

    // Load settings on page load
    loadSettings();

    function stripHtmlAndCleanWhitespace(htmlString) {
        if (!htmlString || typeof htmlString !== 'string') {
            return "";
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;

        const text = tempDiv.textContent || tempDiv.innerText || '';
        tempDiv.remove();
        return text.replace(/\s+/g, ' ').trim();
    }

    const LATEX_REPLACEMENTS = [
        { find: '\\\\frac', replace: '\\dfrac' },
    ];


    const replaceLatexCommands = (text) => {
        if (typeof text !== 'string') {
            return text;
        }

        // Hàm thay thế bên trong một khối LaTeX
        const processLatexBlock = (latex) => {
            let processed = LATEX_REPLACEMENTS.reduce((current, rule) => {
                // Lưu ý: trong chuỗi JS, '\\' phải viết là '\\\\' để đại diện cho '\'
                // Nhưng khi dùng RegExp, ta cần escape backslash: nên rule.find đã là '\\\\frac'
                const regex = new RegExp(rule.find, 'g');
                return current.replace(regex, rule.replace);
            }, latex);

            // Kiểm tra nếu khối chứa \int, \lim, hoặc \underset
            // và chưa có \displaystyle ở đầu
            if (/\\(int|lim|underset)\b/.test(processed) && !/^\s*\\displaystyle/.test(processed)) {
                processed = '\\displaystyle ' + processed;
            }

            return processed;
        };

        // Tìm và thay thế chỉ trong các khối LaTeX: \(...\), \[...\], $...$, $$...$$
        // Ưu tiên $$...$$ trước $...$ để tránh xung đột
        return text
            // Xử lý display math: $$...$$
            .replace(/\$\$([\s\S]*?)\$\$/g, (match, content) => {
                return '$$' + processLatexBlock(content) + '$$';
            })
            // Xử lý inline math: $...$ (không cho phép xuống dòng)
            .replace(/\$([^\n]*?)\$/g, (match, content) => {
                return '$' + processLatexBlock(content) + '$';
            })
    };


    // Fetch data from JSON files
    async function fetchJSONData() {
        try {
            // Fetch skills data
            const skillsResponse = await fetch(`${CONFIG.GOOGLE_SCRIPT.GET_SKILLS}?action=get-skills`);
            if (skillsResponse.ok) {
                skillsData = await skillsResponse.json();
            } else {
                console.error('Failed to fetch skills data');
                // Use fallback data
                skillsData = [
                    { "iid": 24241328, "name": "01.K6.1.1.1 - Sử dụng được thuật ngữ tập hợp, phần tử thuộc (không thuộc) một tập hợp.", "code": "01.K6.1.1.1" },
                    { "iid": 24241375, "name": "01.K6.1.2.1 - Nhận biết được tập hợp các số tự nhiên", "code": "01.K6.1.2.1" },
                    { "iid": 24241376, "name": "01.K6.1.2.2 - Nhận biết được tập hợp các số nguyên", "code": "01.K6.1.2.2" },
                    { "iid": 24241377, "name": "01.K6.1.2.3 - Nhận biết được tập hợp các số hữu tỷ", "code": "01.K6.1.2.3" },
                    { "iid": 24241378, "name": "01.K6.1.2.4 - Nhận biết được tập hợp các số thực", "code": "01.K6.1.2.4" },
                    { "iid": 24241379, "name": "01.K6.1.3.1 - Thực hiện được phép toán cộng, trừ, nhân, chia trên các số tự nhiên", "code": "01.K6.1.3.1" },
                    { "iid": 24241380, "name": "01.K6.1.3.2 - Thực hiện được phép toán cộng, trừ, nhân, chia trên các số nguyên", "code": "01.K6.1.3.2" }
                ];
            }

            // Fetch action words data
            const actionWordsResponse = await fetch(`${CONFIG.GOOGLE_SCRIPT.GET_ACTION_WORDS}?action=get-dongtu`);
            if (actionWordsResponse.ok) {
                actionWordsData = await actionWordsResponse.json();
            } else {
                console.error('Failed to fetch action words data');
                // Use fallback data
                actionWordsData = [
                    { "name": "Nhận ra/Nhận dạng", "iid": 27854578 },
                    { "name": "Nêu tên", "iid": 27854579 },
                    { "name": "Mô tả", "iid": 27854580 },
                    { "name": "Giải thích", "iid": 27854581 },
                    { "name": "Phân biệt", "iid": 27854582 },
                    { "name": "So sánh", "iid": 27854583 },
                    { "name": "Phân tích", "iid": 27854584 },
                    { "name": "Đánh giá", "iid": 27854585 },
                    { "name": "Áp dụng", "iid": 27854586 },
                    { "name": "Tổng hợp", "iid": 27854587 }
                ];
            }

            // Initialize multi-selects after data is loaded
            initializeMultiSelects();
        } catch (error) {
            console.error('Error fetching data:', error);
            // Use fallback data
            skillsData = [
                { "iid": 24241328, "name": "01.K6.1.1.1 - Sử dụng được thuật ngữ tập hợp, phần tử thuộc (không thuộc) một tập hợp.", "code": "01.K6.1.1.1" },
                { "iid": 24241375, "name": "01.K6.1.2.1 - Nhận biết được tập hợp các số tự nhiên", "code": "01.K6.1.2.1" },
                { "iid": 24241376, "name": "01.K6.1.2.2 - Nhận biết được tập hợp các số nguyên", "code": "01.K6.1.2.2" },
                { "iid": 24241377, "name": "01.K6.1.2.3 - Nhận biết được tập hợp các số hữu tỷ", "code": "01.K6.1.2.3" },
                { "iid": 24241378, "name": "01.K6.1.2.4 - Nhận biết được tập hợp các số thực", "code": "01.K6.1.2.4" },
                { "iid": 24241379, "name": "01.K6.1.3.1 - Thực hiện được phép toán cộng, trừ, nhân, chia trên các số tự nhiên", "code": "01.K6.1.3.1" },
                { "iid": 24241380, "name": "01.K6.1.3.2 - Thực hiện được phép toán cộng, trừ, nhân, chia trên các số nguyên", "code": "01.K6.1.3.2" }
            ];

            actionWordsData = [
                { "name": "Nhận ra/Nhận dạng", "iid": 27854578 },
                { "name": "Nêu tên", "iid": 27854579 },
                { "name": "Mô tả", "iid": 27854580 },
                { "name": "Giải thích", "iid": 27854581 },
                { "name": "Phân biệt", "iid": 27854582 },
                { "name": "So sánh", "iid": 27854583 },
                { "name": "Phân tích", "iid": 27854584 },
                { "name": "Đánh giá", "iid": 27854585 },
                { "name": "Áp dụng", "iid": 27854586 },
                { "name": "Tổng hợp", "iid": 27854587 }
            ];

            // Initialize multi-selects with fallback data
            initializeMultiSelects();
        }
    }

    // File upload handling
    fileInput.addEventListener('change', handleFileSelect);

    // ============================================
    // UPLOAD TABS FUNCTIONALITY
    // ============================================
    const uploadTabs = document.querySelectorAll('.upload-tab');
    const uploadTabContents = document.querySelectorAll('.upload-tab-content');

    uploadTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;

            // Remove active class from all tabs and contents
            uploadTabs.forEach(t => t.classList.remove('active'));
            uploadTabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(`${tabName}TabContent`).classList.add('active');
        });
    });

    // ============================================
    // AI INPUT TABS FUNCTIONALITY
    // ============================================
    const aiInputTabs = document.querySelectorAll('.ai-input-tab');
    const aiInputContents = document.querySelectorAll('.ai-input-content');

    aiInputTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const inputType = tab.dataset.input;

            // Remove active class from all tabs and contents
            aiInputTabs.forEach(t => t.classList.remove('active'));
            aiInputContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(`${inputType}InputContent`).classList.add('active');
        });
    });

    // ============================================
    // IMAGE UPLOAD AND PREVIEW
    // ============================================
    const imageInput = document.getElementById('imageInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const recognizeImageBtn = document.getElementById('recognizeImageBtn');
    let uploadedImages = [];

    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();

                reader.onload = (event) => {
                    uploadedImages.push({
                        file: file,
                        dataUrl: event.target.result
                    });
                    renderImagePreviews();
                };

                reader.readAsDataURL(file);
            }
        });

        // Show recognize button if images are uploaded
        if (files.length > 0) {
            recognizeImageBtn.style.display = 'block';
        }
    });

    function renderImagePreviews() {
        imagePreviewContainer.innerHTML = '';

        uploadedImages.forEach((image, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';

            previewItem.innerHTML = `
                <img src="${image.dataUrl}" alt="Preview ${index + 1}">
                <button class="image-preview-remove" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;

            imagePreviewContainer.appendChild(previewItem);
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.image-preview-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                uploadedImages.splice(index, 1);
                renderImagePreviews();

                // Hide recognize button if no images
                if (uploadedImages.length === 0) {
                    recognizeImageBtn.style.display = 'none';
                }
            });
        });
    }

    // ============================================
    // AI RECOGNITION - IMAGE
    // ============================================
    recognizeImageBtn.addEventListener('click', async () => {
        if (uploadedImages.length === 0) {
            showErrors(['Vui lòng tải lên ít nhất một ảnh']);
            return;
        }

        setButtonLoading(recognizeImageBtn, true);
        showSuccess('Đang nhận diện câu hỏi từ ảnh...');

        try {
            // Convert images to base64 for API
            const imageDataArray = uploadedImages.map(img => img.dataUrl);

            const response = await fetch(`${CONFIG.API_URL}/recognize-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ images: imageDataArray })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Nhận diện thất bại');
            }

            // Update JSON editor with recognized questions
            const currentData = jsonEditor.value ? JSON.parse(jsonEditor.value) : [];
            const newData = Array.isArray(currentData) ? currentData : [];

            if (Array.isArray(data.questions)) {
                newData.push(...data.questions);
            }

            jsonEditor.value = JSON.stringify(newData, null, 2);

            // Hide editor and show preview
            document.querySelector('.editor-content').style.display = 'none';
            document.querySelector('.main-container').classList.remove('two-columns');

            updatePreview();
            showSuccess(`Đã nhận diện thành công ${data.questions.length} câu hỏi từ ảnh`);

            // Clear uploaded images
            uploadedImages = [];
            renderImagePreviews();
            recognizeImageBtn.style.display = 'none';
            imageInput.value = '';

        } catch (error) {
            showErrors([error.message]);
        } finally {
            setButtonLoading(recognizeImageBtn, false);
        }
    });

    // ============================================
    // AI RECOGNITION - TEXT
    // ============================================
    const textInput = document.getElementById('textInput');
    const recognizeTextBtn = document.getElementById('recognizeTextBtn');

    recognizeTextBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();

        if (!text) {
            showErrors(['Vui lòng nhập nội dung câu hỏi']);
            return;
        }

        setButtonLoading(recognizeTextBtn, true);
        showSuccess('Đang nhận diện câu hỏi từ text...');

        try {
            const response = await fetch(`${CONFIG.API_URL}/recognize-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Nhận diện thất bại');
            }

            // Update JSON editor with recognized questions
            const currentData = jsonEditor.value ? JSON.parse(jsonEditor.value) : [];
            const newData = Array.isArray(currentData) ? currentData : [];

            if (Array.isArray(data.questions)) {
                newData.push(...data.questions);
            }

            jsonEditor.value = JSON.stringify(newData, null, 2);

            // Hide editor and show preview
            document.querySelector('.editor-content').style.display = 'none';
            document.querySelector('.main-container').classList.remove('two-columns');

            updatePreview();
            showSuccess(`Đã nhận diện thành công ${data.questions.length} câu hỏi từ text`);

            // Clear text input
            textInput.value = '';

        } catch (error) {
            showErrors([error.message]);
        } finally {
            setButtonLoading(recognizeTextBtn, false);
        }
    });


    // Drag and drop handling
    fileUploadContainer.addEventListener('dragover', function (e) {
        e.preventDefault();
        fileUploadContainer.classList.add('dragover');
    });

    fileUploadContainer.addEventListener('dragleave', function (e) {
        e.preventDefault();
        fileUploadContainer.classList.remove('dragover');
    });

    fileUploadContainer.addEventListener('drop', function (e) {
        e.preventDefault();
        fileUploadContainer.classList.remove('dragover');

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            processFile(file);
        }
    });

    function handleFileSelect(e) {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            processFile(file);
        }
    }

    function processFile(file) {
        // Display file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.classList.add('show');

        // Check file type
        if (file.name.endsWith('.json') || file.type === 'application/json') {
            // Process JSON file
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const content = e.target.result;
                    // Validate JSON
                    JSON.parse(content);

                    // Set content to editor nhưng không hiển thị
                    jsonEditor.value = content;

                    // Ẩn phần soạn thảo JSON và tập trung vào phần xem trước
                    document.querySelector('.editor-content').style.display = 'none';
                    document.querySelector('.main-container').classList.remove('two-columns');

                    // Update preview
                    updatePreview();

                    showSuccess('Tải lên file JSON thành công');
                } catch (error) {
                    showErrors([`File không phải là JSON hợp lệ: ${error.message}`]);
                    fileInfo.classList.remove('show');
                }
            };

            reader.onerror = function () {
                showErrors(['Lỗi khi đọc file']);
                fileInfo.classList.remove('show');
            };

            reader.readAsText(file);
        } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // Process Word file
            uploadWordFile(file);
        } else {
            showErrors(['Vui lòng chọn file JSON hoặc Word (.docx)']);
            fileInfo.classList.remove('show');
        }
    }

    function uploadWordFile(file) {
        const formData = new FormData();
        formData.append('docxFile', file);

        // Show loading state
        showSuccess('Đang xử lý file Word...');

        fetch(`${CONFIG.API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'DNT': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-gpc': '1'
            },
            body: formData
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    throw new Error(data.error);
                }
                // Xử lý dữ liệu JSON trả về nhưng không hiển thị trong trình soạn thảo
                jsonEditor.value = JSON.stringify(data.data, null, 2);
                // Ẩn phần soạn thảo JSON và tập trung vào phần xem trước
                document.querySelector('.editor-content').style.display = 'none';
                document.querySelector('.main-container').classList.remove('two-columns');
                updatePreview();
                showSuccess('Xử lý file Word thành công');
            })
            .catch(error => {
                showErrors([error.message]);
                fileInfo.classList.remove('show');
            });
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async function genHint(content) {
        const formdata = new FormData();

        formdata.append("question_content", stripHtmlAndCleanWhitespace(content));

        let body = {
            question_content: stripHtmlAndCleanWhitespace(content)
        };

        const requestOptions = {
            method: "POST",
            body: JSON.stringify(body),
            redirect: "follow",
        };

        try {
            const response = await fetch(CONFIG.GOOGLE_SCRIPT.GEN_HINTS, requestOptions);

            // Check if the response is OK and has a body
            if (!response.ok) {
                console.error("HTTP error! status:", response.status);
                // You can return a specific error message here
                return "An error occurred on the server.";
            }

            // Get the response text first to check if it's empty
            const responseText = await response.text();
            if (!responseText) {
                console.error("The server returned an empty response.");
                return "The server returned an empty hint.";
            }

            // Try to parse the text as JSON
            try {
                const result = JSON.parse(responseText);
                return result.result;
            } catch (jsonError) {
                console.error("Failed to parse JSON:", jsonError);
                console.error("Received text:", responseText);
                return "Failed to get a valid hint from the server.";
            }
        } catch (fetchError) {
            console.error("Network or fetch error:", fetchError);
            return "A network error occurred. Please check your connection.";
        }
    }

    async function genActionWord(content, solution, level) {
        const formdata = new FormData();
        formdata.append("content", stripHtmlAndCleanWhitespace(content));
        formdata.append("level", level);
        formdata.append("solution", stripHtmlAndCleanWhitespace(solution));

        let body = {
            content: stripHtmlAndCleanWhitespace(content),
            level: level,
            solution: stripHtmlAndCleanWhitespace(solution)
        };

        const requestOptions = {
            method: "POST",
            body: JSON.stringify(body),
            redirect: "follow",
        };

        try {
            const response = await fetch(CONFIG.GOOGLE_SCRIPT.GEN_ACTION_WORD, requestOptions);

            // Check if the response is OK and has a body
            if (!response.ok) {
                console.error("HTTP error! status:", response.status);
                // You can return a specific error message here
                return "An error occurred on the server.";
            }

            // Get the response text first to check if it's empty
            const responseText = await response.text();
            if (!responseText) {
                console.error("The server returned an empty response.");
                return "The server returned an empty hint.";
            }

            // Try to parse the text as JSON
            try {
                const result = JSON.parse(responseText);
                return result.result;
            } catch (jsonError) {
                console.error("Failed to parse JSON:", jsonError);
                console.error("Received text:", responseText);
                return "Failed to get a valid hint from the server.";
            }
        } catch (fetchError) {
            console.error("Network or fetch error:", fetchError);
            return "A network error occurred. Please check your connection.";
        }
    }

    async function genTags(content, solution, level) {
        const formdata = new FormData();
        formdata.append("content", stripHtmlAndCleanWhitespace(content));
        formdata.append("level", level);
        formdata.append("solution", stripHtmlAndCleanWhitespace(solution));

        let body = {
            content: stripHtmlAndCleanWhitespace(content),
            level: level,
            solution: stripHtmlAndCleanWhitespace(solution)
        };

        const requestOptions = {
            method: "POST",
            body: JSON.stringify(body),
            redirect: "follow",
        };

        try {
            const response = await fetch(CONFIG.GOOGLE_SCRIPT.GEN_TAGS, requestOptions);

            // Check if the response is OK and has a body
            if (!response.ok) {
                console.error("HTTP error! status:", response.status);
                // You can return a specific error message here
                return "An error occurred on the server.";
            }

            // Get the response text first to check if it's empty
            const responseText = await response.text();
            if (!responseText) {
                console.error("The server returned an empty response.");
                return "The server returned an empty hint.";
            }

            // Try to parse the text as JSON
            try {
                const result = JSON.parse(responseText);
                return result.result.tags;
            } catch (jsonError) {
                console.error("Failed to parse JSON:", jsonError);
                console.error("Received text:", responseText);
                return "Failed to get a valid hint from the server.";
            }
        } catch (fetchError) {
            console.error("Network or fetch error:", fetchError);
            return "A network error occurred. Please check your connection.";
        }
    }

    // Biến lưu timeout để có thể clear khi cần
    let messageTimeout = null;

    // Ẩn tất cả thông báo
    function hideAllMessages() {
        // Clear timeout cũ nếu có
        if (messageTimeout) {
            clearTimeout(messageTimeout);
            messageTimeout = null;
        }

        warningContainer.classList.remove('fade-out');
        errorContainer.classList.remove('fade-out');
        successContainer.classList.remove('fade-out');

        warningContainer.style.display = 'none';
        errorContainer.style.display = 'none';
        successContainer.style.display = 'none';
    }

    // Hàm tự động ẩn message sau 5 giây
    function autoHideMessage(container) {
        // Clear timeout cũ nếu có
        if (messageTimeout) {
            clearTimeout(messageTimeout);
        }

        // Set timeout mới
        messageTimeout = setTimeout(() => {
            // Thêm class fade-out để trigger animation
            container.classList.add('fade-out');

            // Sau khi animation kết thúc (300ms), ẩn hoàn toàn
            setTimeout(() => {
                container.style.display = 'none';
                container.classList.remove('fade-out');
            }, 300);
        }, 5000); // 5 giây
    }

    // Hiển thị cảnh báo
    function showWarnings(warnings) {
        if (warnings.length === 0) {
            warningContainer.style.display = 'none';
            return;
        }

        warningList.innerHTML = '';
        warnings.forEach(warning => {
            const li = document.createElement('li');
            li.className = 'warning-item';
            li.textContent = warning;
            warningList.appendChild(li);
        });

        warningContainer.style.display = 'block';
        autoHideMessage(warningContainer);
    }

    // Hiển thị lỗi
    function showErrors(errors) {
        if (errors.length === 0) {
            errorContainer.style.display = 'none';
            return;
        }

        errorList.innerHTML = '';
        errors.forEach(error => {
            const li = document.createElement('li');
            li.className = 'error-item';
            li.textContent = error;
            errorList.appendChild(li);
        });

        errorContainer.style.display = 'block';
        autoHideMessage(errorContainer);
    }

    // Hiển thị thông báo thành công
    function showSuccess(message) {
        successMessage.textContent = message;
        successContainer.style.display = 'block';
        warningContainer.style.display = 'none';
        errorContainer.style.display = 'none';
        autoHideMessage(successContainer);
    }

    // Multi-Progress System
    const progressItems = new Map(); // Store progress items by ID

    // Tạo progress item mới
    function createProgressItem(id, title, total) {
        // Remove existing item if it exists
        if (progressItems.has(id)) {
            removeProgressItem(id);
        }

        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        progressItem.id = `progress-${id}`;
        progressItem.innerHTML = `
            <div class="progress-header">
                <div class="progress-title">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span class="progress-title-text">${title}</span>
                </div>
                <div class="progress-stats">
                    <span class="progress-current">0</span>/<span class="progress-total">${total}</span>
                </div>
                <button class="progress-close" onclick="removeProgressItem('${id}')">&times;</button>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar"></div>
            </div>
            <div class="progress-message"></div>
        `;

        progressContainerWrapper.appendChild(progressItem);

        progressItems.set(id, {
            element: progressItem,
            total: total,
            current: 0
        });

        return progressItem;
    }

    // Cập nhật progress item
    function updateProgressItem(id, current, message = '') {
        const item = progressItems.get(id);
        if (!item) return;

        item.current = current;
        const percentage = (current / item.total) * 100;

        const progressBar = item.element.querySelector('.progress-bar');
        const progressCurrent = item.element.querySelector('.progress-current');
        const progressMessage = item.element.querySelector('.progress-message');

        progressBar.style.width = percentage + '%';
        progressCurrent.textContent = current;

        if (message) {
            progressMessage.textContent = message;
        }
    }

    // Đánh dấu progress item hoàn thành
    function completeProgressItem(id, message = 'Hoàn thành!') {
        const item = progressItems.get(id);
        if (!item) return;

        item.element.classList.add('completed');

        const icon = item.element.querySelector('.progress-title i');
        icon.className = 'fas fa-check-circle';

        const progressBar = item.element.querySelector('.progress-bar');
        progressBar.style.width = '100%';

        const progressMessage = item.element.querySelector('.progress-message');
        progressMessage.textContent = message;

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeProgressItem(id);
        }, 5000);
    }

    // Đánh dấu progress item lỗi
    function errorProgressItem(id, message = 'Có lỗi xảy ra!') {
        const item = progressItems.get(id);
        if (!item) return;

        item.element.classList.add('error');

        const icon = item.element.querySelector('.progress-title i');
        icon.className = 'fas fa-exclamation-circle';

        const progressMessage = item.element.querySelector('.progress-message');
        progressMessage.textContent = message;

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeProgressItem(id);
        }, 5000);
    }

    // Xóa progress item
    function removeProgressItem(id) {
        const item = progressItems.get(id);
        if (!item) return;

        item.element.classList.add('removing');

        setTimeout(() => {
            if (item.element.parentNode) {
                item.element.parentNode.removeChild(item.element);
            }
            progressItems.delete(id);
        }, 300); // Match animation duration
    }

    // Expose removeProgressItem to global scope for onclick
    window.removeProgressItem = removeProgressItem;

    // Cập nhật số lượng câu hỏi
    function updateQuestionStats(data) {
        if (!Array.isArray(data)) {
            questionCount.textContent = '0';
            mcCount.textContent = '0';
            tfCount.textContent = '0';
            fillCount.textContent = '0';
            return;
        }

        questionCount.textContent = data.length;

        let mc = 0, tf = 0, fill = 0;
        data.forEach(item => {
            if (item.type === 'MC' || item.type === 'MMC') mc++;
            else if (item.type === 'TF') tf++;
            else if (item.type === 'SA') fill++;
        });

        mcCount.textContent = mc;
        tfCount.textContent = tf;
        fillCount.textContent = fill;
    }

    // Giải mã các thực thể HTML
    function decodeHTMLEntities(text) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }

    // Hàm để xử lý lại MathJax khi nội dung thay đổi
    function typeset(code) {
        if (MathJax && MathJax.typeset) {
            try {
                // Đảm bảo MathJax đã được tải hoàn toàn
                setTimeout(() => {
                    try {
                        // Sử dụng phương thức typeset của MathJax
                        MathJax.typeset(code());
                    } catch (err) {
                        console.log('Typeset failed: ' + err.message);
                    }
                }, 100);
            } catch (err) {
                console.log('Typeset setup failed: ' + err.message);
            }
        } else {
            console.log('MathJax not available or typeset method not found');
        }
    }

    // Render math in text
    function renderMathInText(text) {
        //return text;
        if (!mathToggle.checked) return text;
        if (!text) return '';

        // Xử lý các ký tự đặc biệt trước khi render math
        let processedText = text.replace(/\\n/g, '<br>');

        // Xử lý các ký tự đặc biệt trong công thức toán
        processedText = processedText.replace(/\\begin\{align\*?\}/g, '\\begin{aligned}');
        processedText = processedText.replace(/\\end\{align\*?\}/g, '\\end{aligned}');

        // Xử lý các ký hiệu đặc biệt
        processedText = processedText.replace(/\\algin/g, '\\begin{aligned}');
        processedText = processedText.replace(/\\endalgin/g, '\\end{aligned}');
        processedText = processedText.replace(/\\algin\*/g, '\\begin{aligned}');
        processedText = processedText.replace(/\\endalgin\*/g, '\\end{aligned}');

        // Xử lý các ký hiệu vector
        processedText = processedText.replace(/\\vec\{([A-Za-z0-9]+)\}/g, '\\overrightarrow{$1}');
        processedText = processedText.replace(/\\vec ([A-Za-z0-9]+)/g, '\\overrightarrow{$1}');


        // Xử lý các ký hiệu đặc biệt trong công thức toán học
        processedText = processedText.replace(/\\rightarrow/g, '\\rightarrow');
        processedText = processedText.replace(/\\Rightarrow/g, '\\Rightarrow');
        processedText = processedText.replace(/\\leftarrow/g, '\\leftarrow');
        processedText = processedText.replace(/\\Leftarrow/g, '\\Leftarrow');
        processedText = processedText.replace(/\\leftrightarrow/g, '\\leftrightarrow');
        processedText = processedText.replace(/\\Leftrightarrow/g, '\\Leftrightarrow');

        // Xử lý các ký hiệu căn bậc hai
        processedText = processedText.replace(/\\sqrt\{([^{}]+)\}/g, (match, content) => {
            return '\\sqrt{' + content + '}';
        });

        // Xử lý các ký hiệu đặc biệt trong công thức toán học của người dùng
        processedText = processedText.replace(/\\overrightarrow\{([A-Za-z0-9]+)\}/g, '\\overrightarrow{$1}');
        processedText = processedText.replace(/\\overrightarrow ([A-Za-z0-9]+)/g, '\\overrightarrow{$1}');

        // Xử lý các ký hiệu vector đặc biệt
        processedText = processedText.replace(/\\SO/g, '\\overrightarrow{SO}');
        processedText = processedText.replace(/\\OM/g, '\\overrightarrow{OM}');
        processedText = processedText.replace(/\\SM/g, '\\overrightarrow{SM}');

        // Xử lý các ký hiệu phân số đặc biệt
        //processedText = processedText.replace(/([0-9]+)\/([0-9]+)/g, '\\frac{$1}{$2}');

        try {
            // Tạo một container để xử lý MathJax
            const container = document.createElement('div');
            const fragment = document.createRange().createContextualFragment(processedText);
            container.appendChild(fragment);


            // Kích hoạt MathJax để xử lý các công thức toán học
            if (window.MathJax) {
                // Đánh dấu container để MathJax xử lý
                container.className = 'tex2jax_process';

                // Kích hoạt MathJax để xử lý container
                try {
                    // Sử dụng hàm typeset đã được cập nhật
                    if (typeof MathJax.typeset === 'function') {
                        MathJax.typeset([container]);
                    } else {
                        console.log('MathJax.typeset is not a function, using custom typeset');
                        typeset(() => [container]);
                    }
                } catch (err) {
                    console.error('MathJax typeset error:', err);
                }
            }


            return container.innerHTML;
        } catch (e) {
            console.error("General math rendering error:", e);
            return text;
        }
    }

    // Định dạng JSON
    function formatJSON() {
        try {
            const jsonString = jsonEditor.value.trim();
            if (!jsonString) {
                showErrors(['Vui lòng nhập dữ liệu JSON']);
                return;
            }

            const parsedData = JSON.parse(jsonString);
            const formattedJSON = JSON.stringify(parsedData, null, 2);
            jsonEditor.value = formattedJSON;
            updatePreview();
            showSuccess('Đã định dạng JSON thành công');
        } catch (error) {
            showErrors([`Lỗi định dạng JSON: ${error.message}`]);
        }
    }

    // Áp dụng thay đổi
    function applyChanges() {
        try {
            const jsonString = jsonEditor.value.trim();
            if (!jsonString) {
                showErrors(['Vui lòng nhập dữ liệu JSON']);
                return;
            }

            const parsedData = JSON.parse(jsonString);
            const validation = validateData(parsedData);

            if (validation.errors.length > 0) {
                showErrors(validation.errors);
            } else if (validation.warnings.length > 0) {
                showWarnings(validation.warnings);
            } else {
                showSuccess('Dữ liệu hợp lệ');
            }

            updatePreview();
        } catch (error) {
            showErrors([`Lỗi JSON: ${error.message}`]);
        }
    }

    // Kiểm tra câu hỏi trùng lặp
    function checkDuplicates() {
        try {
            const jsonString = jsonEditor.value.trim();
            if (!jsonString) {
                showErrors(['Vui lòng nhập dữ liệu JSON']);
                return;
            }

            const parsedData = JSON.parse(jsonString);

            if (!Array.isArray(parsedData)) {
                showErrors(['Dữ liệu không phải là một mảng']);
                return;
            }

            const duplicates = checkDuplicateQuestions(parsedData);

            if (duplicates.length > 0) {
                const warnings = [];
                duplicates.forEach(dup => {
                    warnings.push(`Câu hỏi ${dup.indices.join(', ')} có nội dung trùng nhau: "${dup.content.substring(0, 80)}..."`);
                });
                showWarnings(warnings);

                // Hiển thị thông tin tổng hợp
                const totalDuplicates = duplicates.reduce((sum, dup) => sum + dup.indices.length, 0);
                console.log(`🔍 Tìm thấy ${duplicates.length} nhóm câu hỏi trùng lặp, tổng ${totalDuplicates} câu hỏi bị trùng`);
            } else {
                showSuccess('✅ Không tìm thấy câu hỏi trùng lặp!');
            }
        } catch (error) {
            showErrors([`Lỗi khi kiểm tra trùng: ${error.message}`]);
        }
    }

    // Validate dữ liệu
    function validateData(data) {
        const errors = [];  // Lỗi nghiêm trọng: các trường bắt buộc bị thiếu
        const warnings = []; // Cảnh báo: các trường không bắt buộc nhưng nên có bị thiếu

        if (!Array.isArray(data)) {
            errors.push('Dữ liệu không phải là một mảng');
            return { errors, warnings };
        }

        data.forEach((item, index) => {
            const itemPrefix = `Câu hỏi ${index + 1}:`;

            // Kiểm tra các trường bắt buộc
            if (!item.type) {
                errors.push(`${itemPrefix} Lỗi loại câu hỏi`);
            }

            if (!item.question) {
                errors.push(`${itemPrefix} Thiếu nội dung câu hỏi`);
            }

            // Kiểm tra các trường tùy thuộc vào loại câu hỏi
            if (item.type === 'MC' || item.type === 'MMC') {
                if (!item.options || !Array.isArray(item.options) || item.options.length < 2) {
                    errors.push(`${itemPrefix} Câu hỏi trắc nghiệm cần ít nhất 2 lựa chọn`);
                }

                if (!item.correctAnswer || !Array.isArray(item.correctAnswer)) {
                    errors.push(`${itemPrefix} Thiếu Đáp án đúng`);
                }
            }

            if (item.type === 'TF') {
                if (!item.statements || !Array.isArray(item.statements) || item.statements.length < 2) {
                    errors.push(`${itemPrefix} Câu hỏi đúng/sai cần ít nhất 2 khẳng định`);
                }

                if (!item.correctAnswer || !Array.isArray(item.correctAnswer)) {
                    errors.push(`${itemPrefix}  Thiếu đáp án đúng`);
                }
            }

            if (item.type === 'SA') {
                if (!item.answers) {
                    errors.push(`${itemPrefix} Thiếu nội dung câu trả lời cho câu hỏi điền vào chỗ trống`);
                }
            }

            // Kiểm tra các trường không bắt buộc nhưng nên có
            if (!item.difficult_level) {
                warnings.push(`${itemPrefix} Thiếu Mức độ khó`);
            }

            if (!item.skill || !Array.isArray(item.skill) || item.skill.length === 0) {
                warnings.push(`${itemPrefix} Thiếu trường Kỹ năng`);
            }

            if (!item.action_word || !Array.isArray(item.action_word) || item.action_word.length === 0) {
                warnings.push(`${itemPrefix} Thiếu trường Động từ`);
            }

            if (!item.solution) {
                warnings.push(`${itemPrefix} Thiếu trường Lời giải`);
            }

            if (!item.hint) {
                warnings.push(`${itemPrefix} Thiếu trường Gợi ý`);
            }

            if (!item.tags || !Array.isArray(item.tags) || item.tags.length === 0) {
                warnings.push(`${itemPrefix} Thiếu trường Thẻ thực tiễn`);
            }
        });

        return { errors, warnings };
    }

    // Kiểm tra trùng nội dung câu hỏi
    function checkDuplicateQuestions(data) {
        if (!Array.isArray(data)) {
            return [];
        }

        const duplicates = [];
        const contentMap = new Map(); // Map để lưu nội dung đã chuẩn hóa và các index tương ứng

        data.forEach((item, index) => {
            if (!item.question) {
                return;
            }

            // Chuẩn hóa nội dung câu hỏi: loại bỏ HTML tags và khoảng trắng thừa
            const normalizedContent = stripHtmlAndCleanWhitespace(item.question);

            if (!normalizedContent) {
                return;
            }

            // Kiểm tra xem nội dung này đã tồn tại chưa
            if (contentMap.has(normalizedContent)) {
                // Nếu đã tồn tại, thêm index hiện tại vào danh sách
                contentMap.get(normalizedContent).push(index + 1); // +1 để hiển thị số thứ tự từ 1
            } else {
                // Nếu chưa tồn tại, tạo mới
                contentMap.set(normalizedContent, [index + 1]);
            }
        });

        // Lọc ra những nội dung có nhiều hơn 1 câu hỏi
        contentMap.forEach((indices, content) => {
            if (indices.length > 1) {
                duplicates.push({
                    content: content,
                    indices: indices
                });
            }
        });

        return duplicates;
    }

    // Select all questions
    function updateSelectAllButtonState() {
        const checkboxes = document.querySelectorAll('.question-checkbox');
        const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
        const someChecked = Array.from(checkboxes).some(cb => cb.checked);

        if (allChecked) {
            selectAllBtn.innerHTML = '<i class="fas fa-square"></i> Bỏ chọn tất cả';
        } else if (someChecked) {
            selectAllBtn.innerHTML = '<i class="fas fa-check-double"></i> Chọn tất cả';
        } else {
            selectAllBtn.innerHTML = '<i class="fas fa-check-double"></i> Chọn tất cả';
        }
    }

    function getSelectedData() {
        const checkboxes = document.querySelectorAll('.question-checkbox');
        const selectedData = [];
        const parsedData = JSON.parse(jsonEditor.value);

        checkboxes.forEach(cb => {
            if (cb.checked) {
                const questionIndex = cb.dataset.index;
                selectedData.push(parsedData[questionIndex]);
            }
        });

        return selectedData;
    }

    function selectAllQuestions() {
        const checkboxes = document.querySelectorAll('.question-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);

        checkboxes.forEach(cb => {
            cb.checked = !allChecked;
        });

        updateSelectAllButtonState();
    }



    // Initialize multi-select dropdowns
    function initializeMultiSelects() {
        // Clear existing options
        skillsOptions.innerHTML = '';
        actionWordsOptions.innerHTML = '';

        // Populate skills dropdown
        skillsData.forEach(skill => {
            const option = document.createElement('div');
            option.className = 'multi-select-option';
            option.dataset.iid = skill.iid;
            option.dataset.name = skill.name;
            option.dataset.code = skill.code;
            option.innerHTML = `
                        ${skill.name}
                        <span class="option-code">${skill.code}</span>
                    `;
            skillsOptions.appendChild(option);
        });

        // Populate action words dropdown
        actionWordsData.forEach(actionWord => {
            const option = document.createElement('div');
            option.className = 'multi-select-option';
            option.dataset.iid = actionWord.iid;
            option.dataset.name = actionWord.name;
            option.textContent = actionWord.name;
            actionWordsOptions.appendChild(option);
        });

        // Skills multi-select event listeners
        skillsTrigger.addEventListener('click', function () {
            const isOpen = skillsDropdown.classList.contains('open');
            closeAllMultiSelects();
            if (!isOpen) {
                skillsDropdown.classList.add('open');
                skillsTrigger.classList.add('open');
                // Focus on search input when dropdown opens
                skillsMultiSelect.querySelector('.search-input').focus();
            }
        });

        // Skills search functionality
        const skillsSearchInput = skillsMultiSelect.querySelector('.search-input');
        skillsSearchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const options = skillsOptions.querySelectorAll('.multi-select-option');
            let hasResults = false;

            options.forEach(option => {
                const name = option.dataset.name.toLowerCase();
                const code = option.dataset.code.toLowerCase();

                if (name.includes(searchTerm) || code.includes(searchTerm)) {
                    option.style.display = 'block';
                    hasResults = true;
                } else {
                    option.style.display = 'none';
                }
            });

            // Show/hide no results message
            let noResultsMsg = skillsOptions.querySelector('.multi-select-no-results');
            if (!hasResults && searchTerm) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.className = 'multi-select-no-results';
                    noResultsMsg.textContent = 'Không tìm thấy kỹ năng phù hợp';
                    skillsOptions.appendChild(noResultsMsg);
                }
            } else if (noResultsMsg) {
                noResultsMsg.remove();
            }
        });

        skillsOptions.addEventListener('click', function (e) {
            if (e.target.classList.contains('multi-select-option')) {
                const option = e.target;
                const iid = option.dataset.iid;
                const name = option.dataset.name;
                const code = option.dataset.code;

                if (option.classList.contains('selected')) {
                    // Deselect
                    option.classList.remove('selected');
                    selectedSkills = selectedSkills.filter(skill => skill.iid !== parseInt(iid));
                } else {
                    // Select
                    option.classList.add('selected');
                    selectedSkills.push({
                        iid: parseInt(iid),
                        name: name,
                        code: code
                    });
                }

                updateSkillsTags();
            }
        });

        // Action words multi-select event listeners
        actionWordsTrigger.addEventListener('click', function () {
            const isOpen = actionWordsDropdown.classList.contains('open');
            closeAllMultiSelects();
            if (!isOpen) {
                actionWordsDropdown.classList.add('open');
                actionWordsTrigger.classList.add('open');
                // Focus on search input when dropdown opens
                actionWordsMultiSelect.querySelector('.search-input').focus();
            }
        });

        // Action words search functionality
        const actionWordsSearchInput = actionWordsMultiSelect.querySelector('.search-input');
        actionWordsSearchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const options = actionWordsOptions.querySelectorAll('.multi-select-option');
            let hasResults = false;

            options.forEach(option => {
                const name = option.dataset.name.toLowerCase();

                if (name.includes(searchTerm)) {
                    option.style.display = 'block';
                    hasResults = true;
                } else {
                    option.style.display = 'none';
                }
            });

            // Show/hide no results message
            let noResultsMsg = actionWordsOptions.querySelector('.multi-select-no-results');
            if (!hasResults && searchTerm) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.className = 'multi-select-no-results';
                    noResultsMsg.textContent = 'Không tìm thấy động từ phù hợp';
                    actionWordsOptions.appendChild(noResultsMsg);
                }
            } else if (noResultsMsg) {
                noResultsMsg.remove();
            }
        });

        actionWordsOptions.addEventListener('click', function (e) {
            if (e.target.classList.contains('multi-select-option')) {
                const option = e.target;
                const iid = option.dataset.iid;
                const name = option.dataset.name;

                if (option.classList.contains('selected')) {
                    // Deselect
                    option.classList.remove('selected');
                    selectedActionWords = selectedActionWords.filter(actionWord => actionWord.iid !== parseInt(iid));
                } else {
                    // Select
                    option.classList.add('selected');
                    selectedActionWords.push({
                        iid: parseInt(iid),
                        name: name
                    });
                }

                updateActionWordsTags();
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function (e) {
            if (!skillsMultiSelect.contains(e.target)) {
                skillsDropdown.classList.remove('open');
                skillsTrigger.classList.remove('open');
            }

            if (!actionWordsMultiSelect.contains(e.target)) {
                actionWordsDropdown.classList.remove('open');
                actionWordsTrigger.classList.remove('open');
            }
        });
    }

    // Close all multi-select dropdowns
    function closeAllMultiSelects() {
        skillsDropdown.classList.remove('open');
        skillsTrigger.classList.remove('open');
        actionWordsDropdown.classList.remove('open');
        actionWordsTrigger.classList.remove('open');
    }

    // Update skills tags display
    function updateSkillsTags() {
        skillsTags.innerHTML = '';
        selectedSkills.forEach(skill => {
            const tag = document.createElement('div');
            tag.className = 'multi-select-tag';
            tag.innerHTML = `
                        ${skill.name}
                        <button type="button" data-iid="${skill.iid}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
            skillsTags.appendChild(tag);

            // Add event listener to remove button
            tag.querySelector('button').addEventListener('click', function () {
                const iid = parseInt(this.dataset.iid);
                selectedSkills = selectedSkills.filter(skill => skill.iid !== iid);
                updateSkillsTags();

                // Update dropdown selection
                const option = skillsOptions.querySelector(`[data-iid="${iid}"]`);
                if (option) {
                    option.classList.remove('selected');
                }
            });
        });
    }

    // Update action words tags display
    function updateActionWordsTags() {
        actionWordsTags.innerHTML = '';
        selectedActionWords.forEach(actionWord => {
            const tag = document.createElement('div');
            tag.className = 'multi-select-tag';
            tag.innerHTML = `
                        ${actionWord.name}
                        <button type="button" data-iid="${actionWord.iid}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
            actionWordsTags.appendChild(tag);

            // Add event listener to remove button
            tag.querySelector('button').addEventListener('click', function () {
                const iid = parseInt(this.dataset.iid);
                selectedActionWords = selectedActionWords.filter(actionWord => actionWord.iid !== iid);
                updateActionWordsTags();

                // Update dropdown selection
                const option = actionWordsOptions.querySelector(`[data-iid="${iid}"]`);
                if (option) {
                    option.classList.remove('selected');
                }
            });
        });
    }

    // Open edit modal for a question
    function openEditModal(index) {
        try {
            const data = JSON.parse(jsonEditor.value);
            const question = data[index];

            if (!question) {
                showErrors([`Câu hỏi ${index + 1} không tồn tại`]);
                return;
            }

            currentEditIndex = index;

            // Reset multi-selects
            selectedSkills = [];
            selectedActionWords = [];

            // Set form values
            editType.value = question.type || 'MC';
            editQuestion.value = question.question || '';
            editDifficultLevel.value = question.difficult_level || '';
            editSolution.value = question.solution || '';
            editHint.value = question.hint || '';
            editTags.value = question.tags ? question.tags.join(', ') : '';

            // Set selected skills
            if (question.skill && Array.isArray(question.skill)) {
                question.skill.forEach(skill => {
                    const skillData = skillsData.find(s => s.iid === skill.iid || s.code === skill.code);
                    if (skillData) {
                        selectedSkills.push({
                            iid: skillData.iid,
                            name: skillData.name,
                            code: skillData.code
                        });
                    } else if (skill.iid || skill.name) {
                        selectedSkills.push(skill);
                    }
                });
            }
            updateSkillsTags();

            // Update skills dropdown selection
            skillsOptions.querySelectorAll('.multi-select-option').forEach(option => {
                const iid = parseInt(option.dataset.iid);
                if (selectedSkills.some(skill => skill.iid === iid)) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });

            // Set selected action words
            if (question.action_word && Array.isArray(question.action_word)) {
                question.action_word.forEach(actionWord => {
                    const actionWordData = actionWordsData.find(a => a.iid == actionWord.iid);
                    if (actionWordData) {
                        selectedActionWords.push({
                            iid: actionWordData.iid,
                            name: actionWordData.name
                        });
                    } else if (actionWord.iid || actionWord.name) {
                        selectedActionWords.push(actionWord);
                    }
                });
            }
            updateActionWordsTags();

            // Update action words dropdown selection
            actionWordsOptions.querySelectorAll('.multi-select-option').forEach(option => {
                const iid = parseInt(option.dataset.iid);
                if (selectedActionWords.some(actionWord => actionWord.iid === iid)) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });

            // Set options for MC/MMC
            if (question.type === 'MC' || question.type === 'MMC') {
                mcOptionsContainer.style.display = 'block';
                tfStatementsContainer.style.display = 'none';
                fillAnswerContainer.style.display = 'none';
                mpMatchingContainer.style.display = 'none';
                mddmDragDropContainer.style.display = 'none';
                mroReorderingContainer.style.display = 'none';

                // Clear and populate options
                optionsContainer.innerHTML = '';
                if (question.options && Array.isArray(question.options)) {
                    question.options.forEach((option, i) => {
                        const optionDiv = document.createElement('div');
                        optionDiv.className = 'form-group';
                        optionDiv.innerHTML = `
                                    <div class="input-group">
                                        <input type="text" class="form-control option-input" value="${option}" data-index="${i}">
                                        <button type="button" class="btn-remove-option btn-secondary" data-index="${i}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                `;
                        optionsContainer.appendChild(optionDiv);
                    });
                }

                // Set correct answers
                correctAnswersContainer.innerHTML = '';
                if (question.correctAnswer && Array.isArray(question.correctAnswer)) {
                    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                    optionLabels.forEach((label, i) => {
                        if (i < (question.options ? question.options.length : 0)) {
                            const isChecked = question.correctAnswer.includes(label);
                            const div = document.createElement('div');
                            div.className = 'form-check';
                            div.innerHTML = `
                                        <input class="form-check-input correct-answer-checkbox" type="checkbox" value="${label}" id="correctAnswer${i}" ${isChecked ? 'checked' : ''}>
                                        <label class="form-check-label" for="correctAnswer${i}">${label}</label>
                                    `;
                            correctAnswersContainer.appendChild(div);
                        }
                    });
                }
            }

            // Set statements for TF
            else if (question.type === 'TF') {
                mcOptionsContainer.style.display = 'none';
                tfStatementsContainer.style.display = 'block';
                fillAnswerContainer.style.display = 'none';
                mpMatchingContainer.style.display = 'none';
                mddmDragDropContainer.style.display = 'none';
                mroReorderingContainer.style.display = 'none';

                // Clear and populate statements
                statementsContainer.innerHTML = '';
                if (question.statements && Array.isArray(question.statements)) {
                    question.statements.forEach((statement, i) => {
                        const statementDiv = document.createElement('div');
                        statementDiv.className = 'form-group';
                        statementDiv.innerHTML = `
                                    <div class="input-group">
                                        <input type="text" class="form-control statement-input" value="${statement}" data-index="${i}">
                                        <button type="button" class="btn-remove-statement btn-secondary" data-index="${i}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                `;
                        statementsContainer.appendChild(statementDiv);
                    });
                }

                // Set correct answers
                correctAnswersContainerTF.innerHTML = '';
                if (question.correctAnswer && Array.isArray(question.correctAnswer)) {
                    const statementLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
                    statementLabels.forEach((label, i) => {
                        if (i < (question.statements ? question.statements.length : 0)) {
                            const isChecked = question.correctAnswer.includes(label);
                            const div = document.createElement('div');
                            div.className = 'form-check';
                            div.innerHTML = `
                                        <input class="form-check-input correct-answer-checkbox-tf" type="checkbox" value="${label}" id="correctAnswerTF${i}" ${isChecked ? 'checked' : ''}>
                                        <label class="form-check-label" for="correctAnswerTF${i}">${label}</label>
                                    `;
                            correctAnswersContainerTF.appendChild(div);
                        }
                    });
                }
            }

            // Set answer for FILL
            else if (question.type === 'SA') {
                mcOptionsContainer.style.display = 'none';
                tfStatementsContainer.style.display = 'none';
                fillAnswerContainer.style.display = 'none';
                mpMatchingContainer.style.display = 'none';
                mddmDragDropContainer.style.display = 'none';
                mroReorderingContainer.style.display = 'none';

                editAnswer.value = question.answers || '';
            }

            // Set items for MP (Matching Pairs)
            else if (question.type === 'MP') {
                mcOptionsContainer.style.display = 'none';
                tfStatementsContainer.style.display = 'none';
                fillAnswerContainer.style.display = 'none';
                mpMatchingContainer.style.display = 'block';
                mddmDragDropContainer.style.display = 'none';
                mroReorderingContainer.style.display = 'none';

                // Clear and populate left items
                leftItemsContainer.innerHTML = '';
                if (question.left && Array.isArray(question.left)) {
                    question.left.forEach((item, i) => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'form-group';
                        itemDiv.innerHTML = `
                            <div class="input-group">
                                <input type="text" class="form-control left-item-input" value="${item}" data-index="${i}">
                                <button type="button" class="btn-remove-left-item btn-secondary" data-index="${i}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;
                        leftItemsContainer.appendChild(itemDiv);
                    });
                }

                // Clear and populate right items
                rightItemsContainer.innerHTML = '';
                if (question.right && Array.isArray(question.right)) {
                    question.right.forEach((item, i) => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'form-group';
                        itemDiv.innerHTML = `
                            <div class="input-group">
                                <input type="text" class="form-control right-item-input" value="${item}" data-index="${i}">
                                <button type="button" class="btn-remove-right-item btn-secondary" data-index="${i}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;
                        rightItemsContainer.appendChild(itemDiv);
                    });
                }
            }

            // Set options for MDDM (Drag and Drop Multiple)
            else if (question.type === 'MDDM') {
                mcOptionsContainer.style.display = 'none';
                tfStatementsContainer.style.display = 'none';
                fillAnswerContainer.style.display = 'none';
                mpMatchingContainer.style.display = 'none';
                mddmDragDropContainer.style.display = 'block';
                mroReorderingContainer.style.display = 'none';

                // Clear and populate drag drop options
                dragDropOptionsContainer.innerHTML = '';
                if (question.options && Array.isArray(question.options)) {
                    question.options.forEach((option, i) => {
                        const optionDiv = document.createElement('div');
                        optionDiv.className = 'form-group';
                        optionDiv.innerHTML = `
                            <div class="input-group">
                                <input type="text" class="form-control dragdrop-option-input" value="${option}" data-index="${i}">
                                <button type="button" class="btn-remove-dragdrop-option btn-secondary" data-index="${i}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;
                        dragDropOptionsContainer.appendChild(optionDiv);
                    });
                }

                // Set correct answer
                if (question.correctAnswer && Array.isArray(question.correctAnswer)) {
                    editCorrectAnswerMDDM.value = question.correctAnswer.join(',');
                } else {
                    editCorrectAnswerMDDM.value = '';
                }
            }

            // Set items for MRO (Multiple Reordering)
            else if (question.type === 'MRO') {
                mcOptionsContainer.style.display = 'none';
                tfStatementsContainer.style.display = 'none';
                fillAnswerContainer.style.display = 'none';
                mpMatchingContainer.style.display = 'none';
                mddmDragDropContainer.style.display = 'none';
                mroReorderingContainer.style.display = 'block';

                // Clear and populate reorder items
                reorderItemsContainer.innerHTML = '';
                if (question.items && Array.isArray(question.items)) {
                    question.items.forEach((item, i) => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'form-group';

                        // Create input group
                        const inputGroup = document.createElement('div');
                        inputGroup.className = 'input-group';

                        // Create input
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.className = 'form-control reorder-item-input';
                        input.value = item; // Safely set value
                        input.dataset.index = i;

                        // Create remove button
                        const removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.className = 'btn-remove-reorder-item btn-secondary';
                        removeBtn.dataset.index = i;
                        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';

                        // Add event listener to remove button
                        removeBtn.addEventListener('click', function () {
                            itemDiv.remove();
                        });

                        // Assemble
                        inputGroup.appendChild(input);
                        inputGroup.appendChild(removeBtn);
                        itemDiv.appendChild(inputGroup);
                        reorderItemsContainer.appendChild(itemDiv);
                    });
                }
                // Note: correctAnswer will be auto-generated as [0, 1, 2, ...] based on items length
            }

            // Default case - hide all type-specific containers
            else {
                mcOptionsContainer.style.display = 'none';
                tfStatementsContainer.style.display = 'none';
                fillAnswerContainer.style.display = 'none';
                mpMatchingContainer.style.display = 'none';
                mddmDragDropContainer.style.display = 'none';
                mroReorderingContainer.style.display = 'none';
            }

            // Show modal
            editModal.classList.add('active');
        } catch (error) {
            showErrors([`Lỗi khi mở modal chỉnh sửa: ${error.message}`]);
        }
    }

    // Save edited question
    function saveEditedQuestion() {
        try {
            const data = JSON.parse(jsonEditor.value);

            if (currentEditIndex < 0 || currentEditIndex >= data.length) {
                showErrors(['Chỉ số câu hỏi không hợp lệ']);
                return;
            }

            // Get form values
            const type = editType.value;
            const question = editQuestion.value;
            const difficultLevel = editDifficultLevel.value;
            const solution = editSolution.value;
            const hint = editHint.value;
            const tags = editTags.value.split(',').map(tag => tag.trim()).filter(tag => tag);

            // Create updated question object
            const updatedQuestion = {
                ...data[currentEditIndex],
                type,
                question,
                difficult_level: difficultLevel,
                skill: selectedSkills,
                action_word: selectedActionWords,
                solution,
                hint,
                tags
            };

            // Add type-specific fields
            if (type === 'MC' || type === 'MMC') {
                // Get options
                const optionInputs = document.querySelectorAll('.option-input');
                const options = Array.from(optionInputs).map(input => input.value);

                // Get correct answers
                const correctAnswerCheckboxes = document.querySelectorAll('.correct-answer-checkbox:checked');
                const correctAnswer = Array.from(correctAnswerCheckboxes).map(cb => cb.value);

                updatedQuestion.options = options;
                updatedQuestion.correctAnswer = correctAnswer;
            }
            else if (type === 'TF') {
                // Get statements
                const statementInputs = document.querySelectorAll('.statement-input');
                const statements = Array.from(statementInputs).map(input => input.value);

                // Get correct answers
                const correctAnswerCheckboxes = document.querySelectorAll('.correct-answer-checkbox-tf:checked');
                const correctAnswer = Array.from(correctAnswerCheckboxes).map(cb => cb.value);

                updatedQuestion.statements = statements;
                updatedQuestion.correctAnswer = correctAnswer;
            }
            else if (type === 'SA') {
                const answer = [];
                const regex = /__([^_]*?)__|\[([^\[\]]*?\|[^[\]]*?)\]/g;
                let match;

                while ((match = regex.exec(question)) !== null) {
                    if (match[1] !== undefined) {
                        const parts = match[1]
                            .split('/')
                            .map(s => s.trim())
                            .filter(s => s !== '');
                        if (parts.length > 0) answer.push(parts);
                    } else if (match[2] !== undefined) {
                        const firstOption = match[2].split('|')[0]?.trim();
                        if (firstOption !== undefined && firstOption !== '') {
                            answer.push([firstOption]);
                        }
                    }
                }
                updatedQuestion.answers = answer;
            }
            else if (type === 'MP') {
                // Get left items
                const leftItemInputs = document.querySelectorAll('.left-item-input');
                const leftItems = Array.from(leftItemInputs).map(input => input.value);

                // Get right items
                const rightItemInputs = document.querySelectorAll('.right-item-input');
                const rightItems = Array.from(rightItemInputs).map(input => input.value);

                updatedQuestion.left = leftItems;
                updatedQuestion.right = rightItems;
            }
            else if (type === 'MDDM') {
                // Get drag drop options
                const dragDropOptionInputs = document.querySelectorAll('.dragdrop-option-input');
                const options = Array.from(dragDropOptionInputs).map(input => input.value);

                // Get correct answer (parse comma-separated indices)
                const correctAnswerStr = editCorrectAnswerMDDM.value.trim();
                const correctAnswer = correctAnswerStr ? correctAnswerStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];

                updatedQuestion.options = options;
                updatedQuestion.correctAnswer = correctAnswer;
            }
            else if (type === 'MRO') {
                // Get reorder items
                const reorderItemInputs = document.querySelectorAll('.reorder-item-input');
                const items = Array.from(reorderItemInputs).map(input => input.value);
                updatedQuestion.items = items;
            }

            // Update data
            data[currentEditIndex] = updatedQuestion;
            jsonEditor.value = JSON.stringify(data, null, 2);

            // Close modal
            editModal.classList.remove('active');

            // OPTIMIZED: Only update the specific question item instead of full re-render
            updateSingleQuestionPreview(currentEditIndex, updatedQuestion);

            // Show success message
            showSuccess(`Đã cập nhật câu hỏi ${currentEditIndex + 1}`);
        } catch (error) {
            showErrors([`Lỗi khi lưu câu hỏi: ${error.message}`]);
        }
    }

    // Add option to MC question
    function addOption() {
        const optionIndex = document.querySelectorAll('.option-input').length;
        const optionDiv = document.createElement('div');
        optionDiv.className = 'form-group';
        optionDiv.innerHTML = `
                    <div class="input-group">
                        <input type="text" class="form-control option-input" value="" data-index="${optionIndex}">
                        <button type="button" class="btn-remove-option btn-secondary" data-index="${optionIndex}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
        optionsContainer.appendChild(optionDiv);

        // Add to correct answers
        const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        if (optionIndex < optionLabels.length) {
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                        <input class="form-check-input correct-answer-checkbox" type="checkbox" value="${optionLabels[optionIndex]}" id="correctAnswer${optionIndex}">
                        <label class="form-check-label" for="correctAnswer${optionIndex}">${optionLabels[optionIndex]}</label>
                    `;
            correctAnswersContainer.appendChild(div);
        }

        // Add event listener to remove button
        optionDiv.querySelector('.btn-remove-option').addEventListener('click', function () {
            removeOption(this.dataset.index);
        });
    }

    // Remove option from MC question
    function removeOption(index) {
        // Remove option input
        const optionInputs = document.querySelectorAll('.option-input');
        if (optionInputs[index]) {
            optionInputs[index].closest('.form-group').remove();
        }

        // Re-index remaining options
        const remainingOptions = document.querySelectorAll('.option-input');
        remainingOptions.forEach((input, i) => {
            input.dataset.index = i;
            input.closest('.form-group').querySelector('.btn-remove-option').dataset.index = i;
        });

        // Rebuild correct answers
        correctAnswersContainer.innerHTML = '';
        const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        optionLabels.forEach((label, i) => {
            if (i < remainingOptions.length) {
                const div = document.createElement('div');
                div.className = 'form-check';
                div.innerHTML = `
                            <input class="form-check-input correct-answer-checkbox" type="checkbox" value="${label}" id="correctAnswer${i}">
                            <label class="form-check-label" for="correctAnswer${i}">${label}</label>
                        `;
                correctAnswersContainer.appendChild(div);
            }
        });
    }

    // Add statement to TF question
    function addStatement() {
        const statementIndex = document.querySelectorAll('.statement-input').length;
        const statementDiv = document.createElement('div');
        statementDiv.className = 'form-group';
        statementDiv.innerHTML = `
                    <div class="input-group">
                        <input type="text" class="form-control statement-input" value="" data-index="${statementIndex}">
                        <button type="button" class="btn-remove-statement btn-secondary" data-index="${statementIndex}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
        statementsContainer.appendChild(statementDiv);

        // Add to correct answers
        const statementLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        if (statementIndex < statementLabels.length) {
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                        <input class="form-check-input correct-answer-checkbox-tf" type="checkbox" value="${statementLabels[statementIndex]}" id="correctAnswerTF${statementIndex}">
                        <label class="form-check-label" for="correctAnswerTF${statementIndex}">${statementLabels[statementIndex]}</label>
                    `;
            correctAnswersContainerTF.appendChild(div);
        }

        // Add event listener to remove button
        statementDiv.querySelector('.btn-remove-statement').addEventListener('click', function () {
            removeStatement(this.dataset.index);
        });
    }

    // Remove statement from TF question
    function removeStatement(index) {
        // Remove statement input
        const statementInputs = document.querySelectorAll('.statement-input');
        if (statementInputs[index]) {
            statementInputs[index].closest('.form-group').remove();
        }

        // Re-index remaining statements
        const remainingStatements = document.querySelectorAll('.statement-input');
        remainingStatements.forEach((input, i) => {
            input.dataset.index = i;
            input.closest('.form-group').querySelector('.btn-remove-statement').dataset.index = i;
        });

        // Rebuild correct answers
        correctAnswersContainerTF.innerHTML = '';
        const statementLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        statementLabels.forEach((label, i) => {
            if (i < remainingStatements.length) {
                const div = document.createElement('div');
                div.className = 'form-check';
                div.innerHTML = `
                            <input class="form-check-input correct-answer-checkbox-tf" type="checkbox" value="${label}" id="correctAnswerTF${i}">
                            <label class="form-check-label" for="correctAnswerTF${i}">${label}</label>
                        `;
                correctAnswersContainerTF.appendChild(div);
            }
        });
    }

    // Add left item to MP question
    function addLeftItem() {
        const itemIndex = document.querySelectorAll('.left-item-input').length;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'form-group';
        itemDiv.innerHTML = `
            <div class="input-group">
                <input type="text" class="form-control left-item-input" value="" data-index="${itemIndex}">
                <button type="button" class="btn-remove-left-item btn-secondary" data-index="${itemIndex}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        leftItemsContainer.appendChild(itemDiv);

        // Add event listener to remove button
        itemDiv.querySelector('.btn-remove-left-item').addEventListener('click', function () {
            this.closest('.form-group').remove();
        });
    }

    // Add right item to MP question
    function addRightItem() {
        const itemIndex = document.querySelectorAll('.right-item-input').length;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'form-group';
        itemDiv.innerHTML = `
            <div class="input-group">
                <input type="text" class="form-control right-item-input" value="" data-index="${itemIndex}">
                <button type="button" class="btn-remove-right-item btn-secondary" data-index="${itemIndex}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        rightItemsContainer.appendChild(itemDiv);

        // Add event listener to remove button
        itemDiv.querySelector('.btn-remove-right-item').addEventListener('click', function () {
            this.closest('.form-group').remove();
        });
    }

    // Add drag drop option to MDDM question
    function addDragDropOption() {
        const optionIndex = document.querySelectorAll('.dragdrop-option-input').length;
        const optionDiv = document.createElement('div');
        optionDiv.className = 'form-group';
        optionDiv.innerHTML = `
            <div class="input-group">
                <input type="text" class="form-control dragdrop-option-input" value="" data-index="${optionIndex}">
                <button type="button" class="btn-remove-dragdrop-option btn-secondary" data-index="${optionIndex}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        dragDropOptionsContainer.appendChild(optionDiv);

        // Add event listener to remove button
        optionDiv.querySelector('.btn-remove-dragdrop-option').addEventListener('click', function () {
            this.closest('.form-group').remove();
        });
    }

    // Add reorder item to MRO question
    function addReorderItem() {
        const itemIndex = document.querySelectorAll('.reorder-item-input').length;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'form-group';
        itemDiv.innerHTML = `
            <div class="input-group">
                <input type="text" class="form-control reorder-item-input" value="" data-index="${itemIndex}">
                <button type="button" class="btn-remove-reorder-item btn-secondary" data-index="${itemIndex}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        reorderItemsContainer.appendChild(itemDiv);

        // Add event listener to remove button
        itemDiv.querySelector('.btn-remove-reorder-item').addEventListener('click', function () {
            this.closest('.form-group').remove();
        });
    }

    // Handle question type change in edit modal
    editType.addEventListener('change', function () {
        const type = this.value;

        if (type === 'MC' || type === 'MMC') {
            mcOptionsContainer.style.display = 'block';
            tfStatementsContainer.style.display = 'none';
            fillAnswerContainer.style.display = 'none';
            mpMatchingContainer.style.display = 'none';
            mddmDragDropContainer.style.display = 'none';
            mroReorderingContainer.style.display = 'none';
        } else if (type === 'TF') {
            mcOptionsContainer.style.display = 'none';
            tfStatementsContainer.style.display = 'block';
            fillAnswerContainer.style.display = 'none';
            mpMatchingContainer.style.display = 'none';
            mddmDragDropContainer.style.display = 'none';
            mroReorderingContainer.style.display = 'none';
        } else if (type === 'SA') {
            mcOptionsContainer.style.display = 'none';
            tfStatementsContainer.style.display = 'none';
            fillAnswerContainer.style.display = 'block';
            mpMatchingContainer.style.display = 'none';
            mddmDragDropContainer.style.display = 'none';
            mroReorderingContainer.style.display = 'none';
        } else if (type === 'MP') {
            mcOptionsContainer.style.display = 'none';
            tfStatementsContainer.style.display = 'none';
            fillAnswerContainer.style.display = 'none';
            mpMatchingContainer.style.display = 'block';
            mddmDragDropContainer.style.display = 'none';
            mroReorderingContainer.style.display = 'none';
        } else if (type === 'MDDM') {
            mcOptionsContainer.style.display = 'none';
            tfStatementsContainer.style.display = 'none';
            fillAnswerContainer.style.display = 'none';
            mpMatchingContainer.style.display = 'none';
            mddmDragDropContainer.style.display = 'block';
            mroReorderingContainer.style.display = 'none';
        } else if (type === 'MRO') {
            mcOptionsContainer.style.display = 'none';
            tfStatementsContainer.style.display = 'none';
            fillAnswerContainer.style.display = 'none';
            mpMatchingContainer.style.display = 'none';
            mddmDragDropContainer.style.display = 'none';
            mroReorderingContainer.style.display = 'block';
        }
    });

    // Hàm tạo lời giải bằng AI
    function generateSolution() {
        const question = editQuestion.value;
        const type = editType.value;

        showWarnings(['Chức năng đang phát triển']);
        return;

    }

    // Hàm tạo gợi ý bằng AI
    async function generateHint() {
        const question = editQuestion.value;

        if (!question) {
            showErrors(['Vui lòng nhập nội dung câu hỏi trước khi tạo gợi ý']);
            return;
        }

        // Hiển thị trạng thái đang tải
        generateHintBtn.disabled = true;
        generateHintBtn.classList.add('loading');

        try {
            // Gọi hàm tạo gợi ý.
            // Chờ hàm genHint hoàn thành và trả về kết quả
            const hint = await genHint(question);

            // Điền gợi ý vào textarea
            editHint.value = hint;

            // Hiển thị thông báo thành công
            showSuccess('Đã tạo gợi ý bằng AI thành công');

        } catch (error) {
            // Xử lý lỗi nếu việc tạo gợi ý thất bại
            showErrors([`Lỗi khi tạo gợi ý: ${error.message}`]);
        } finally {
            // Dù thành công hay thất bại, luôn xóa trạng thái đang tải
            generateHintBtn.disabled = false;
            generateHintBtn.classList.remove('loading');
        }
    }

    // Hàm tạo động từ chỉ thị bằng AI
    async function generateActionWords() {
        const question = editQuestion.value;
        const solution = editSolution.value
        const level = editDifficultLevel.value

        if (!question) {
            showErrors(['Vui lòng nhập nội dung câu hỏi trước khi tạo động từ chỉ thị']);
            return;
        }

        // Hiển thị trạng thái đang tải
        generateActionWordsBtn.disabled = true;
        generateActionWordsBtn.classList.add('loading');

        // Mô phỏng API call
        try {
            // Gọi hàm tạo động từ chỉ thị.
            // Chờ hàm genActionWord hoàn thành và trả về kết quả
            const actionWords = await genActionWord(question, solution, "M" + level);

            // Điền gợi ý vào textarea
            selectedActionWords = actionWords.student_competency_iids.split(",").map(item => actionWordsData.filter(ac => ac.iid == item)[0]);
            updateActionWordsTags();

            // Hiển thị thông báo thành công
            showSuccess('Đã tạo gợi ý bằng AI thành công');

        } catch (error) {
            // Xử lý lỗi nếu việc tạo gợi ý thất bại
            showErrors([`Lỗi khi tạo gợi ý: ${error.message}`]);
        } finally {
            // Dù thành công hay thất bại, luôn xóa trạng thái đang tải
            generateActionWordsBtn.disabled = false;
            generateActionWordsBtn.classList.remove('loading');
        }
    }

    // Hàm tạo thẻ bằng AI
    async function generateTags() {
        const question = editQuestion.value;
        const type = editType.value;

        if (!question) {
            showErrors(['Vui lòng nhập nội dung câu hỏi trước khi tạo thẻ']);
            return;
        }

        // Hiển thị trạng thái đang tải
        generateTagsBtn.disabled = true;
        generateTagsBtn.classList.add('loading');

        try {
            // Gọi hàm tạo thẻ.
            // Chờ hàm genTags hoàn thành và trả về kết quả
            const tags = await genTags(question, type);

            // Điền thẻ vào textarea
            selectedTags = tags.join(",")
            editTags.value = selectedTags;

        } catch (error) {
            // Xử lý lỗi nếu việc tạo thẻ thất bại
            showErrors([`Lỗi khi tạo thẻ: ${error.message}`]);
        } finally {
            // Dù thành công hay thất bại, luôn xóa trạng thái đang tải
            generateTagsBtn.disabled = false;
            generateTagsBtn.classList.remove('loading');
        }
    }

    // Hàm tạo lời giải hàng loạt
    function batchGenerateSolution() {
        showErrors(['Chức năng đang phát triển']);
        return;

    }

    // Hàm tạo gợi ý hàng loạt
    async function batchGenerateHint() {
        const checkboxes = document.querySelectorAll('.question-checkbox:checked');
        if (checkboxes.length === 0) {
            showErrors(['Vui lòng chọn ít nhất một câu hỏi để tạo gợi ý']);
            return;
        }

        const progressId = 'hint-' + Date.now();

        // Hiển thị trạng thái đang tải
        batchGenerateHintBtn.disabled = true;
        batchGenerateHintBtn.classList.add('loading');

        // Tạo progress item
        createProgressItem(progressId, 'Đang tạo gợi ý...', checkboxes.length);

        try {
            const data = JSON.parse(jsonEditor.value);

            // *** THAY ĐỔI CHÍNH BẮT ĐẦU TỪ ĐÂY ***
            // Sử dụng vòng lặp for...of để xử lý tuần tự thay vì Promise.all
            let processedCount = 0;
            for (const checkbox of checkboxes) {
                const index = parseInt(checkbox.dataset.index);
                if (index >= 0 && index < data.length) {
                    const question = data[index];

                    // Cập nhật progress
                    updateProgressItem(progressId, processedCount, `Đang xử lý câu hỏi ${index + 1}...`);

                    // Dùng await để đợi từng request hoàn thành trước khi sang vòng lặp tiếp theo
                    const hint = await genHint(question.raw[HEADER_REFERENCE.CONTENT] + "HD giải: " + question.raw[HEADER_REFERENCE.EXPLANATION]);

                    // Cập nhật hint vào mảng data
                    let jsonEditorValue = JSON.parse(jsonEditor.value);
                    jsonEditorValue[index].hint = replaceLatexCommands(hint);
                    jsonEditor.value = JSON.stringify(jsonEditorValue, null, 2);
                    updateSingleQuestionPreview(index, jsonEditorValue[index], true);

                    processedCount++;
                    updateProgressItem(progressId, processedCount, `Đã hoàn thành ${processedCount}/${checkboxes.length} câu hỏi`);
                }
            }




            batchGenerateHintBtn.disabled = false;
            batchGenerateHintBtn.classList.remove('loading');
            // Đánh dấu hoàn thành
            completeProgressItem(progressId, `Đã tạo gợi ý cho ${checkboxes.length} câu hỏi thành công`);
        } catch (error) {
            showErrors([`Lỗi khi tạo gợi ý hàng loạt: ${error.message}`]);
            errorProgressItem(progressId, error.message);
            batchGenerateHintBtn.disabled = false;
            batchGenerateHintBtn.classList.remove('loading');
        }
    }

    // Hàm tạo động từ chỉ thị hàng loạt
    async function batchGenerateActionWords() {
        const checkboxes = document.querySelectorAll('.question-checkbox:checked');
        if (checkboxes.length === 0) {
            showErrors(['Vui lòng chọn ít nhất một câu hỏi để tạo động từ chỉ thị']);
            return;
        }

        const progressId = 'actionwords-' + Date.now();

        // Tạo progress item
        createProgressItem(progressId, 'Đang tạo động từ chỉ thị...', checkboxes.length);

        // Hiển thị trạng thái đang tải
        batchGenerateActionWordsBtn.disabled = true;
        batchGenerateActionWordsBtn.classList.add('loading');

        // Mô phỏng API call
        try {
            const data = JSON.parse(jsonEditor.value);

            // *** THAY ĐỔI CHÍNH BẮT ĐẦU TỪ ĐÂY ***
            // Sử dụng vòng lặp for...of để xử lý tuần tự thay vì Promise.all
            let processedCount = 0;
            for (const checkbox of checkboxes) {
                const index = parseInt(checkbox.dataset.index);
                if (index >= 0 && index < data.length) {
                    const question = data[index];

                    // Cập nhật progress
                    updateProgressItem(progressId, processedCount, `Đang xử lý câu hỏi ${index + 1}...`);

                    // Dùng await để đợi từng request hoàn thành trước khi sang vòng lặp tiếp theo
                    const actionWords = await genActionWord(question.raw[HEADER_REFERENCE.CONTENT], question.raw[HEADER_REFERENCE.EXPLANATION], question.raw[HEADER_REFERENCE.LEVEL]);

                    // Cập nhật hint vào mảng data
                    let jsonEditorValue = JSON.parse(jsonEditor.value);
                    jsonEditorValue[index].action_word = actionWords.student_competency_iids.split(",").map(item => actionWordsData.filter(ac => ac.iid == item)[0]);
                    jsonEditor.value = JSON.stringify(jsonEditorValue, null, 2);
                    updateSingleQuestionPreview(index, jsonEditorValue[index], true);

                    processedCount++;
                    updateProgressItem(progressId, processedCount, `Đã hoàn thành ${processedCount}/${checkboxes.length} câu hỏi`);

                }
            }

            batchGenerateActionWordsBtn.disabled = false;
            batchGenerateActionWordsBtn.classList.remove('loading');
            // Đánh dấu hoàn thành
            completeProgressItem(progressId, `Đã tạo động từ chỉ thị cho ${checkboxes.length} câu hỏi thành công`);
        } catch (error) {
            showErrors([`Lỗi khi tạo động từ chỉ thị hàng loạt: ${error.message}`]);
            errorProgressItem(progressId, error.message);
            batchGenerateActionWordsBtn.disabled = false;
            batchGenerateActionWordsBtn.classList.remove('loading');
        }
    }

    // Hàm tạo thẻ hàng loạt
    async function batchGenerateTags() {
        const checkboxes = document.querySelectorAll('.question-checkbox:checked');
        if (checkboxes.length === 0) {
            showErrors(['Vui lòng chọn ít nhất một câu hỏi để tạo thẻ']);
            return;
        }

        const progressId = 'tags-' + Date.now();

        // Tạo progress item
        createProgressItem(progressId, 'Đang tạo thẻ...', checkboxes.length);

        // Hiển thị trạng thái đang tải
        batchGenerateTagsBtn.disabled = true;
        batchGenerateTagsBtn.classList.add('loading');

        // Mô phỏng API call
        try {
            const data = JSON.parse(jsonEditor.value);
            let updatedCount = 0;

            for (const checkbox of checkboxes) {
                const index = parseInt(checkbox.dataset.index);
                if (index >= 0 && index < data.length) {
                    const question = data[index];

                    // Cập nhật progress
                    updateProgressItem(progressId, updatedCount, `Đang xử lý câu hỏi ${index + 1}...`);

                    // Tạo thẻ dựa trên loại câu hỏi và nội dung
                    let tags = await genTags(question.raw[HEADER_REFERENCE.CONTENT], question.raw[HEADER_REFERENCE.EXPLANATION], question.raw[HEADER_REFERENCE.LEVEL]);

                    // Loại bỏ trùng lặp
                    tags = [...new Set(tags)];

                    // Cập nhật thẻ
                    let jsonEditorValue = JSON.parse(jsonEditor.value);
                    jsonEditorValue[index].tags = tags;
                    jsonEditor.value = JSON.stringify(jsonEditorValue, null, 2);
                    updateSingleQuestionPreview(index, jsonEditorValue[index], true);
                    updatedCount++;
                    updateProgressItem(progressId, updatedCount, `Đã hoàn thành ${updatedCount}/${checkboxes.length} câu hỏi`);
                }
            }


            batchGenerateTagsBtn.disabled = false;
            batchGenerateTagsBtn.classList.remove('loading');
            // Đánh dấu hoàn thành
            completeProgressItem(progressId, `Đã tạo thẻ cho ${updatedCount} câu hỏi thành công`);
        } catch (error) {
            showErrors([`Lỗi khi tạo thẻ hàng loạt: ${error.message}`]);
            batchGenerateTagsBtn.disabled = false;
            batchGenerateTagsBtn.classList.remove('loading');
            errorProgressItem(progressId, error.message);
        }
    }

    async function batchAddTags() {
        const checkboxes = document.querySelectorAll('.question-checkbox:checked');
        if (checkboxes.length === 0) {
            showErrors(['Vui lòng chọn ít nhất một câu hỏi để thêm thẻ']);
            return;
        }

        let newTags = prompt("Nhập thẻ mới cách nhau bởi dấu phẩy:");

        if (!newTags) {
            showErrors(['Vui lòng nhập thẻ']);
            batchAddTagsBtn.disabled = false;
            batchAddTagsBtn.classList.remove('loading');
            return;
        }

        newTags = newTags.split(',');

        const progressId = 'add-tags-' + Date.now();

        // Tạo progress item
        createProgressItem(progressId, 'Đang thêm thẻ...', checkboxes.length);

        // Hiển thị trạng thái đang tải
        batchAddTagsBtn.disabled = true;
        batchAddTagsBtn.classList.add('loading');

        try {
            const data = JSON.parse(jsonEditor.value);
            let updatedCount = 0;

            for (const checkbox of checkboxes) {
                const index = parseInt(checkbox.dataset.index);
                if (index >= 0 && index < data.length) {
                    const question = data[index];

                    // Cập nhật progress
                    updateProgressItem(progressId, updatedCount, `Đang xử lý câu hỏi ${index + 1}...`);

                    // Loại bỏ trùng lặp với thẻ đã có
                    let currentTags = question.tags || [];
                    newTags = newTags.filter(tag => !currentTags.includes(tag));

                    // Thêm thẻ mới vào danh sách hiện có
                    let updatedTags = [...currentTags, ...newTags];

                    // Cập nhật thẻ
                    let jsonEditorValue = JSON.parse(jsonEditor.value);
                    jsonEditorValue[index].tags = updatedTags;
                    jsonEditor.value = JSON.stringify(jsonEditorValue, null, 2);
                    updateSingleQuestionPreview(index, jsonEditorValue[index], true);
                    updatedCount++;
                    updateProgressItem(progressId, updatedCount, `Đã hoàn thành ${updatedCount}/${checkboxes.length} câu hỏi`);
                }
            }

            batchAddTagsBtn.disabled = false;
            batchAddTagsBtn.classList.remove('loading');
            // Đánh dấu hoàn thành
            completeProgressItem(progressId, `Đã thêm thẻ cho ${updatedCount} câu hỏi thành công`);
        } catch (error) {
            showErrors([`Lỗi khi thêm thẻ hàng loạt: ${error.message}`]);
            batchAddTagsBtn.disabled = false;
            batchAddTagsBtn.classList.remove('loading');
            errorProgressItem(progressId, error.message);
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function renderAnswerPositions(answers) {
        let html = '<div class="answer-positions">';

        answers.forEach((answerGroup, index) => {
            const position = index + 1;
            const answersText = answerGroup.join(', ');
            html += `
      <div class="answer-item">
        Vị trí ${position} đáp án: <strong>${escapeHtml(answersText)}</strong>
      </div>
    `;
        });

        html += '</div>';
        return html;
    }

    // OPTIMIZED: Update only a single question preview
    function updateSingleQuestionPreview(index, item, checked = false) {
        try {
            // Find the existing preview item
            const existingItem = document.querySelector(`.preview-item[data-index="${index}"]`);
            if (!existingItem) {
                // If not found, do full update
                updatePreview();
                return;
            }

            // Build the HTML for this single question (reuse logic from updatePreview)
            let html = `
                <div class="preview-header">
                    <div class="preview-checkbox-row">
                        <div class="preview-checkbox">  
                            <input type="checkbox" class="question-checkbox" ${checked ? 'checked' : ''} data-index="${index}" id="question-${index}">
                            <label for="question-${index}">Chọn câu hỏi này</label>
                        </div>
                    </div>
                    <div class="preview-title-row">
                        <div class="preview-title">
                            Câu hỏi ${index + 1}
                            <span class="preview-type">${item.type || 'Không xác định'}</span>
                        </div>
                    </div>
                    <button class="btn-edit" data-index="${index}">
                        <i class="fas fa-edit"></i> Sửa câu hỏi
                    </button>
                </div>
                <div class="preview-content">
                    <div class="preview-question">
                        ${renderMathInText(item.question || 'Không có câu hỏi')}
                    </div>
            `;

            if (item.type === 'MC' || item.type === 'MMC') {
                html += '<div class="preview-options">';
                if (item.options && Array.isArray(item.options)) {
                    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                    item.options.forEach((option, i) => {
                        const isCorrect = item.correctAnswer &&
                            item.correctAnswer.includes(optionLabels[i]);
                        html += `
                            <div class="preview-option ${isCorrect ? 'correct' : ''}">
                                <strong>${optionLabels[i]}.</strong> ${renderMathInText(option)}
                            </div>
                        `;
                    });
                }
                html += '</div>';
            }

            if (item.type === 'TF') {
                html += '<div class="preview-statements">';
                if (item.statements && Array.isArray(item.statements)) {
                    const statementLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
                    item.statements.forEach((statement, i) => {
                        const isCorrect = item.correctAnswer &&
                            item.correctAnswer.includes(statementLabels[i]);
                        html += `
                            <div class="preview-statement ${isCorrect ? 'correct' : 'incorrect'}">
                                <span class="preview-statement-marker">${statementLabels[i]})</span>
                                <span>${renderMathInText(statement)}</span>
                            </div>
                        `;
                    });
                }
                html += '</div>';
            }

            if (item.type === 'SA') {
                html += `
                    <div class="preview-answer">
                        <strong>Đáp án:</strong> 
                        ${renderAnswerPositions(item.answers)}
                    </div>
                `;
            }

            if (item.type === 'MP') {
                html += '<div class="preview-matching">';
                html += '<table class="matching-table">';
                html += '<thead><tr><th>Cột trái</th><th>Cột phải</th></tr></thead>';
                html += '<tbody>';

                const maxLength = Math.max(
                    item.left ? item.left.length : 0,
                    item.right ? item.right.length : 0
                );

                for (let i = 0; i < maxLength; i++) {
                    const leftItem = item.left && item.left[i] ? renderMathInText(item.left[i]) : '';
                    const rightItem = item.right && item.right[i] ? renderMathInText(item.right[i]) : '';
                    html += `
                        <tr>
                            <td>${leftItem}</td>
                            <td>${rightItem}</td>
                        </tr>
                    `;
                }

                html += '</tbody></table>';
                html += '</div>';
            }

            if (item.type === 'MDDM') {
                html += '<div class="preview-dragdrop">';
                html += '<div class="preview-dragdrop-options">';
                html += '<strong>Các lựa chọn:</strong>';
                html += '<ol class="dragdrop-options-list">';

                if (item.options && Array.isArray(item.options)) {
                    item.options.forEach((option, i) => {
                        html += `<li>${renderMathInText(option)}</li>`;
                    });
                }

                html += '</ol>';
                html += '</div>';

                if (item.correctAnswer && Array.isArray(item.correctAnswer)) {
                    html += '<div class="preview-dragdrop-answer">';
                    html += '<strong>Đáp án đúng (theo thứ tự vị trí):</strong> ';
                    html += item.correctAnswer.map((index, pos) => {
                        const optionText = item.options && item.options[index] ? item.options[index] : `Chỉ số ${index}`;
                        return `<span class="correct-answer-badge">Vị trí ${pos + 1}: ${renderMathInText(optionText)}</span>`;
                    }).join(' ');
                    html += '</div>';
                }

                html += '</div>';
            }

            if (item.type === 'MRO') {
                html += '<div class="preview-reordering">';
                html += '<div class="preview-reordering-items">';
                html += '<strong>Các mục sắp xếp(thứ tự đúng):</strong>';
                html += '<ol class="reordering-items-list">';

                if (item.items && Array.isArray(item.items)) {
                    item.items.forEach((itemText, i) => {
                        html += `<li>${renderMathInText(itemText)}</li>`;
                    });
                }

                html += '</ol>';
                html += '</div>';

                if (item.correctAnswer && Array.isArray(item.correctAnswer)) {
                    html += '<div class="preview-reordering-answer">';
                    html += '<strong>Thứ tự đúng:</strong> ';
                    html += item.correctAnswer.map((index, pos) => {
                        const itemText = item.items && item.items[index] ? item.items[index] : `Chỉ số ${index}`;
                        return `<span class="correct-answer-badge">${pos + 1}. ${renderMathInText(itemText)}</span>`;
                    }).join(' → ');
                    html += '</div>';
                }

                html += '</div>';
            }

            // Details section
            html += '<div class="preview-details">';

            // Skills
            html += `
                <div class="preview-detail">
                    <div class="preview-detail-title">
                        Kỹ năng:
                    </div>
                    <div class="preview-detail-content">
                        <div class="preview-skills">
            `;

            if (item.skill && Array.isArray(item.skill) && item.skill.length > 0) {
                item.skill.forEach(skill => {
                    html += `
                        <span class="preview-skill">
                            ${skill.name}
                            ${skill.code ? `<span style="font-size: 0.65rem; opacity: 0.7;"> (${skill.code})</span>` : ''}
                        </span>
                    `;
                });
            } else {
                html += '<span style="color: var(--gray-500);">Không có kỹ năng</span>';
            }

            html += `
                        </div>
                    </div>
                </div>
            `;

            // Action words
            html += `
                <div class="preview-detail">
                    <div class="preview-detail-title">
                        Động từ chỉ thị:
                    </div>
                    <div class="preview-detail-content">
                        <div class="preview-action-words">
            `;

            if (item.action_word && Array.isArray(item.action_word) && item.action_word.length > 0) {
                item.action_word.forEach(actionWord => {
                    html += `
                        <span class="preview-action-word">
                            ${actionWord.name}
                        </span>
                    `;
                });
            } else {
                html += '<span style="color: var(--gray-500);">Không có động từ chỉ thị</span>';
            }

            html += `
                        </div>
                    </div>
                </div>
            `;

            // Solution
            html += `
                <div class="preview-detail">
                    <div class="preview-detail-title">
                        Lời giải chi tiết:
                    </div>
                    <div class="preview-detail-content preview-solution">
                        ${item.solution ? renderMathInText(item.solution) : '<span style="color: var(--gray-500);">Không có lời giải</span>'}
                    </div>
                </div>
            `;

            // Hint
            html += `
                <div class="preview-detail">
                    <div class="preview-detail-title">
                        Gợi ý:
                    </div>
                    <div class="preview-detail-content preview-hint">
                        ${item.hint ? renderMathInText(item.hint) : '<span style="color: var(--gray-500);">Không có gợi ý</span>'}
                    </div>
                </div>
            `;

            // Tags
            html += `
                <div class="preview-detail">
                    <div class="preview-detail-title">
                        Thẻ:
                    </div>
                    <div class="preview-detail-content">
                        <div class="preview-tags">
            `;

            if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
                item.tags.forEach(tag => {
                    html += `<span class="preview-tag">${tag}</span>`;
                });
            } else {
                html += '<span style="color: var(--gray-500);">Không có thẻ</span>';
            }

            html += `
                        </div>
                    </div>
                </div>
            `;

            html += '</div>'; // End preview-details

            html += '<div class="preview-meta">';
            html += `
                <div class="preview-meta-item">
                    <strong>Mức độ:</strong> ${item.difficult_level || 'Không xác định'}
                </div>
            `;

            html += '</div></div>'; // End preview-meta and preview-content

            // Update the existing item's innerHTML
            existingItem.innerHTML = html;

            // Re-attach event listeners for this item
            const editBtn = existingItem.querySelector('.btn-edit');
            if (editBtn) {
                editBtn.addEventListener('click', function () {
                    const idx = parseInt(this.dataset.index);
                    openEditModal(idx);
                });
            }

            const checkbox = existingItem.querySelector('.question-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', updateSelectAllButtonState);
            }

            // Trigger MathJax rendering for this item only
            if (window.MathJax && window.MathJax.typeset) {
                setTimeout(() => {
                    try {
                        MathJax.typeset([existingItem]);
                    } catch (err) {
                        console.log('MathJax typeset error:', err);
                    }
                }, 50);
            }

        } catch (error) {
            console.error('Error updating single question:', error);
            // Fallback to full update
            updatePreview();
        }
    }

    // Cập nhật xem trước
    function updatePreview() {
        try {
            const jsonString = jsonEditor.value.trim();
            if (!jsonString) {
                previewContainer.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-file-alt"></i>
                                <p>Xem trước dữ liệu sẽ hiển thị ở đây</p>
                            </div>
                        `;
                updateQuestionStats([]);
                return;
            }

            const parsedData = JSON.parse(jsonString);

            if (!Array.isArray(parsedData)) {
                previewContainer.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-exclamation-triangle"></i>
                                <p>Dữ liệu không phải là mảng</p>
                            </div>
                        `;
                updateQuestionStats([]);
                return;
            }

            // Cập nhật số lượng câu hỏi
            updateQuestionStats(parsedData);

            if (parsedData.length === 0) {
                previewContainer.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-inbox"></i>
                                <p>Mảng rỗng</p>
                            </div>
                        `;
                return;
            }

            previewContainer.innerHTML = '';
            parsedData.forEach((item, index) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.dataset.index = index;

                let html = `
                            <div class="preview-header">
                                <div class="preview-checkbox-row">
                                    <div class="preview-checkbox">
                                        <input type="checkbox" class="question-checkbox" data-index="${index}" id="question-${index}">
                                        <label for="question-${index}">Chọn câu hỏi này</label>
                                    </div>
                                </div>
                                <div class="preview-title-row">
                                    <div class="preview-title">
                                        Câu hỏi ${index + 1}
                                        <span class="preview-type">${item.type || 'Không xác định'}</span>
                                    </div>
                                </div>
                                <button class="btn-edit" data-index="${index}">
                                    <i class="fas fa-edit"></i> Sửa câu hỏi
                                </button>
                            </div>
                            <div class="preview-content">
                                <div class="preview-question">
                                    ${renderMathInText(item.question || 'Không có câu hỏi')}
                                </div>
                        `;

                if (item.type === 'MC' || item.type === 'MMC') {
                    html += '<div class="preview-options">';
                    if (item.options && Array.isArray(item.options)) {
                        const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                        item.options.forEach((option, i) => {
                            const isCorrect = item.correctAnswer &&
                                item.correctAnswer.includes(optionLabels[i]);
                            html += `
                                        <div class="preview-option ${isCorrect ? 'correct' : ''}">
                                            <strong>${optionLabels[i]}.</strong> ${renderMathInText(option)}
                                        </div>
                                    `;
                        });
                    }
                    html += '</div>';
                }

                if (item.type === 'TF') {
                    html += '<div class="preview-statements">';
                    if (item.statements && Array.isArray(item.statements)) {
                        const statementLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
                        item.statements.forEach((statement, i) => {
                            const isCorrect = item.correctAnswer &&
                                item.correctAnswer.includes(statementLabels[i]);
                            html += `
                                        <div class="preview-statement ${isCorrect ? 'correct' : 'incorrect'}">
                                            <span class="preview-statement-marker">${statementLabels[i]})</span>
                                            <span>${renderMathInText(statement)}</span>
                                        </div>
                                    `;
                        });
                    }
                    html += '</div>';
                }

                if (item.type === 'SA') {
                    html += `
                                <div class="preview-answer">
                                    <strong>Đáp án:</strong> 
                                    ${renderAnswerPositions(item.answers)}
                                </div>
                            `;
                }

                if (item.type === 'MP') {
                    html += '<div class="preview-matching">';
                    html += '<table class="matching-table">';
                    html += '<thead><tr><th>Cột trái</th><th>Cột phải</th></tr></thead>';
                    html += '<tbody>';

                    const maxLength = Math.max(
                        item.left ? item.left.length : 0,
                        item.right ? item.right.length : 0
                    );

                    for (let i = 0; i < maxLength; i++) {
                        const leftItem = item.left && item.left[i] ? renderMathInText(item.left[i]) : '';
                        const rightItem = item.right && item.right[i] ? renderMathInText(item.right[i]) : '';
                        html += `
                            <tr>
                                <td>${leftItem}</td>
                                <td>${rightItem}</td>
                            </tr>
                        `;
                    }

                    html += '</tbody></table>';
                    html += '</div>';
                }

                if (item.type === 'MDDM') {
                    html += '<div class="preview-dragdrop">';
                    html += '<div class="preview-dragdrop-options">';
                    html += '<strong>Các lựa chọn:</strong>';
                    html += '<ol class="dragdrop-options-list">';

                    if (item.options && Array.isArray(item.options)) {
                        item.options.forEach((option, i) => {
                            html += `<li>${renderMathInText(option)}</li>`;
                        });
                    }

                    html += '</ol>';
                    html += '</div>';

                    if (item.correctAnswer && Array.isArray(item.correctAnswer)) {
                        html += '<div class="preview-dragdrop-answer">';
                        html += '<strong>Đáp án đúng (theo thứ tự vị trí):</strong> ';
                        html += item.correctAnswer.map((index, pos) => {
                            const optionText = item.options && item.options[index] ? item.options[index] : `Chỉ số ${index}`;
                            return `<span class="correct-answer-badge">Vị trí ${pos + 1}: ${renderMathInText(optionText)}</span>`;
                        }).join(' ');
                        html += '</div>';
                    }

                    html += '</div>';
                }

                if (item.type === 'MRO') {
                    html += '<div class="preview-reordering">';
                    html += '<div class="preview-reordering-items">';
                    html += '<strong>Các mục sắp xếp(thứ tự đúng):</strong>';
                    html += '<ol class="reordering-items-list">';

                    if (item.items && Array.isArray(item.items)) {
                        item.items.forEach((itemText, i) => {
                            html += `<li>${renderMathInText(itemText)}</li>`;
                        });
                    }

                    html += '</ol>';
                    html += '</div>';

                    if (item.correctAnswer && Array.isArray(item.correctAnswer)) {
                        html += '<div class="preview-reordering-answer">';
                        html += '<strong>Thứ tự đúng:</strong> ';
                        html += item.correctAnswer.map((index, pos) => {
                            const itemText = item.items && item.items[index] ? item.items[index] : `Chỉ số ${index}`;
                            return `<span class="correct-answer-badge">${pos + 1}. ${renderMathInText(itemText)}</span>`;
                        }).join(' → ');
                        html += '</div>';
                    }

                    html += '</div>';
                }

                // Hiển thị các thông tin bổ sung
                html += '<div class="preview-details">';

                // Hiển thị kỹ năng
                html += `
                            <div class="preview-detail">
                                <div class="preview-detail-title">
                                    Kỹ năng:
                                </div>
                                <div class="preview-detail-content">
                                    <div class="preview-skills">
                        `;

                if (item.skill && Array.isArray(item.skill) && item.skill.length > 0) {
                    item.skill.forEach(skill => {
                        html += `
                                    <span class="preview-skill">
                                        ${skill.name}
                                        ${skill.code ? `<span style="font-size: 0.65rem; opacity: 0.7;"> (${skill.code})</span>` : ''}
                                    </span>
                                `;
                    });
                } else {
                    html += '<span style="color: var(--gray-500);">Không có kỹ năng</span>';
                }

                html += `
                                    </div>
                                </div>
                            </div>
                        `;

                // Hiển thị động từ chỉ thị
                html += `
                            <div class="preview-detail">
                                <div class="preview-detail-title">
                                    Động từ chỉ thị:
                                </div>
                                <div class="preview-detail-content">
                                    <div class="preview-action-words">
                        `;

                if (item.action_word && Array.isArray(item.action_word) && item.action_word.length > 0) {
                    item.action_word.forEach(actionWord => {
                        html += `
                                    <span class="preview-action-word">
                                        ${actionWord.name}
                                    </span>
                                `;
                    });
                } else {
                    html += '<span style="color: var(--gray-500);">Không có động từ chỉ thị</span>';
                }

                html += `
                                    </div>
                                </div>
                            </div>
                        `;

                // Hiển thị solution
                html += `
                            <div class="preview-detail">
                                <div class="preview-detail-title">
                                    Lời giải chi tiết:
                                </div>
                                <div class="preview-detail-content preview-solution">
                                    ${item.solution ? renderMathInText(item.solution) : '<span style="color: var(--gray-500);">Không có lời giải</span>'}
                                </div>
                            </div>
                        `;

                // Hiển thị hint
                html += `
                            <div class="preview-detail">
                                <div class="preview-detail-title">
                                    Gợi ý:
                                </div>
                                <div class="preview-detail-content preview-hint">
                                    ${item.hint ? renderMathInText(item.hint) : '<span style="color: var(--gray-500);">Không có gợi ý</span>'}
                                </div>
                            </div>
                        `;

                // Hiển thị tags
                html += `
                            <div class="preview-detail">
                                <div class="preview-detail-title">
                                    Thẻ:
                                </div>
                                <div class="preview-detail-content">
                                    <div class="preview-tags">
                        `;

                if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
                    item.tags.forEach(tag => {
                        html += `<span class="preview-tag">${tag}</span>`;
                    });
                } else {
                    html += '<span style="color: var(--gray-500);">Không có thẻ</span>';
                }

                html += `
                                    </div>
                                </div>
                            </div>
                        `;

                html += '</div>'; // End preview-details

                html += '<div class="preview-meta">';
                html += `
                            <div class="preview-meta-item">
                                <strong>Mức độ:</strong> ${item.difficult_level || 'Không xác định'}
                            </div>
                        `;

                html += '</div></div></div>'; // End preview-content, preview-header and preview-item

                previewItem.innerHTML = html;
                previewContainer.appendChild(previewItem);
                // Thêm event listener cho từng checkbox
                updateSelectAllButtonState();
                document.querySelectorAll('.question-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', updateSelectAllButtonState);
                });
            });

            // Add event listeners to edit buttons
            document.querySelectorAll('.btn-edit').forEach(button => {
                button.addEventListener('click', function () {
                    const index = parseInt(this.dataset.index);
                    openEditModal(index);
                });
            });
        } catch (error) {
            previewContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi khi hiển thị: ${error.message}</p>
                        </div>
                    `;
            updateQuestionStats([]);
        }
    }

    // Function to save JSON to localStorage
    function saveJsonToLocalStorage() {
        localStorage.setItem('jsonContent', jsonEditor.value);
    }

    // Function to load JSON from localStorage
    function loadJsonFromLocalStorage() {
        const savedJson = localStorage.getItem('jsonContent');
        if (savedJson) {
            jsonEditor.value = savedJson;
            updatePreview(); // Update preview with loaded content
        }
    }

    // Xử lý sự kiện
    formatBtn.addEventListener('click', formatJSON);
    applyBtn.addEventListener('click', () => {
        applyChanges();
        saveJsonToLocalStorage(); // Save after applying changes
    });


    const downloadJsonBtn = document.querySelector('#downloadJsonBtn');
    downloadJsonBtn.addEventListener('click', () => {
        const jsonContent = jsonEditor.value;
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Event listener for check duplicates button
    checkDuplicatesBtn.addEventListener('click', checkDuplicates);

    mathToggle.addEventListener('change', updatePreview);
    selectAllBtn.addEventListener('click', selectAllQuestions);

    // Batch action event listeners
    batchGenerateSolutionBtn.addEventListener('click', batchGenerateSolution);
    batchGenerateHintBtn.addEventListener('click', batchGenerateHint);
    batchGenerateActionWordsBtn.addEventListener('click', batchGenerateActionWords);
    batchGenerateTagsBtn.addEventListener('click', batchGenerateTags);
    batchAddTagsBtn.addEventListener('click', batchAddTags);

    // Modal event listeners
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function () {
            this.closest('.modal').classList.remove('active');
        });
    });

    cancelEditBtn.addEventListener('click', function () {
        editModal.classList.remove('active');
    });

    saveEditBtn.addEventListener('click', saveEditedQuestion);

    addOptionBtn.addEventListener('click', addOption);

    addStatementBtn.addEventListener('click', addStatement);

    addLeftItemBtn.addEventListener('click', addLeftItem);

    addRightItemBtn.addEventListener('click', addRightItem);

    addDragDropOptionBtn.addEventListener('click', addDragDropOption);

    addReorderItemBtn.addEventListener('click', addReorderItem);

    // AI generation event listeners
    generateSolutionBtn.addEventListener('click', generateSolution);
    generateHintBtn.addEventListener('click', generateHint);
    generateActionWordsBtn.addEventListener('click', generateActionWords);
    generateTagsBtn.addEventListener('click', generateTags);

    // Xử lý sự kiện cho nút hiển thị/ẩn JSON
    toggleEditorBtn.addEventListener('click', function () {
        const editorContent = document.querySelector('.editor-content');
        const mainContainer = document.querySelector('.main-container');

        if (editorContent.style.display === 'none') {
            // Hiển thị editor
            editorContent.style.display = 'block';
            mainContainer.classList.add('two-columns');
        } else {
            // Ẩn editor
            editorContent.style.display = 'none';
            mainContainer.classList.remove('two-columns');
        }
    });

    // Tự động cập nhật xem trước khi nhập liệu
    jsonEditor.addEventListener('input', function () {
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
            updatePreview();
            saveJsonToLocalStorage(); // Save to localStorage on input
        }, 500);
    });

    // Floating Action Button (FAB) functionality
    const fabToggleBtn = document.getElementById('fabToggleBtn');
    const fabDropdown = document.getElementById('fabDropdown');

    fabToggleBtn.addEventListener('click', () => {
        fabDropdown.classList.toggle('show');
    });

    // ============================================
    // DIGITIZE MODAL - Optimized Logic
    // ============================================

    const digitizeBtn = document.getElementById('digitize');
    const digitizeModal = document.getElementById('digitizeModal');
    const digitizeModalClose = document.getElementById('digitizeModalClose');
    const digitizeStep1 = document.getElementById('digitizeStep1');
    const digitizeStep2 = document.getElementById('digitizeStep2');
    const digitizeStep3 = document.getElementById('digitizeStep3');
    const digitizeLoginBtn = document.getElementById('digitizeLoginBtn');
    const digitizeVerifyLinkBtn = document.getElementById('digitizeVerifyLinkBtn');
    const digitizeConfirmBtn = document.getElementById('digitizeConfirmBtn');
    const digitizeBackToStep1Btn = document.getElementById('digitizeBackToStep1Btn');
    const digitizeBackToStep2Btn = document.getElementById('digitizeBackToStep2Btn');

    // Digitize state management
    const digitizeState = {
        currentStep: 1,
        isLoading: false,
        userData: {
            username: '',
            token: '',
            uiid: '',
            bankName: '',
            bankIid: ''
        }
    };

    // Helper: Show specific step
    function showDigitizeStep(step) {
        const steps = [digitizeStep1, digitizeStep2, digitizeStep3];
        steps.forEach((stepEl, index) => {
            stepEl.style.display = index === step - 1 ? 'block' : 'none';
        });
        digitizeState.currentStep = step;
    }

    // Helper: Open/Close modal
    function openDigitizeModal() {
        digitizeModal.style.display = 'flex';
    }

    function closeDigitizeModal() {
        digitizeModal.style.display = 'none';
    }

    // Helper: Show/Hide loading overlay
    const digitizeLoadingOverlay = document.getElementById('digitizeLoadingOverlay');

    function showDigitizeLoading() {
        if (digitizeLoadingOverlay) {
            digitizeLoadingOverlay.classList.add('active');
        }
    }

    function hideDigitizeLoading() {
        if (digitizeLoadingOverlay) {
            digitizeLoadingOverlay.classList.remove('active');
        }
    }

    // Helper: Set loading state for button
    function setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.classList.remove('loading');
        }
    }

    // Helper: Get user credentials from localStorage
    function getUserCredentials() {
        return {
            token: localStorage.getItem('token'),
            uiid: localStorage.getItem('uiid')
        };
    }

    // Helper: Save user credentials to localStorage
    function saveUserCredentials(username, token, uiid) {
        localStorage.setItem('username', username);
        localStorage.setItem('token', token);
        localStorage.setItem('uiid', uiid);
        digitizeState.userData = { ...digitizeState.userData, username, token, uiid };
    }

    // Helper: Save bank info to localStorage
    function saveBankInfo(bankName, bankIid) {
        localStorage.setItem('bank', bankName);
        localStorage.setItem('bank_iid', bankIid);
        digitizeState.userData = { ...digitizeState.userData, bankName, bankIid };
    }

    // API: Check if user is logged in
    async function checkUserLogin() {
        const { token, uiid } = getUserCredentials();

        if (!token || !uiid) {
            return false;
        }

        try {
            const response = await fetch(`${CONFIG.API_URL}/check-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, uiid })
            });

            const data = await response.json();
            return data.success === true;
        } catch (error) {
            console.error('Check login error:', error);
            return false;
        }
    }

    // API: Login to LMS
    async function loginToLMS(username, password) {
        if (!username || !password) {
            throw new Error('Vui lòng nhập tài khoản và mật khẩu');
        }

        const response = await fetch(`${CONFIG.API_URL}/login-lms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ u: username, p: password })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Đăng nhập thất bại');
        }

        return data;
    }

    // API: Find bank by link
    async function findBank(bankLink) {
        if (!bankLink) {
            throw new Error('Vui lòng nhập link ngân hàng');
        }

        const { token, uiid } = getUserCredentials();

        const response = await fetch(`${CONFIG.API_URL}/find-bank`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ link: bankLink, token, uiid })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Không tìm thấy ngân hàng');
        }

        return data;
    }

    // Helper: Calculate size of JSON string in bytes
    function getByteSize(str) {
        return new Blob([str]).size;
    }

    // Helper: Split questions into chunks that fit within size and count limits
    function splitQuestionsIntoChunks(questionsData, maxSizeBytes = 4 * 1024 * 1024, maxQuestionsPerBatch = 20) {
        const { token, uiid } = getUserCredentials();
        const bankIid = localStorage.getItem('bank_iid');

        // Calculate base payload size (without questionsData)
        const basePayload = { bankIid, token, uiid, questionsData: [] };
        const baseSize = getByteSize(JSON.stringify(basePayload));

        const chunks = [];
        let currentChunk = [];
        let currentSize = baseSize;

        for (let i = 0; i < questionsData.length; i++) {
            const question = questionsData[i];
            const questionSize = getByteSize(JSON.stringify(question));

            // Check if adding this question would exceed the size limit OR question count limit
            const wouldExceedSize = currentSize + questionSize > maxSizeBytes;
            const wouldExceedCount = currentChunk.length >= maxQuestionsPerBatch;

            if ((wouldExceedSize || wouldExceedCount) && currentChunk.length > 0) {
                // Save current chunk and start a new one
                chunks.push([...currentChunk]);
                currentChunk = [question];
                currentSize = baseSize + questionSize;
            } else {
                // Add question to current chunk
                currentChunk.push(question);
                currentSize += questionSize;
            }
        }

        // Add the last chunk if it has any questions
        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }

        return chunks;
    }

    // API: Upload questions (optimized for 4MB limit)
    async function uploadQuestions(questionsData) {
        const { token, uiid } = getUserCredentials();
        const bankIid = localStorage.getItem('bank_iid');

        if (!questionsData || questionsData.length === 0) {
            throw new Error('Không có dữ liệu câu hỏi để số hóa');
        }

        // Split questions into chunks
        const chunks = splitQuestionsIntoChunks(questionsData);

        console.log(`Splitting ${questionsData.length} questions into ${chunks.length} chunk(s)`);

        // Upload each chunk sequentially
        const results = [];
        let totalUploaded = 0;

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            console.log(`Uploading chunk ${i + 1}/${chunks.length} (${chunk.length} questions)...`);

            try {
                const response = await fetch(`${CONFIG.API_URL}/upload-questions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bankIid, token, uiid, questionsData: chunk })
                });

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || `Số hóa thất bại ở chunk ${i + 1}/${chunks.length}`);
                }

                totalUploaded += chunk.length;
                results.push(data);

                setTimeout(() => {
                    showSuccess(`Đã tải lên ${totalUploaded}/${questionsData.length} câu hỏi...`);
                }, 2000);

            } catch (error) {
                throw new Error(`Lỗi tại chunk ${i + 1}/${chunks.length}: ${error.message}`);
            }
        }

        // Return combined results
        return {
            success: true,
            message: `Đã tải lên thành công ${totalUploaded} câu hỏi trong ${chunks.length} lần gửi`,
            chunks: results.length,
            totalQuestions: totalUploaded
        };
    }

    // Event: Open digitize modal
    digitizeBtn.addEventListener('click', async () => {
        // Open modal first
        openDigitizeModal();

        // Show loading while checking login status
        showDigitizeLoading();

        try {
            const isLoggedIn = await checkUserLogin();

            if (isLoggedIn) {
                showDigitizeStep(2);
            } else {
                showDigitizeStep(1);
            }
        } catch (error) {
            console.error('Error checking login status:', error);
            // Default to step 1 on error
            showDigitizeStep(1);
        } finally {
            // Hide loading after check completes
            hideDigitizeLoading();
        }
    });

    // Event: Close modal
    digitizeModalClose.addEventListener('click', closeDigitizeModal);

    // Event: Login
    digitizeLoginBtn.addEventListener('click', async () => {
        const username = document.getElementById('digitizeUsername').value.trim();
        const password = document.getElementById('digitizePassword').value;

        setButtonLoading(digitizeLoginBtn, true);
        showDigitizeLoading();

        try {
            const data = await loginToLMS(username, password);
            saveUserCredentials(username, data.token, data.uiid);
            showSuccess('Đăng nhập thành công');
            showDigitizeStep(2);
        } catch (error) {
            showErrors([error.message]);
        } finally {
            setButtonLoading(digitizeLoginBtn, false);
            hideDigitizeLoading();
        }
    });

    // Event: Verify bank link
    digitizeVerifyLinkBtn.addEventListener('click', async () => {
        const bankLink = document.getElementById('digitizeBankLink').value.trim();

        setButtonLoading(digitizeVerifyLinkBtn, true);
        showDigitizeLoading();

        try {
            const data = await findBank(bankLink);
            saveBankInfo(data.name, data.iid);
            document.getElementById('digitizeBankName').textContent = data.name;
            showSuccess('Đã tìm thấy ngân hàng');
            showDigitizeStep(3);
        } catch (error) {
            showErrors([error.message]);
        } finally {
            setButtonLoading(digitizeVerifyLinkBtn, false);
            hideDigitizeLoading();
        }
    });


    // Event: Confirm digitization
    digitizeConfirmBtn.addEventListener('click', async () => {
        setButtonLoading(digitizeConfirmBtn, true);
        showDigitizeLoading();

        try {
            const questionsData = JSON.parse(jsonEditor.value);
            const result = await uploadQuestions(questionsData);

            // Show detailed success message
            if (result.chunks > 1) {
                showSuccess(`${result.message}`);
            } else {
                showSuccess('Số hóa thành công');
            }

            closeDigitizeModal();
        } catch (error) {
            showErrors([error.message]);
        } finally {
            setButtonLoading(digitizeConfirmBtn, false);
            hideDigitizeLoading();
        }
    });

    // Event: Back buttons
    digitizeBackToStep1Btn.addEventListener('click', () => showDigitizeStep(1));
    digitizeBackToStep2Btn.addEventListener('click', () => showDigitizeStep(2));

    window.addEventListener('click', (event) => {
        if (event.target == digitizeModal) {
            digitizeModal.style.display = 'none';
        }
    });

    window.addEventListener('click', (event) => {
        if (!fabToggleBtn.contains(event.target) && !fabDropdown.contains(event.target)) {
            fabDropdown.classList.remove('show');
        }
    });

    // Load JSON from localStorage when the page loads
    loadJsonFromLocalStorage();

    // Đảm bảo giao diện mặc định là 1 cột khi tải trang
    document.querySelector('.editor-content').style.display = 'none';
    document.querySelector('.main-container').classList.remove('two-columns');

    // Fetch data from JSON files and initialize
    fetchJSONData();

    // Expose hideAllMessages to global scope for close button
    window.hideAllMessages = hideAllMessages;
});
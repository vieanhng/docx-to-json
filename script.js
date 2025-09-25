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
    const jsonEditor = document.getElementById('jsonEditor');
    const previewContainer = document.getElementById('previewContainer');
    const formatBtn = document.getElementById('formatBtn');
    const applyBtn = document.getElementById('applyBtn');
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

    // Modal elements
    const editModal = document.getElementById('editModal');
    const editType = document.getElementById('editType');
    const editQuestion = document.getElementById('editQuestion');
    const mcOptionsContainer = document.getElementById('mcOptionsContainer');
    const tfStatementsContainer = document.getElementById('tfStatementsContainer');
    const fillAnswerContainer = document.getElementById('fillAnswerContainer');
    const optionsContainer = document.getElementById('optionsContainer');
    const statementsContainer = document.getElementById('statementsContainer');
    const correctAnswersContainer = document.getElementById('correctAnswersContainer');
    const correctAnswersContainerTF = document.getElementById('correctAnswersContainerTF');
    const editAnswer = document.getElementById('editAnswer');
    const editDifficultLevel = document.getElementById('editDifficultLevel');
    const editSolution = document.getElementById('editSolution');
    const editHint = document.getElementById('editHint');
    const editTags = document.getElementById('editTags');
    const addOptionBtn = document.getElementById('addOptionBtn');
    const addStatementBtn = document.getElementById('addStatementBtn');
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

    // State variables
    let currentEditIndex = -1;
    let selectedSkills = [];
    let selectedActionWords = [];
    let skillsData = [];
    let actionWordsData = [];

    function stripHtmlAndCleanWhitespace(htmlString) {
        if (!htmlString || typeof htmlString !== 'string') {
            return "";
        }

        let textOnly = htmlString.replace(/<.*?>/g, '');

        textOnly = textOnly.replace(/\s+/g, ' ').trim();

        return textOnly;
    }

    // Fetch data from JSON files
    async function fetchJSONData() {
        try {
            // Fetch skills data
            const skillsResponse = await fetch('https://free-n8n.taikhoanai.store/webhook/get-skills');
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
            const actionWordsResponse = await fetch('https://free-n8n.taikhoanai.store/webhook/get-dongtu');
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

        fetch('https://vercel-doc-to-json.vercel.app/upload', {
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
                if (!response.ok) {
                    throw new Error('Lỗi khi gửi file Word');
                }
                return response.json();
            })
            .then(data => {
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

        const requestOptions = {
            method: "POST",
            body: formdata,
            redirect: "follow",
        };

        try {
            const response = await fetch("https://free-n8n.taikhoanai.store/webhook/gen-hints", requestOptions);

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

        const requestOptions = {
            method: "POST",
            body: formdata,
            redirect: "follow",
        };

        try {
            const response = await fetch("https://free-n8n.taikhoanai.store/webhook/gen-dongtu", requestOptions);

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

        const requestOptions = {
            method: "POST",
            body: formdata,
            redirect: "follow",
        };

        try {
            const response = await fetch("https://free-n8n.taikhoanai.store/webhook/gen-the", requestOptions);

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

    // Ẩn tất cả thông báo
    function hideAllMessages() {
        warningContainer.style.display = 'none';
        errorContainer.style.display = 'none';
        successContainer.style.display = 'none';
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
    }

    // Hiển thị thông báo thành công
    function showSuccess(message) {
        successMessage.textContent = message;
        successContainer.style.display = 'block';
        warningContainer.style.display = 'none';
        errorContainer.style.display = 'none';
    }

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
                fillAnswerContainer.style.display = 'block';

                editAnswer.value = question.answers || '';
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
                updatedQuestion.answers = editAnswer.value;
            }

            // Update data
            data[currentEditIndex] = updatedQuestion;
            jsonEditor.value = JSON.stringify(data, null, 2);

            // Close modal
            editModal.classList.remove('active');

            // Update preview
            updatePreview();

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

    // Handle question type change in edit modal
    editType.addEventListener('change', function () {
        const type = this.value;

        if (type === 'MC' || type === 'MMC') {
            mcOptionsContainer.style.display = 'block';
            tfStatementsContainer.style.display = 'none';
            fillAnswerContainer.style.display = 'none';
        } else if (type === 'TF') {
            mcOptionsContainer.style.display = 'none';
            tfStatementsContainer.style.display = 'block';
            fillAnswerContainer.style.display = 'none';
        } else if (type === 'SA') {
            mcOptionsContainer.style.display = 'none';
            tfStatementsContainer.style.display = 'none';
            fillAnswerContainer.style.display = 'block';
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

        // Hiển thị trạng thái đang tải
        batchGenerateHintBtn.disabled = true;
        batchGenerateHintBtn.classList.add('loading');

        try {
            const data = JSON.parse(jsonEditor.value);

            // *** THAY ĐỔI CHÍNH BẮT ĐẦU TỪ ĐÂY ***
            // Sử dụng vòng lặp for...of để xử lý tuần tự thay vì Promise.all
            for (const checkbox of checkboxes) {
                const index = parseInt(checkbox.dataset.index);
                if (index >= 0 && index < data.length) {
                    const question = data[index];

                    // Dùng await để đợi từng request hoàn thành trước khi sang vòng lặp tiếp theo
                    const hint = await genHint(question.raw["Nội dung"] + "HD giải: " + question.raw["HD giải chi tiết"]);

                    // Cập nhật hint vào mảng data
                    let jsonEditorValue = JSON.parse(jsonEditor.value);
                    jsonEditorValue[index].hint = hint;
                    jsonEditor.value = JSON.stringify(jsonEditorValue, null, 2);
                    updatePreview();                    
                }
            }




            // Xóa trạng thái đang tải
            batchGenerateHintBtn.disabled = false;
            batchGenerateHintBtn.classList.remove('loading');

            showSuccess(`Đã tạo gợi ý cho ${checkboxes.length} câu hỏi thành công`);
        } catch (error) {
            showErrors([`Lỗi khi tạo gợi ý hàng loạt: ${error.message}`]);
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

        // Hiển thị trạng thái đang tải
        batchGenerateActionWordsBtn.disabled = true;
        batchGenerateActionWordsBtn.classList.add('loading');

        // Mô phỏng API call
        try {
            const data = JSON.parse(jsonEditor.value);

            // *** THAY ĐỔI CHÍNH BẮT ĐẦU TỪ ĐÂY ***
            // Sử dụng vòng lặp for...of để xử lý tuần tự thay vì Promise.all
            for (const checkbox of checkboxes) {
                const index = parseInt(checkbox.dataset.index);
                if (index >= 0 && index < data.length) {
                    const question = data[index];

                    // Dùng await để đợi từng request hoàn thành trước khi sang vòng lặp tiếp theo
                    const actionWords = await genActionWord(question.raw["Nội dung"], question.raw["HD giải chi tiết"], question["MĐ"]);

                    // Cập nhật hint vào mảng data
                    let jsonEditorValue = JSON.parse(jsonEditor.value);
                    jsonEditorValue[index].action_word = actionWords.student_competency_iids.split(",").map(item => actionWordsData.filter(ac => ac.iid == item)[0]);
                    jsonEditor.value = JSON.stringify(jsonEditorValue, null, 2);
                    updatePreview();


                }
            }

            // Xóa trạng thái đang tải
            batchGenerateActionWordsBtn.disabled = false;
            batchGenerateActionWordsBtn.classList.remove('loading');

            showSuccess(`Đã tạo động từ chỉ thị cho ${checkboxes.length} câu hỏi thành công`);
        } catch (error) {
            showErrors([`Lỗi khi tạo động từ chỉ thị hàng loạt: ${error.message}`]);
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

                    // Tạo thẻ dựa trên loại câu hỏi và nội dung
                    let tags = await genTags(question.raw["Nội dung"], question.raw["HD giải chi tiết"], question["MĐ"]);

                    // Loại bỏ trùng lặp
                    tags = [...new Set(tags)];

                    // Cập nhật thẻ
                    let jsonEditorValue = JSON.parse(jsonEditor.value);
                    jsonEditorValue[index].tags = tags;
                    jsonEditor.value = JSON.stringify(jsonEditorValue, null, 2);
                    updatePreview();
                    updatedCount++;
                }
            }


            // Xóa trạng thái đang tải
            batchGenerateTagsBtn.disabled = false;
            batchGenerateTagsBtn.classList.remove('loading');

            showSuccess(`Đã tạo thẻ cho ${updatedCount} câu hỏi thành công`);
        } catch (error) {
            showErrors([`Lỗi khi tạo thẻ hàng loạt: ${error.message}`]);
            batchGenerateTagsBtn.disabled = false;
            batchGenerateTagsBtn.classList.remove('loading');
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
                                    <strong>Đáp án:</strong> ${renderMathInText(item.answers || 'Không có')}
                                </div>
                            `;
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
    mathToggle.addEventListener('change', updatePreview);
    selectAllBtn.addEventListener('click', selectAllQuestions);

    // Batch action event listeners
    batchGenerateSolutionBtn.addEventListener('click', batchGenerateSolution);
    batchGenerateHintBtn.addEventListener('click', batchGenerateHint);
    batchGenerateActionWordsBtn.addEventListener('click', batchGenerateActionWords);
    batchGenerateTagsBtn.addEventListener('click', batchGenerateTags);

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

    // Close the dropdown if the user clicks outside of it
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
});
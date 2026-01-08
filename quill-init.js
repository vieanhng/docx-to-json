// Quill Editor Initialization and Management
let quillEditors = {};

// Initialize Quill editors when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    initializeQuillEditors();
});

function initializeQuillEditors() {
    // Register ImageResize module if available
    if (window.ImageResize) {
        Quill.register('modules/imageResize', ImageResize.default);
    }

    // Configuration for Quill toolbar
    const toolbarOptions = [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
    ];

    // Initialize editor for Question Content
    if (document.getElementById('editQuestionRich')) {
        quillEditors.question = new Quill('#editQuestionRich', {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions,
                imageResize: {
                    displaySize: true,
                    modules: ['Resize', 'DisplaySize', 'Toolbar']
                }
            },
            placeholder: 'Nhập nội dung câu hỏi...'
        });
    }

    // Initialize editor for Solution
    if (document.getElementById('editSolution')) {
        quillEditors.solution = new Quill('#editSolution', {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions,
                imageResize: {
                    displaySize: true,
                    modules: ['Resize', 'DisplaySize', 'Toolbar']
                }
            },
            placeholder: 'Nhập lời giải chi tiết...'
        });
    }

    // Initialize editor for Hint
    if (document.getElementById('editHint')) {
        quillEditors.hint = new Quill('#editHint', {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions,
                imageResize: {
                    displaySize: true,
                    modules: ['Resize', 'DisplaySize', 'Toolbar']
                }
            },
            placeholder: 'Nhập gợi ý...'
        });
    }

    // Add image upload handler
    setupImageHandlers();
}

function setupImageHandlers() {
    // Custom image handler for all editors
    Object.keys(quillEditors).forEach(editorKey => {
        const editor = quillEditors[editorKey];
        const toolbar = editor.getModule('toolbar');

        toolbar.addHandler('image', function () {
            selectLocalImage(editor);
        });
    });
}

function selectLocalImage(editor) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
        const file = input.files[0];

        // Validate file type
        if (/^image\//.test(file.type)) {
            saveToServer(file, editor);
        } else {
            console.warn('You could only upload images.');
        }
    };
}

function saveToServer(file, editor) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const base64Image = e.target.result;
        insertToEditor(base64Image, editor);
    };

    reader.readAsDataURL(file);
}

function insertToEditor(url, editor) {
    const range = editor.getSelection();
    editor.insertEmbed(range.index, 'image', url);
}

// Helper functions to get/set content
function getQuillContent(editorName) {
    if (quillEditors[editorName]) {
        return quillEditors[editorName].root.innerHTML;
    }
    return '';
}

function setQuillContent(editorName, content) {
    if (quillEditors[editorName]) {
        quillEditors[editorName].root.innerHTML = content || '';
    }
}

function clearQuillContent(editorName) {
    if (quillEditors[editorName]) {
        quillEditors[editorName].setText('');
    }
}

function clearAllQuillEditors() {
    Object.keys(quillEditors).forEach(editorName => {
        clearQuillContent(editorName);
    });
}

// Export functions for use in main script
window.quillHelpers = {
    getContent: getQuillContent,
    setContent: setQuillContent,
    clear: clearQuillContent,
    clearAll: clearAllQuillEditors,
    editors: quillEditors
};

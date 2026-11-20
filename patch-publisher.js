// GTXMOD — Patch Publisher: Replace File Upload with URL Input Dynamically
(function(){
    const TARGET_SELECTOR = 'input[type="file"]'; // الحقل المستهدف للإخفاء
    
    function replaceFileWithUrl() {
        // 1. ابحث عن جميع حقول رفع الملفات المرئية حالياً
        const fileInputs = document.querySelectorAll(TARGET_SELECTOR);
        
        if (fileInputs.length === 0) return;

        fileInputs.forEach(input => {
            // تأكد أنه لم يتم استبداله مسبقاً
            if (input.dataset.patched === 'true') return;

            // 2. اخفِ حقل الملف القديم
            input.style.display = 'none';
            input.dataset.patched = 'true';

            // 3. أنشئ حقل الرابط الجديد
            const urlInput = document.createElement('input');
            urlInput.type = 'url';
            urlInput.name = 'downloadUrl'; // الاسم المتوقع من الخادم
            urlInput.placeholder = 'https://www.mediafire.com/file/xyz/mod.zip';
            urlInput.required = true;
            
            // تنسيق مطابق للموقع
            urlInput.style.cssText = `
                width: 100%;
                padding: 10px;
                background: #020617;
                border: 1px solid #334155;
                color: white;
                border-radius: 8px;
                margin-bottom: 15px;
                font-family: monospace;
                box-sizing: border-box;
            `;

            // 4. أدرج حقل الرابط بعد حقل الملف المخفي مباشرة
            input.parentNode.insertBefore(urlInput, input.nextSibling);

            // 5. أضف تلميح للمستخدم
            const hint = document.createElement('small');
            hint.textContent = '💡 ضع رابط تحميل مباشر (MediaFire/Mega/etc). لا ترفع ملفات هنا.';
            hint.style.cssText = 'color:#94a3b8; display:block; text-align:center; margin-top:-10px; margin-bottom:10px; font-size:11px;';
            urlInput.parentNode.insertBefore(hint, urlInput.nextSibling);
        });
    }

    // --- اعتراض عملية الإرسال (Intercept Submit) ---
    // نحتاج لضمان أن البيانات المرسلة تحتوي على downloadUrl وليس modFile
    document.addEventListener('submit', function(e) {
        const form = e.target;
        
        // هل هذا هو النموذج المعني؟ (نبحث عن وجود حقل patched بداخله)
        if (!form.querySelector('[data-patched="true"]')) return;

        // منع الإرسال الافتراضي مؤقتاً لمعالجة البيانات
        e.preventDefault();
        e.stopPropagation();

        const formData = new FormData(form);
        
        // حذف المفتاح القديم إذا وجدناه (modFile, zipFile, etc.)
        ['modFile', 'zipFile', 'fileToUpload'].forEach(key => {
            if (formData.has(key)) formData.delete(key);
        });

        // التأكد من وجود downloadUrl
        if (!formData.has('downloadUrl')) {
            alert('❌ يرجى إدخال رابط التحميل!');
            return;
        }

        // إرسال البيانات يدوياً للدالة الخلفية
        fetch('/api/publish', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('🎉 تم النشر بنجاح!');
                location.reload();
            } else {
                throw new Error(data.error || 'فشل النشر');
            }
        })
        .catch(err => {
            console.error(err);
            alert('❌ خطأ: ' + err.message);
        });
    }, true); // Capture phase لمنع app.js من التقاط الحدث أولاً

    // --- بدء التشغيل والمراقبة ---
    window.addEventListener('load', () => {
        setTimeout(replaceFileWithUrl, 500);
        
        // مراقب للتأكد من أن الحقول الجديدة تظهر عند فتح النافذة لاحقاً
        const observer = new MutationObserver(() => {
            clearTimeout(window._patchTimer);
            window._patchTimer = setTimeout(replaceFileWithUrl, 300);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });

})();

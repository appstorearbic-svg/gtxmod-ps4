// GTXMOD — اعتراض نشر المودات: إجبار استخدام الرابط بدلاً من الملف
(function(){
    const LS_KEY_URL = "gtx_last_published_url"; // لتذكر آخر رابط تم إدخاله

    function setupInterceptor() {
        // 1. ابحث عن نافذة/قسم إنشاء المنشور
        // نفترض وجود عنصر يحمل ID أو Class خاص بالنشر (مثل #postForm, .new-mod-editor)
        // إذا لم تعرف الاسم الدقيق، سنبحث عن أي form يحتوي على input type="file"
        
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            if (!form.querySelector('input[type="file"]')) return; // نتجاهل النماذج التي لا تحتوي على رفع ملفات
            
            // منع التكرار
            if (form.dataset.intercepted === 'true') return;
            form.dataset.intercepted = 'true';

            // 2. إخفاء حقل رفع الملف (ZIP) بصرياَ ومنعاً للتفاعل
            const fileInput = form.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.style.display = 'none';
                fileInput.disabled = true;
                // إضافة تلميح بسيط للمستخدم
                const hint = document.createElement('small');
                hint.innerHTML = '⚠️ <span style="color:#ef4444">رفع الملفات معطل. استخدم حقل الرابط أدناه.</span>';
                hint.style.cssText = 'display:block; margin-bottom:10px; font-size:11px; text-align:center;';
                fileInput.parentNode.insertBefore(hint, fileInput.nextSibling);
            }

            // 3. إضافة حقل الرابط الجديد (إذا لم يكن موجوداَ)
            let urlField = form.querySelector('input[name="downloadUrl"]');
            if (!urlField) {
                urlField = document.createElement('input');
                urlField.type = 'url';
                urlField.name = 'downloadUrl';
                urlField.placeholder = 'https://www.mediafire.com/file/xyz/mod.zip';
                urlField.required = true;
                urlField.style.cssText = 'width:100%; padding:10px; background:#020617; border:1px solid #3b82f6; color:white; border-radius:8px; margin-bottom:15px; font-family:monospace; box-sizing:border-box;';
                
                // ضع الحقل قبل زر الإرسال مباشرة
                const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                if (submitBtn) {
                    submitBtn.parentNode.insertBefore(urlField, submitBtn);
                    
                    // إضافة تسمية توضيحية
                    const label = document.createElement('label');
                    label.textContent = '🔗 رابط التحميل المباشر:';
                    label.style.cssText = 'display:block; margin-bottom:5px; color:#94a3b8; font-weight:bold;';
                    submitBtn.parentNode.insertBefore(label, urlField);
                } else {
                    form.appendChild(urlField);
                }
            }

            // 4. اعتراض حدث الإرسال (Submit Event)
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                e.stopImmediatePropagation(); // إيقاف app.js من التدخل

                const downloadUrl = urlField.value.trim();
                
                if (!downloadUrl || !downloadUrl.startsWith('http')) {
                    alert('❌ يرجى إدخال رابط تحميل صحيح يبدأ بـ http أو https.');
                    urlField.focus();
                    return;
                }

                // جمع البيانات الأخرى من الحقول الموجودة (العنوان، التصنيف، إلخ)
                // نحاول قراءة القيم من الحقول الأصلية في app.js
                const titleEl = form.querySelector('input[name="title"], input[placeholder*="عنوان"]');
                const categoryEl = form.querySelector('select[name="category"], select[data-cat]');
                const descEl = form.querySelector('textarea[name="description"]');
                const sizeEl = form.querySelector('input[name="size"]');

                const title = titleEl ? titleEl.value : "مود بدون عنوان";
                const category = categoryEl ? categoryEl.value : "سيارات";
                const description = descEl ? descEl.value : "";
                const size = sizeEl ? sizeEl.value : "Unknown";

                // إظهار حالة التحميل
                const btn = form.querySelector('button[type="submit"], input[type="submit"]');
                if (btn) {
                    btn.disabled = true;
                    btn.textContent = "جاري النشر...";
                }

                try {
                    // إرسال البيانات إلى API الخاص بنا
                    const formData = new FormData();
                    formData.append('downloadUrl', downloadUrl);
                    formData.append('title', title);
                    formData.append('category', category);
                    formData.append('description', description);
                    formData.append('size', size);
                    formData.append('imageUrl', ''); // يمكن إضافة صورة لاحقاً

                    const res = await fetch('/api/publish', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await res.json();

                    if (data.success) {
                        alert('🎉 تم النشر بنجاح! سيتم تحديث الصفحة.');
                        location.reload();
                    } else {
                        throw new Error(data.error || 'فشل الاتصال بالخادم');
                    }

                } catch (err) {
                    console.error(err);
                    alert('❌ خطأ: ' + err.message);
                    if (btn) {
                        btn.disabled = false;
                        btn.textContent = "نشر";
                    }
                }
            }, true); // Capture phase لضمان الأولوية
        });
    }

    // --- بدء التشغيل والمراقبة ---
    window.addEventListener('load', () => {
        setTimeout(setupInterceptor, 500);
        
        // مراقبة ظهور نماذج جديدة ديناميكياَ
        const observer = new MutationObserver(() => {
            clearTimeout(window._interceptTimer);
            window._interceptTimer = setTimeout(setupInterceptor, 300);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });

})();

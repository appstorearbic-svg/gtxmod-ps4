// GTXMOD — استبدال كامل لنموذج النشر (No More File Upload Conflicts)
(function(){
    let formReplaced = false;

    function injectNewForm() {
        // 1. ابحث عن حاوية النموذج (غالباً modal أو dialog)
        // نفترض أن هناك عنصر يحمل ID مثل 'postModal', 'createPostDialog', أو class مشابه
        // سنبحث عن أي عنصر مرئي يحتوي على زر "نشر" أو حقل عنوان
        
        const potentialContainers = document.querySelectorAll('.modal, .dialog, [role="dialog"], #postEditor, .editor-container');
        
        for (let container of potentialContainers) {
            // تأكد أنه المرئي وأنه يحتوي على عناصر إدخال
            if (container.offsetParent !== null && container.querySelector('input[type="text"]')) {
                
                // 2. هل تم استبداله مسبقاَ؟
                if (container.dataset.gtxReplaced === 'true') continue;

                // 3. هدم المحتوى القديم
                // نحذف كل شيء داخل الحاوية ما عدا العناوين الرئيسية إن وجدت
                const oldInputs = container.querySelectorAll('input, textarea, select, button[type="submit"], label');
                oldInputs.forEach(el => el.remove());

                // 4. بناء النموذج الجديد النظيف
                container.innerHTML = `
                    <div style="padding: 20px; direction: rtl; font-family: sans-serif;">
                        <h3 style="color:#3b82f6; margin-bottom:15px; text-align:center;">📤 نشر مود جديد</h3>
                        
                        <form id="gtxCleanPostForm">
                            <!-- عنوان المود -->
                            <label style="display:block; margin-bottom:5px; color:#94a3b8;">عنوان المود:</label>
                            <input type="text" name="title" placeholder="مثال: سيارة Bugatti Chiron" required 
                                   style="width:100%; padding:10px; background:#020617; border:1px solid #334155; color:white; border-radius:8px; margin-bottom:15px;" />

                            <!-- التصنيف -->
                            <label style="display:block; margin-bottom:5px; color:#94a3b8;">التصنيف:</label>
                            <select name="category" required 
                                    style="width:100%; padding:10px; background:#020617; border:1px solid #334155; color:white; border-radius:8px; margin-bottom:15px;">
                                <option value="" disabled selected>اختر تصنيف...</option>
                                <option value="سيارات">سيارات</option>
                                <option value="شخصيات">شخصيات</option>
                                <option value="موطورات">موطورات</option>
                                <option value="طيارات">طيارات</option>
                                <option value="قوارب">قوارب</option>
                            </select>

                            <!-- رابط التحميل (بدل رفع ZIP) -->
                            <label style="display:block; margin-bottom:5px; color:#94a3b8;">رابط تحميل المود (MediaFire/Mega):</label>
                            <input type="url" name="downloadUrl" placeholder="https://www.mediafire.com/file/xyz/mod.zip" required 
                                   style="width:100%; padding:10px; background:#020617; border:1px solid #334155; color:white; border-radius:8px; margin-bottom:15px; font-family:monospace; font-size:12px;" />
                            <small style="display:block; color:#ef4444; font-size:11px; margin-top:-10px; margin-bottom:15px; text-align:center;">
                                ⚠️ تأكد أن الرابط مباشر للتحميل وليس صفحة عرض.
                            </small>

                            <!-- صورة الغلاف (رفع محلي كما طلبت) -->
                            <label style="display:block; margin-bottom:5px; color:#94a3b8;">صورة الغلاف (اختياري):</label>
                            <input type="file" name="coverImage" accept="image/*" 
                                   style="width:100%; padding:10px; background:#020617; border:1px dashed #334155; color:#94a3b8; border-radius:8px; margin-bottom:15px; cursor:pointer;" />
                            
                            <!-- وصف -->
                            <label style="display:block; margin-bottom:5px; color:#94a3b8;">وصف مختصر:</label>
                            <textarea name="description" rows="3" placeholder="أضف تفاصيل عن المود..." 
                                      style="width:100%; padding:10px; background:#020617; border:1px solid #334155; color:white; border-radius:8px; margin-bottom:15px;"></textarea>

                            <!-- حجم الملف (اختياري للعرض) -->
                            <label style="display:block; margin-bottom:5px; color:#94a3b8;">حجم الملف (اختياري):</label>
                            <input type="text" name="size" placeholder="مثال: 15 MB" 
                                   style="width:100%; padding:10px; background:#020617; border:1px solid #334155; color:white; border-radius:8px; margin-bottom:20px;" />

                            <!-- أزرار التحكم -->
                            <div style="display:flex; gap:10px;">
                                <button type="button" id="gtxCancelBtn" style="flex:1; padding:12px; background:#334155; color:white; border:0; border-radius:8px; cursor:pointer;">إلغاء</button>
                                <button type="submit" id="gtxPublishBtn" style="flex:2; padding:12px; background:#16a34a; color:white; border:0; border-radius:8px; font-weight:bold; cursor:pointer;">🚀 نشر الآن</button>
                            </div>
                        </form>
                        
                        <div id="gtxPostStatus" style="margin-top:15px; text-align:center; font-size:13px; min-height:20px;"></div>
                    </div>
                `;

                // علامة للاستبدال لمنع التكرار
                container.dataset.gtxReplaced = 'true';

                // 5. ربط الأحداث للنموذج الجديد
                
                // زر الإلغاء
                container.querySelector('#gtxCancelBtn').onclick = () => {
                    // حاول إغلاق المودال بالطريقة الأصلية أو إخفاؤه
                    const closeBtn = document.querySelector('.close-modal, .btn-close, [aria-label="Close"]');
                    if(closeBtn) closeBtn.click();
                    else container.style.display = 'none';
                };

                // إرسال النموذج
                container.querySelector('#gtxCleanPostForm').onsubmit = async (e) => {
                    e.preventDefault();
                    
                    const btn = container.querySelector('#gtxPublishBtn');
                    const statusDiv = container.querySelector('#gtxPostStatus');
                    const formData = new FormData(e.target);
                    
                    // التحقق من وجود الرابط
                    const url = formData.get('downloadUrl');
                    if(!url || !url.startsWith('http')) {
                        statusDiv.innerHTML = '<span style="color:#ef4444">❌ يرجى إدخال رابط تحميل صحيح.</span>';
                        return;
                    }

                    btn.disabled = true;
                    btn.textContent = "جاري النشر...";
                    statusDiv.innerHTML = "<span style='color:#fbbf24'>⏳ جارٍ المعالجة...</span>";

                    try {
                        // 1. معالجة الصورة (إذا كانت موجودة)
                        let imageUrl = "";
                        const coverFile = formData.get('coverImage');
                        if (coverFile && coverFile.size > 0) {
                            // رفع الصورة لـ Catbox بسرعة (الصور صغيرة)
                            const imgFormData = new FormData();
                            imgFormData.append("reqtype", "fileupload");
                            imgFormData.append("fileToUpload", coverFile);
                            
                            const imgRes = await fetch("https://catbox.moe/user/api.php", {
                                method: "POST",
                                body: imgFormData
                            });
                            
                            if(imgRes.ok) {
                                imageUrl = await imgRes.text();
                                if(!imageUrl.startsWith('http')) imageUrl = ""; // فشل الرفع
                            }
                        }

                        // 2. إرسال البيانات للدالة الخلفية /api/publish
                        const apiData = new FormData();
                        apiData.append("title", formData.get("title"));
                        apiData.append("category", formData.get("category"));
                        apiData.append("downloadUrl", url);
                        apiData.append("description", formData.get("description") || "");
                        apiData.append("size", formData.get("size") || "Unknown");
                        apiData.append("imageUrl", imageUrl); // نضيف رابط الصورة
                        
                        const pubRes = await fetch("/api/publish", {
                            method: "POST",
                            body: apiData
                        });
                        
                        const pubData = await pubRes.json();
                        
                        if(pubData.success) {
                            statusDiv.innerHTML = "<span style='color:#16a34a;font-weight:bold;'>🎉 تم النشر بنجاح!</span>";
                            setTimeout(() => location.reload(), 1500);
                        } else {
                            throw new Error(pubData.error || "خطأ في الخادم");
                        }

                    } catch(err) {
                        console.error(err);
                        statusDiv.innerHTML = `<span style='color:#ef4444;font-weight:bold;'>❌ فشل: ${err.message}</span>`;
                        btn.disabled = false;
                        btn.textContent = "🚀 نشر الآن";
                    }
                };
                
                break; // توقف بعد أول استبدال ناجح
            }
        }
    }

    // --- بدء التشغيل والمراقبة ---
    window.addEventListener('load', () => {
        // نراقب النقرات لفتح نافذة النشر
        document.addEventListener('click', (e) => {
            // إذا كان الزر الذي ضغط عليه يفتح نافذة النشر (ابحث عن كلمات مفتاحية)
            const target = e.target.closest('button, a');
            if(target && (target.textContent.includes('نشر') || target.textContent.includes('Add Post') || target.id.includes('post'))) {
                setTimeout(injectNewForm, 100); // انتظر قليلاً حتى تظهر النافذة
            }
        });
        
        // مراقبة DOM للتأكد من ظهور النافذة
        const observer = new MutationObserver(() => {
            if(document.querySelector('[data-gtx-replaced]')) return; // إذا تم الاستبدال بالفعل
            
            // ابحث عن أي نافذة ظهرت حديثاً تحتوي على input type=text
            const modals = document.querySelectorAll('.modal:not([hidden]), .dialog:not([hidden])');
            modals.forEach(modal => {
                if(modal.querySelector('input[type="text"]') && !modal.dataset.gtxReplaced) {
                    injectNewForm();
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });

})();

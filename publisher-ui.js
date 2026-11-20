// GTXMOD — واجهة النشر البسيطة (اعتماد كامل على روابط خارجية)
(function(){
    function injectPublisherUI() {
        const tabsNav = document.querySelector(".as-tabs");
        if(!tabsNav || document.getElementById("pubTab")) return;

        // 1. إضافة زر التبويب
        const pubBtn = document.createElement("button");
        pubBtn.className = "as-tab";
        pubBtn.id = "pubTab";
        pubBtn.innerHTML = "📤 نشر جديد";
        tabsNav.appendChild(pubBtn);

        // 2. إضافة محتوى التبويب
        const viewsContainer = document.querySelector(".as-main");
        if(viewsContainer && !document.getElementById("pubSection")) {
            const sec = document.createElement("section");
            sec.className = "as-view";
            sec.id = "pubSection";
            sec.hidden = true;
            
            // تصميم نموذج بسيط وواضح
            sec.innerHTML = `
                <div class="as-box live">
                    <h3 style="color:#3b82f6;margin-bottom:15px;">🔗 نشر مود عبر رابط خارجي</h3>
                    
                    <form id="gtxPubForm">
                        <!-- عنوان المود -->
                        <label style="display:block;margin-bottom:5px;color:#94a3b8;">عنوان المود:</label>
                        <input type="text" name="title" placeholder="مثال: سيارة BYD GT Pro" required style="width:100%;padding:10px;background:#020617;border:1px solid #334155;color:white;border-radius:8px;margin-bottom:15px;" />
                        
                        <!-- التصنيف -->
                        <label style="display:block;margin-bottom:5px;color:#94a3b8;">التصنيف:</label>
                        <select name="category" required style="width:100%;padding:10px;background:#020617;border:1px solid #334155;color:white;border-radius:8px;margin-bottom:15px;">
                            <option value="سيارات">سيارات</option>
                            <option value="شخصيات">شخصيات</option>
                            <option value="موطورات">موطورات</option>
                            <option value="طيارات">طيارات</option>
                            <option value="قوارب">قوارب</option>
                        </select>
                        
                        <!-- رابط التحميل (MediaFire/Mega/etc) -->
                        <label style="display:block;margin-bottom:5px;color:#94a3b8;">رابط التحميل المباشر:</label>
                        <input type="url" name="downloadUrl" placeholder="https://www.mediafire.com/file/xyz/mod.zip" required style="width:100%;padding:10px;background:#020617;border:1px solid #334155;color:white;border-radius:8px;margin-bottom:15px;font-family:monospace;font-size:12px;" />
                        <small style="color:#94a3b8;display:block;text-align:center;margin-bottom:15px;font-size:11px;">💡 تأكد أن الرابط مباشر للتحميل وليس صفحة عرض.</small>

                        <!-- وصف مختصر -->
                        <label style="display:block;margin-bottom:5px;color:#94a3b8;">وصف مختصر (اختياري):</label>
                        <textarea name="description" rows="2" placeholder="مود سيارة رياضية عالية الجودة..." style="width:100%;padding:10px;background:#020617;border:1px solid #334155;color:white;border-radius:8px;margin-bottom:15px;"></textarea>
                        
                        <!-- حجم الملف (اختياري للعرض فقط) -->
                        <label style="display:block;margin-bottom:5px;color:#94a3b8;">حجم الملف (اختياري):</label>
                        <input type="text" name="size" placeholder="مثال: 15 MB" style="width:100%;padding:10px;background:#020617;border:1px solid #334155;color:white;border-radius:8px;margin-bottom:15px;" />

                        <!-- زر النشر -->
                        <button type="submit" id="pubSubmitBtn" style="width:100%;padding:12px;background:#16a34a;color:white;border:0;border-radius:8px;font-weight:bold;cursor:pointer;font-size:16px;">🚀 نشر المود الآن</button>
                    </form>
                    
                    <div id="pubStatus" style="margin-top:15px;text-align:center;font-size:14px;min-height:20px;"></div>
                </div>
            `;
            viewsContainer.appendChild(sec);

            // ربط حدث النقر للتبديل
            pubBtn.onclick = () => {
                document.querySelectorAll(".as-view").forEach(v => v.hidden = true);
                sec.hidden = false;
                document.querySelectorAll(".as-tab").forEach(t => t.classList.remove("on"));
                pubBtn.classList.add("on");
            };

            // منطق النشر
            sec.querySelector("#gtxPubForm").onsubmit = async (e) => {
                e.preventDefault();
                
                const btn = sec.querySelector("#pubSubmitBtn");
                const statusDiv = sec.querySelector("#pubStatus");
                const formData = new FormData(e.target);
                
                const title = formData.get("title");
                const category = formData.get("category");
                const downloadUrl = formData.get("downloadUrl");
                const description = formData.get("description") || "";
                const size = formData.get("size") || "Unknown";

                // تحقق بسيط من صحة الرابط
                if (!downloadUrl.startsWith("http")) {
                    statusDiv.innerHTML = "<span style='color:#ef4444'>❌ يرجى إدخال رابط صحيح يبدأ بـ http أو https</span>";
                    return;
                }

                btn.disabled = true;
                btn.textContent = "جاري النشر...";
                statusDiv.innerHTML = "<span style='color:#fbbf24'>⏳ جارٍ تحديث قاعدة البيانات...</span>";

                try {
                    // إرسال البيانات للدالة الخلفية /api/publish
                    const apiFormData = new FormData();
                    apiFormData.append("downloadUrl", downloadUrl);
                    apiFormData.append("title", title);
                    apiFormData.append("category", category);
                    apiFormData.append("description", description);
                    apiFormData.append("size", size);
                    
                    const pubRes = await fetch("/api/publish", {
                        method: "POST",
                        body: apiFormData
                    });
                    
                    const pubData = await pubRes.json();
                    
                    if(pubData.success) {
                        statusDiv.innerHTML = "<span style='color:#16a34a;font-weight:bold;'>🎉 تم النشر بنجاح!</span>";
                        alert("تم إضافة المود للموقع!");
                        location.reload(); 
                    } else {
                        throw new Error(pubData.error || "خطأ غير معروف");
                    }

                } catch(err) {
                    console.error(err);
                    statusDiv.innerHTML = `<span style='color:#ef4444;font-weight:bold;'>❌ فشل: ${err.message}</span>`;
                } finally {
                    btn.disabled = false;
                    btn.textContent = "🚀 نشر المود الآن";
                }
            };
        }
    }

    window.addEventListener("load", () => {
        setTimeout(injectPublisherUI, 1000);
    });
})();

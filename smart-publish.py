#!/usr/bin/env python3
import os, json, subprocess, sys

# إعدادات المستودعات
REPOS = {
    "primary": "origin",      # gtxmod-ps4
    "secondary": "mods2"      # gtxmod-ps4-mods-2
}

def get_current_mod_count(repo_name):
    """جلب عدد المودات الحالية من mods.json"""
    try:
        # نفترض أن mods.json موجود في الجذر
        if repo_name == "primary":
            path = "mods.json"
        else:
            # للمستودع الثاني، نحتاج لclone مؤقت أو قراءة remote file
            # للتبسيط هنا، سنستخدم git show لقراءة الملف من الفرع البعيد
            cmd = f"git show {repo_name}/main:mods.json"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.returncode != 0: return 0
            data = json.loads(result.stdout)
            return len(data) if isinstance(data, list) else len(data.get('mods', []))
        
        # للقراءة المحلية (Primary)
        with open(path, 'r') as f:
            data = json.load(f)
            return len(data) if isinstance(data, list) else len(data.get('mods', []))
            
    except Exception as e:
        print(f"Error counting mods in {repo_name}: {e}")
        return 0

def select_target_repo():
    """اختيار المستودع الأقل امتلاءً أو التالي في الدور"""
    count_primary = get_current_mod_count("primary")
    
    # قاعدة بسيطة: إذا تجاوز العدد 50 موداً في الرئيسي، ننتقل للثاني
    # يمكنك تغيير الرقم حسب حاجتك
    MAX_LIMIT_PRIMARY = 1 
    
    if count_primary < MAX_LIMIT_PRIMARY:
        return "primary"
    else:
        return "secondary"

def publish_mod(mod_file_path, mod_metadata):
    target = select_target_repo()
    print(f"🎯 Target Repository selected: {target}")
    
    # 1. نسخ ملف المود إلى مجلد مناسب في المستودع الهدف
    dest_dir = "mods/"
    os.makedirs(dest_dir, exist_ok=True)
    
    filename = os.path.basename(mod_file_path)
    dest_path = os.path.join(dest_dir, filename)
    
    import shutil
    shutil.copy(mod_file_path, dest_path)
    print(f"📦 Copied {filename} to {dest_path}")
    
    # 2. تحديث mods.json في المستودع الهدف
    mods_json_path = "mods.json"
    
    # قراءة القائمة الحالية
    current_mods = []
    if os.path.exists(mods_json_path):
        with open(mods_json_path, 'r') as f:
            try:
                data = json.load(f)
                current_mods = data if isinstance(data, list) else data.get('mods', [])
            except: pass
    
    # إضافة المود الجديد
    new_entry = {
        "id": mod_metadata['id'],
        "title": mod_metadata['title'],
        "category": mod_metadata['category'],
        "url": f"https://raw.githubusercontent.com/appstorearbic-svg/{'gtxmod-ps4' if target=='primary' else 'gtxmod-ps4-mods-2'}/main/{dest_path}",
        "image": mod_metadata.get('image', ''),
        "size": mod_metadata.get('size', ''),
        "date": mod_metadata.get('date', '')
    }
    current_mods.append(new_entry)
    
    # حفظ التعديلات
    with open(mods_json_path, 'w') as f:
        json.dump(current_mods, f, indent=2, ensure_ascii=False)
    print(f"✅ Updated mods.json")
    
    # 3. Commit و Push للمستودع الهدف
    subprocess.run(["git", "add", "."], check=True)
    msg = f"Publish new mod: {mod_metadata['title']} to {target}"
    subprocess.run(["git", "commit", "-m", msg], check=True)
    
    remote_name = REPOS[target]
    print(f"🚀 Pushing to {remote_name}...")
    subprocess.run(["git", "push", remote_name, "main"], check=True)
    print(f"🎉 Success! Mod published to {target}.")

if __name__ == "__main__":
    # مثال للاستخدام: python3 smart-publish.py path/to/mod.zip '{"id":"test","title":"Test Mod","category":"cars"}'
    if len(sys.argv) < 3:
        print("Usage: python3 smart-publish.py <zip_path> '<json_metadata>'")
        sys.exit(1)
    
    zip_path = sys.argv[1]
    metadata = json.loads(sys.argv[2])
    publish_mod(zip_path, metadata)

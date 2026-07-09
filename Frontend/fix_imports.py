import os
import glob

def fix_imports():
    src_dir = "/home/suman/Desktop/Mern Stack Projects/RealTimeChat/Frontend/src"
    
    for filepath in glob.glob(src_dir + "/**/*.jsx", recursive=True) + glob.glob(src_dir + "/**/*.js", recursive=True):
        if filepath.endswith("config.js"): continue
        
        with open(filepath, 'r') as f:
            content = f.read()
            
        new_content = content.replace("from '../main'", "from '../config'")
        new_content = new_content.replace('from "../main"', 'from "../config"')
        new_content = new_content.replace("from './main'", "from './config'")
        new_content = new_content.replace('from "./main"', 'from "./config"')
        
        if new_content != content:
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Fixed {filepath}")

fix_imports()

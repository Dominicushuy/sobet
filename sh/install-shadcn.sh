#!/bin/bash  

# Khởi tạo Shadcn UI  
npx shadcn@latest init  

# Danh sách các component  
COMPONENTS=(  
    "calendar"  
    "date-picker"  
    "button"  
    "input"  
    "dialog"  
    "dropdown-menu"  
    "select"  
    "tabs"  
    "table"  
    "card"  
    "form"  
    "toast"  
    "sheet"  
    "popover"
    "tooltip"
    "checkbox"
)  

# Cài đặt từng component  
for component in "${COMPONENTS[@]}"  
do  
    npx shadcn@latest add "$component"  
done  

echo "Đã cài đặt xong tất cả các component!"
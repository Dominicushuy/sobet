#!/bin/bash

# Script để tạo cấu trúc dự án xổ số

echo "Bắt đầu tạo cấu trúc dự án..."

# Tạo thư mục gốc src (nếu chưa tồn tại)
if [ ! -d "src" ]; then
  mkdir -p src
  echo "Đã tạo thư mục src"
fi

# Tạo các thư mục con
directories=(
  "src/assets"
  "src/components/common"
  "src/components/layout"
  "src/components/chat"
  "src/components/tables"
  "src/components/forms"
  "src/components/modals"
  "src/components/charts"
  "src/contexts"
  "src/database"
  "src/hooks"
  "src/pages/auth"
  "src/pages/user"
  "src/pages/admin"
  "src/services/betCodeParser"
  "src/services/calculator"
  "src/services/verification"
  "src/services/export"
  "src/utils"
  "src/config"
)

# Tạo các thư mục
for dir in "${directories[@]}"; do
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    echo "Đã tạo thư mục $dir"
  else
    echo "Thư mục $dir đã tồn tại, bỏ qua"
  fi
done

# Tạo các file
files=(
  # Context files
  "src/contexts/AuthContext.jsx"
  "src/contexts/UIContext.jsx"
  
  # Database files
  "src/database/db.js"
  "src/database/schema.js"
  "src/database/seeders.js"
  "src/database/migrations.js"
  
  # Hook files
  "src/hooks/useBetCodes.js"
  "src/hooks/useVerification.js"
  "src/hooks/useStations.js"
  
  # Page files - User
  "src/pages/user/BetCodeInput.jsx"
  "src/pages/user/BetCodeHistory.jsx"
  
  # Page files - Admin
  "src/pages/admin/Dashboard.jsx"
  "src/pages/admin/UserManagement.jsx"
  "src/pages/admin/StationManagement.jsx"
  "src/pages/admin/BetTypeManagement.jsx"
  "src/pages/admin/BetCodeVerification.jsx"
  "src/pages/admin/VerificationHistory.jsx"
  
  # Service files - Parser
  "src/services/betCodeParser/parser.js"
  "src/services/betCodeParser/validator.js"
  "src/services/betCodeParser/errorDetector.js"
  "src/services/betCodeParser/errorFixer.js"
  
  # Service files - Calculator
  "src/services/calculator/stakeCalculator.js"
  "src/services/calculator/prizeCalculator.js"
  
  # Service files - Verification
  "src/services/verification/matcher.js"
  "src/services/verification/resultProcessor.js"
  
  # Service files - Export
  "src/services/export/excelExporter.js"
  "src/services/export/pdfExporter.js"
  
  # Utility files
  "src/utils/formatters.js"
  "src/utils/validators.js"
  "src/utils/calculations.js"
  "src/utils/dateUtils.js"
  
  # Config files
  "src/config/constants.js"
  "src/config/defaults.js"
  "src/config/roles.js"
  
  # Root files
  "src/App.jsx"
  "src/index.jsx"
)

# Tạo các file
for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    touch "$file"
    echo "Đã tạo file $file"
  else
    echo "File $file đã tồn tại, bỏ qua"
  fi
done

echo "Đã hoàn thành việc tạo cấu trúc dự án!"
echo "Tổng cộng: ${#directories[@]} thư mục và ${#files[@]} file được kiểm tra."
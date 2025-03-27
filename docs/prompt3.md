Tôi dự định sẽ xây dựng màn hình sau, vì đây là chức năng lớn nên tôi cần bạn hệ thống lại, mô tả kỹ lại và tách thành nhiều tasks nhỏ hơn để dễ quản lý, tôi sẽ dùng từng task để hỏi Chat Bot tạo ra code nên bạn có thể mô tả task dưới dạng prompt

Output chỉ chứa plan mô tả task dưới dạng prompt, không cần chứa code

- Mô phỏng màn hình chat người dùng với Bot (kiểu giống telegram hoặc messenger)
  Màn hình chia làm 2 phần bằng nhau, bên trái là danh sách các mã cược hợp lệ, bên phải là ô chat

* Người dùng nhập mã cược vào ô chat (có thể nhập nhiều mã cược cùng lúc), nếu hợp lệ thì hiển thị mã cược đó ở danh sách bên trái (dưới dạng Card) nhưng mới chỉ ở bản nháp, chưa lưu vào hệ thống, sẽ có một nút lưu và Confirm ở đầu danh sách mã cược để lưu vào hệ thống.
* Vì người dùng sẽ nhập tổ hợp nhiều mã một lúc nên những mã nào hợp lệ sẽ được hiển thị ở danh sách bên trái, những mã nào bị lỗi sẽ được Chat bot hiển thị thông báo lỗi, hướng dẫn sửa lỗi ở ngay ô chat.
* Lịch sử chat không lưu lại, chỉ lưu lại các mã cược hợp lệ ở danh sách bên trái vào session, khi người dùng thoát ra và vào lại thì danh sách mã cược vẫn còn.
* Danh sách mã cược sẽ bao gồm chi tiết thông tin cược như: tên đài, số cược, kiểu cược, tính toán số tiền đóng, tiềm năng thắng trên một số cược, tiềm năng thắng trên tất cả cược.
* Mỗi Card mã cược sẽ có nút xóa để xóa mã cược khỏi danh sách
* Mỗi Card mã cược sẽ có nút chỉnh sửa để chỉnh sửa thông tin mã cược
* Mỗi Card mã cược sẽ có nút xem chi tiết để xem thông tin chi tiết mã cược
* Mỗi Card mã cược sẽ có nút in để in thông tin mã cược cho khách hàng, in dưới dạng PDF

# Plan for Chat Interface and Bet Management System - Task Breakdown

## 1. Basic Layout and Structure

```
Create a responsive layout for a bet management system with a chat interface. The screen should be split into two equal parts: a list of valid bet codes on the left and a chat interface on the right. Use React with Tailwind CSS for styling. The left panel should have a header with a save/confirm button and scrollable content area. The right panel should have a chat header, message display area, and a message input at the bottom. Implement a basic state management structure to handle the conversation flow and bet code list.
```

## 2. Chat Interface Functionality

```
Implement the chat interface component for the betting system. Create a message input area with a send button that allows users to input text messages (bet codes). Display messages in a conversation format with user messages aligned to the right and bot responses to the left. Each message should have proper styling with timestamps. Ensure the chat area scrolls automatically to show the latest messages. No need to implement message persistence between sessions yet.
```

## 3. Bet Code Parser and Validator

```
Implement a bet code parsing and validation service that can analyze user-submitted bet codes from the chat interface. Use the provided parseBetCode, validateBetCode, and detectErrors functions from the existing codebase. The service should be able to identify valid bet codes, detect errors, and provide helpful error messages. Structure the service to return both valid codes and detailed error information that can be displayed in the chat interface.
```

## 4. Bet Code Card Component

```
Create a BetCodeCard component to display valid bet codes in the left panel. Each card should show key information including station name, betting numbers, bet type, stake amount, and potential winnings. The card should have a header with the station name, a body with bet details, and a footer with action buttons (delete, edit, details, print). Style the card with Tailwind CSS to be visually appealing and clearly display the bet information. Make the component responsive to fit different screen sizes.
```

## 5. Bet Code Management State

```
Implement state management for the bet code list using React context or a state management library. Create functions to add, edit, remove, and save bet codes. The state should maintain draft status for newly added codes until they are saved/confirmed. Implement session storage to persist the bet code list between page refreshes. Include functionality to track validation status and any error messages for each code. Ensure the state is properly synchronized with the UI components.
```

## 6. Error Handling and Suggestions in Chat

```
Enhance the chat interface to provide intelligent error feedback for invalid bet codes. Implement a system that can analyze parsing errors and display user-friendly error messages in the chat. Add suggestions for fixing common errors (like incorrect station names, bet types, or number formats). Include visual cues to highlight specific parts of the code that have errors. The bot response should offer step-by-step guidance on how to correct the issues with proper formatting and examples.
```

## 7. PDF Export Functionality

```
Implement a PDF generation feature for bet codes. Create a service that can convert a bet code card's information into a well-formatted PDF document using jsPDF or a similar library. The PDF should include all relevant betting information, formatted in a receipt-like layout with the station name, betting numbers, bet type, stake amount, potential winnings, and a timestamp. Add a print button to each bet card that triggers the PDF generation and download.
```

## 8. Edit Functionality for Bet Codes

```
Create an edit mode for bet code cards. Implement a modal or inline editing functionality that allows users to modify existing bet codes. The editor should provide fields for all editable properties and validate changes in real-time using the same validation logic as the parser. Include a preview of calculation results (stake amount and potential winnings) as the user makes changes. Ensure that edited codes are properly validated before saving and update the state accordingly.
```

## 9. Batch Operations and Save/Confirm Functionality

```
Implement batch operations for bet codes, including a master save/confirm button at the top of the list. Create the logic to transition draft bet codes to confirmed status. Add visual indicators to distinguish between draft and confirmed codes. Implement batch selection functionality to allow users to select multiple codes for operations like deletion or confirmation. Add confirmation dialogs for important actions like deleting or confirming multiple codes. Update the session storage to reflect the confirmed status.
```

## 10. Detailed View Modal

```
Create a detailed view modal for bet codes that shows comprehensive information about a selected bet. The modal should display all available information about the bet, including calculation details, breakdown of potential winnings, and any additional metadata. Format complex numerical data in a readable way with proper separators and currency symbols. Include a section showing the original bet code text and its parsed interpretation. Add buttons to perform actions like edit, delete, or print directly from the modal.
```

## 11. Responsive Design and Mobile Optimization

```
Optimize the application for different screen sizes, with special attention to mobile devices. Implement a responsive layout that converts the side-by-side panels to a tabbed or stacked interface on smaller screens. Ensure that the chat interface and bet code list are both fully functional on mobile with appropriate touch controls. Add swipe gestures for card actions on touch devices. Optimize the PDF generation for mobile viewing. Test the interface on various device sizes and ensure all functionality works correctly in both orientations.
```

## 12. Performance Optimization

```
Optimize the application performance, especially for handling large numbers of bet codes. Implement virtualized lists for the bet code display to handle hundreds of items efficiently. Add debouncing for user input in the chat to prevent excessive validation calls. Implement memoization for expensive calculations like parsing and validation. Optimize the PDF generation process to work efficiently even with many items. Add loading states and progress indicators for operations that might take time. Ensure the application remains responsive under load.
```

## 13. Accessibility and UX Enhancements

```
Enhance the application's accessibility and user experience. Implement proper keyboard navigation throughout the interface. Add screen reader support with ARIA attributes for all interactive elements. Implement clear focus states and tab order. Add helpful tooltips for complex features. Enhance the visual feedback for actions with animations and transitions. Implement undo functionality for deletions and edits. Add sound notifications for important events like errors or confirmations. Ensure all text has sufficient contrast and readable font sizes.
```

Each of these tasks can be implemented independently, allowing you to build up the application feature by feature. The prompts are designed to provide specific direction while leaving room for implementation details.

# HƯỚNG DẪN THUYẾT MINH VÀ QUAY VIDEO BẢO VỆ GIỮA KỲ
**Môn:** Phát triển ứng dụng di động  
**Đề tài:** Quản lý món ăn  
**MSSV:** BIT240023  
**Tên Project:** BIT240023_FoodManager  

---

## 1. TỔNG QUAN HỆ THỐNG ĐÃ XÂY DỰNG

Ứng dụng được xây dựng hoàn chỉnh bằng **React Native (TypeScript)** với lưu trữ local **AsyncStorage**, đáp ứng 100% các yêu cầu từ đề bài (không dùng API ngoài theo yêu cầu của bạn):

1. **Tuân thủ quy định MSSV (BIT240023):**
   - Tên bảng / Storage Key: `BIT240023_DishCategory`, `BIT240023_Dish`, `BIT240023_Language`.
   - Tất cả các trường dữ liệu đều có tiền tố `BIT240023_`:
     - **DishCategory:** `BIT240023_Id`, `BIT240023_Name`, `BIT240023_Description`.
     - **Dish:** `BIT240023_Id`, `BIT240023_Name`, `BIT240023_Price`, `BIT240023_PreparationTime`, `BIT240023_IsAvailable`, `BIT240023_Description`, `BIT240023_DishCategoryId`, `BIT240023_DishImage` (`BIT240023_ImageUrl`, `BIT240023_IsThumbnail`).
   - Badge hiển thị rõ ràng `MSSV: BIT240023` trên thanh Header của ứng dụng.

2. **Dữ liệu mẫu khởi tạo (Seed Data):**
   - 04 loại món ăn phong phú (vượt yêu cầu tối thiểu 3).
   - 07 món ăn thực tế với đầy đủ nhiều hình ảnh chất lượng cao (vượt yêu cầu tối thiểu 5).
   - Có cả món đang bán (`Available`) và ngừng bán (`Unavailable`) để demo trực quan.

3. **Chức năng cơ bản & nghiệp vụ:**
   - **Danh sách (List):** Tìm kiếm tên món ăn theo thời gian thực (real-time); Lọc đồng thời theo loại món, trạng thái bán, khoảng giá; Sắp xếp theo giá tăng/giảm, thời gian chế biến nhanh nhất; Giữ nguyên bộ lọc khi chuyển màn hình.
   - **Chi tiết (Detail):** Bộ sưu tập nhiều ảnh, hiển thị huy hiệu `Quick` (<= 15 phút) hoặc `Regular` (> 15 phút), nút đổi ảnh đại diện (Thumbnail), thêm URL ảnh mới.
   - **Thêm/Sửa món (Create/Edit):** Form chọn loại món từ dữ liệu lưu trữ, validation nghiêm ngặt (tên không rỗng, giá > 0, thời gian > 0, tên món không trùng trong cùng loại).
   - **Xóa món:** Hộp thoại xác nhận trước khi xóa an toàn.
   - **Ràng buộc loại món:** Không cho phép xóa loại món đang có món ăn sử dụng (hiển thị thông báo số lượng món đang dùng).
   - **Đa ngôn ngữ (English ↔ Tiếng Việt):** Mặc định English, chuyển đổi tức thì trên Header, dịch toàn bộ nhãn, nút, trạng thái, lỗi validation, và lưu vào bộ nhớ.

---

## 2. KỊCH BẢN QUAY VIDEO 1: DEMO ỨNG DỤNG (2.0 ĐIỂM)

*Thời lượng khuyến nghị: 3 - 5 phút. Hãy bật emulator hoặc máy thật và thao tác theo các bước sau:*

1. **Giới thiệu đầu video:**
   - Chỉ vào tiêu đề và huy hiệu `MSSV: BIT240023` trên Header ứng dụng.
   - Giới thiệu: "Em chào thầy/cô, em là sinh viên có mã số BIT240023. Sau đây em xin demo ứng dụng BIT240023_FoodManager."
2. **Demo Đa ngôn ngữ (English ↔ Tiếng Việt):**
   - Ứng dụng mở lên mặc định là tiếng Anh (English).
   - Bấm vào nút chuyển ngôn ngữ `[EN | VI]` trên Header -> toàn bộ giao diện, nhãn, nút chuyển sang Tiếng Việt ngay lập tức.
   - Chuyển lại tiếng Anh hoặc giữ tiếng Việt để kiểm tra tính duy trì trạng thái khi chuyển qua các màn hình.
3. **Demo Tìm kiếm, Lọc & Sắp xếp:**
   - **Tìm kiếm:** Gõ một phần tên món (ví dụ: `pho` hoặc `nem`) -> danh sách lọc ngay lập tức.
   - **Lọc theo loại:** Chọn chip loại món ở thanh cuộn trên cùng (ví dụ: `Appetizers`).
   - **Mở bộ lọc nâng cao (Filters):**
     - Chọn trạng thái `Available` -> món "Bánh Mì Đặc Biệt" (đang ngừng bán) sẽ bị ẩn đi.
     - Chọn `All` -> món ngừng bán lại xuất hiện với nhãn đỏ `Stopped / Ngừng bán` (đúng chuẩn yêu cầu 4.4).
     - Nhập khoảng giá: Min 40000 - Max 60000 -> bấm Áp dụng -> danh sách lọc đúng khoảng giá.
     - Sắp xếp: Chọn `Price: Low to High` -> món giá rẻ lên trước; chọn `Prep Time: Shortest` -> món thời gian ngắn lên trước.
4. **Demo Xem chi tiết món & Quản lý ảnh đại diện (Thumbnail):**
   - Bấm vào một món ăn (ví dụ: "Hanoi Beef Pho").
   - Quan sát badge phân loại thời gian chế biến: 25 phút -> hiển thị `Regular / Thông thường`.
   - Xem dải ảnh thu nhỏ: bấm đổi ảnh đại diện (Set as Thumbnail) -> ảnh được chọn nhận ngôi sao ★ làm ảnh chính ngay lập tức.
   - Bấm nút "+ Add Image URL" -> nhập đường link ảnh mới để minh họa thêm ảnh bằng ImageUrl.
   - Bấm Back quay lại danh sách -> **chỉ rõ là các bộ lọc và từ khóa tìm kiếm vẫn được giữ nguyên** (đúng yêu cầu đề bài).
5. **Demo Thêm món mới & Kiểm tra Validation:**
   - Bấm nút "+ Add Dish" (Thêm món).
   - Bấm "Create" khi chưa nhập dữ liệu -> ứng dụng hiển thị hộp báo lỗi validation (Tên không được để trống, Giá > 0, Thời gian > 0).
   - Nhập tên trùng với một món đã có trong cùng loại -> kiểm tra lỗi "A dish with this name already exists in this category".
   - Nhập thông tin hợp lệ, thời gian 10 phút, thêm URL ảnh -> Lưu -> Món mới xuất hiện với huy hiệu `Quick`.
6. **Demo Chỉnh sửa & Xóa món:**
   - Bấm nút "Edit" trên món vừa tạo -> sửa giá và đổi trạng thái sang ngừng bán -> Lưu -> Dữ liệu cập nhật ngay.
   - Bấm nút "Delete" -> hộp thoại xác nhận hiện lên -> Bấm xác nhận -> Món ăn bị xóa khỏi danh sách.
7. **Demo NÂNG CAO: Chế độ Ngoại tuyến & Tự động đồng bộ với MockAPI (1,5 Điểm):**
   - Chỉ vào huy hiệu mạng trên Header: đang hiển thị `🟢 Online`.
   - **Tắt mạng:** Bấm nút **`📡 Cut Net`** trên Header (hoặc ngắt Wi-Fi máy tính) -> huy hiệu chuyển ngay sang **`🔴 Offline`**.
   - **Thao tác khi offline:** Bấm `+ Add Dish` thêm một món ăn mới (ví dụ: *"Bánh Cuốn Nóng"*).
   - Quan sát: Món ăn vẫn được tạo thành công và lưu vào bộ nhớ Local (AsyncStorage), hiển thị huy hiệu `🔴 Offline (1)`.
   - **Bật mạng trở lại:** Bấm nút **`📶 Turn Online`** (hoặc bật lại Wi-Fi) -> Ứng dụng lập tức hiển thị huy hiệu **`⚡ Syncing with MockAPI...`**.
   - Hệ thống tự động đẩy bản ghi vừa tạo lên MockAPI mà **không cần người dùng bấm nút nào**.
   - Sau khi đồng bộ xong, chuyển sang `🟢 Online` và dữ liệu đồng bộ nhất quán 100%!
8. **Demo Ràng buộc quản lý Loại món (Category Constraint):**
   - Bấm nút "Categories" trên thanh công cụ.
   - Thấy danh sách loại món kèm số lượng món ăn trong từng loại (`3 dish(es)`, `1 dish(es)`, ...).
   - Thử bấm nút xóa một loại món đang có 3 món ăn -> Hệ thống hiện thông báo: "Cannot delete category! There are 3 dish(es) currently using this category."
   - Bấm "+ Add Category" -> tạo một loại món mới (chưa có món nào) -> bấm xóa -> loại món mới được xóa thành công!

---

## 3. KỊCH BẢN QUAY VIDEO 2: THUYẾT MINH MÃ NGUỒN (2.0 ĐIỂM)

*Hãy mở Visual Studio Code / IDE và lần lượt mở các file theo thứ tự sau để thuyết minh:*

### Bước 1: Chỉ rõ tên Project và cấu trúc thư mục
- Mở `package.json` và `app.json`: chỉ vào `"name": "BIT240023_FoodManager"`.
- Mở `android/app/src/main/java/com/bit240023_foodmanager/MainActivity.kt`: chỉ vào hàm `getMainComponentName(): String = "BIT240023_FoodManager"`.

### Bước 2: Thuyết minh Model dữ liệu & Quy định tiền tố {MSSV}_ (ĐIỂM THEN CHỐT)
- Mở file `src/types/index.ts`:
  - Giải thích 02 model chính: `BIT240023_DishCategory` và `BIT240023_Dish`.
  - Chỉ rõ từng trường dữ liệu đều bắt buộc có tiền tố `BIT240023_`:
    - `BIT240023_Id`, `BIT240023_Name`, `BIT240023_Description`
    - `BIT240023_Price`, `BIT240023_PreparationTime`, `BIT240023_IsAvailable`, `BIT240023_DishCategoryId`
    - `BIT240023_DishImage` gồm `{ BIT240023_ImageUrl, BIT240023_IsThumbnail }`.
  - Giải thích quan hệ: Mỗi món `Dish` tham chiếu đến `DishCategory` thông qua khóa ngoại `BIT240023_DishCategoryId`.

### Bước 3: Thuyết minh Lưu trữ Local & Tên Table (AsyncStorage)
- Mở file `src/services/storageService.ts`:
  - Chỉ vào đối tượng `STORAGE_KEYS`:
    ```typescript
    export const STORAGE_KEYS = {
      TABLE_DISH_CATEGORY: 'BIT240023_DishCategory',
      TABLE_DISH: 'BIT240023_Dish',
      APP_LANGUAGE: 'BIT240023_Language',
    };
    ```
  - Giải thích: Vì AsyncStorage là dạng key-value, ta sử dụng key mang tiền tố `{MSSV}_` đóng vai trò như các bảng (Table) trong cơ sở dữ liệu quan hệ.
  - Chỉ vào hàm `deleteCategory`: giải thích kiểm tra ràng buộc không cho xóa loại món đang có món ăn tham chiếu đến:
    ```typescript
    const inUseDishes = dishes.filter(d => d.BIT240023_DishCategoryId === categoryId);
    if (inUseDishes.length > 0) return { success: false, inUseCount: inUseDishes.length };
    ```

### Bước 4: Thuyết minh Nghiệp vụ & Validation trong AppContext
- Mở file `src/context/AppContext.tsx`:
  - Chỉ vào hàm `validateDish`:
    - Tên không rỗng.
    - Giá > 0 (`Price > 0`).
    - Thời gian chế biến > 0 (`PreparationTime > 0`).
    - Loại món hợp lệ (`DishCategoryId`).
    - Tên món không trùng trong cùng loại món (`d.BIT240023_DishCategoryId === dish.BIT240023_DishCategoryId && d.BIT240023_Name === dish.BIT240023_Name`).
  - Chỉ vào hàm `setThumbnailImage`: đảm bảo mỗi món chỉ có duy nhất 1 ảnh đại diện (`BIT240023_IsThumbnail = true`), các ảnh khác tự động về `false`.
  - Chỉ vào cơ chế lưu trữ và chuyển đổi ngôn ngữ (`toggleLanguage`).

### Bước 5: Thuyết minh Đa ngôn ngữ (i18n)
- Mở file `src/i18n/translations.ts`:
  - Chỉ vào từ điển ngôn ngữ với mặc định là tiếng Anh (`en`) và tiếng Việt (`vi`), dịch toàn bộ nhãn, nút bấm, thông báo lỗi validation và trạng thái.

### Bước 6: Thuyết minh Phần Nâng cao: Offline & Tự động đồng bộ với MockAPI (1,5 Điểm)
- Mở file `src/services/mockApiService.ts`:
  - Chỉ vào Base URL: `https://6ad72199f71f154ac487d56c.mockapi.io/ai/v1`.
  - Chỉ vào 2 endpoint tương ứng với 2 resource có tiền tố `{MSSV}_`:
    - `BIT240023_DishCategory`
    - `BIT240023_Dish`
  - Các hàm gọi REST API: `getCategories`, `createCategory`, `deleteCategory`, `getDishes`, `createDish`, `updateDish`, `deleteDish`.
- Mở file `src/services/syncService.ts`:
  - **Phát hiện mạng:** Lắng nghe sự kiện `online` / `offline` của trình duyệt / thiết bị và heartbeat ping kiểm tra kết nối định kỳ.
  - **Hàng đợi lưu ngoại tuyến (Offline Queue):** Lưu các tác vụ tạo/sửa/xóa vào AsyncStorage key `BIT240023_SyncQueue` khi mất kết nối mạng.
  - **Cơ chế tự động đồng bộ (Auto-Sync):** Khi có mạng trở lại, hàm `syncOfflineChanges()` tự động duyệt qua hàng đợi và đẩy lên MockAPI, thay thế ID tạm bằng ID thật từ MockAPI, đảm bảo dữ liệu nhất quán và không trùng lặp bản ghi.

### Bước 7: Thuyết minh Màn hình danh sách & Bộ lọc
- Mở file `src/screens/DishListScreen.tsx`:
  - Chỉ vào hook `useMemo` tính toán `filteredAndSortedDishes`:
    - Tìm kiếm chuỗi con (substring search).
    - Lọc loại món.
    - Lọc trạng thái đang bán (`available` chỉ lấy `true`, `all` lấy cả `true` và `false`).
    - Lọc khoảng giá (`minPrice` và `maxPrice`).
    - Sắp xếp giá và thời gian chế biến.
    - Huy hiệu `Quick` khi `PreparationTime <= 15`, ngược lại là `Regular`.

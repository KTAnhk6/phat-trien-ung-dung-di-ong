import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  en: {
    students: "Students",
    addStudent: "Add Student",
    studentDetails: "Student Details",
    name: "Full Name",
    studentId: "Student ID",
    email: "Email",
    avatar: "Avatar",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    confirmEdit: "Do you want to edit this student's information?",
    confirmDelete: "Do you want to delete this student's information?",
    yes: "Yes",
    no: "No",
    cancel: "Cancel",
    selectImage: "Select Image",
    takePhoto: "Take Photo",
    studentListEmpty: "No students found.",
    error: "Error",
    success: "Success",
    requiredFields: "Please fill all required fields",
    invalidStudentIdFormat: "Student ID must have 9 chars (e.g. BAA221234): 'B' + 2 uppercase letters + 2 digits (22-30) + 4 digits",
  },
  vi: {
    students: "Sinh viên",
    addStudent: "Thêm SV",
    studentDetails: "Chi tiết SV",
    name: "Họ tên SV",
    studentId: "Mã số SV",
    email: "Email",
    avatar: "Ảnh đại diện",
    save: "Lưu",
    delete: "Xóa",
    edit: "Sửa",
    confirmEdit: "Bạn có muốn sửa thông tin SV không?",
    confirmDelete: "Bạn có muốn xóa thông tin SV không?",
    yes: "Có",
    no: "Không",
    cancel: "Hủy",
    selectImage: "Chọn ảnh",
    takePhoto: "Chụp ảnh",
    studentListEmpty: "Chưa có sinh viên.",
    error: "Lỗi",
    success: "Thành công",
    requiredFields: "Vui lòng điền đủ thông tin",
    invalidStudentIdFormat: "MSV phải có 9 kí tự (VD: BAA221234): bắt đầu bằng 'B', 2 chữ hoa, 2 số từ 22-30, 4 số bất kỳ",
  },
};

const i18n = new I18n(translations);

i18n.locale = getLocales()[0]?.languageCode ?? 'vi';
i18n.enableFallback = true;
i18n.defaultLocale = 'vi';

export default i18n;

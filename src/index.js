const express = require('express');
const app = express();
const cors = require('cors');
const xlsx = require('xlsx');
const multer = require('multer');
const fs = require('fs');
app.use(express.json());
app.use(cors());
const upload = multer({ dest: 'uploads/' }); // Đường dẫn để lưu trữ file tải lên

app.post('/upload', upload.single('excelFile'), (req, res) => {
  const filePath = req.file.path;

  // Đọc file Excel và xử lý dữ liệu
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // Thực hiện các xử lý khác với dữ liệu từ file Excel

  // Xóa file tạm sau khi đã xử lý
  fs.unlinkSync(filePath);
  // Lấy dữ liệu của cột "Product Name"
  const columnName = 'Seller SKU';
  const headerRow = data[0];
  const columnIndex = headerRow.indexOf(columnName);

  const columnData = data.slice(1).map(rowData => rowData[columnIndex]).filter(value => value !== undefined);
  const numberCounts = {};

  columnData.forEach(value => {
    const number = value.match(/\d+/); // Lấy số từ chuỗi
    if (number) {
      if (numberCounts[number]) {
        numberCounts[number]++;
      } else {
        numberCounts[number] = 1;
      }
    }
  });
  const duplicatedNumbers = Object.keys(numberCounts).filter(number => numberCounts[number] > 1);
  res.json({ data: columnData, duplicatedNumbers: duplicatedNumbers });
});
app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(3000);
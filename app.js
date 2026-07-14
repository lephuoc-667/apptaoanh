// Thiết lập ngày mặc định từ hệ thống
const eventDateInput = document.getElementById('eventDate');
const today = new Date();
eventDateInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

// Logic ẩn/hiện ô nhập tên CD-CR
const themeSelect = document.getElementById('theme');
const weddingGroup = document.getElementById('weddingGroup');
const weddingThemes = ["LỄ ĐÍNH HÔN", "LỄ THÀNH HÔN", "LỄ TÂN HÔN", "LỄ VU QUY"];

function checkTheme() {
    weddingGroup.style.display = weddingThemes.includes(themeSelect.value) ? "block" : "none";
}
themeSelect.addEventListener('change', checkTheme);
checkTheme();

// Đọc file ảnh nền tải lên
let uploadedImage = null;
const bgUpload = document.getElementById('bgUpload');
const uploadLabel = document.getElementById('uploadLabel');

bgUpload.addEventListener('change', function(e) {
    if(this.files && this.files[0]) {
        uploadLabel.textContent = `✔️ Đã chọn: ${this.files[0].name}`;
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = () => uploadedImage = img;
            img.src = event.target.result;
        }
        reader.readAsDataURL(this.files[0]);
    }
});

// Hàm chính xử lý xuất ảnh
document.getElementById('btnExport').addEventListener('click', function() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const ratio = document.querySelector('input[name="aspectRatio"]:checked').value;
    
    // Cấu hình kích thước ảnh 4K
    const width = ratio === '16:9' ? 3840 : 2160;
    const height = ratio === '16:9' ? 2160 : 3840;
    canvas.width = width;
    canvas.height = height;

    // 1. Vẽ nền
    if (uploadedImage) {
        let imgRatio = uploadedImage.width / uploadedImage.height;
        let canvasRatio = width / height;
        let dw, dh, sx, sy;
        if (imgRatio > canvasRatio) {
            dh = height; dw = height * imgRatio; sx = (width - dw) / 2; sy = 0;
        } else {
            dw = width; dh = width / imgRatio; sx = 0; sy = (height - dh) / 2;
        }
        ctx.drawImage(uploadedImage, sx, sy, dw, dh);
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fillRect(0, 0, width, height);
    } else {
        let grad = ctx.createLinearGradient(0, 0, 0, height);
        if (weddingThemes.includes(themeSelect.value)) {
            grad.addColorStop(0, '#700000'); grad.addColorStop(1, '#150000');
        } else {
            grad.addColorStop(0, '#0f2027'); grad.addColorStop(1, '#2c5364');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    }

    // 2. Vẽ nội dung chữ
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const baseSize = ratio === '16:9' ? width / 30 : height / 30;

    // Tên chủ đề
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${baseSize * 1.8}px "Times New Roman", serif`;
    let currentY = height * 0.35;
    ctx.fillText(themeSelect.value, width / 2, currentY);

    // Nếu là lễ cưới hỏi thì vẽ thêm tên CD-CR
    if (weddingThemes.includes(themeSelect.value)) {
        const groom = document.getElementById('groomName').value.trim() || "TÂN LANG";
        const bride = document.getElementById('brideName').value.trim() || "TÂN NƯƠNG";
        ctx.fillStyle = '#dfb76c';
        ctx.font = `italic bold ${baseSize * 1.2}px "Times New Roman", serif`;
        currentY += baseSize * 1.5;
        ctx.fillText(`${groom.toUpperCase()}  ❤  ${bride.toUpperCase()}`, width / 2, currentY);
    }

    // Gạch chân trang trí
    ctx.strokeStyle = '#dfb76c'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(width/2 - baseSize*3, currentY + baseSize); ctx.lineTo(width/2 + baseSize*3, currentY + baseSize); ctx.stroke();

    // Thông tin ngày tháng
    const dParts = eventDateInput.value.split('-');
    const formattedDate = `${dParts[2]}/${dParts[1]}/${dParts[0]}`;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${baseSize * 0.9}px Arial, sans-serif`;
    ctx.fillText(`ĐỊA ĐIỂM: CẦN THƠ — NGÀY: ${formattedDate}`, width / 2, height * 0.58);

    // Vẽ khung sảnh hướng dẫn ở dưới cùng
    const bW = baseSize * 14; const bH = baseSize * 1.8;
    const bX = (width - bW) / 2; const bY = height * 0.72;
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 3;
    
    // Tạo hình chữ nhật bo góc thủ công trên Canvas
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bX, bY, bW, bH, 15) : ctx.rect(bX, bY, bW, bH);
    ctx.fill(); ctx.stroke();

    // Vẽ text trong khung sảnh
    ctx.fillStyle = '#dfb76c';
    ctx.font = `italic bold ${baseSize * 0.75}px Arial, sans-serif`;
    ctx.fillText(`Vị trí: ${document.getElementById('hall').value}`, width / 2, bY + (bH / 2));

    // 3. Tự động tải xuống
    const link = document.createElement('a');
    link.download = `SuKien_${themeSelect.value.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
    
    canvas.style.display = "inline-block"; // Hiện preview
});
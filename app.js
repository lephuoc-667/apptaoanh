// Thiết lập ngày mặc định
const eventDateInput = document.getElementById('eventDate');
const today = new Date();
eventDateInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

// Bộ phần tử điều khiển UI
const themeSelect = document.getElementById('theme');
const weddingGroup = document.getElementById('weddingGroup');
const conferenceGroup = document.getElementById('conferenceGroup');
const hallGroup = document.getElementById('hallGroup');
const ratioInputs = document.querySelectorAll('input[name="aspectRatio"]');

const weddingThemes = ["LỄ ĐÍNH HÔN", "LỄ THÀNH HÔN", "LỄ TÂN HÔN", "LỄ VU QUY"];

// Trạng thái hiển thị sảnh & form nhập thông tin dựa trên lựa chọn người dùng
function updateFormUI() {
    const theme = themeSelect.value;
    const currentRatio = document.querySelector('input[name="aspectRatio"]:checked').value;

    // 1. Logic ẩn hiện theo chủ đề
    if (weddingThemes.includes(theme)) {
        weddingGroup.style.display = "block";
        conferenceGroup.style.display = "none";
    } else {
        weddingGroup.style.display = "none";
        conferenceGroup.style.display = "block";
    }

    // 2. Logic ẩn hiện chọn sảnh (Chỉ hiện khi chọn Kích Thước Dọc 9:16)
    if (currentRatio === "9:16") {
        hallGroup.style.display = "block";
    } else {
        hallGroup.style.display = "none";
    }
}

themeSelect.addEventListener('change', updateFormUI);
ratioInputs.forEach(input => input.addEventListener('change', updateFormUI));
updateFormUI(); // Chạy lúc khởi tạo trang

// Logic tải ảnh nền tự chọn
let uploadedImage = null;
const bgUpload = document.getElementById('bgUpload');
const uploadLabel = document.getElementById('uploadLabel');

bgUpload.addEventListener('change', function(e) {
    if(this.files && this.files[0]) {
        uploadLabel.textContent = `✔️ Đã chọn: ${this.files[0].name}`;
        uploadLabel.style.borderColor = "#d4af37";
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = () => uploadedImage = img;
            img.src = event.target.result;
        }
        reader.readAsDataURL(this.files[0]);
    }
});

// --- PHẦN VẼ ĐỒ HỌA MỸ THUẬT LÊN CANVAS ---
document.getElementById('btnExport').addEventListener('click', function() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const ratio = document.querySelector('input[name="aspectRatio"]:checked').value;
    const theme = themeSelect.value;
    
    // Thiết lập độ phân giải siêu cao (UHD)
    const width = ratio === '16:9' ? 3840 : 2160;
    const height = ratio === '16:9' ? 2160 : 3840;
    canvas.width = width;
    canvas.height = height;

    // 1. Vẽ hình nền (hoặc tạo gradient mĩ thuật)
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
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Lớp phủ dịu mượt
        ctx.fillRect(0, 0, width, height);
    } else {
        let grad = ctx.createLinearGradient(0, 0, 0, height);
        if (weddingThemes.includes(theme)) {
            grad.addColorStop(0, '#58000a'); // Màu đỏ nhung hoàng gia sâu thẳm
            grad.addColorStop(0.5, '#2e0004');
            grad.addColorStop(1, '#0e0002');
        } else {
            grad.addColorStop(0, '#0c1b2b'); // Màu xanh Navy trầm ấm chuyên nghiệp
            grad.addColorStop(0.5, '#07101a');
            grad.addColorStop(1, '#020406');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    }

    // --- VẼ ĐỒ HỌA HOA VĂN MỸ THUẬT (Mỹ thuật Corner-Art) ---
    drawArtOrnaments(ctx, width, height);

    // 2. Thiết lập văn bản nghệ thuật
    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle';
    const baseSize = ratio === '16:9' ? width / 30 : height / 30;

    // Bóng chữ tinh tế
    ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    // --- Vẽ Chủ Đề ---
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${baseSize * 1.8}px "Georgia", "Times New Roman", serif`;
    let currentY = height * 0.35;
    ctx.fillText(theme, width / 2, currentY);

    // --- Vẽ Thông Tin Chi Tiết (Tùy Chủ Đề) ---
    if (weddingThemes.includes(theme)) {
        // Vẽ Tên CD & CR cho lễ cưới
        const groom = document.getElementById('groomName').value.trim() || "GIA HUY";
        const bride = document.getElementById('brideName').value.trim() || "THANH VÂN";
        ctx.fillStyle = '#dfb76c'; // Màu vàng Gold sang trọng
        ctx.font = `italic bold ${baseSize * 1.3}px "Georgia", "Times New Roman", serif`;
        currentY += baseSize * 1.5;
        ctx.fillText(`${groom.toUpperCase()}  ❤  ${bride.toUpperCase()}`, width / 2, currentY);
    } else {
        // Vẽ Nội Dung chi tiết cho Hội nghị / Hội thảo / Workshop
        const confContent = document.getElementById('conferenceContent').value.trim() || "CHƯƠNG TRÌNH PHÁT TRIỂN NĂNG LỰC DOANH NGHIỆP";
        ctx.fillStyle = '#e2e8f0'; 
        ctx.font = `bold ${baseSize * 0.9}px Arial, sans-serif`;
        currentY += baseSize * 1.3;
        ctx.fillText(confContent, width / 2, currentY);
    }

    // Vẽ dòng gạch phân chia mảnh có hạt tròn ngọc bích ở giữa
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#dfb76c'; 
    ctx.lineWidth = 4;
    ctx.beginPath(); 
    ctx.moveTo(width/2 - baseSize*2.5, currentY + baseSize); 
    ctx.lineTo(width/2 + baseSize*2.5, currentY + baseSize); 
    ctx.stroke();

    ctx.fillStyle = '#dfb76c';
    ctx.beginPath();
    ctx.arc(width/2, currentY + baseSize, 8, 0, Math.PI * 2);
    ctx.fill();

    // Thiết lập lại bóng đổ cho thông tin tiếp theo
    ctx.shadowBlur = 10;

    // --- Vẽ Địa Điểm & Thời Gian ---
    const dParts = eventDateInput.value.split('-');
    const formattedDate = `${dParts[2]}/${dParts[1]}/${dParts[0]}`;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${baseSize * 0.85}px Arial, sans-serif`;
    
    const infoY = height * 0.58;
    ctx.fillText(`CẦN THƠ, NGÀY ${formattedDate}`, width / 2, infoY);

    // --- Vẽ Sảnh (Chỉ khi ở chế độ dọc 9:16) ---
    if (ratio === "9:16") {
        const hall = document.getElementById('hall').value;
        const bW = baseSize * 14; 
        const bH = baseSize * 1.8;
        const bX = (width - bW) / 2; 
        const bY = height * 0.72;

        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        if(ctx.roundRect) {
            ctx.roundRect(bX, bY, bW, bH, 15);
        } else {
            ctx.rect(bX, bY, bW, bH);
        }
        ctx.fill(); 
        ctx.stroke();

        ctx.fillStyle = '#dfb76c';
        ctx.font = `italic bold ${baseSize * 0.72}px Arial, sans-serif`;
        ctx.fillText(`Vị trí: ${hall}`, width / 2, bY + (bH / 2));
    }

    // 3. Tự động tải ảnh xuống
    const link = document.createElement('a');
    link.download = `SuKien_${theme.replace(/\s+/g, '_')}_${ratio.replace(':', 'x')}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
    
    canvas.style.display = "inline-block";
});

// Hàm vẽ hoa văn góc & khung viền nghệ thuật màu vàng Gold
// Hàm vẽ hoa văn góc & khung viền nghệ thuật màu vàng Gold
function drawArtOrnaments(ctx, width, height) {
    const margin = 100;
    
    // === ĐÃ BỎ VIỀN KÉP GIÚP THIỆP THOÁNG HƠN ===

    // Vẽ hoa văn lá nghệ thuật ở 4 góc (Bố cục "Banana Leaf/Floral" trừu tượng)
    const corners = [
        { x: margin + 20, y: margin + 20, scaleX: 1, scaleY: 1 }, // Trên trái
        { x: width - (margin + 20), y: margin + 20, scaleX: -1, scaleY: 1 }, // Trên phải
        { x: margin + 20, y: height - (margin + 20), scaleX: 1, scaleY: -1 }, // Dưới trái
        { x: width - (margin + 20), y: height - (margin + 20), scaleX: -1, scaleY: -1 } // Dưới phải
    ];

    corners.forEach(corner => {
        ctx.save();
        ctx.translate(corner.x, corner.y);
        ctx.scale(corner.scaleX, corner.scaleY);

        // Vẽ 3 tầng cánh hoa văn lá cong nghệ thuật màu vàng Gold cổ điển
        ctx.strokeStyle = "#dfb76c";
        ctx.lineWidth = 6;
        ctx.fillStyle = "#dfb76c";

        // Cuống lá/Nhành góc chính
        ctx.beginPath();
        ctx.arc(0, 0, 80, Math.PI, Math.PI * 1.5);
        ctx.stroke();

        // Lá 1 (Lớn)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(120, 30, 150, 150);
        ctx.quadraticCurveTo(30, 120, 0, 0);
        ctx.stroke();

        // Lá 2 (Trực quan giống dáng lá chuối nghệ thuật uốn cong)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(180, -20, 220, 80);
        ctx.quadraticCurveTo(80, 80, 0, 0);
        ctx.stroke();

        // Khớp tâm góc
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}

    // Vẽ hoa văn lá nghệ thuật ở 4 góc (Bố cục "Banana Leaf/Floral" trừu tượng)
    const corners = [
        { x: margin + 20, y: margin + 20, scaleX: 1, scaleY: 1 }, // Trên trái
        { x: width - (margin + 20), y: margin + 20, scaleX: -1, scaleY: 1 }, // Trên phải
        { x: margin + 20, y: height - (margin + 20), scaleX: 1, scaleY: -1 }, // Dưới trái
        { x: width - (margin + 20), y: height - (margin + 20), scaleX: -1, scaleY: -1 } // Dưới phải
    ];

    corners.forEach(corner => {
        ctx.save();
        ctx.translate(corner.x, corner.y);
        ctx.scale(corner.scaleX, corner.scaleY);

        // Vẽ 3 tầng cánh hoa văn lá cong nghệ thuật màu vàng Gold cổ điển
        ctx.strokeStyle = "#dfb76c";
        ctx.lineWidth = 6;
        ctx.fillStyle = "#dfb76c";

        // Cuống lá/Nhành góc chính
        ctx.beginPath();
        ctx.arc(0, 0, 80, Math.PI, Math.PI * 1.5);
        ctx.stroke();

        // Lá 1 (Lớn)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(120, 30, 150, 150);
        ctx.quadraticCurveTo(30, 120, 0, 0);
        ctx.stroke();

        // Lá 2 (Trực quan giống dáng lá chuối nghệ thuật uốn cong)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(180, -20, 220, 80);
        ctx.quadraticCurveTo(80, 80, 0, 0);
        ctx.stroke();

        // Khớp tâm góc
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}

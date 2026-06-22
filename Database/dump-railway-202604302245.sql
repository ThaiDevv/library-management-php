-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: shinkansen.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ct_phieumuon`
--

DROP TABLE IF EXISTS `ct_phieumuon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ct_phieumuon` (
  `MaPM` varchar(20) NOT NULL,
  `MaCuonSach` varchar(20) NOT NULL,
  `NgayTraThucTe` datetime DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT 'Đang mượn',
  PRIMARY KEY (`MaPM`,`MaCuonSach`),
  KEY `FK_CTPM_CuonSach` (`MaCuonSach`),
  CONSTRAINT `FK_CTPM_CuonSach` FOREIGN KEY (`MaCuonSach`) REFERENCES `cuonsach` (`MaCuonSach`) ON DELETE RESTRICT,
  CONSTRAINT `FK_CTPM_PhieuMuon` FOREIGN KEY (`MaPM`) REFERENCES `phieumuon` (`MaPM`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ct_phieumuon`
--

LOCK TABLES `ct_phieumuon` WRITE;
/*!40000 ALTER TABLE `ct_phieumuon` DISABLE KEYS */;
INSERT INTO `ct_phieumuon` VALUES ('PM20260430103449','C107','2026-04-30 10:35:05','Đã trả'),('PM20260430103449','C112','2026-04-30 10:35:05','Đã trả'),('PM20260430103449','C113','2026-04-30 10:35:05','Đã trả'),('PM20260430103835','C101','2026-04-30 10:51:19','Đã trả'),('PM20260430103835','C113','2026-04-30 10:51:19','Đã trả'),('PM20260430121447','C108','2026-04-30 12:34:03','Đã trả'),('PM20260430121447','C111','2026-04-30 12:34:03','Đã trả'),('PM20260430121447','C113','2026-04-30 12:34:03','Đã trả'),('PM20260430121447','C117','2026-04-30 12:34:03','Đã trả');
/*!40000 ALTER TABLE `ct_phieumuon` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_MuonSach_CapNhatTrangThai` BEFORE INSERT ON `ct_phieumuon` FOR EACH ROW BEGIN

    DECLARE v_TrangThai VARCHAR(50);
	DECLARE v_TinhTrang VARCHAR(50);
	DECLARE v_NotFound BOOLEAN DEFAULT FALSE;

    -- Nếu SELECT không tìm thấy cuốn sách
    DECLARE CONTINUE HANDLER FOR NOT FOUND
    BEGIN
        SET v_NotFound = TRUE;
    END;
    
    SELECT TrangThai,TinhTrang INTO v_TrangThai,v_TinhTrang
    FROM cuonsach
    WHERE MaCuonSach = NEW.MaCuonSach
    LIMIT 1;

    IF v_TrangThai IS NULL OR v_TrangThai != 'Sẵn sàng' OR v_TinhTrang != 'Bình Thường'  THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Cuốn sách này không có sẵn trong kho để cho mượn!';
    ELSE
        UPDATE cuonsach
        SET TrangThai = 'Đang mượn'
        WHERE MaCuonSach = NEW.MaCuonSach;
    END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_TraSach_XuLyTuDong` AFTER UPDATE ON `ct_phieumuon` FOR EACH ROW BEGIN

    DECLARE v_NgayTraDuKien DATETIME;

    DECLARE v_MaDocGia VARCHAR(20);

    DECLARE v_MaNV VARCHAR(10);

    DECLARE v_TienPhat DECIMAL(18,2);

	DECLARE v_SoSachChuaTra INT;



    IF NEW.TrangThai = 'Đã trả' AND (OLD.TrangThai IS NULL OR OLD.TrangThai <> 'Đã trả') THEN



        -- Bước A: Hoàn lại trạng thái cuốn sách trên kệ

        UPDATE cuonsach

        SET TrangThai = 'Sẵn sàng'

        WHERE MaCuonSach = NEW.MaCuonSach;



        -- Bước B: Lấy thông tin phiếu mượn gốc để biết ai mượn, ai lập, ngày hạn là bao giờ

        SELECT NgayTraDuKien, MaDocGia, MaNV

        INTO v_NgayTraDuKien, v_MaDocGia, v_MaNV

        FROM phieumuon

        WHERE MaPM = NEW.MaPM

        LIMIT 1;



        -- Bước C: Gọi hàm tính tiền phạt (Đếm số ngày trễ * 5000đ)

        SET v_TienPhat = fn_TinhTienPhat(DATE(v_NgayTraDuKien), DATE(NEW.NgayTraThucTe));



        -- Bước D: Nếu có tiền phạt (> 0), TỰ ĐỘNG SINH PHIẾU PHẠT

        IF v_TienPhat > 0 THEN

            INSERT INTO phieuphat(

                MaDocGia, 

                MaNV, 

                MaPM, 

                SoTien, 

                LyDo, 

                TrangThai

            )

            VALUES (

                v_MaDocGia, 

                v_MaNV, 

                NEW.MaPM, 

                v_TienPhat, 

                CONCAT('Trả trễ hạn cuốn sách: ', NEW.MaCuonSach), 

                'Chưa thanh toán'

            );

        END IF;

        -- 4. [MỚI] KIỂM TRA & ĐÓNG PHIẾU MƯỢN

        -- Đếm xem phiếu này còn bao nhiêu cuốn chưa trả

        SELECT COUNT(*) INTO v_SoSachChuaTra FROM ct_phieumuon 

        WHERE MaPM = NEW.MaPM AND (TrangThai IS NULL OR TrangThai <> 'Đã trả');



        -- Nếu tất cả đã trả hết -> Chuyển trạng thái phiếu cha thành 'Hoàn tất'

        IF v_SoSachChuaTra = 0 THEN

            UPDATE phieumuon SET TrangThaiTongThe = 'Hoàn tất' WHERE MaPM = NEW.MaPM;

        END IF;



    END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `cuonsach`
--

DROP TABLE IF EXISTS `cuonsach`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuonsach` (
  `MaCuonSach` varchar(20) NOT NULL,
  `MaDauSach` varchar(20) NOT NULL,
  `TrangThai` enum('Sẵn sàng','Đang mượn') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'Sẵn sàng',
  `TinhTrang` enum('Bình Thường','Bị Hỏng') DEFAULT 'Bình Thường',
  PRIMARY KEY (`MaCuonSach`),
  KEY `FK_CuonSach_DauSach` (`MaDauSach`),
  CONSTRAINT `FK_CuonSach_DauSach` FOREIGN KEY (`MaDauSach`) REFERENCES `dausach` (`MaDauSach`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuonsach`
--

LOCK TABLES `cuonsach` WRITE;
/*!40000 ALTER TABLE `cuonsach` DISABLE KEYS */;
INSERT INTO `cuonsach` VALUES ('C101','DS11','Sẵn sàng','Bình Thường'),('C102','DS11','Đang mượn','Bình Thường'),('C103','DS11','Sẵn sàng','Bị Hỏng'),('C104','DS12','Sẵn sàng','Bình Thường'),('C105','DS12','Sẵn sàng','Bình Thường'),('C106','DS13','Đang mượn','Bình Thường'),('C107','DS11','Sẵn sàng','Bình Thường'),('C108','DS11','Sẵn sàng','Bình Thường'),('C109','DS11','Sẵn sàng','Bình Thường'),('C110','DS13','Sẵn sàng','Bình Thường'),('C111','DS13','Sẵn sàng','Bình Thường'),('C112','DS13','Sẵn sàng','Bình Thường'),('C113','DS12','Sẵn sàng','Bình Thường'),('C114','DS12','Sẵn sàng','Bình Thường'),('C115','DS12','Sẵn sàng','Bình Thường'),('C116','DS14','Sẵn sàng','Bình Thường'),('C117','DS14','Sẵn sàng','Bình Thường');
/*!40000 ALTER TABLE `cuonsach` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dausach`
--

DROP TABLE IF EXISTS `dausach`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dausach` (
  `MaDauSach` varchar(20) NOT NULL,
  `TenSach` varchar(255) NOT NULL,
  `TacGia` varchar(100) DEFAULT NULL,
  `NamXuatBan` smallint DEFAULT NULL,
  `MaTheLoai` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`MaDauSach`),
  KEY `FK_DauSach_TheLoai` (`MaTheLoai`),
  CONSTRAINT `FK_DauSach_TheLoai` FOREIGN KEY (`MaTheLoai`) REFERENCES `theloai` (`MaTheLoai`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dausach`
--

LOCK TABLES `dausach` WRITE;
/*!40000 ALTER TABLE `dausach` DISABLE KEYS */;
INSERT INTO `dausach` VALUES ('DS11','Tâm lý học đám đông','Gustave Le Bon',2020,'TL04'),('DS12','Sapiens - Lược sử loài người','Yuval Noah Harari',2018,'TL11'),('DS13','Việt Nam sử lược','Trần Trọng Kim',2015,'TL11'),('DS14','Dune - Xứ cát','Frank Herbert',2021,'TL12');
/*!40000 ALTER TABLE `dausach` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `docgia`
--

DROP TABLE IF EXISTS `docgia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `docgia` (
  `MaDocGia` varchar(20) NOT NULL,
  `HoTen` varchar(100) NOT NULL,
  `NgaySinh` date DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `DienThoai` varchar(15) DEFAULT NULL,
  `TrangThai` varchar(20) DEFAULT 'HoatDong',
  PRIMARY KEY (`MaDocGia`),
  UNIQUE KEY `DienThoai` (`DienThoai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `docgia`
--

LOCK TABLES `docgia` WRITE;
/*!40000 ALTER TABLE `docgia` DISABLE KEYS */;
INSERT INTO `docgia` VALUES ('DG101','Nguyễn Thị Tuyết','2002-12-15','Quận 1, TPHCM','0911222333','Hoạt Động'),('DG102','Trần Hữu Nam','1998-07-22','Quận 3, TPHCM','0922333444','Hoạt Động'),('DG103','Lê Văn Khóa','2001-03-05','Bình Thạnh, TPHCM','0933444555','Bị Khóa'),('DG104','Phạm Quỳnh Như','2005-09-10','Thủ Đức, TPHCM','0944555666','Bị Khóa'),('DG105','Nguyễn Tấn Đạt','1995-11-20','Gò Vấp, TPHCM','0955666777','Hoạt Động'),('DG106','Nguyễn Hoàng Yến','2004-08-08','Quận 7, TPHCM','0988666777','Hoạt Động'),('DG107','Vũ Đồng Hành','2015-04-18','Tân Bình, TPHCM','0977888999','Hoạt Động'),('DG20','Phạm Sinh Viên','2004-05-15','KTX Khu B, Thủ Đức','0888111222','Hoạt Động'),('DG21','Trần Văn Thái','2006-01-06','Bình Thạnh, TPHCM','0559826016','Hoạt Động'),('DG22','Ngô Khóa Thẻ','2005-01-01','Quận 12, TPHCM','0888111444','Bị Khóa'),('DG23','Ha Vi','2006-12-02','Thua Thien Hue','0555111555','Hoạt Động'),('DG50','l1312313232wdq','2006-02-08','21312313232','21312312312','Bị Khóa');
/*!40000 ALTER TABLE `docgia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhanvien`
--

DROP TABLE IF EXISTS `nhanvien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhanvien` (
  `MaNV` varchar(10) NOT NULL,
  `HoTen` varchar(100) NOT NULL,
  `DienThoai` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`MaNV`),
  UNIQUE KEY `DienThoai` (`DienThoai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhanvien`
--

LOCK TABLES `nhanvien` WRITE;
/*!40000 ALTER TABLE `nhanvien` DISABLE KEYS */;
INSERT INTO `nhanvien` VALUES ('NV04','TranVanThai','0559826011'),('NV041','Thai','0559826016'),('NV10','Trần Quản Trị','0900111000');
/*!40000 ALTER TABLE `nhanvien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phieumuon`
--

DROP TABLE IF EXISTS `phieumuon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieumuon` (
  `MaPM` varchar(20) NOT NULL,
  `MaDocGia` varchar(20) NOT NULL,
  `MaNV` varchar(10) NOT NULL,
  `NgayMuon` datetime DEFAULT CURRENT_TIMESTAMP,
  `NgayTraDuKien` datetime NOT NULL,
  `TrangThaiTongThe` varchar(50) DEFAULT 'Đang xử lý',
  PRIMARY KEY (`MaPM`),
  KEY `FK_PhieuMuon_DocGia` (`MaDocGia`),
  KEY `FK_PhieuMuon_NhanVien` (`MaNV`),
  CONSTRAINT `FK_PhieuMuon_DocGia` FOREIGN KEY (`MaDocGia`) REFERENCES `docgia` (`MaDocGia`) ON DELETE RESTRICT,
  CONSTRAINT `FK_PhieuMuon_NhanVien` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieumuon`
--

LOCK TABLES `phieumuon` WRITE;
/*!40000 ALTER TABLE `phieumuon` DISABLE KEYS */;
INSERT INTO `phieumuon` VALUES ('PM20260430031934','DG101','NV04','2026-04-30 03:19:34','2026-05-14 00:00:00','Hoàn tất'),('PM20260430103449','DG21','NV04','2026-04-30 10:34:49','2026-05-14 00:00:00','Hoàn tất'),('PM20260430103835','DG107','NV04','2026-04-30 10:38:35','2026-05-30 00:00:00','Hoàn tất'),('PM20260430121447','DG21','NV04','2026-04-30 12:14:47','2026-05-14 00:00:00','Hoàn tất');
/*!40000 ALTER TABLE `phieumuon` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_KiemTraDocGiaQuaHan` BEFORE INSERT ON `phieumuon` FOR EACH ROW BEGIN

    DECLARE v_SoPhieuQuaHan INT;



    SELECT COUNT(*) INTO v_SoPhieuQuaHan

    FROM phieumuon p 

    WHERE p.MaDocGia = NEW.MaDocGia

      AND p.TrangThaiTongThe IN ('Đang xử lý', 'Đang mượn')

      AND p.NgayTraDuKien < CURDATE();



    IF v_SoPhieuQuaHan > 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'Lỗi: Độc giả đang có sách mượn quá hạn chưa trả!';

    END IF;



    IF fn_DemSoSachDangMuon(NEW.MaDocGia) >= 5 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'Lỗi: Độc giả đã mượn đủ 5 cuốn!';

    END IF;



END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_XoaPhieuMuon_HoanTonKho` BEFORE DELETE ON `phieumuon` FOR EACH ROW BEGIN

    UPDATE cuonsach

    SET TrangThai = 'Sẵn sàng'

    WHERE MaCuonSach IN (

        SELECT MaCuonSach 

        FROM ct_phieumuon 

        WHERE MaPM = OLD.MaPM AND TrangThai = 'Đang mượn'

    );

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `phieuphat`
--

DROP TABLE IF EXISTS `phieuphat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieuphat` (
  `MaPhieuPhat` int NOT NULL AUTO_INCREMENT,
  `MaDocGia` varchar(20) NOT NULL,
  `MaNV` varchar(10) NOT NULL,
  `MaPM` varchar(20) DEFAULT NULL,
  `SoTien` decimal(10,2) NOT NULL,
  `LyDo` varchar(255) NOT NULL,
  `TrangThai` varchar(50) DEFAULT 'Chưa thanh toán',
  `NgayTao` datetime DEFAULT CURRENT_TIMESTAMP,
  `NgayThanhToan` datetime DEFAULT NULL,
  PRIMARY KEY (`MaPhieuPhat`),
  KEY `FK_PhieuPhat_DocGia` (`MaDocGia`),
  KEY `FK_PhieuPhat_NhanVien` (`MaNV`),
  KEY `FK_PhieuPhat_PhieuMuon` (`MaPM`),
  CONSTRAINT `FK_PhieuPhat_DocGia` FOREIGN KEY (`MaDocGia`) REFERENCES `docgia` (`MaDocGia`) ON DELETE RESTRICT,
  CONSTRAINT `FK_PhieuPhat_NhanVien` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`) ON DELETE RESTRICT,
  CONSTRAINT `FK_PhieuPhat_PhieuMuon` FOREIGN KEY (`MaPM`) REFERENCES `phieumuon` (`MaPM`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieuphat`
--

LOCK TABLES `phieuphat` WRITE;
/*!40000 ALTER TABLE `phieuphat` DISABLE KEYS */;
/*!40000 ALTER TABLE `phieuphat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `quanlyphieuquahan`
--

DROP TABLE IF EXISTS `quanlyphieuquahan`;
/*!50001 DROP VIEW IF EXISTS `quanlyphieuquahan`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `quanlyphieuquahan` AS SELECT 
 1 AS `MaPM`,
 1 AS `TenDocGia`,
 1 AS `TenNhanVien`,
 1 AS `NgayMuon`,
 1 AS `NgayTraDuKien`,
 1 AS `SoSachDangMuon`,
 1 AS `SoNgayTre`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `taikhoan`
--

DROP TABLE IF EXISTS `taikhoan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taikhoan` (
  `MatKhau` varchar(255) NOT NULL,
  `MaNV` varchar(10) DEFAULT NULL,
  `role` enum('NHANVIEN','ADMIN') NOT NULL DEFAULT 'NHANVIEN',
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `MaNV` (`MaNV`),
  CONSTRAINT `FK_TaiKhoan_NhanVien` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taikhoan`
--

LOCK TABLES `taikhoan` WRITE;
/*!40000 ALTER TABLE `taikhoan` DISABLE KEYS */;
INSERT INTO `taikhoan` VALUES ('$2b$10$uLTBH6G.flnBuq4zFOhAKOdglMPc.NOpn6xWEoF7ePRTm3O0btnW.','NV04','ADMIN',9),('123456','NV10','ADMIN',12),('$2b$10$eqNLBuiEGhspkinGxCdGPupMrLCI0ORH3z7gMwtmvQheA14sLnYKa','NV041','NHANVIEN',15);
/*!40000 ALTER TABLE `taikhoan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `theloai`
--

DROP TABLE IF EXISTS `theloai`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `theloai` (
  `MaTheLoai` varchar(10) NOT NULL,
  `TenTheLoai` varchar(100) NOT NULL,
  `MoTa` text,
  PRIMARY KEY (`MaTheLoai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `theloai`
--

LOCK TABLES `theloai` WRITE;
/*!40000 ALTER TABLE `theloai` DISABLE KEYS */;
INSERT INTO `theloai` VALUES ('TL01','CNTTT','kich tinh'),('TL02','VanHoc','Văn học'),('TL03','KinhTe','Kinh tế'),('TL04','KhoaHoc','Khoa học'),('TL05','KyNang','Kỹ năng sống'),('TL06','Hài Kịch','Hài hước vui nhộn'),('TL07','Hoạt Hình','Yêu thương'),('TL10','Tâm lý học','Các sách nghiên cứu hành vi, nhận thức'),('TL11','Lịch sử','Lịch sử Việt Nam và Thế giới'),('TL12','Tiểu thuyết','Các tác phẩm văn học viễn tưởng');
/*!40000 ALTER TABLE `theloai` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `thongkesachdangmuon`
--

DROP TABLE IF EXISTS `thongkesachdangmuon`;
/*!50001 DROP VIEW IF EXISTS `thongkesachdangmuon`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `thongkesachdangmuon` AS SELECT 
 1 AS `MaDauSach`,
 1 AS `TenSach`,
 1 AS `MaDocGia`,
 1 AS `SoLuongDangMuon`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `thongkesachtheotheloai`
--

DROP TABLE IF EXISTS `thongkesachtheotheloai`;
/*!50001 DROP VIEW IF EXISTS `thongkesachtheotheloai`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `thongkesachtheotheloai` AS SELECT 
 1 AS `MaTheLoai`,
 1 AS `TenTheLoai`,
 1 AS `TongSoSach`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_DanhSachNhanVien`
--

DROP TABLE IF EXISTS `v_DanhSachNhanVien`;
/*!50001 DROP VIEW IF EXISTS `v_DanhSachNhanVien`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_DanhSachNhanVien` AS SELECT 
 1 AS `Mã Nhân Viên`,
 1 AS `Họ Tên`,
 1 AS `Số Điện Thoại`,
 1 AS `Vai Trò`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_lichsumuon`
--

DROP TABLE IF EXISTS `v_lichsumuon`;
/*!50001 DROP VIEW IF EXISTS `v_lichsumuon`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_lichsumuon` AS SELECT 
 1 AS `MaPM`,
 1 AS `TenDocGia`,
 1 AS `NgaySinh`,
 1 AS `TenNhanVien`,
 1 AS `NgayMuon`,
 1 AS `NgayTraDuKien`,
 1 AS `TrangThaiTongThe`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_phieumuonchitiet`
--

DROP TABLE IF EXISTS `v_phieumuonchitiet`;
/*!50001 DROP VIEW IF EXISTS `v_phieumuonchitiet`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_phieumuonchitiet` AS SELECT 
 1 AS `MaPM`,
 1 AS `TenDocGia`,
 1 AS `NhanVienLap`,
 1 AS `DanhSachCuonSach`,
 1 AS `NgayMuon`,
 1 AS `NgayTraDuKien`,
 1 AS `TrangThaiPhieu`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_quanlysach`
--

DROP TABLE IF EXISTS `v_quanlysach`;
/*!50001 DROP VIEW IF EXISTS `v_quanlysach`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_quanlysach` AS SELECT 
 1 AS `MaDauSach`,
 1 AS `TenSach`,
 1 AS `TacGia`,
 1 AS `NamXuatBan`,
 1 AS `MaTheLoai`,
 1 AS `TenTheLoai`,
 1 AS `TongSoCuon`,
 1 AS `SoCuonSanSang`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_sachdangmuon_docgia`
--

DROP TABLE IF EXISTS `v_sachdangmuon_docgia`;
/*!50001 DROP VIEW IF EXISTS `v_sachdangmuon_docgia`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_sachdangmuon_docgia` AS SELECT 
 1 AS `MaDocGia`,
 1 AS `HoTen`,
 1 AS `TongDangMuon`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'railway'
--
/*!50003 DROP FUNCTION IF EXISTS `fn_DemSoSachDangMuon` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  FUNCTION `fn_DemSoSachDangMuon`(p_MaDocGia VARCHAR(50)) RETURNS int
    READS SQL DATA
BEGIN

    DECLARE v_TongSach INT;



    SELECT COUNT(ct.MaCuonSach)

    INTO v_TongSach

    FROM phieumuon pm

    JOIN ct_phieumuon ct ON pm.MaPM = ct.MaPM

    WHERE pm.MaDocGia  = p_MaDocGia

      AND ct.TrangThai = 'Đang mượn';



    RETURN IFNULL(v_TongSach, 0);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_TinhTienPhat` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  FUNCTION `fn_TinhTienPhat`(p_NgayTraDuKien DATE, p_NgayTraThucTe DATE) RETURNS decimal(18,2)
    READS SQL DATA
BEGIN
    DECLARE v_TienPhat  DECIMAL(18,2) DEFAULT 0;
    DECLARE v_SoNgayTre INT;
    DECLARE v_NgayTra   DATE;

    SET v_NgayTra   = IFNULL(p_NgayTraThucTe, CURDATE());
    SET v_SoNgayTre = DATEDIFF(v_NgayTra, p_NgayTraDuKien);

    IF v_SoNgayTre > 0 THEN
        SET v_TienPhat = v_SoNgayTre * 5000;
    END IF;

    RETURN v_TienPhat;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CapNhatDauSach` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `CapNhatDauSach`(
    IN p_MaDauSach VARCHAR(10),
    IN p_TenSach NVARCHAR(100),
    IN p_MaTheLoai VARCHAR(10),
    IN p_TacGia NVARCHAR(100),
    IN p_NamXB INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
	    ROLLBACK;
	    RESIGNAL;
	END;
	
	START TRANSACTION;

    IF p_MaTheLoai IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM theloai WHERE MaTheLoai = p_MaTheLoai) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Mã thể loại không tồn tại!';
        END IF;
    END IF;

    UPDATE dausach 

    SET 
        TenSach = COALESCE(p_TenSach, TenSach),

        MaTheLoai = COALESCE(p_MaTheLoai, MaTheLoai),

        TacGia = COALESCE(p_TacGia, TacGia),

        NamXuatBan = COALESCE(p_NamXB, NamXuatBan)

    WHERE MaDauSach = p_MaDauSach;
COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CapNhatDocGia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `CapNhatDocGia`(
    IN MaDocGiaMoi VARCHAR(20),
    IN HoTenMoi VARCHAR(100),
    IN NgaySinhMoi DATE,
    IN DiaChiMoi VARCHAR(255),
    IN DienThoaiMoi VARCHAR(15)

)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
	    ROLLBACK;
	    RESIGNAL;
	END;
	
	START TRANSACTION;
	
    IF NOT EXISTS (SELECT 1 FROM docgia WHERE MaDocGia = MaDocGiaMoi) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Mã Độc Giả không tồn tại!';

    ELSE
        UPDATE docgia
        
		SET 
            HoTen = COALESCE(HoTenMoi, HoTen),
            
            NgaySinh = COALESCE(NgaySinhMoi, NgaySinh),
            
            DiaChi = COALESCE(DiaChiMoi, DiaChi),
            
            DienThoai = COALESCE(DienThoaiMoi, DienThoai)
            
        WHERE MaDocGia = MaDocGiaMoi;

    END IF;
	COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CapNhatNhanVien` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `CapNhatNhanVien`(

    IN MaNVMoi VARCHAR(10),

    IN HoTenMoi VARCHAR(100),

    IN DienThoaiMoi VARCHAR(15),

    IN MatKhauMoi VARCHAR(255),  -- Thêm tham số Mật khẩu

    IN RoleMoi VARCHAR(50)       -- Thêm tham số Role

)
BEGIN

    DECLARE EXIT HANDLER FOR SQLEXCEPTION

    BEGIN

        ROLLBACK;

        RESIGNAL;

    END;



    START TRANSACTION;

    -- 1. Check tồn tại

    IF NOT EXISTS (SELECT 1 FROM nhanvien WHERE MaNV = MaNVMoi) THEN

        SIGNAL SQLSTATE '45000' 

        SET MESSAGE_TEXT = 'Lỗi: Mã Nhân Viên không tồn tại!';



    -- 2. Check trùng số điện thoại

    ELSEIF DienThoaiMoi IS NOT NULL AND EXISTS (

        SELECT 1 FROM nhanvien 

        WHERE DienThoai = DienThoaiMoi 

        AND MaNV <> MaNVMoi

    ) THEN

        SIGNAL SQLSTATE '45000' 

        SET MESSAGE_TEXT = 'Lỗi: Số điện thoại đã tồn tại cho nhân viên khác!';



    ELSE

        -- 3. Cập nhật bảng nhanvien

        UPDATE nhanvien 

        SET 

            HoTen = COALESCE(HoTenMoi, HoTen),

            DienThoai = COALESCE(DienThoaiMoi, DienThoai)

        WHERE MaNV = MaNVMoi;

        

        -- 4. Cập nhật bảng taikhoan

        UPDATE taikhoan

        SET

            MatKhau = COALESCE(MatKhauMoi, MatKhau),

            role = COALESCE(RoleMoi, role)

        WHERE MaNV = MaNVMoi;

        

    END IF;

    COMMIT;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CapNhatTheLoai` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `CapNhatTheLoai`(
    IN MaTheLoaiMoi VARCHAR(10),
    IN TenTheLoaiMoi VARCHAR(100),
    IN MoTaMoi TEXT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
	    ROLLBACK;
	    RESIGNAL;
	END;
	
	START TRANSACTION;
	
    IF NOT EXISTS (SELECT 1 FROM theloai WHERE MaTheLoai = MaTheLoaiMoi) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Mã Thể Loại không tồn tại!';
    ELSE
        UPDATE theloai 
        SET 
            TenTheLoai = COALESCE(TenTheLoaiMoi, TenTheLoai),
            MoTa = COALESCE(MoTaMoi, MoTa)
        WHERE MaTheLoai = MaTheLoaiMoi;

    END IF;
	COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GiaHanSach` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `GiaHanSach`(

    IN p_MaPM VARCHAR(20),

    IN p_SoNgayThem INT

)
BEGIN

	DECLARE v_TrangThai VARCHAR(50);

    DECLARE v_NgayTraDuKien DATETIME;



	DECLARE EXIT HANDLER FOR SQLEXCEPTION

	BEGIN

	    ROLLBACK;

	    RESIGNAL;

	END;

	

	START TRANSACTION;



    -- Lấy trạng thái hiện tại

    SELECT TrangThaiTongThe, NgayTraDuKien INTO v_TrangThai, v_NgayTraDuKien

    FROM phieumuon WHERE MaPM = p_MaPM FOR UPDATE;



    -- Kiểm tra điều kiện

    IF v_TrangThai IS NULL THEN

        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Không tìm thấy phiếu mượn!';

    ELSEIF v_TrangThai = 'Hoàn tất' THEN

        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Phiếu mượn này đã hoàn tất, không thể gia hạn!';

    ELSEIF v_NgayTraDuKien < CURDATE() THEN

        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Phiếu mượn ĐÃ QUÁ HẠN. Phải trả sách và đóng phạt, không được gia hạn!';

    ELSE

        -- Nếu hợp lệ mới cho phép cộng thêm ngày

        UPDATE phieumuon

        SET NgayTraDuKien = DATE_ADD(NgayTraDuKien, INTERVAL p_SoNgayThem DAY)

        WHERE MaPM = p_MaPM;

    END IF;

    COMMIT;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `KhoaTheDocGia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `KhoaTheDocGia`(
    IN MaDocGiaMoi VARCHAR(20)
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
	    ROLLBACK;
	    RESIGNAL;
	END;
	
	START TRANSACTION;
	
    IF NOT EXISTS (SELECT 1 FROM DocGia WHERE MaDocGia = MaDocGiaMoi) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Mã Độc Giả không tồn tại!';
    ELSE
        UPDATE docgia SET TrangThai = 'Bị Khóa' WHERE MaDocGia = MaDocGiaMoi;
    END IF;
	COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `MoKhoaTheDocGia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `MoKhoaTheDocGia`(
    IN MaDocGiaMoi VARCHAR(20)
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
	    ROLLBACK;
	    RESIGNAL;
	END;
	
	START TRANSACTION;
    IF NOT EXISTS (SELECT 1 FROM DocGia WHERE MaDocGia = MaDocGiaMoi) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Mã Độc Giả không tồn tại!';

    ELSE
        UPDATE docgia SET TrangThai = 'Hoạt Động' WHERE MaDocGia = MaDocGiaMoi;
    END IF;
	COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `NhapKhoCuonSach` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `NhapKhoCuonSach`(
    IN MaDauSachMoi VARCHAR(20),
    IN SoLuong INT
)
BEGIN
	DECLARE i INT DEFAULT 1;
    DECLARE maxID INT;

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
	    ROLLBACK;
	    RESIGNAL;
	END;
	
	START TRANSACTION;
	
    IF NOT EXISTS (SELECT 1 FROM dausach WHERE MaDauSach = MaDauSachMoi) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Mã Đầu Sách không tồn tại!';
    ELSE
        SELECT IFNULL(MAX(CAST(SUBSTRING(MaCuonSach, 2) AS UNSIGNED)), 0) INTO maxID
        FROM cuonsach
        WHERE MaCuonSach LIKE 'C%';
        
        WHILE i <= SoLuong DO
            SET maxID = maxID + 1;
            INSERT INTO cuonsach(MaCuonSach, MaDauSach, TrangThai, TinhTrang)
            VALUES (CONCAT('C', LPAD(maxID, 3, '0')), MaDauSachMoi, 'Sẵn sàng', 'Bình Thường');
            SET i = i + 1;
        END WHILE;

    END IF;
    
	COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_ThanhToanTienPhat` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `sp_ThanhToanTienPhat`(

    IN p_MaPhieuPhat INT,

    IN p_MaNV VARCHAR(10)

)
BEGIN

    DECLARE v_TrangThai VARCHAR(50);

    DECLARE v_MaDocGia VARCHAR(20);

    DECLARE v_SoPhieuNo INT;

    

    DECLARE EXIT HANDLER FOR SQLEXCEPTION

    BEGIN

        ROLLBACK;

        RESIGNAL;

    END;



    START TRANSACTION;

        -- 1. Lấy trạng thái phiếu phạt và xem ai là người đang bị phạt

        SELECT TrangThai, MaDocGia 

        INTO v_TrangThai, v_MaDocGia

        FROM phieuphat

        WHERE MaPhieuPhat = p_MaPhieuPhat

        FOR UPDATE;

        

        -- 2. Kiểm tra tính hợp lệ

        IF v_TrangThai IS NULL THEN

            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Không tìm thấy phiếu phạt!';

        END IF;



        IF v_TrangThai = 'Đã thanh toán' THEN

            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Phiếu phạt này đã được thanh toán trước đó!';

        END IF;



        -- 3. Thực hiện thanh toán (Dùng NOW() thay vì CURDATE())

        UPDATE phieuphat

        SET TrangThai = 'Đã thanh toán', 

            NgayThanhToan = NOW(), 

            MaNV = p_MaNV

        WHERE MaPhieuPhat = p_MaPhieuPhat;

    COMMIT;



END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_ThongKeMuonTra_TheoGiaiDoan` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `sp_ThongKeMuonTra_TheoGiaiDoan`(
    IN p_TuNgay DATE,
    IN p_DenNgay DATE
)
BEGIN
    -- Validate tham số
    IF p_TuNgay IS NULL OR p_DenNgay IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Ngày bắt đầu và ngày kết thúc không được để trống!';
    END IF;

    IF p_TuNgay > p_DenNgay THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Ngày bắt đầu không được lớn hơn ngày kết thúc!';
    END IF;

    -- Chi tiết từng phiếu mượn
    SELECT
        pm.MaPM,
        pm.NgayMuon,
        pm.NgayTraDuKien,
        pm.MaDocGia,
        dg.HoTen                                                             AS TenDocGia,
        pm.MaNV,
        nv.HoTen                                                             AS TenNhanVien,
        COUNT(ct.MaCuonSach)                                                 AS TongSoSach,
        SUM(CASE WHEN ct.TrangThai = 'Đã trả'    THEN 1 ELSE 0 END)         AS SoSachDaTra,
        SUM(CASE WHEN ct.TrangThai = 'Đang mượn' THEN 1 ELSE 0 END)         AS SoSachDangMuon,
        pm.TrangThaiTongThe                                                  AS TrangThaiPhieu
    FROM PhieuMuon pm
    JOIN DocGia       dg ON pm.MaDocGia = dg.MaDocGia
    JOIN NhanVien     nv ON pm.MaNV     = nv.MaNV
    JOIN CT_PhieuMuon ct ON pm.MaPM     = ct.MaPM
    WHERE pm.NgayMuon BETWEEN p_TuNgay AND p_DenNgay
    GROUP BY
        pm.MaPM, pm.NgayMuon, pm.NgayTraDuKien,
        pm.MaDocGia, dg.HoTen,
        pm.MaNV, nv.HoTen, pm.TrangThaiTongThe
    ORDER BY pm.NgayMuon ASC;

    -- Tổng hợp toàn giai đoạn
    SELECT
        COUNT(DISTINCT pm.MaPM)                                                      AS TongSoPhieuMuon,
        SUM(CASE WHEN pm.TrangThaiTongThe = 'Hoàn tất'   THEN 1 ELSE 0 END)         AS SoPhieuHoanTat,
        SUM(CASE WHEN pm.TrangThaiTongThe = 'Đang xử lý' THEN 1 ELSE 0 END)         AS SoPhieuDangXuLy,
        COUNT(ct.MaCuonSach)                                                         AS TongSoLuotMuon,
        SUM(CASE WHEN ct.TrangThai = 'Đã trả'    THEN 1 ELSE 0 END)                 AS TongSachDaTra,
        SUM(CASE WHEN ct.TrangThai = 'Đang mượn' THEN 1 ELSE 0 END)                 AS TongSachDangMuon
    FROM PhieuMuon pm
    JOIN CT_PhieuMuon ct ON pm.MaPM = ct.MaPM
    WHERE pm.NgayMuon BETWEEN p_TuNgay AND p_DenNgay;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_ThongKePhieuMuonTheoThoiGian` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `sp_ThongKePhieuMuonTheoThoiGian`(
    IN p_TuNgay DATE,
    IN p_DenNgay DATE
)
BEGIN
    -- Validate
    IF p_TuNgay IS NULL OR p_DenNgay IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Thiếu ngày!';
    END IF;

    IF p_TuNgay > p_DenNgay THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Sai khoảng thời gian!';
    END IF;

    SELECT
        pm.MaPM,
        pm.NgayMuon,
        pm.NgayTraDuKien,
        MAX(ct.NgayTraThucTe) AS NgayTraThucTe,
        dg.HoTen AS TenDocGia,

        COUNT(ct.MaCuonSach) AS TongSach,

        SUM(CASE WHEN ct.TrangThai = 'Đang mượn' THEN 1 ELSE 0 END) AS DangMuon,
        SUM(CASE WHEN ct.TrangThai = 'Đã trả' THEN 1 ELSE 0 END) AS DaTra

    FROM phieumuon pm
    JOIN docgia dg ON pm.MaDocGia = dg.MaDocGia
    JOIN ct_phieumuon ct ON pm.MaPM = ct.MaPM

    WHERE pm.NgayMuon BETWEEN p_TuNgay AND p_DenNgay

    GROUP BY 
        pm.MaPM,
        pm.NgayMuon,
        pm.NgayTraDuKien,
        ct.NgayTraThucTe,
        dg.HoTen

    ORDER BY pm.NgayMuon ASC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_ThongKePhieuQuaHan_TheoThoiGian` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `sp_ThongKePhieuQuaHan_TheoThoiGian`(
    IN p_TuNgay DATE,
    IN p_DenNgay DATE
)
BEGIN
	IF p_TuNgay IS NULL OR p_DenNgay IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Ngày bắt đầu và ngày kết thúc không được để trống!';
    END IF;

    IF p_TuNgay > p_DenNgay THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Ngày bắt đầu không được lớn hơn ngày kết thúc!';
    END IF;
	
    SELECT
        pm.MaPM,
        dg.HoTen AS TenDocGia,
        pm.NgayMuon,
        pm.NgayTraDuKien,

        COUNT(ct.MaCuonSach) AS TongSach,

        SUM(CASE WHEN ct.TrangThai = 'Đang mượn' THEN 1 ELSE 0 END) AS DangMuon,

        DATEDIFF(CURDATE(), pm.NgayTraDuKien) AS SoNgayQuaHan

    FROM phieumuon pm
    JOIN docgia dg ON pm.MaDocGia = dg.MaDocGia
    JOIN ct_phieumuon ct ON pm.MaPM = ct.MaPM

    WHERE 
        DATE(pm.NgayMuon) BETWEEN p_TuNgay AND p_DenNgay
        AND ct.NgayTraThucTe IS NULL
        AND pm.NgayTraDuKien < CURDATE()

    GROUP BY 
        pm.MaPM,
        dg.HoTen,
        pm.NgayMuon,
        pm.NgayTraDuKien;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_ThongKeSachDangMuon` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `sp_ThongKeSachDangMuon`()
BEGIN

    SELECT

        ds.MaDauSach,

        ds.TenSach,

        ds.SoLuongDangMuon

    FROM thongkesachdangmuon ds;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_ThongKeSachTheoTheLoai` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `sp_ThongKeSachTheoTheLoai`(
    IN p_TenTheLoai VARCHAR(100),
	IN p_MaTheLoai Varchar(100)
)
BEGIN
SELECT * FROM thongkesachtheotheloai
WHERE (p_MaTheLoai IS NULL OR MaTheLoai = p_MaTheLoai)
  AND (p_TenTheLoai IS NULL OR TenTheLoai LIKE CONCAT('%', p_TenTheLoai, '%'));
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_TimKiemDocGia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `sp_TimKiemDocGia`(

    IN p_TuKhoa VARCHAR(100)

)
BEGIN

    SELECT 

       *

    FROM docgia

    WHERE HoTen LIKE CONCAT('%', p_TuKhoa, '%')

       OR DienThoai LIKE CONCAT('%', p_TuKhoa, '%') OR p_TuKhoa is null;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_TraCuuPhieuMuon` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `sp_TraCuuPhieuMuon`(IN p_TuKhoa VARCHAR(100))
BEGIN

    -- Gọi thẳng từ View

    SELECT 

        MaPM, 

        TenDocGia, 

        TenNhanVien, 

        NgayMuon, 

        NgayTraDuKien, 

        TrangThaiTongThe

    FROM v_lichsumuon

    WHERE MaPM LIKE CONCAT('%', p_TuKhoa, '%')

       OR TenDocGia LIKE CONCAT('%', p_TuKhoa, '%')

       OR NgayMuon LIKE CONCAT('%', p_TuKhoa, '%');

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `ThemDauSach` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `ThemDauSach`(
    IN MaDauSachMoi VARCHAR(20),
    IN TenSachMoi VARCHAR(100),
    IN MaTheLoaiMoi VARCHAR(10),
    IN TacGiaMoi VARCHAR(100),
    IN NamXBMoi SMALLINT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

 	START TRANSACTION;

    IF EXISTS (SELECT 1 FROM dausach WHERE MaDauSach = MaDauSachMoi) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Mã Đầu Sách đã tồn tại!';

    ELSEIF NOT EXISTS (SELECT 1 FROM theloai WHERE MaTheLoai = MaTheLoaiMoi) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Mã Thể Loại không tồn tại!';

    ELSE
        INSERT INTO dausach(MaDauSach, TenSach, MaTheLoai, TacGia, NamXuatBan)
        VALUES (MaDauSachMoi, TenSachMoi, MaTheLoaiMoi, TacGiaMoi, NamXBMoi);

    END IF;
	COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `ThemDocGia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `ThemDocGia`(
    IN MaDocGiaMoi VARCHAR(20),
    IN HoTenMoi VARCHAR(100),
    IN NgaySinhMoi DATE,
    IN DiaChiMoi VARCHAR(255),
    IN DienThoaiMoi VARCHAR(15)
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

   	START TRANSACTION;
    IF EXISTS (SELECT 1 FROM docgia WHERE MaDocGia = MaDocGiaMoi) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Mã Độc Giả đã tồn tại!';
    ELSE
        INSERT INTO docgia(MaDocGia, HoTen, NgaySinh, DiaChi, DienThoai, TrangThai)
        VALUES (MaDocGiaMoi, HoTenMoi, NgaySinhMoi, DiaChiMoi, DienThoaiMoi, 'Hoạt Động');
    END IF;
	COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `ThemNhanVien` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `ThemNhanVien`(
    IN MaNVMoi VARCHAR(10),
    IN HoTenMoi VARCHAR(100),
    IN DienThoaiMoi VARCHAR(15)

)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    IF EXISTS (SELECT 1 FROM nhanvien WHERE MaNV = MaNVMoi) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Mã Nhân Viên đã tồn tại!';

    ELSE
        INSERT INTO nhanvien(MaNV, HoTen, DienThoai) VALUES (MaNVMoi, HoTenMoi, DienThoaiMoi);

    END IF;
	COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `ThemSachVaoPhieuMuon` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `ThemSachVaoPhieuMuon`(

    IN p_MaPM VARCHAR(20),

    IN p_DanhSach JSON

)
BEGIN

    DECLARE i INT DEFAULT 0;

    DECLARE n INT;

    DECLARE v_MaCuonSach VARCHAR(50);

    DECLARE v_message TEXT;



    DECLARE EXIT HANDLER FOR SQLEXCEPTION

    BEGIN

        ROLLBACK;

        RESIGNAL;

    END;



    IF p_DanhSach IS NULL OR JSON_LENGTH(p_DanhSach) = 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'Danh sách sách không hợp lệ!';

    END IF;



    IF NOT EXISTS (

        SELECT 1 FROM phieumuon WHERE MaPM = p_MaPM

    ) THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'Phiếu mượn không tồn tại!';

    END IF;



    START TRANSACTION;



    SET n = JSON_LENGTH(p_DanhSach);



    WHILE i < n DO



        SET v_MaCuonSach = JSON_UNQUOTE(

            JSON_EXTRACT(p_DanhSach, CONCAT('$[', i, ']'))

        );



        IF NOT EXISTS (

            SELECT 1 FROM cuonsach WHERE MaCuonSach = v_MaCuonSach

        ) THEN

            SET v_message = CONCAT('Cuốn sách không tồn tại: ', v_MaCuonSach);

            SIGNAL SQLSTATE '45000'

            SET MESSAGE_TEXT = v_message;

        END IF;



        INSERT INTO ct_phieumuon(MaPM, MaCuonSach)

        VALUES (p_MaPM, v_MaCuonSach);



        SET i = i + 1;



    END WHILE;



    COMMIT;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `ThemTheLoai` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `ThemTheLoai`(
    IN MaTheLoaiMoi VARCHAR(10),
    IN TenTheLoaiMoi VARCHAR(100),
    IN MoTaMoi TEXT

)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    IF EXISTS (
        SELECT * 
        FROM theloai tl 
        WHERE tl.MaTheLoai = MaTheLoaiMoi

    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'MaTheLoai da ton tai!';
    
    ELSE
        INSERT INTO theloai(MaTheLoai, TenTheLoai, MoTa)
        VALUES (MaTheLoaiMoi, TenTheLoaiMoi, MoTaMoi);

    END IF;
	COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `ThucHienMuonNhieuSach` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `ThucHienMuonNhieuSach`(
    IN p_MaDocGia VARCHAR(20),
    IN p_MaNV VARCHAR(10),
    IN p_NgayTraDuKien DATETIME,
    IN p_DanhSach JSON
)
BEGIN
    DECLARE v_MaPM VARCHAR(20);
    DECLARE i INT DEFAULT 0;
    DECLARE n INT;

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SET v_MaPM = CONCAT('PM', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'));
    SET n = JSON_LENGTH(p_DanhSach);

    START TRANSACTION;
    
    INSERT INTO phieumuon(MaPM, MaDocGia, MaNV, NgayTraDuKien, TrangThaiTongThe)
    VALUES (v_MaPM, p_MaDocGia, p_MaNV, p_NgayTraDuKien, 'Đang mượn');

    WHILE i < n DO
        INSERT INTO ct_phieumuon(MaPM, MaCuonSach)
        VALUES (v_MaPM, JSON_UNQUOTE(JSON_EXTRACT(p_DanhSach, CONCAT('$[', i, ']'))));
        SET i = i + 1;
    END WHILE;

    COMMIT;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `ThucHienTraSach` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `ThucHienTraSach`(
    IN p_MaPM VARCHAR(20),
    IN p_DanhSach JSON
)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE n INT;

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SET n = JSON_LENGTH(p_DanhSach);

    START TRANSACTION;

    WHILE i < n DO
        UPDATE ct_phieumuon
        SET NgayTraThucTe = NOW(), TrangThai = 'Đã trả'
        WHERE MaPM = p_MaPM 
          AND MaCuonSach = JSON_UNQUOTE(JSON_EXTRACT(p_DanhSach, CONCAT('$[', i, ']')));
        SET i = i + 1;
    END WHILE;

    COMMIT;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `TimKiemDauSach` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `TimKiemDauSach`(
    IN p_TenSach NVARCHAR(100),
    IN p_TacGia NVARCHAR(100),
    IN p_MaTheLoai VARCHAR(10)
)
BEGIN

    SELECT * FROM v_quanlysach
WHERE (p_TenSach IS NULL OR TenSach LIKE CONCAT('%', p_TenSach, '%'))
  AND (p_TacGia IS NULL OR TacGia LIKE CONCAT('%', p_TacGia, '%'))
  AND (p_MaTheLoai IS NULL OR MaTheLoai = p_MaTheLoai);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `TimKiemMuonSach` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `TimKiemMuonSach`(
    IN p_TenDocGia VARCHAR(100),
    IN p_TuNgay DATE,
    IN p_DenNgay DATE
)
BEGIN
    SELECT 
    	MaPM,
    	TenDocGia,
    	NhanVienLap,
    	NgayMuon,
    	NgayTraDuKien,
    	TrangThaiPhieu
    FROM v_phieumuonchitiet v
    WHERE
        (p_TenDocGia IS NULL 
         OR v.TenDocGia LIKE CONCAT('%', p_TenDocGia, '%'))
         
        AND (
            p_TuNgay IS NULL
            OR DATE(CONVERT_TZ(v.NgayMuon, '+00:00', '+07:00')) >= p_TuNgay
        )

        AND (
            p_DenNgay IS NULL
            OR DATE(CONVERT_TZ(v.NgayMuon, '+00:00', '+07:00')) <= p_DenNgay
        );

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `TraNhieuSach` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `TraNhieuSach`(

    IN p_MaPM VARCHAR(20)

)
BEGIN

    DECLARE v_KiemTra INT;



    DECLARE EXIT HANDLER FOR SQLEXCEPTION

    BEGIN

        ROLLBACK;

        RESIGNAL;

    END;



    START TRANSACTION;

        SELECT COUNT(*) INTO v_KiemTra

        FROM phieumuon

        WHERE MaPM = p_MaPM;



        IF v_KiemTra = 0 THEN

            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Không tìm thấy phiếu mượn này!';

        END IF;

        UPDATE ct_phieumuon

        SET TrangThai = 'Đã trả',

            NgayTraThucTe = NOW() 

        WHERE MaPM = p_MaPM AND TrangThai = 'Đang mượn';

        UPDATE phieumuon

        SET TrangThaiTongThe = 'Hoàn tất' 

        WHERE MaPM = p_MaPM;



    COMMIT;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `XemDanhSachNguoiMuonTheoTen` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `XemDanhSachNguoiMuonTheoTen`(IN p_HoTen VARCHAR(100))
BEGIN
    SELECT dg.MaDocGia, dg.HoTen, pm.MaPM, pm.NgayMuon, pm.TrangThaiTongThe
    FROM docgia dg
    JOIN phieumuon pm ON dg.MaDocGia = pm.MaDocGia
    WHERE pm.TrangThaiTongThe = 'Đang Mượn'
      AND dg.HoTen LIKE CONCAT('%', p_HoTen, '%');
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `XoaTheLoai` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `XoaTheLoai`(
    IN MaTheLoaiXoa VARCHAR(10)
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    IF NOT EXISTS (SELECT 1 FROM theloai WHERE MaTheLoai = MaTheLoaiXoa) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Mã Thể Loại không tồn tại!';
    ELSE
        DELETE FROM theloai WHERE MaTheLoai = MaTheLoaiXoa;

    END IF;
    
	COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `quanlyphieuquahan`
--

/*!50001 DROP VIEW IF EXISTS `quanlyphieuquahan`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `quanlyphieuquahan` AS select `pm`.`MaPM` AS `MaPM`,`dg`.`HoTen` AS `TenDocGia`,`nv`.`HoTen` AS `TenNhanVien`,`pm`.`NgayMuon` AS `NgayMuon`,`pm`.`NgayTraDuKien` AS `NgayTraDuKien`,count(`ct`.`MaCuonSach`) AS `SoSachDangMuon`,(to_days(curdate()) - to_days(`pm`.`NgayTraDuKien`)) AS `SoNgayTre` from (((`phieumuon` `pm` join `docgia` `dg` on((`dg`.`MaDocGia` = `pm`.`MaDocGia`))) join `nhanvien` `nv` on((`nv`.`MaNV` = `pm`.`MaNV`))) join `ct_phieumuon` `ct` on((`ct`.`MaPM` = `pm`.`MaPM`))) where ((`pm`.`NgayTraDuKien` < curdate()) and (`ct`.`NgayTraThucTe` is null)) group by `pm`.`MaPM`,`dg`.`HoTen`,`nv`.`HoTen`,`pm`.`NgayMuon`,`pm`.`NgayTraDuKien` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `thongkesachdangmuon`
--

/*!50001 DROP VIEW IF EXISTS `thongkesachdangmuon`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `thongkesachdangmuon` AS select `ds`.`MaDauSach` AS `MaDauSach`,`ds`.`TenSach` AS `TenSach`,`pm`.`MaDocGia` AS `MaDocGia`,count(`ct`.`MaCuonSach`) AS `SoLuongDangMuon` from (((`ct_phieumuon` `ct` join `phieumuon` `pm` on((`pm`.`MaPM` = `ct`.`MaPM`))) join `cuonsach` `cs` on((`cs`.`MaCuonSach` = `ct`.`MaCuonSach`))) join `dausach` `ds` on((`ds`.`MaDauSach` = `cs`.`MaDauSach`))) where (`ct`.`TrangThai` = 'Đang mượn') group by `ds`.`MaDauSach`,`ds`.`TenSach`,`pm`.`MaDocGia` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `thongkesachtheotheloai`
--

/*!50001 DROP VIEW IF EXISTS `thongkesachtheotheloai`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `thongkesachtheotheloai` AS select `tl`.`MaTheLoai` AS `MaTheLoai`,`tl`.`TenTheLoai` AS `TenTheLoai`,count(`cs`.`MaCuonSach`) AS `TongSoSach` from ((`theloai` `tl` left join `dausach` `ds` on((`ds`.`MaTheLoai` = `tl`.`MaTheLoai`))) left join `cuonsach` `cs` on((`cs`.`MaDauSach` = `ds`.`MaDauSach`))) group by `tl`.`MaTheLoai`,`tl`.`TenTheLoai` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_DanhSachNhanVien`
--

/*!50001 DROP VIEW IF EXISTS `v_DanhSachNhanVien`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `v_DanhSachNhanVien` AS select `nv`.`MaNV` AS `Mã Nhân Viên`,`nv`.`HoTen` AS `Họ Tên`,`nv`.`DienThoai` AS `Số Điện Thoại`,`tk`.`role` AS `Vai Trò` from (`nhanvien` `nv` left join `taikhoan` `tk` on((`nv`.`MaNV` = `tk`.`MaNV`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_lichsumuon`
--

/*!50001 DROP VIEW IF EXISTS `v_lichsumuon`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `v_lichsumuon` AS select `pm`.`MaPM` AS `MaPM`,`dg`.`HoTen` AS `TenDocGia`,`dg`.`NgaySinh` AS `NgaySinh`,`nv`.`HoTen` AS `TenNhanVien`,`pm`.`NgayMuon` AS `NgayMuon`,`pm`.`NgayTraDuKien` AS `NgayTraDuKien`,`pm`.`TrangThaiTongThe` AS `TrangThaiTongThe` from ((`phieumuon` `pm` join `docgia` `dg` on((`pm`.`MaDocGia` = `dg`.`MaDocGia`))) join `nhanvien` `nv` on((`pm`.`MaNV` = `nv`.`MaNV`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_phieumuonchitiet`
--

/*!50001 DROP VIEW IF EXISTS `v_phieumuonchitiet`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `v_phieumuonchitiet` AS select `pm`.`MaPM` AS `MaPM`,`dg`.`HoTen` AS `TenDocGia`,`nv`.`HoTen` AS `NhanVienLap`,group_concat(concat(`ds`.`TenSach`,' - ',`cs`.`MaCuonSach`,' (',`ct`.`TrangThai`,')') separator ', ') AS `DanhSachCuonSach`,`pm`.`NgayMuon` AS `NgayMuon`,`pm`.`NgayTraDuKien` AS `NgayTraDuKien`,`pm`.`TrangThaiTongThe` AS `TrangThaiPhieu` from (((((`phieumuon` `pm` join `ct_phieumuon` `ct` on((`pm`.`MaPM` = `ct`.`MaPM`))) join `cuonsach` `cs` on((`ct`.`MaCuonSach` = `cs`.`MaCuonSach`))) join `dausach` `ds` on((`cs`.`MaDauSach` = `ds`.`MaDauSach`))) join `docgia` `dg` on((`pm`.`MaDocGia` = `dg`.`MaDocGia`))) join `nhanvien` `nv` on((`pm`.`MaNV` = `nv`.`MaNV`))) group by `pm`.`MaPM`,`dg`.`HoTen`,`nv`.`HoTen`,`pm`.`NgayMuon`,`pm`.`NgayTraDuKien`,`pm`.`TrangThaiTongThe` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_quanlysach`
--

/*!50001 DROP VIEW IF EXISTS `v_quanlysach`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `v_quanlysach` AS select `ds`.`MaDauSach` AS `MaDauSach`,`ds`.`TenSach` AS `TenSach`,`ds`.`TacGia` AS `TacGia`,`ds`.`NamXuatBan` AS `NamXuatBan`,`ds`.`MaTheLoai` AS `MaTheLoai`,`tl`.`TenTheLoai` AS `TenTheLoai`,count(`cs`.`MaCuonSach`) AS `TongSoCuon`,sum((case when ((`cs`.`TrangThai` = 'Sẵn sàng') and (`cs`.`TinhTrang` = 'Bình Thường')) then 1 else 0 end)) AS `SoCuonSanSang` from ((`dausach` `ds` join `theloai` `tl` on((`ds`.`MaTheLoai` = `tl`.`MaTheLoai`))) left join `cuonsach` `cs` on((`ds`.`MaDauSach` = `cs`.`MaDauSach`))) group by `ds`.`MaDauSach`,`ds`.`TenSach`,`ds`.`TacGia`,`ds`.`NamXuatBan`,`ds`.`MaTheLoai`,`tl`.`TenTheLoai` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_sachdangmuon_docgia`
--

/*!50001 DROP VIEW IF EXISTS `v_sachdangmuon_docgia`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `v_sachdangmuon_docgia` AS select `dg`.`MaDocGia` AS `MaDocGia`,`dg`.`HoTen` AS `HoTen`,count(`ct`.`MaCuonSach`) AS `TongDangMuon` from ((`docgia` `dg` join `phieumuon` `pm` on((`dg`.`MaDocGia` = `pm`.`MaDocGia`))) join `ct_phieumuon` `ct` on((`pm`.`MaPM` = `ct`.`MaPM`))) where (`ct`.`TrangThai` = 'Đang mượn') group by `dg`.`MaDocGia`,`dg`.`HoTen` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-30 22:46:01

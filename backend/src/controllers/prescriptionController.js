// Cập nhật đơn thuốc
exports.updatePrescription = async (req, res) => {
    const pool = require("../../db");
    const toaid = req.params.id;
    const { patientName, medicines, services, luuydonthuoc } = req.body;
    if (!toaid) {
        return res.status(400).json({ error: "Thiếu thông tin đơn thuốc hoặc thuốc" });
    }
    try {
        let tongtien = 0;
        console.log('Received update for toaid:', toaid, { patientName, medicines, services, luuydonthuoc });
        if (!medicines && !services && luuydonthuoc !== undefined) {
            await pool.query(
                "UPDATE chitiettoathuoc SET luuydonthuoc = $1, updatedat = NOW() WHERE toaid = $2",
                [luuydonthuoc || "", toaid]
            );
            return res.json({ success: true, toaid });
        }

        await pool.query("DELETE FROM chitiettoathuoc WHERE toaid = $1", [toaid]);
        await pool.query("DELETE FROM chitietdichvu WHERE toaid = $1", [toaid]);

        if (Array.isArray(medicines)) {
            for (const med of medicines) {
                if (!med.thuocid || med.thuocid === 0) continue;
                const thuocRes = await pool.query("SELECT giatienmotcong FROM thuoc WHERE thuocid = $1", [med.thuocid]);
                const giatienmotcong = thuocRes.rows[0]?.giatienmotcong || 0;
                const thanhtien = Number(giatienmotcong) * Number(med.soluong);
                tongtien += thanhtien;
                await pool.query(
                    "INSERT INTO chitiettoathuoc (toaid, thuocid, soluong, chuy, luuydonthuoc, createdat, updatedat) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())",
                    [toaid, med.thuocid, med.soluong, med.chuy || "", luuydonthuoc || ""]
                );
            }
        }

        // Thêm lại chi tiết dịch vụ nếu có
        if (Array.isArray(services)) {
            for (const sv of services) {
                if (sv.dichvuid) {
                    const songay = sv.songay != null ? sv.songay : 1;
                    const dvRes = await pool.query("SELECT giadichvu FROM dichvu WHERE dichvuid = $1", [sv.dichvuid]);
                    const giadichvu = dvRes.rows[0]?.giadichvu || 0;
                    tongtien += Number(giadichvu) * Number(songay);
                    await pool.query(
                        "INSERT INTO chitietdichvu (toaid, dichvuid, songay, createdat, updatedat) VALUES ($1, $2, $3, NOW(), NOW())",
                        [toaid, sv.dichvuid, songay]
                    );
                }
            }
        }

        // Cập nhật tổng tiền
        await pool.query(
            "UPDATE thanhtoan SET tongtien = $1, updatedat = NOW() WHERE toaid = $2",
            [tongtien, toaid]
        );

        res.json({ success: true, toaid, tongtien });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi khi cập nhật đơn thuốc" });
    }
};

exports.createPrescription = async (req, res) => {
    const pool = require("../../db");
    const { patientName, medicines, services, note } = req.body;
    if (!patientName) {
        return res.status(400).json({ error: "Thiếu thông tin bệnh nhân" });
    }
    try {
        let benhnhanid;
        const findPatient = await pool.query("SELECT benhnhanid FROM benhnhan WHERE hoten = $1 LIMIT 1", [patientName]);
        if (findPatient.rows.length > 0) {
            benhnhanid = findPatient.rows[0].benhnhanid;
        } else {
            const newPatient = await pool.query(
                "INSERT INTO benhnhan (hoten, createdat, updatedat) VALUES ($1, NOW(), NOW()) RETURNING benhnhanid",
                [patientName]
            );
            benhnhanid = newPatient.rows[0].benhnhanid;
        }

        // 2. Tạo đơn thuốc (toathuoc)
        const toaRes = await pool.query(
            "INSERT INTO toathuoc (benhnhanid, ngaykadon, createdat, updatedat) VALUES ($1, NOW(), NOW(), NOW()) RETURNING toaid",
            [benhnhanid]
        );
        const toaid = toaRes.rows[0].toaid;

        let tongtien = 0;
        if (Array.isArray(medicines) && medicines.length > 0) {
            for (const med of medicines) {
                if (!med.thuocid || med.thuocid === 0) continue;
                // Lấy giá thuốc
                const thuocRes = await pool.query("SELECT giatienmotcong FROM thuoc WHERE thuocid = $1", [med.thuocid]);
                const giatienmotcong = thuocRes.rows[0]?.giatienmotcong || 0;
                const thanhtien = Number(giatienmotcong) * Number(med.soluong);
                tongtien += thanhtien;
                await pool.query(
                    "INSERT INTO chitiettoathuoc (toaid, thuocid, soluong, luuydonthuoc, createdat, updatedat) VALUES ($1, $2, $3, $4, NOW(), NOW())",
                    [toaid, med.thuocid, med.soluong, note || null]
                );
            }
        } else if (note) {
            await pool.query(
                "INSERT INTO chitiettoathuoc (toaid, thuocid, soluong, luuydonthuoc, createdat, updatedat) VALUES ($1, NULL, 0, $2, NOW(), NOW())",
                [toaid, note]
            );
        }

        // Thêm dịch vụ nếu có
        if (Array.isArray(services)) {
            for (const sv of services) {
                if (sv.dichvuid) {
                    const songay = sv.songay != null ? sv.songay : 1;
                    const dvRes = await pool.query("SELECT giadichvu FROM dichvu WHERE dichvuid = $1", [sv.dichvuid]);
                    const giadichvu = dvRes.rows[0]?.giadichvu || 0;
                    tongtien += Number(giadichvu) * Number(songay);
                    await pool.query(
                        "INSERT INTO chitietdichvu (toaid, dichvuid, songay, createdat, updatedat) VALUES ($1, $2, $3, NOW(), NOW())",
                        [toaid, sv.dichvuid, songay]
                    );
                }
            }
        }

        // 4. Lưu tổng tiền vào bảng thanhtoan
        await pool.query(
            "INSERT INTO thanhtoan (toaid, tongtien, createdat, updatedat) VALUES ($1, $2, NOW(), NOW())",
            [toaid, tongtien]
        );

        res.json({ success: true, toaid, tongtien });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi khi tạo đơn thuốc" });
    }
};

const pool = require("../../db");

exports.getPrescriptions = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                t.toaid AS id,
                b.hoten AS patientName,
                t.ngaykadon AS examinationDate,
                COALESCE(tt.tongtien, 0) AS price,
                b.benhnhanid as patientId,
                -- Lấy tất cả thuốc
                (
                    SELECT json_agg(json_build_object(
                        'thuocid', ct.thuocid,
                        'soluong', ct.soluong,
                        'chuy', ct.chuy,
                        'tenthuoc', th.tenthuoc
                    ))
                    FROM chitiettoathuoc ct
                    JOIN thuoc th ON ct.thuocid = th.thuocid
                    WHERE ct.toaid = t.toaid AND ct.thuocid IS NOT NULL
                ) AS medicines,
                -- Lấy tất cả dịch vụ
                (
                    SELECT json_agg(json_build_object(
                        'dichvuid', ctdv.dichvuid,
                        'songay', ctdv.songay,
                        'tendichvu', dv.tendichvu
                    ))
                    FROM chitietdichvu ctdv
                    JOIN dichvu dv ON ctdv.dichvuid = dv.dichvuid
                    WHERE ctdv.toaid = t.toaid
                ) AS services,
                -- Lấy luuydonthuoc riêng
                (
                    SELECT ct.luuydonthuoc FROM chitiettoathuoc ct WHERE ct.toaid = t.toaid AND ct.luuydonthuoc IS NOT NULL LIMIT 1
                ) AS luuydonthuoc
            FROM toathuoc t
            JOIN benhnhan b ON t.benhnhanid = b.benhnhanid
            LEFT JOIN thanhtoan tt ON t.toaid = tt.toaid
            ORDER BY t.ngaykadon DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách đơn thuốc" });
        console.error("Lỗi khi lấy danh sách đơn thuốc:", err);
    }
};

// Lấy chi tiết đơn thuốc
exports.getPrescriptionDetail = async (req, res) => {
    try {
        const toaid = req.params.id;
        const result = await pool.query(`
            SELECT
                t.toaid AS id,
                b.hoten AS patientName,
                t.ngaykadon AS examinationDate,
                COALESCE(tt.tongtien, 0) AS price,
                b.benhnhanid as patientId,
                -- Lấy tất cả thuốc
                (
                    SELECT json_agg(json_build_object(
                        'thuocid', ct.thuocid,
                        'soluong', ct.soluong,
                        'chuy', ct.chuy,
                        'tenthuoc', th.tenthuoc
                    ))
                    FROM chitiettoathuoc ct
                    JOIN thuoc th ON ct.thuocid = th.thuocid
                    WHERE ct.toaid = t.toaid AND ct.thuocid IS NOT NULL
                ) AS medicines,
                -- Lấy tất cả dịch vụ
                (
                    SELECT json_agg(json_build_object(
                        'dichvuid', ctdv.dichvuid,
                        'songay', ctdv.songay,
                        'tendichvu', dv.tendichvu
                    ))
                    FROM chitietdichvu ctdv
                    JOIN dichvu dv ON ctdv.dichvuid = dv.dichvuid
                    WHERE ctdv.toaid = t.toaid
                ) AS services,
                -- Lấy luuydonthuoc riêng
                (
                    SELECT ct.luuydonthuoc FROM chitiettoathuoc ct WHERE ct.toaid = t.toaid AND ct.luuydonthuoc IS NOT NULL LIMIT 1
                ) AS luuydonthuoc
            FROM toathuoc t
            JOIN benhnhan b ON t.benhnhanid = b.benhnhanid
            LEFT JOIN thanhtoan tt ON t.toaid = tt.toaid
            WHERE t.toaid = $1
        `, [toaid]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy đơn thuốc' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Lỗi khi lấy chi tiết đơn thuốc:', err);
        res.status(500).json({ error: 'Lỗi khi lấy chi tiết đơn thuốc', detail: err.message });
    }
};

exports.getPrescriptionsByPatient = async (req, res) => {
    const pool = require("../../db");
    const { patientname, benhnhanid } = req.query;
    try {
        let whereClause = "";
        let params = [];
        if (benhnhanid) {
            whereClause = "b.benhnhanid = $1";
            params = [benhnhanid];
        } else if (patientname) {
            whereClause = "b.hoten = $1";
            params = [patientname];
        } else {
            return res.status(400).json({ error: "Thiếu thông tin bệnh nhân" });
        }

        const result = await pool.query(`
            SELECT
                t.toaid AS id,
                b.hoten AS patientName,
                t.ngaykadon AS examinationDate,
                COALESCE(tt.tongtien, 0) AS price,
                b.benhnhanid as patientId,
                -- Lấy tất cả thuốc
                (
                    SELECT json_agg(json_build_object(
                        'thuocid', ct.thuocid,
                        'soluong', ct.soluong,
                        'chuy', ct.chuy,
                        'tenthuoc', th.tenthuoc
                    ))
                    FROM chitiettoathuoc ct
                    JOIN thuoc th ON ct.thuocid = th.thuocid
                    WHERE ct.toaid = t.toaid AND ct.thuocid IS NOT NULL
                ) AS medicines,
                -- Lấy tất cả dịch vụ
                (
                    SELECT json_agg(json_build_object(
                        'dichvuid', ctdv.dichvuid,
                        'songay', ctdv.songay,
                        'tendichvu', dv.tendichvu
                    ))
                    FROM chitietdichvu ctdv
                    JOIN dichvu dv ON ctdv.dichvuid = dv.dichvuid
                    WHERE ctdv.toaid = t.toaid
                ) AS services,
                -- Lấy luuydonthuoc riêng
                (
                    SELECT ct.luuydonthuoc FROM chitiettoathuoc ct WHERE ct.toaid = t.toaid AND ct.luuydonthuoc IS NOT NULL LIMIT 1
                ) AS luuydonthuoc
            FROM toathuoc t
            JOIN benhnhan b ON t.benhnhanid = b.benhnhanid
            LEFT JOIN thanhtoan tt ON t.toaid = tt.toaid
            WHERE ${whereClause}
            ORDER BY t.ngaykadon DESC
        `, params);

        res.json(result.rows);
    } catch (err) {
        console.error('Lỗi khi lấy đơn thuốc của bệnh nhân:', err);
        res.status(500).json({ error: "Lỗi khi lấy đơn thuốc của bệnh nhân", detail: err.message });
    }
};

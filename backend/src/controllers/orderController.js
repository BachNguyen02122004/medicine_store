// const { ToaThuoc, ChiTietToaThuoc } = require("../models/toathuocModel");
// const BenhNhan = require("../models/benhNhanModel");
// const Thuoc = require("../models/thuocModel");

// exports.getToaThuocChiTiet = async (req, res) => {
//     try {
//         const data = await ToaThuoc.findAll({
//             include: [
//                 {
//                     model: BenhNhan,
//                     attributes: ["hoten"],
//                 },
//                 {
//                     model: ChiTietToaThuoc,
//                     include: [
//                         {
//                             model: Thuoc,
//                             attributes: ["tenthuoc", "giatienmotcong"],
//                         },
//                     ],
//                 },
//             ],
//             attributes: ["toaid", "ngaykadon"],
//         });

//         res.json(data);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Lỗi server" });
//     }
// };

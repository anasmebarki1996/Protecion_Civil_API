const express = require("express");
const hospitalController = require("../controllers/hospitalController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .get("/hospital", hospitalController.getAllHospitals)
  .get("/hospital/:id", hospitalController.getHospital)
  .post("/createHospital", hospitalController.createHospital)
  .post("/updateHospital", hospitalController.updateHospital)
  .post("/deleteHospital", hospitalController.deleteHospital)
  .get("/getListHospital", hospitalController.getListHospital);

// router
//     .get('/hospital', authController.protect, hospitalController.getAllHospitals)
//     .get('/hospital/:id', authController.protect, hospitalController.getHospital)
//     .post('/hospital/', authController.protect, authController.restricTo('admin'), hospitalController.createHospital)
//     .patch('/hospital/:id', authController.protect, authController.restricTo('admin'), hospitalController.modifyHospital)
//     .delete('/hospital/:id', authController.protect, authController.restricTo('admin'), hospitalController.deleteHospital)

module.exports = router;

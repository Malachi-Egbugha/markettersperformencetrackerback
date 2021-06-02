const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//create schema
const performanceSchema = new Schema(
  {
    connectiontype: String,
    cust_category: String,
    district: String,
    feeder: String,
    feeder_code: String,
    transformer: String,
    transformer_code: String,
    billed_pop: Number,
    paid_pop: Number,
    billed_amt: Number,
    paid_amt: Number,
    arrears: Number,
    bill_type: String,
    MARKETER_NAME: String,
    STAFF_ID: String,
    marketer_phone: String,
  },
  { timestamps: true }
);

//create a model
const Performances = mongoose.model("performance", performanceSchema);

//export the model
module.exports = Performances;

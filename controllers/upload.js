const excelToJson = require("convert-excel-to-json");
const Performance = require("../models/performances");
var dateFormat = require("dateformat");

//read specific leave
exports.readall = async (req, res, next) => {
  try {
    const ourPerformance = await Performance.find();
    const totalPerformance = await Performance.countDocuments();
    res.json({ ourPerformance, totalPerformance });
  } catch (err) {
    return res
      .status(403)
      .json({ error: "Error Please Contact Administrator" });
  }
};

exports.upload = (req, res, next) => {
  if (req.files == null) {
    return res.status(400).json({ msg: "No file uploaded" });
  }
  const file = req.files.file;
  file.mv(`${process.cwd()}/uploads/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    }
    //convert excel file to json
    let result = excelToJson({
      sourceFile: `${process.cwd()}/uploads/${file.name}`,
      sheets: [
        {
          // Excel Sheet Name
          name: "Sheet1",

          // Header Row -> be skipped and will not be present at our result object.
          header: {
            rows: 2,
          },
          // Mapping columns to keys
          columnToKey: {
            A: "connectiontype",
            B: "cust_category",
            C: "district",
            D: "feeder",
            E: "feeder_code",
            F: "transformer",
            G: "transformer_code",
            H: "billed_pop",
            I: "paid_pop",
            K: "billed_amt",
            L: "paid_amt",
            N: "arrears",
            O: "bill_type",
            P: "MARKETER_NAME",
            Q: "STAFF_ID",
            R: "marketer_phone",
          },
        },
      ],
    });

    try {
      await Performance.deleteMany({});
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Error 1 Encountered Please Contact Administrator" });
    }

    try {
      const results = await Performance.insertMany(result.Sheet1);
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Error 2 Encountered Please Contact Administrator" });
    }

    //upinsert to data base
    res.json({
      fileName: file.name,
      filePath: `/uploads/${file.name}`,
    });
  });
};

exports.stats = async (req, res, next) => {
  try {
    //count number of Peerformance
    const totalPerformance = await Performance.countDocuments();

    const totalMarketters = await (
      await Performance.distinct("STAFF_ID")
    ).length;
    const totalFeeders = await (
      await Performance.distinct("feeder_code")
    ).length;
    const totalTransformers = await (
      await Performance.distinct("transformer_code")
    ).length;
    const totalDistricts = await (
      await Performance.distinct("district")
    ).length;
    //feeder statistics
    const Feederstats = await Performance.aggregate([
      {
        $group: {
          _id: "$feeder",
          totalbilledpop: { $sum: "$billed_pop" },
          totalpaidpop: { $sum: "$paid_pop" },
          totalbilledamt: { $sum: "$billed_amt" },
          totalpaidamt: { $sum: "$paid_amt" },
          district: { $last: "$district" },
          feeder_code: { $last: "$feeder_code" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    //tranformer statistics
    const Tranformerstats = await Performance.aggregate([
      {
        $group: {
          _id: "$transformer",
          totalbilledpop: { $sum: "$billed_pop" },
          totalpaidpop: { $sum: "$paid_pop" },
          totalbilledamt: { $sum: "$billed_amt" },
          totalpaidamt: { $sum: "$paid_amt" },
          district: { $last: "$district" },
          feeder: { $last: "$feeder" },
          feeder_code: { $last: "$feeder_code" },
          transformer_code: { $last: "$transformer_code" },
        },
      },

      {
        $sort: { _id: 1 },
      },
    ]);
    //Marketer statistics
    const Marketterstats = await Performance.aggregate([
      {
        $group: {
          _id: "$MARKETER_NAME",
          totalbilledpop: { $sum: "$billed_pop" },
          totalpaidpop: { $sum: "$paid_pop" },
          totalbilledamt: { $sum: "$billed_amt" },
          totalpaidamt: { $sum: "$paid_amt" },
          totalCount: { $sum: 1 },
        },
      },

      {
        $sort: { _id: 1 },
      },
    ]);
    //district statistics
    const Districtstats = await Performance.aggregate([
      {
        $group: {
          _id: "$district",
          totalbilledpop: { $sum: "$billed_pop" },
          totalpaidpop: { $sum: "$paid_pop" },
          totalbilledamt: { $sum: "$billed_amt" },
          totalpaidamt: { $sum: "$paid_amt" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    //district statistics
    const Totalstats = await Performance.aggregate([
      {
        $group: {
          _id: "$connectiontype",
          totalbilledpop: { $sum: "$billed_pop" },
          totalpaidpop: { $sum: "$paid_pop" },
          totalbilledamt: { $sum: "$billed_amt" },
          totalpaidamt: { $sum: "$paid_amt" },
          totalarrears: { $sum: "$arrears" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      totalPerformance,
      totalMarketters,
      totalFeeders,
      totalTransformers,
      totalDistricts,
      Feederstats,
      Tranformerstats,
      Marketterstats,
      Totalstats,

      Districtstats,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error 3 Encountered Please Contact Administrator" });
  }
};

exports.bot = async (req, res, next) => {
  try {
    //feeder statistics
    const Sendbotstats = await Performance.find({}).select({
      paid_pop: 1,
      billed_pop: 1,
      paid_amt: 1,
      billed_amt: 1,
      MARKETER_NAME: 1,
      STAFF_ID: 1,
      createdAt: 1,
      transformer: 1,
      transformer_code: 1,
    });
    res.json({
      Sendbotstats,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error 4 Encountered Please Contact Administrator" });
  }
};
//function to add leaading zeros
function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

exports.test = async (req, res, next) => {
  let staffid = [];
  try {
    const checkid = await Performance.distinct("STAFF_ID");

    checkid.forEach((u, i) => {
      let im = pad(u, 5);
      staffid.push(im);
    });

    //dela
    res.json({
      staffid,
    });
  } catch (err) {
    console.log(err);
  }
};
//find performance by chat id to send to bot api
exports.findstaff = async (req, res, next) => {
  try {
    let message = "";
    const staff = await Performance.find({
      STAFF_ID: parseInt(req.params.id, 10),
    });

    staff.forEach((u, i) => {
      let ce = Math.round((u.paid_pop / u.billed_pop) * 100);
      let cc = Math.round((u.paid_amt / u.billed_amt) * 100);
      let dat = dateFormat(u.createdAt, "d, mmmm, yyyy");
      message += `Staff Name: ${u.MARKETER_NAME},\nDSS Name:${
        u.transformer
      },\nDSS ID:${u.transformer_code},\nBilled Population : ${
        u.billed_pop
      },\nPaid Population: ${
        u.paid_pop
      },\nCollection Coverage: ${ce}%, Billed Amount: ${u.billed_amt
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, "$&,")}, Paid Amount: ${u.paid_amt
        .toFixed(2)
        .replace(
          /\d(?=(\d{3})+\.)/g,
          "$&,"
        )},\nCollection Efficiency:${ce}%, Date:${dat}\n\n +++++++++++++++\n`;
    });

    res.json({ message });
  } catch (err) {
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { STAFF_ID } = req.body;
    const foundPerf = await Performance.findOne({
      STAFF_ID: parseInt(req.params.id, 10),
    });
    if (foundPerf) {
      return res
        .status(403)
        .json({ error: "Staff Reg Number  is already in use", status: false });
    }
    const perf = new Performance(req.body);
    await perf.save();
    res.json({ perf });
  } catch (err) {
    next(err);
  }
};

const excelToJson = require("convert-excel-to-json");
const Performance = require("../models/performances");

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
      await Performance.distinct("MARKETER_NAME")
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
        },
      },
    ]);
    //tranformer statistics
    const Tranformerstats = await Performance.aggregate([
      {
        $group: {
          _id: "$transformer",
          totalbilledpop: { $sum: "$billed_pop" },
          totalpaidpop: { $sum: "$paid_pop" },
        },
      },
    ]);
    //district statistics
    const Districtstats = await Performance.aggregate([
      {
        $group: {
          _id: "$district",
          totalbilledpop: { $sum: "$billed_pop" },
          totalpaidpop: { $sum: "$paid_pop" },
        },
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
        },
      },
    ]);

    res.json({
      totalPerformance,
      totalMarketters,
      totalFeeders,
      totalTransformers,
      totalDistricts,
      Totalstats,
      Districtstats,
      Tranformerstats,
      Feederstats,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error 3 Encountered Please Contact Administrator" });
  }
};

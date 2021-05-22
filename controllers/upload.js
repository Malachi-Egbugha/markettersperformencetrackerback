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
      return res.status(500).send(err);
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
    console.log(result);
    const results = await Performance.insertMany(result.Sheet1);
    console.log(`${results.insertedCount} documents were inserted`);

    //upinsert to data base
    res.json({
      fileName: file.name,
      filePath: `/uploads/${file.name}`,
    });
  });
};

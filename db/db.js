const mongoose = require("mongoose");
mongoose
  .connect(
    process.env.DB_URI
  )
  .then(() => console.log("koneksi berhasil"))
  .catch((err) => console.log("kesalahan koneksi:", err));



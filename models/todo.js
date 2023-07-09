const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
  username: String,
  password: String,
});

const todoSchema = mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
        todo: String,
        deskripsi: String
})

const Todo = mongoose.model("Todo", todoSchema)
const User = mongoose.model('User', userSchema);

module.exports = { Todo, User }

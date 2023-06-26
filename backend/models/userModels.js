const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    picture: {
        type: String,
    }
},
    {
        timestamps: true
    }
);


//function to check whether the user entered password and username are correct while login 
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.pre("save", async function (next) {
    //this.isModified will be true if the data is saved in the database
    if (!this.isModified("password")){
        next();
    }

    // console.log("going to save data in database");
    const salt = await bcrypt.genSalt(10)
    const hashedPassword =  await bcrypt.hash(this.password, salt);
    this.password = hashedPassword
})


const Users = mongoose.model("User", userSchema);
module.exports = Users;